import { useState } from "react";
import { Outlet, Link } from "react-router-dom";

import {
  FaBars,
  FaBell,
  FaUser,
  FaChevronDown,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import UserSidebar from "../components/sideBar/UserSiderBar";

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useAuth();

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  /*
  =====================================================
  USER IDENTITY
  =====================================================
  */

  const firstName =
    user?.name?.trim()?.split(" ")[0] || "Trader";

  const fullName =
    user?.name || "Trader";

  const email =
    user?.email || "No email";

  const role =
    user?.role || "user";

  // Create initials for the avatar
  const initials =
    user?.name
      ?.trim()
      ?.split(/\s+/)
      ?.slice(0, 2)
      ?.map((name) => name.charAt(0).toUpperCase())
      ?.join("") || "U";

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <UserSidebar
        sidebarOpen={sidebarOpen}
        closeSidebar={closeSidebar}
      />

      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div className="lg:ml-72">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header
          className="
            sticky top-0 z-30
            flex h-20 items-center justify-between
            border-b border-surface-700
            bg-surface-900/95
            px-4
            backdrop-blur-md
            sm:px-6
            lg:px-8
          "
        >

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div className="flex items-center gap-4">

            {/* MOBILE MENU */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="
                rounded-lg p-2
                text-surface-300
                transition
                hover:bg-surface-800
                hover:text-brand-400
                lg:hidden
              "
              aria-label="Open menu"
            >
              <FaBars className="text-xl" />
            </button>

            {/* WELCOME MESSAGE */}

            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Welcome back,{" "}
                <span className="text-brand-400">
                  {firstName}
                </span>
              </h2>

              <p className="hidden text-xs text-surface-400 sm:block">
                Manage your trading account and activity
              </p>
            </div>
          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="flex items-center gap-2 sm:gap-4">

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            <button
              type="button"
              className="
                relative rounded-lg p-2.5
                text-surface-300
                transition
                hover:bg-surface-800
                hover:text-brand-400
              "
              aria-label="Notifications"
            >
              <FaBell className="text-lg" />

              {/* Notification indicator */}

              <span
                className="
                  absolute right-1.5 top-1.5
                  h-2 w-2
                  rounded-full
                  bg-accent-500
                  shadow-[0_0_8px_rgba(34,211,238,0.7)]
                "
              />
            </button>

            {/* =================================================
                USER PROFILE
            ================================================= */}

            <Link
              to="/user/profile"
              className="
                group
                flex items-center gap-3
                border-l border-surface-700
                pl-3
                sm:pl-4
              "
            >

              {/* USER INFORMATION */}

              <div className="hidden text-right sm:block">

                <p
                  className="
                    max-w-[180px]
                    truncate
                    text-sm
                    font-semibold
                    text-surface-100
                    group-hover:text-brand-400
                    transition
                  "
                  title={fullName}
                >
                  {fullName}
                </p>

                <p
                  className="
                    max-w-[180px]
                    truncate
                    text-xs
                    text-surface-400
                  "
                  title={email}
                >
                  {email}
                </p>

                <div className="mt-0.5 flex items-center justify-end gap-1">
                  <span
                    className="
                      rounded-full
                      bg-brand-500/10
                      px-2 py-0.5
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-wide
                      text-brand-400
                    "
                  >
                    {role}
                  </span>
                </div>
              </div>

              {/* USER AVATAR */}

              <div
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-full
                  border border-brand-500/40
                  bg-brand-500/10
                  text-sm
                  font-bold
                  text-brand-400
                  transition
                  group-hover:border-brand-400
                  group-hover:bg-brand-500/20
                "
                title={fullName}
              >
                {initials}
              </div>

              {/* DESKTOP ARROW */}

              <FaChevronDown
                className="
                  hidden
                  text-xs
                  text-surface-500
                  transition
                  group-hover:text-brand-400
                  sm:block
                "
              />
            </Link>
          </div>
        </header>

        {/* =====================================================
            PAGE CONTENT
        ===================================================== */}

        <main
          className="
            min-h-[calc(100vh-5rem)]
            bg-surface-950
            p-4
            sm:p-6
            lg:p-8
          "
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserLayout;