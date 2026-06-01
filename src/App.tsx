import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ShopProvider } from "@/store/shop";
import InstallPrompt from "@/components/InstallPrompt";
import { initializeCacheManagement } from "@/utils/cacheUtils";
import { useEffect } from "react";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import SearchPage from "./pages/SearchPage";
import SellPage from "./pages/SellPage";
import CheckoutPage from "./pages/CheckoutPage";
import AdminDashboardNew from "./pages/admin/AdminDashboardNew";
import RealDashboard from "./pages/admin/RealDashboard";
import LiveDashboard2025 from "./pages/admin/LiveDashboard2025";
import TempDashboard from "./pages/admin/TempDashboard";
import ComprehensiveMonitor from "./pages/admin/ComprehensiveMonitor";
import ActivityMonitor from "./pages/admin/ActivityMonitor";
import SystemControl from "./pages/admin/SystemControl";
import DatabaseViewer from "./pages/admin/DatabaseViewer";
import DirectApiTest from "./pages/admin/DirectApiTest";

import AdminUsers from "./pages/admin/AdminUsers";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminLuckyCodes from "./pages/admin/AdminLuckyCodes";
import AdminLogin from "./pages/admin/AdminLogin";
import AuthDebug from "./pages/admin/AuthDebug";
import ApiTestPage from "./pages/admin/ApiTestPage";
import AdminRoute from "./components/AdminRoute";
import SettingsPage from "./pages/SettingsPage";

import TestLuckyCodes from "./pages/TestLuckyCodes";

const queryClient = new QueryClient();

const App = () => {
  // Initialize cache management on app start
  useEffect(() => {
    initializeCacheManagement();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="mobile-container no-horizontal-scroll">
        <Toaster />
        <Sonner />
        <InstallPrompt />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ShopProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/sell" element={<AdminRoute><SellPage /></AdminRoute>} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/test-lucky-codes" element={<TestLuckyCodes />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
                <Route path="/admin" element={<ComprehensiveMonitor />} />
                <Route path="/admin/activity" element={<ActivityMonitor />} />
                <Route path="/admin/control" element={<SystemControl />} />
                <Route path="/admin/database" element={<DatabaseViewer />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/lucky-codes" element={<AdminLuckyCodes />} />
                <Route path="/admin/test" element={<DirectApiTest />} />
                <Route path="/admin/debug" element={<AuthDebug />} />
                <Route path="/admin/diagnostic" element={<TempDashboard />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ShopProvider>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
