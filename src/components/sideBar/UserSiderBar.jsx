import {
  FaTimes,
  FaHome,
  FaSignOutAlt,
  FaUser,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";
import SidebarMenu from "../sideBar/SideBar";

const UserSidebar = ({ sidebarOpen, closeSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="
            fixed inset-0 z-40
            bg-surface-950/80
            backdrop-blur-sm
            lg:hidden
          "
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed
          left-0
          top-0
          z-50
          flex
          h-screen
          w-72
          flex-col
          overflow-y-auto
          border-r
          border-surface-700
          bg-surface-900
          shadow-2xl
          shadow-black/30
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
        {/* LOGO */}
        <div
          className="
            flex h-20
            shrink-0
            items-center
            justify-between
            border-b border-surface-700
            px-6
          "
        >
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              EmmCore
              <span className="text-brand-400">Prop</span>
            </h1>

            <p className="text-xs text-surface-400">
              Trader Dashboard
            </p>
          </div>

          {/* MOBILE CLOSE */}
          <button
            onClick={closeSidebar}
            className="
              rounded-lg p-2
              text-surface-400
              transition
              hover:bg-surface-800
              hover:text-brand-400
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        {/* USER PROFILE */}
        <div
          className="
            shrink-0
            border-b border-surface-700
            p-5
          "
        >
          <div className="flex items-center gap-3">
            {/* AVATAR */}
            <div
              className="
                flex h-11 w-11
                shrink-0
                items-center justify-center
                rounded-full
                border border-brand-500/30
                bg-brand-500/10
                text-brand-400
              "
            >
              <FaUser />
            </div>

            {/* USER DETAILS */}
            <div className="min-w-0">
              <p className="truncate font-semibold text-surface-100">
                {user?.name || "Trader"}
              </p>

              <p className="truncate text-xs text-surface-400">
                {user?.email || "No email"}
              </p>
            </div>
          </div>

          {/* EMAIL STATUS */}
          <div className="mt-4 flex items-center gap-2 text-xs">
            {user?.emailVerified ? (
              <>
                <FaCheckCircle className="text-success-500" />

                <span className="text-success-500">
                  Email Verified
                </span>
              </>
            ) : (
              <>
                <FaClock className="text-warning-500" />

                <span className="text-warning-500">
                  Email Not Verified
                </span>
              </>
            )}
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1">
          <SidebarMenu onNavigate={closeSidebar} />
        </div>

        {/* BOTTOM ACTIONS */}
        <div
          className="
            shrink-0
            border-t border-surface-700
            p-4
          "
        >
          {/* VIEW WEBSITE */}
          <a
            href="/"
            onClick={closeSidebar}
            className="
              mb-2
              flex items-center gap-3
              rounded-xl
              px-4 py-3
              text-sm font-medium
              text-surface-300
              transition-all
              duration-200
              hover:bg-brand-500/10
              hover:text-brand-400
            "
          >
            <FaHome />

            <span>View Website</span>
          </a>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="
              flex w-full
              items-center gap-3
              rounded-xl
              px-4 py-3
              text-sm font-medium
              text-danger-400
              transition-all
              duration-200
              hover:bg-danger-500/10
              hover:text-danger-300
            "
          >
            <FaSignOutAlt />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default UserSidebar;