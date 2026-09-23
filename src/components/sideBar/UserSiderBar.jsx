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
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
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
          border-slate-200
          bg-white
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
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              EmmCore
              <span className="text-blue-600">Prop</span>
            </h1>

            <p className="text-xs text-slate-500">
              Trader Dashboard
            </p>
          </div>

          <button
            onClick={closeSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          >
            <FaTimes />
          </button>
        </div>

        {/* USER PROFILE */}
        <div className="shrink-0 border-b border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FaUser />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">
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
                <FaCheckCircle className="text-green-500" />

                <span className="text-green-600">
                  Email Verified
                </span>
              </>
            ) : (
              <>
                <FaClock className="text-yellow-500" />

                <span className="text-yellow-600">
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
        <div className="shrink-0 border-t border-slate-200 p-4">
          <a
            href="/"
            onClick={closeSidebar}
            className="mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
          >
            <FaHome />

            <span>View Website</span>
          </a>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
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