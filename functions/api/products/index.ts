// Cloudflare Pages Function — Public Products API
interface Env {
  DB: D1Database;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET /api/products
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    if (!context.env.DB) {
      return json([], 200);
    }

    const url      = new URL(context.request.url);
    const category = url.searchParams.get("category");
    const search   = url.searchParams.get("search") || url.searchParams.get("q");
    const sort     = url.searchParams.get("sort") || "newest";
    const featured = url.searchParams.get("featured");
    const limit    = Math.min(parseInt(url.searchParams.get("limit")  || "50"), 100);
    const offset   = parseInt(url.searchParams.get("offset") || "0");

    let query  = "SELECT * FROM products WHERE is_available = 1";
    const params: (string | number)[] = [];

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    if (featured === "1") {
      query += " AND is_featured = 1";
    }
    if (search) {
      query += " AND (title LIKE ? OR description LIKE ? OR category LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    switch (sort) {
      case "trending":  query += " ORDER BY (rating * reviews_count) DESC, created_at DESC"; break;
      case "price_low": query += " ORDER BY price ASC";  break;
      case "price_high":query += " ORDER BY price DESC"; break;
      case "rating":    query += " ORDER BY rating DESC, reviews_count DESC"; break;
      default:          query += " ORDER BY created_at DESC";
    }

    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const { results } = await context.env.DB.prepare(query).bind(...params).all();
    return json(results || []);
  } catch (err: any) {
    console.error("GET /api/products error:", err);
    return json([]);
  }
};

// POST /api/products  (admin only — called from admin panel)
export const onRequestPost: PagesFunction<Env> = async (context) => {
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
  } catch (err: any) {
    console.error("POST /api/products error:", err);
    return json({ error: err.message }, 500);
  }
};
