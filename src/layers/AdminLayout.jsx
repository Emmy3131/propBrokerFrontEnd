import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";

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
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";

const AdminLayout = () => {
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();

  /*
  =====================================================
  ADMIN NAVIGATION MENUS
  =====================================================
  */

  const adminMenus = [
    {
      label: "Overview",
      path: "/adminDashboard",
      icon: <FaChartLine />,
    },

    {
      label: "Users",
      path: "/adminDashboard/users",
      icon: <FaUsers />,
    },

    {
      label: "Accounts",
      path: "/adminDashboard/accounts",
      icon: <FaUserShield />,
    },

    {
      label: "Deposits",
      path: "/adminDashboard/deposits",
      icon: <FaMoneyBillWave />,
    },

    {
      label: "Withdrawals",
      path: "/adminDashboard/withdrawals",
      icon: <FaWallet />,
    },

    {
      label: "Transactions",
      path: "/adminDashboard/transactions",
      icon: <FaExchangeAlt />,
    },

    {
      label: "Notifications",
      path: "/adminDashboard/notifications",
      icon: <FaBell />,
    },

    {
      label: "Settings",
      path: "/adminDashboard/settings",
      icon: <FaCog />,
    },
  ];

  /*
  =====================================================
  FIND CURRENT PAGE
  =====================================================
  */

  const currentMenu = adminMenus.find((menu) => {
    if (menu.path === "/adminDashboard") {
      return location.pathname === menu.path;
    }

    return location.pathname.startsWith(menu.path);
  });

  const pageTitle = currentMenu?.label || "Administration";

  /*
  =====================================================
  LOGOUT
  =====================================================
  */

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  /*
  =====================================================
  USER INITIAL
  =====================================================
  */

  const userInitial =
    user?.name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "A";

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">

        {/* =====================================================
            MOBILE OVERLAY
        ===================================================== */}

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* =====================================================
            SIDEBAR
        ===================================================== */}

        <aside
          className={`
            fixed inset-y-0 left-0 z-50
            flex w-72 flex-col
            border-r border-white/10
            bg-slate-900
            shadow-2xl
            transition-transform duration-300
            lg:static lg:translate-x-0 lg:shadow-none
            ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
            }
          `}
        >

          {/* =====================================================
              BRAND
          ===================================================== */}

          <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                EmmCore
              </h1>

              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
                PropBroker
              </p>
            </div>

            {/* Mobile close */}

            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <FaTimes />
            </button>

          </div>

          {/* =====================================================
              ADMIN PROFILE
          ===================================================== */}

          <div className="border-b border-white/10 p-5">

            <div className="flex items-center gap-3">

              {/* Avatar */}

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-base font-bold text-cyan-400 ring-1 ring-cyan-500/30">
                {userInitial}
              </div>

              {/* User information */}

              <div className="min-w-0 flex-1">

                <p className="truncate text-sm font-semibold text-white">
                  {user?.name || "Admin User"}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-400">
                  {user?.email || "admin@example.com"}
                </p>

                <div className="mt-1.5 flex items-center gap-1.5">

                  <FaCheckCircle className="text-[10px] text-emerald-400" />

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                    {user?.role || "Admin"}
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              NAVIGATION
          ===================================================== */}

          <nav className="flex-1 overflow-y-auto px-4 py-6">

            {/* Administration heading */}

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Administration
            </p>

            <div className="space-y-1">

              {adminMenus.map((menu) => (
                <NavLink
                  key={menu.path}
                  to={menu.path}
                  end={menu.path === "/adminDashboard"}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `
                    group flex items-center gap-3
                    rounded-xl px-3 py-3
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/20"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    }
                    `
                  }
                >

                  {/* Icon */}

                  <span className="flex w-5 shrink-0 justify-center text-base">
                    {menu.icon}
                  </span>

                  {/* Label */}

                  <span className="flex-1">
                    {menu.label}
                  </span>

                  {/* Active indicator */}

                  {location.pathname === menu.path && (
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  )}

                </NavLink>
              ))}

            </div>

            {/* =================================================
                SYSTEM
            ================================================= */}

            <p className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              System
            </p>

            <NavLink
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="
                group flex items-center gap-3
                rounded-xl px-3 py-3
                text-sm font-medium
                text-slate-400
                transition
                hover:bg-white/5
                hover:text-white
              "
            >

              <span className="flex w-5 justify-center text-base">
                <FaHome />
              </span>

              <span>
                View Website
              </span>

            </NavLink>

          </nav>

          {/* =====================================================
              SIDEBAR FOOTER / LOGOUT
          ===================================================== */}

          <div className="border-t border-white/10 p-4">

            <button
              type="button"
              onClick={handleLogout}
              className="
                flex w-full items-center gap-3
                rounded-xl px-3 py-3
                text-sm font-medium
                text-slate-400
                transition
                hover:bg-red-500/10
                hover:text-red-400
              "
            >

              <span className="flex w-5 justify-center">
                <FaSignOutAlt />
              </span>

              <span>
                Logout
              </span>

            </button>

          </div>

        </aside>

        {/* =====================================================
            MAIN AREA
        ===================================================== */}

        <div className="flex min-w-0 flex-1 flex-col">

          {/* =====================================================
              TOP HEADER
          ===================================================== */}

          <header
            className="
              sticky top-0 z-30
              flex h-20
              items-center justify-between
              border-b border-white/10
              bg-slate-950/90
              px-4
              backdrop-blur-xl
              sm:px-6
            "
          >

            {/* Left side */}

            <div className="flex items-center gap-4">

              {/* Mobile menu */}

              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="
                  rounded-xl
                  border border-white/10
                  bg-white/5
                  p-2.5
                  text-slate-300
                  transition
                  hover:bg-white/10
                  hover:text-white
                  lg:hidden
                "
                aria-label="Open sidebar"
              >
                <FaBars />
              </button>

              {/* Page title */}

              <div>

                <h2 className="text-lg font-semibold text-white">
                  {pageTitle}
                </h2>

                <p className="hidden text-xs text-slate-500 sm:block">
                  Manage your EmmCore PropBroker platform
                </p>

              </div>

            </div>

            {/* =================================================
                RIGHT HEADER
            ================================================= */}

            <div className="flex items-center gap-3">

              {/* Notification */}

              <button
                type="button"
                className="
                  relative
                  rounded-xl
                  border border-white/10
                  bg-white/5
                  p-2.5
                  text-slate-400
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
                title="Notifications"
              >

                <FaBell />

                {/* Notification indicator */}

                <span
                  className="
                    absolute
                    right-1.5
                    top-1.5
                    h-2
                    w-2
                    rounded-full
                    bg-cyan-400
                  "
                />

              </button>

              {/* Divider */}

              <div className="hidden h-8 w-px bg-white/10 sm:block" />

              {/* =================================================
                  USER
              ================================================= */}

              <div className="hidden items-center gap-3 sm:flex">

                <div className="text-right">

                  <p className="max-w-[180px] truncate text-sm font-medium text-white">
                    {user?.name || "Admin User"}
                  </p>

                  <p className="text-xs text-slate-500">
                    Administrator
                  </p>

                </div>

                {/* Header avatar */}

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-bold text-cyan-400 ring-1 ring-cyan-500/30">
                  {userInitial}
                </div>

              </div>

            </div>

          </header>

          {/* =====================================================
              CONTENT
          ===================================================== */}

          <main className="flex-1 p-4 sm:p-6 lg:p-8">

            {/* =================================================
                SESSION STATUS
            ================================================= */}

            <div
              className="
                mb-6
                hidden
                items-center
                justify-between
                rounded-xl
                border border-white/10
                bg-slate-900/50
                px-4 py-3
                md:flex
              "
            >

              {/* Session */}

              <div className="flex items-center gap-2 text-xs text-slate-400">

                <FaCheckCircle className="text-emerald-400" />

                <span>
                  Admin session active
                </span>

              </div>

              {/* Security */}

              <div className="flex items-center gap-2 text-xs text-slate-500">

                <FaClock />

                <span>
                  Secure administration panel
                </span>

              </div>

            </div>

            {/* =================================================
                CHILD ADMIN PAGE
            ================================================= */}

            <Outlet />

          </main>

        </div>

      </div>
    </div>
  );
};

export default AdminLayout;