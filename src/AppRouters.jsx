import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

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
import Security from "./pages/Security";
import TwoFactorAuthentication from "./pages/TwoFactoreAuthentication";
import SetupTwoFactor from "./pages/SetupFactor";

//Public Pages
import Home from "./pages/landing/Home";
import Profile from "./pages/Profile";


//Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUserManagement from "./pages/Admin/UsersManagement";
import AdminKycDetails from "./pages/Admin/KYC";
import AdminUserDetails from "./pages/Admin/UserDetails"
import Deposits from "./pages/Admin/Deposits";
import AdminDepositDetails from "./pages/Admin/AdminDepositeDetails";
import AdminWithdrawals from "./pages/Admin/Withdrawals"
import AdminWithdrawalDetails from "./pages/Admin/AdminWithdrawalDetails";



//User Pages
import UserDashboard from "./pages/users/UserDashoard";
import Transactions from "./pages/users/Transactions";
import Deposit from "./pages/users/Deposit";
import Withdraw from "./pages/users/Withdrawals";

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
            <Route path="/two-factor" element={<TwoFactorAuth />} />
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
            <Route path="deposits" element={<Deposits />} />
            <Route path="deposits/:depositId" element={<AdminDepositDetails />} />
            <Route path="/adminWihdrawal" element={<AdminWithdrawals />} />
            <Route path="withdrawals/:withdrawalId" element={<AdminWithdrawalDetails />} />
            <Route path="admin/profile" element={<Profile />} />
            <Route path="/admin/security" element={<Security />} />
            <Route path="/security/2fa/setup" element={<TwoFactorAuthentication />} />
          </Route>

          {/* =========================
            USER ROUTES
        ========================== */}
          <Route element={<UserLayout />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/profile" element={<Profile />} />
            <Route path="/user/security" element={<Security />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/user/deposits" element={<Deposit />} />
            <Route path="/user/withdraw" element={<Withdraw />} />
            <Route path="/security/2fa/setup" element={<TwoFactorAuthentication />} />
            <Route path="/setUpFactore" element={<SetupTwoFactor/>}/>
          </Route>

        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;