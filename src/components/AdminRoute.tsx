import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const hostname = window.location.hostname;

  // Synchronously redirect main production domain to admin subdomain — no useEffect flicker
  const isMainProductionDomain = hostname === "Mimshach.co.ke" || hostname === "www.Mimshach.co.ke";
  if (isMainProductionDomain) {
    window.location.replace(`https://admin.Mimshach.co.ke${window.location.pathname}${window.location.search}`);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Redirecting to admin portal...</p>
        </div>
      </div>
    );
  }

  // Check auth synchronously — no useEffect, no flicker
  const isAdmin =
    sessionStorage.getItem('isAdmin') === 'true' ||
    document.cookie.includes('admin_session=true');

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
