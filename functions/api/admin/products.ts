// Cloudflare Pages Function — Admin Products API
interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function isAdmin(request: Request): boolean {
  const cookie  = request.headers.get("Cookie") || "";
  const session = request.headers.get("X-Admin-Session") || "";
  const auth    = request.headers.get("Authorization") || "";
  return cookie.includes("admin_session=true") || session === "true" || auth === "Bearer admin_session_true";
}

// GET /api/admin/products
export async function onRequestGet(context: { env: Env; request: Request }) {
  if (!isAdmin(context.request)) return json({ error: "Unauthorized" }, 401);

  try {
    const { results } = await context.env.DB.prepare(
      "SELECT * FROM products ORDER BY created_at DESC"
    ).all();
    return json({ success: true, products: results });
  } catch (error) {
    console.error("Admin GET products error:", error);
    return json({ error: "Failed to fetch products" }, 500);
  }
}

// POST /api/admin/products — create product
export async function onRequestPost(context: { env: Env; request: Request }) {
  if (!isAdmin(context.request)) return json({ error: "Unauthorized" }, 401);

  try {
    const data = await context.request.json() as {
      title: string;
      description?: string;
      category: string;
      price: number;
      original_price?: number;
      image_url?: string;
      images?: string;
      stock_quantity?: number;
      is_featured?: boolean;
    };

    if (!data.title || !data.category || !data.price) {
      return json({ error: "title, category and price are required" }, 400);
    }

    const id  = crypto.randomUUID();
    const now = new Date().toISOString();

    await context.env.DB.prepare(`
      INSERT INTO products (id, title, description, category, price, original_price, image_url, images, stock_quantity, is_featured, rating, reviews_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
    `).bind(
      id,
      data.title,
      data.description || null,
      data.category,
      data.price,
      data.original_price || null,
      data.image_url || null,
      data.images || null,
      data.stock_quantity ?? 1,
      data.is_featured ? 1 : 0,
      now,
      now
    ).run();

    return json({ success: true, id }, 201);
  } catch (error: any) {
    console.error("Admin POST products error:", error);
    return json({ error: error.message }, 500);
  }
}

// PUT /api/admin/products — update product
export async function onRequestPut(context: { env: Env; request: Request }) {
  if (!isAdmin(context.request)) return json({ error: "Unauthorized" }, 401);

  try {
    const body = await context.request.json() as {
      id: string;
      title?: string;
      description?: string;
      category?: string;
      price?: number;
      original_price?: number;
      stock_quantity?: number;
      is_available?: boolean;
      is_featured?: boolean;
      image_url?: string;
      images?: string;
    };

    if (!body.id) return json({ error: "Product ID is required" }, 400);

    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (body.title          !== undefined) { fields.push("title = ?");          params.push(body.title); }
    if (body.description    !== undefined) { fields.push("description = ?");    params.push(body.description); }
    if (body.category       !== undefined) { fields.push("category = ?");       params.push(body.category); }
    if (body.price          !== undefined) { fields.push("price = ?");          params.push(body.price); }
    if (body.original_price !== undefined) { fields.push("original_price = ?"); params.push(body.original_price); }
    if (body.stock_quantity !== undefined) { fields.push("stock_quantity = ?"); params.push(body.stock_quantity); }
    if (body.is_available   !== undefined) { fields.push("is_available = ?");   params.push(body.is_available ? 1 : 0); }
    if (body.is_featured    !== undefined) { fields.push("is_featured = ?");    params.push(body.is_featured ? 1 : 0); }
    if (body.image_url      !== undefined) { fields.push("image_url = ?");      params.push(body.image_url); }
    if (body.images         !== undefined) { fields.push("images = ?");         params.push(body.images); }

    if (fields.length === 0) return json({ error: "No fields to update" }, 400);

    fields.push("updated_at = ?");
    params.push(new Date().toISOString());
    params.push(body.id);

    await context.env.DB.prepare(
      `UPDATE products SET ${fields.join(", ")} WHERE id = ?`
    ).bind(...params).run();

    return json({ success: true });
  } catch (error: any) {
    console.error("Admin PUT products error:", error);
    return json({ error: error.message }, 500);
  }
}

// DELETE /api/admin/products?id=...
export async function onRequestDelete(context: { env: Env; request: Request }) {
  if (!isAdmin(context.request)) return json({ error: "Unauthorized" }, 401);

  try {
    const url       = new URL(context.request.url);
    const productId = url.searchParams.get("id");
    if (!productId) return json({ error: "Product ID is required" }, 400);

    const product = await context.env.DB.prepare(
      "SELECT image_url, images FROM products WHERE id = ?"
    ).bind(productId).first() as { image_url?: string; images?: string } | null;

    if (!product) return json({ error: "Product not found" }, 404);

    await context.env.DB.prepare("DELETE FROM products WHERE id = ?").bind(productId).run();

    // Clean up R2 images
    const keys: string[] = [];
    if (product.image_url) {
      const k = product.image_url.split("/").pop();
      if (k) keys.push(k);
    }
    if (product.images) {
      try {
        (JSON.parse(product.images) as string[]).forEach((url) => {
          const k = url.split("/").pop();
          if (k) keys.push(k);
        });
      } catch (_) {}
    }
    for (const key of keys) {
      try { await context.env.STORAGE.delete(key); } catch (_) {}
    }

    return json({ success: true });
  } catch (error: any) {
    console.error("Admin DELETE products error:", error);
    return json({ error: error.message }, 500);
  }
}
