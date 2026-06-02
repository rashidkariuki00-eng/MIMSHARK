import { ReactNode, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Package, PlusCircle, LogOut, Menu, X, Shield } from "lucide-react";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { clearAdminSession } from "@/utils/adminAuth";

interface AdminLayoutProps {
  children?: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminEmail = sessionStorage.getItem('adminEmail') || 'Admin';

  const handleLogout = () => {
    // Clear admin session
    clearAdminSession();
    
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const menuItems = [
    {
      icon: PlusCircle,
      label: 'Post Product',
      path: '/sell',
      description: 'Add new item to shop',
    },
    {
      icon: Package,
      label: 'Manage Products',
      path: '/admin/products',
      description: 'View, edit & delete listings',
    },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0a0800]">
      {/* Top Navigation Bar — black & gold */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0d0b00] border-b border-[#D4AF37]/20 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3">
          {/* Left */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
            >
              <Menu className="h-4 w-4 md:h-5 md:w-5 text-[#D4AF37]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#D4AF37]/10 transition-colors"
            >
              {mobileMenuOpen
                ? <X className="h-4 w-4 text-[#D4AF37]" />
                : <Menu className="h-4 w-4 text-[#D4AF37]" />}
            </button>
            <div className="flex items-center gap-2">
              <Logo />
              <div className="flex items-center gap-1 ml-1 px-2 md:px-3 py-1 bg-gradient-to-r from-[#C9941A] to-[#D4AF37] rounded-full">
                <Shield className="h-3 w-3 md:h-4 md:w-4 text-black" />
                <span className="text-xs font-bold text-black">ADMIN</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 md:gap-3">
            <div className="hidden md:flex items-center gap-3 pl-3 border-l border-[#D4AF37]/20">
              <div className="text-right">
                <p className="text-xs md:text-sm font-semibold text-[#D4AF37]">Admin</p>
                <p className="text-xs text-[#D4AF37]/50">{adminEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg hover:bg-red-900/30 transition-colors group"
                title="Logout"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5 text-[#D4AF37]/60 group-hover:text-red-400" />
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-900/30 transition-colors group"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-[#D4AF37]/60 group-hover:text-red-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar — Desktop */}
      <aside
        className={`hidden lg:block fixed left-0 top-12 md:top-16 bottom-0 bg-[#0d0b00] border-r border-[#D4AF37]/20 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-16 md:w-20'
        }`}
      >
        <nav className="p-2 md:p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-gradient-to-r from-[#C9941A] to-[#D4AF37] shadow-lg shadow-[#D4AF37]/20'
                    : 'text-[#D4AF37]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'
                }`}
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 ${active ? 'text-black' : ''}`} />
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs md:text-sm font-semibold truncate ${active ? 'text-black' : ''}`}>
                      {item.label}
                    </p>
                    <p className={`text-xs truncate ${active ? 'text-black/70' : 'text-[#D4AF37]/40'}`}>
                      {item.description}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 border-t border-[#D4AF37]/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 md:gap-3 px-2 md:px-4 py-2 md:py-3 rounded-xl text-red-400/70 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-xs md:text-sm font-semibold">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/70" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="fixed left-0 top-12 md:top-16 bottom-0 w-72 sm:w-80 bg-[#0d0b00] border-r border-[#D4AF37]/20 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="p-3 md:p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 md:px-4 py-3 md:py-4 rounded-xl transition-all ${
                      active
                        ? 'bg-gradient-to-r from-[#C9941A] to-[#D4AF37] shadow-lg shadow-[#D4AF37]/20'
                        : 'text-[#D4AF37]/60 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-black' : ''}`} />
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${active ? 'text-black' : ''}`}>{item.label}</p>
                      <p className={`text-xs ${active ? 'text-black/70' : 'text-[#D4AF37]/40'}`}>
                        {item.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 border-t border-[#D4AF37]/20 bg-[#0d0b00]">
              <div className="mb-3 px-3">
                <p className="text-sm font-semibold text-[#D4AF37]">Admin</p>
                <p className="text-xs text-[#D4AF37]/50">{adminEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400/70 hover:bg-red-900/20 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-semibold">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        <div className="p-1 sm:p-2 md:p-3 lg:p-4 xl:p-6">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
