import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {AuthProvider} from "./context/AuthContext";

import GuestLayout from "./layers/GuestLayout";
import AuthLayout from "./layers/AuthLayout";
import AdminLayout from "./layers/AdminLayout";
import UserLayout from "./layers/UserLayout";


//Authentication Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/CreateAccount";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VeryEmail";
import DisableTwoFactor from "./pages/auth/DisableTwoFactor";
import ResendVerification from "./pages/auth/ResendVerificationEmail";
import TwoFactorAuth from "./pages/auth/TwoFactor";
import TwoFactorSetup from "./pages/auth/SetupTwoFactor";

//Public Pages
import Home from "./pages/landing/Home";

//Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUserManagement from "./pages/Admin/UsersManagement";
import AdminKycDetails from "./pages/Admin/KYC";
import AdminUserDetails from "./pages/Admin/UserDetails"

function App() {
  return (
    <Router>
      <AuthProvider>
      <Routes>

        {/* =========================
            GUEST / PUBLIC ROUTES
        ========================== */}
        <Route element={<GuestLayout />}>
          <Route path="/" element={<Home />} />
        </Route>

        {/* =========================
            AUTHENTICATION ROUTES
        ========================== */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/disable-two-factor" element={<DisableTwoFactor />} />
          <Route path="/resend-verification" element={<ResendVerification />} />
          <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
          <Route path="/two-factor-setup" element={<TwoFactorSetup />} />
        </Route>

        {/* =========================
            ADMIN ROUTES
        ========================== */}
        <Route element={<AdminLayout />}>
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/userManagement" element={<AdminUserManagement />} />
           <Route path="/admin/users/:userId/kyc" element={<AdminKycDetails />} />
            <Route path="/admin/users/:userId/details" element={<AdminUserDetails />} />
        </Route>

        {/* =========================
            USER ROUTES
        ========================== */}
        <Route element={<UserLayout />}>
          <Route path="/userDashboard" element={<h1>User Dashboard</h1>} />
        </Route>

      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;