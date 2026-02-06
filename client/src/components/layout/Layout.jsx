import { useNavigate, useLocation, Outlet, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiHome,
  FiBriefcase,
  FiFileText,
  FiLogOut,
  FiPieChart,
  FiSettings,
  FiUser,
  FiCpu,
} from "react-icons/fi";
import { motion } from "framer-motion";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { icon: FiHome, label: "Dashboard", path: "/" },
    { icon: FiBriefcase, label: "Jobs", path: "/jobs" },
    { icon: FiCpu, label: "Automation", path: "/automation" },
    { icon: FiFileText, label: "Resume", path: "/resume" },
  ];

  return (
    <div className="min-h-screen flex font-sans selection:bg-indigo-500/30 bg-[#0f1014] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[100px] mix-blend-screen" />
      </div>

      {/* Sidebar */}
      <aside className="w-72 fixed h-full z-20 hidden md:flex flex-col border-r border-white/5 bg-[#0f1014]/50 backdrop-blur-xl">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <span className="font-bold text-white text-xl">J</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Job<span className="text-indigo-400">Flow</span>
            </h1>
          </div>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest pl-2 mb-2">
            Menu
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className="relative group">
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div
                  className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "text-indigo-400 font-medium"
                      : "text-gray-400 group-hover:text-gray-200 group-hover:bg-white/5"
                  }`}
                >
                  <item.icon
                    className={`text-xl transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-gray-900/30">
          <div className="p-2 rounded-2xl border border-white/5 bg-gray-800/40 mb-3 group hover:border-white/10 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-sm font-bold text-gray-300 ring-2 ring-black">
                {user?.name?.[0] || "U"}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-white transition-colors">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
          >
            <FiLogOut /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-72 relative z-10 h-screen overflow-y-auto">
        {/* Top Header for Mobile/Context */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 bg-[#0f1014]/80 backdrop-blur-md border-b border-white/5 md:hidden">
          <div className="font-bold text-xl">JobFlow</div>
          <button className="p-2 rounded-lg bg-gray-800 text-gray-200">
            <FiUser />
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto pb-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
