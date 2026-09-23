import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaChartLine,
  FaUsers,
  FaUserShield,
  FaMoneyBillWave,
  FaWallet,
  FaExchangeAlt,
  FaCog,
  FaBell,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaHome,
  FaUser,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

const menuItems = [
  {
    label: "Dashboard",
    path: "/userDashboard",
    icon: FaHome,
  },
  {
    label: "Trading",
    path: "/userDashboard/trading",
    icon: FaChartLine,
  },
  {
    label: "Accounts",
    path: "/userDashboard/accounts",
    icon: FaUserShield,
  },
  {
    label: "Positions",
    path: "/userDashboard/positions",
    icon: FaChartLine,
  },
  {
    label: "Orders",
    path: "/userDashboard/orders",
    icon: FaExchangeAlt,
  },
  {
    label: "Deposits",
    path: "/userDashboard/deposits",
    icon: FaMoneyBillWave,
  },
  {
    label: "Withdrawals",
    path: "/userDashboard/withdrawals",
    icon: FaWallet,
  },
  {
    label: "Transactions",
    path: "/userDashboard/transactions",
    icon: FaExchangeAlt,
  },
  {
    label: "Referrals",
    path: "/userDashboard/referrals",
    icon: FaUsers,
  },
  {
    label: "Notifications",
    path: "/userDashboard/notifications",
    icon: FaBell,
  },
  {
    label: "Profile",
    path: "/userDashboard/profile",
    icon: FaUser,
  },
  {
    label: "Settings",
    path: "/userDashboard/settings",
    icon: FaCog,
  },
];

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed
          top-0
          left-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          border-r
          border-slate-800
          bg-slate-900
          transition-transform
          duration-300
          lg:translate-x-0
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800 px-6">
          <div>
            <h1 className="text-xl font-bold">
              EmmCore
              <span className="text-cyan-400">Prop</span>
            </h1>

            <p className="text-xs text-slate-500">
              Trader Dashboard
            </p>
          </div>

          <button
            onClick={closeSidebar}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <FaTimes />
          </button>
        </div>

        {/* User profile */}
        <div className="border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
              <FaUser />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold">
                {user?.name || "Trader"}
              </p>

              <p className="truncate text-xs text-slate-500">
                {user?.email || "No email"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs">
            {user?.emailVerified ? (
              <>
                <FaCheckCircle className="text-green-400" />
                <span className="text-green-400">
                  Email Verified
                </span>
              </>
            ) : (
              <>
                <FaClock className="text-yellow-400" />
                <span className="text-yellow-400">
                  Email Not Verified
                </span>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Trading
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/userDashboard"}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    px-4
                    py-3
                    text-sm
                    font-medium
                    transition
                    ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    }
                    `
                  }
                >
                  <Icon className="text-lg" />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-slate-800 p-4">
          <NavLink
            to="/"
            onClick={closeSidebar}
            className="mb-2 flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <FaHome />
            <span>View Website</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            >
              <FaBars className="text-xl" />
            </button>

            <div>
              <h2 className="text-lg font-semibold">
                Welcome back, {user?.name?.split(" ")[0] || "Trader"}
              </h2>

              <p className="hidden text-xs text-slate-500 sm:block">
                Manage your trading account and activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification */}
            <button
              onClick={() =>
                navigate("/userDashboard/notifications")
              }
              className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <FaBell />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-cyan-400" />
            </button>

            {/* User */}
            <div className="hidden items-center gap-3 border-l border-slate-800 pl-4 sm:flex">
              <div className="text-right">
                <p className="text-sm font-medium">
                  {user?.name || "Trader"}
                </p>

                <p className="text-xs capitalize text-slate-500">
                  {user?.role || "user"}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                <FaUser />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-[calc(100vh-5rem)] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}