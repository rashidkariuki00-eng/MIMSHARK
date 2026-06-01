// Comprehensive Monitor API — Mimshach schema
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
    const [products, orders, pending, revenue, recentOrders, categories] = await Promise.all([
      DB.prepare("SELECT COUNT(*) as count FROM products").first<{ count: number }>(),
      DB.prepare("SELECT COUNT(*) as count FROM orders").first<{ count: number }>(),
      DB.prepare("SELECT COUNT(*) as count FROM orders WHERE status = 'pending'").first<{ count: number }>(),
      DB.prepare("SELECT COALESCE(SUM(total_amount),0) as total FROM orders WHERE status='delivered'").first<{ total: number }>(),
      DB.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5").all(),
      DB.prepare("SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC").all(),
    ]);

    return json({
      success: true,
      stats: {
        totalProducts: products?.count ?? 0,
        totalOrders: orders?.count ?? 0,
        pendingOrders: pending?.count ?? 0,
        totalRevenue: revenue?.total ?? 0,
      },
      recentOrders: recentOrders.results,
      productsByCategory: categories.results,
      systemHealth: {
        database: { status: "online", responseTime: 0 },
        storage: { status: "online", usage: "N/A" },
        api: { status: "online", uptime: "100%" },
      },
    });
  } catch (error: any) {
    console.error("Monitor error:", error);
    return json({ error: error.message }, 500);
  }
}
