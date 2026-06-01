// Activity Monitor API — Mimshach schema
import { isAdmin } from "./auth";

interface Env { DB: D1Database; }

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet(context: { env: Env; request: Request }) {
  if (!isAdmin(context.request)) return json({ error: "Unauthorized" }, 401);

  const { DB } = context.env;

  try {
    const [recentOrders, recentProducts, orderStats] = await Promise.all([
      DB.prepare(`
        SELECT o.id, o.order_number, o.customer_name, o.customer_phone,
               o.total_amount, o.status, o.created_at,
               COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 20
      `).all(),
      DB.prepare(`
        SELECT id, title, category, price, is_available, created_at
        FROM products
        ORDER BY created_at DESC
        LIMIT 10
      `).all(),
      DB.prepare(`
        SELECT status, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as total
        FROM orders
        GROUP BY status
      `).all(),
    ]);

    return json({
      success: true,
      recentOrders: recentOrders.results,
      recentProducts: recentProducts.results,
      orderStats: orderStats.results,
    });
  } catch (error: any) {
    console.error("Activity monitor error:", error);
    return json({ error: error.message }, 500);
  }
}
