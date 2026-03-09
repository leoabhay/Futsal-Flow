import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  LogIn,
  Home,
  Calendar,
  User,
  Instagram,
  Facebook,
  Github,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";

const Navbar = ({ user, handleLogout, dashboardPath }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    const cleanPath = path.replace(/\\/g, "/");
    const safePath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;
    return `${baseUrl}${safePath}`;
  };
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-dark/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-all duration-300">
            <span className="text-xl">⚽</span>
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
            FUTSAL FLOW
          </span>
        </Link>
        <div className="hidden md:flex space-x-8 items-center">
          {!user && (
            <NavLink
              to="/"
              className={({ isActive }) =>
                `flex items-center space-x-2 text-sm font-semibold tracking-wide transition-colors ${isActive ? "text-primary" : "text-gray-400 hover:text-white"}`
              }
            >
              <Home size={18} />
              <span>HOME</span>
            </NavLink>
          )}

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
              to="/profile"
              className={({ isActive }) =>
                `flex items-center space-x-2 text-sm font-semibold tracking-wide transition-colors ${isActive ? "text-primary" : "text-gray-400 hover:text-white"}`
              }
            >
              <User size={18} />
              <span>PROFILE</span>
            </NavLink>
          )}

          <div className="h-6 w-[1px] bg-white/10 mx-2"></div>

          {!user ? (
            <Link
              to="/login"
              className="btn-primary flex items-center space-x-2 px-8 py-3 shadow-[0_0_20px_rgba(59,130,246,0.5)] group"
            >
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
              <span>GET STARTED</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black overflow-hidden border border-white/10 shadow-lg">
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      className="w-full h-full object-cover"
                      alt={user.name}
                    />
                  ) : (
                    user.name[0].toUpperCase()
                  )}
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

        {/* Hamburger Button for Mobile */}
        <button
          className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-dark/95 backdrop-blur-3xl border-b border-white/5 px-6 py-6 flex flex-col space-y-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {!user && (
            <NavLink
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-4 text-sm font-semibold tracking-wide transition-colors p-4 rounded-xl ${isActive ? "bg-primary/20 text-primary" : "text-gray-400 hover:text-white hover:bg-white/5"}`
              }
            >
              <Home size={20} />
              <span>HOME</span>
            </NavLink>
          )}

          {user && (
            <NavLink
              to={dashboardPath}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-4 text-sm font-semibold tracking-wide transition-colors p-4 rounded-xl ${isActive ? "bg-primary/20 text-primary" : "text-gray-400 hover:text-white hover:bg-white/5"}`
              }
            >
              <LayoutDashboard size={20} />
              <span>DASHBOARD</span>
            </NavLink>
          )}

          <NavLink
            to="/futsals"
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-4 text-sm font-semibold tracking-wide transition-colors p-4 rounded-xl ${isActive ? "bg-primary/20 text-primary" : "text-gray-400 hover:text-white hover:bg-white/5"}`
            }
          >
            <Calendar size={20} />
            <span>GROUNDS</span>
          </NavLink>

          {user && (
            <NavLink
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-4 text-sm font-semibold tracking-wide transition-colors p-4 rounded-xl ${isActive ? "bg-primary/20 text-primary" : "text-gray-400 hover:text-white hover:bg-white/5"}`
              }
            >
              <User size={20} />
              <span>PROFILE</span>
            </NavLink>
          )}

          <div className="h-[1px] w-full bg-white/10 my-4"></div>

          {!user ? (
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary flex items-center justify-center space-x-2 w-full py-4 mt-2 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] group"
            >
              <span>GET STARTED</span>
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          ) : (
            <div className="flex items-center justify-between w-full p-4 bg-white/5 rounded-2xl border border-white/5 mt-2">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-lg font-black overflow-hidden border border-white/10 shadow-lg">
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user.avatar)}
                      className="w-full h-full object-cover"
                      alt={user.name}
                    />
                  ) : (
                    user.name[0].toUpperCase()
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold tracking-tight text-white">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="text-xs text-gray-500 uppercase tracking-widest">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                title="Logout"
              >
                <LogIn size={20} className="rotate-180" />
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

const MainLayout = () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const dashboardPath =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "owner"
        ? "/owner/dashboard"
        : "/dashboard";

  return (
    <div className="min-h-screen bg-dark text-white selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
      </div>

      <Navbar
        user={user}
        handleLogout={handleLogout}
        dashboardPath={dashboardPath}
      />
      <main className="relative z-10 pt-32 pb-20 max-w-7xl mx-auto px-6">
        <Outlet />
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-dark/50 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <div className="space-y-6">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-all duration-300">
                  <span className="text-xl">⚽</span>
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent tracking-tighter">
                  FUTSAL FLOW
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                The ultimate platform for futsal enthusiasts in Nepal. Book
                grounds, manage teams, and stay ahead in the game.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/leo_abhay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://www.facebook.com/abhaychaudhary1303"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://github.com/leoabhay/Futsal-Flow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Github size={18} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">
                Quick Links
              </h4>
              <ul className="space-y-4">
                {!user && (
                  <li>
                    <Link
                      to="/"
                      className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center group"
                    >
                      <ArrowRight
                        size={14}
                        className="mr-2 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"
                      />
                      Home
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    to="/futsals"
                    className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight
                      size={14}
                      className="mr-2 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"
                    />
                    Explore Grounds
                  </Link>
                </li>
                <li>
                  <Link
                    to={dashboardPath}
                    className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center group"
                  >
                    <ArrowRight
                      size={14}
                      className="mr-2 opacity-0 group-hover:opacity-100 -ml-4 group-hover:ml-0 transition-all"
                    />
                    Your Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">
                Contact Us
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 text-gray-400 text-sm">
                  <MapPin size={18} className="text-primary mt-0.5 shrink-0" />
                  <span>Kathmandu, Nepal</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-400 text-sm">
                  <Phone size={18} className="text-primary shrink-0" />
                  <span>+977 9800000000</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-400 text-sm">
                  <Mail size={18} className="text-primary shrink-0" />
                  <span>info@futsalflow.com</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wider text-sm uppercase">
                Newsletter
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Get the latest updates on tournaments and offers.
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-primary px-3 rounded text-white hover:bg-primary-dark transition-colors">
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-gray-500 text-xs">
            <p>© 2026 Futsal Flow. All rights reserved.</p>
            <div className="flex space-x-8">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
