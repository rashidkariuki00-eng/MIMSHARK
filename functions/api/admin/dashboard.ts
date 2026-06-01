// Admin Dashboard API — uses new Mimshach schema (no users table)
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
    const [
      totalProducts,
      availableProducts,
      totalOrders,
      pendingOrders,
      revenue,
      recentOrders,
      ordersByStatus,
      topProducts,
    ] = await Promise.all([
      DB.prepare("SELECT COUNT(*) as count FROM products").first<{ count: number }>(),
      DB.prepare("SELECT COUNT(*) as count FROM products WHERE is_available = 1").first<{ count: number }>(),
      DB.prepare("SELECT COUNT(*) as count FROM orders").first<{ count: number }>(),
      DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").first<{ count: number }>(),
      DB.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status = 'delivered'").first<{ total: number }>(),
      DB.prepare(`
        SELECT o.*, COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 10
      `).all(),
      DB.prepare("SELECT status, COUNT(*) as count FROM orders GROUP BY status").all(),
      DB.prepare(`
        SELECT p.title, p.category, p.price,
          COUNT(oi.id) as times_ordered
        FROM products p
        LEFT JOIN order_items oi ON p.id = oi.product_id
        GROUP BY p.id
        ORDER BY times_ordered DESC
        LIMIT 5
      `).all(),
    ]);

    return json({
      success: true,
      stats: {
        totalProducts: totalProducts?.count ?? 0,
        availableProducts: availableProducts?.count ?? 0,
        totalOrders: totalOrders?.count ?? 0,
        pendingOrders: pendingOrders?.count ?? 0,
        totalRevenue: revenue?.total ?? 0,
        recentOrders: recentOrders.results,
        ordersByStatus: ordersByStatus.results,
        topProducts: topProducts.results,
      },
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return json({ error: error.message }, 500);
  }
}
