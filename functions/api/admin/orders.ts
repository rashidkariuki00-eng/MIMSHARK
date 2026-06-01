// Admin Orders API — uses new Mimshach schema
interface Env { DB: D1Database; }

function isAdmin(request: Request): boolean {
  const cookie  = request.headers.get("Cookie") || "";
  const session = request.headers.get("X-Admin-Session") || "";
  const auth    = request.headers.get("Authorization") || "";
  return cookie.includes("admin_session=true") || session === "true" || auth === "Bearer admin_session_true";
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// GET /api/admin/orders
export async function onRequestGet(context: { env: Env; request: Request }) {
  if (!isAdmin(context.request)) return json({ error: "Unauthorized" }, 401);

  try {
    const { results } = await context.env.DB.prepare(`
      SELECT
        o.*,
        COUNT(oi.id) as item_count,
        GROUP_CONCAT(oi.product_title, ', ') as products_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all();

    return json({ success: true, orders: results });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return json({ error: error.message }, 500);
  }
}

// PUT /api/admin/orders — update order status
export async function onRequestPut(context: { env: Env; request: Request }) {
  if (!isAdmin(context.request)) return json({ error: "Unauthorized" }, 401);

  try {
    const { id, status } = await context.request.json() as { id: string; status: string };
    if (!id || !status) return json({ error: "id and status are required" }, 400);

    const validStatuses = ['pending','confirmed','processing','shipped','delivered','cancelled'];
    if (!validStatuses.includes(status)) return json({ error: "Invalid status" }, 400);

    await context.env.DB.prepare(
      "UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(status, id).run();

    return json({ success: true, message: `Order updated to ${status}` });
  } catch (error: any) {
    console.error("Orders PUT error:", error);
    return json({ error: error.message }, 500);
  }
}
