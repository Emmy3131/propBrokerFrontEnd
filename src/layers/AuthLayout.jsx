import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <div className="min-h-screen site-bg">
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;