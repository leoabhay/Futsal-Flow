import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  LogIn,
  UserPlus,
  Home,
  Calendar,
  User,
} from "lucide-react";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    // Clear cookie (optional as interceptor should handle 401, but for UX)
    window.location.href = "/login";
  };

  const dashboardPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "owner"
        ? "/owner/dashboard"
        : "/dashboard";

  return (
    <nav className="fixed top-0 w-full z-50 px-6 py-4">
      <div className="mx-auto max-w-7xl glass py-4 px-8 flex items-center justify-between border-white/5 shadow-2xl shadow-black/50">
        <Link
          to="/"
          className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter"
        >
          FUTSAL FLOW
        </Link>
        <div className="hidden md:flex space-x-8 items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center space-x-2 text-sm font-semibold tracking-wide transition-colors ${isActive ? "text-primary" : "text-gray-400 hover:text-white"}`
            }
          >
            <Home size={18} />
            <span>HOME</span>
          </NavLink>
          <NavLink
            to="/futsals"
            className={({ isActive }) =>
              `flex items-center space-x-2 text-sm font-semibold tracking-wide transition-colors ${isActive ? "text-primary" : "text-gray-400 hover:text-white"}`
            }
          >
            <Calendar size={18} />
            <span>GROUNDS</span>
          </NavLink>

          {user && (
            <NavLink
              to={dashboardPath}
              className={({ isActive }) =>
                `flex items-center space-x-2 text-sm font-semibold tracking-wide transition-colors ${isActive ? "text-primary" : "text-gray-400 hover:text-white"}`
              }
            >
              <LayoutDashboard size={18} />
              <span>DASHBOARD</span>
            </NavLink>
          )}

          <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

          {!user ? (
            <>
              <Link
                to="/login"
                className="text-gray-400 hover:text-white text-sm font-bold flex items-center space-x-2"
              >
                <LogIn size={18} />
                <span>LOGIN</span>
              </Link>
              <Link
                to="/signup"
                className="btn-primary flex items-center space-x-2 px-6"
              >
                <UserPlus size={18} />
                <span>SIGN UP</span>
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-black">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="text-xs font-bold tracking-tight">
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogIn size={18} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-dark text-white selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>

      <Navbar />
      <main className="relative z-10 pt-32 pb-20 max-w-7xl mx-auto px-6">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-white/5 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
          <p>© 2026 Futsal Flow. Elevating the game in Nepal.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a
              href="/admin/create-futsal"
              className="text-primary-dark hover:text-primary transition-colors font-bold uppercase tracking-widest text-[10px]"
            >
              Portal Admin
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
