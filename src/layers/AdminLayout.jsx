import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-white/10 bg-slate-900 lg:block">
          <div className="p-6">
            <h1 className="text-xl font-bold">
              EmmCore Admin
            </h1>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-white/10 bg-slate-900 px-6 py-4">
            <h2 className="font-semibold">
              Administration
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

export default AdminLayout;