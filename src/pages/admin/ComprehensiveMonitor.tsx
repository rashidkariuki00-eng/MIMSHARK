import { useState, useEffect } from "react";
import { Package, ShoppingBag, TrendingUp, Clock, RefreshCw, CheckCircle, Truck, XCircle } from "lucide-react";
import { adminFetch } from "@/utils/adminAuth";

interface DashboardData {
  stats: {
    totalProducts: number;
    availableProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
  };
  recentOrders: any[];
  productsByCategory: Array<{ category: string; count: number }>;
  systemHealth: {
    database: { status: string };
    storage: { status: string };
    api: { status: string };
  };
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  shipped:    "bg-indigo-100 text-indigo-800",
  delivered:  "bg-green-100 text-green-800",
  cancelled:  "bg-red-100 text-red-800",
};

const ComprehensiveMonitor = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState("");

  const fetchData = async (background = false) => {
    try {
      if (background) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const res = await adminFetch("/api/admin/comprehensive-monitor");
      if (!res.ok) throw new Error(`API ${res.status}`);
      const json = await res.json() as any;
      setData(json);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(false);
    const id = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            {lastUpdate && <p className="text-xs text-gray-500 mt-0.5">Updated {lastUpdate}</p>}
          </div>
          <button
            onClick={() => fetchData(false)}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-3 py-2 text-xs font-bold text-black hover:opacity-90 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading || refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            ⚠️ {error} — Check that the D1 database binding is configured.
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<Package className="h-5 w-5 text-[#D4AF37]" />} label="Products" value={data?.stats.totalProducts ?? "—"} sub={`${data?.stats.availableProducts ?? 0} available`} />
          <StatCard icon={<ShoppingBag className="h-5 w-5 text-blue-500" />} label="Total Orders" value={data?.stats.totalOrders ?? "—"} sub="all time" />
          <StatCard icon={<Clock className="h-5 w-5 text-orange-500" />} label="Pending" value={data?.stats.pendingOrders ?? "—"} sub="need attention" highlight={!!data && (data.stats.pendingOrders ?? 0) > 0} />
          <StatCard icon={<TrendingUp className="h-5 w-5 text-green-500" />} label="Revenue" value={data ? `KES ${(data.stats.totalRevenue ?? 0).toLocaleString()}` : "—"} sub="delivered orders" />
        </div>

        {/* System Health */}
        {data?.systemHealth && (
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(data.systemHealth).map(([key, val]: [string, any]) => (
              <div key={key} className={`rounded-lg border p-3 text-center ${val.status === "online" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                {val.status === "online"
                  ? <CheckCircle className="h-4 w-4 text-green-600 mx-auto mb-1" />
                  : <XCircle className="h-4 w-4 text-red-600 mx-auto mb-1" />}
                <p className="text-xs font-bold capitalize text-gray-700">{key}</p>
                <p className={`text-xs font-semibold ${val.status === "online" ? "text-green-600" : "text-red-600"}`}>{val.status}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Truck className="h-4 w-4 text-[#D4AF37]" /> Recent Orders
            </h2>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : (data?.recentOrders ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No orders yet</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {(data?.recentOrders ?? []).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700 text-xs">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">#{order.order_number}</p>
                      <p className="text-gray-500">{order.customer_name} · {order.customer_phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">KES {(order.total_amount ?? 0).toLocaleString()}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Products by Category */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-4">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Package className="h-4 w-4 text-[#D4AF37]" /> By Category
            </h2>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}</div>
            ) : (data?.productsByCategory ?? []).length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No products yet</p>
            ) : (
              <div className="space-y-2">
                {(data?.productsByCategory ?? []).map((cat: any) => (
                  <div key={cat.category} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <span className="font-medium capitalize text-gray-700 dark:text-gray-200">{cat.category}</span>
                    <span className="font-bold text-[#D4AF37]">{cat.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, highlight = false }: {
  icon: React.ReactNode; label: string; value: string | number; sub: string; highlight?: boolean;
}) => (
  <div className={`rounded-xl border p-4 shadow-sm ${highlight ? "bg-orange-50 border-orange-200" : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"}`}>
    <div className="flex items-center gap-2 mb-2">{icon}<span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span></div>
    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
  </div>
);

export default ComprehensiveMonitor;
