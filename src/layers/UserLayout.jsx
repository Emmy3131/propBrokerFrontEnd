import { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  FaBars,
  FaBell,
  FaUser,
} from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import UserSidebar from "../components/sideBar/UserSiderBar";

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useAuth();

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-surface-950 text-surface-100">
      {/* SIDEBAR */}
      <UserSidebar
        sidebarOpen={sidebarOpen}
        closeSidebar={closeSidebar}
      />

      {/* MAIN AREA */}
      <div className="lg:ml-72">
        {/* HEADER */}
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
          {/* LEFT */}
          <div className="flex items-center gap-4">
            {/* MOBILE MENU */}
            <button
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

            {/* WELCOME */}
            <div>
              <h2 className="text-lg font-semibold text-white">
                Welcome back,{" "}
                {user?.name?.split(" ")[0] || "Trader"}
              </h2>

              <p className="hidden text-xs text-surface-400 sm:block">
                Manage your trading account and activity
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* NOTIFICATIONS */}
            <button
              className="
                relative rounded-lg p-2
                text-surface-300
                transition
                hover:bg-surface-800
                hover:text-brand-400
              "
              aria-label="Notifications"
            >
              <FaBell />

              {/* Notification indicator */}
              <span
                className="
                  absolute right-1 top-1
                  h-2 w-2
                  rounded-full
                  bg-accent-500
                  shadow-[0_0_8px_rgba(34,211,238,0.7)]
                "
              />
            </button>

            {/* USER PROFILE */}
            <div
              className="
                hidden items-center gap-3
                border-l border-surface-700
                pl-4
                sm:flex
              "
            >
              {/* USER INFO */}
              <div className="text-right">
                <p className="text-sm font-medium text-surface-100">
                  {user?.name || "Trader"}
                </p>

                <p className="text-xs capitalize text-surface-400">
                  {user?.role || "user"}
                </p>
              </div>

              {/* USER AVATAR */}
              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  border border-brand-500/30
                  bg-brand-500/10
                  text-brand-400
                "
              >
                <FaUser />
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
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