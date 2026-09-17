import { Outlet } from "react-router-dom";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        {/* User Sidebar */}
        <aside className="hidden w-64 border-r border-white/10 bg-slate-900 lg:block">
          <div className="p-6">
            <h1 className="text-xl font-bold">
              EmmCore
            </h1>
          </div>

          <nav className="px-4">
            {/* Dashboard navigation will come here */}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <header className="border-b border-white/10 bg-slate-900 px-6 py-4">
            <h2 className="font-semibold">
              Trader Dashboard
            </h2>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;