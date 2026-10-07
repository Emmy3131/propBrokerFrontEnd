import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoutes";

// =====================================================
// LAYOUTS
// =====================================================

import GuestLayout from "./layers/GuestLayout";
import AuthLayout from "./layers/AuthLayout";
import AdminLayout from "./layers/AdminLayout";
import UserLayout from "./layers/UserLayout";

// =====================================================
// AUTHENTICATION PAGES
// =====================================================

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/CreateAccount";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VeryEmail";
import DisableTwoFactor from "./pages/auth/DisableTwoFactor";
import ResendVerification from "./pages/auth/ResendVerificationEmail";
import TwoFactorAuth from "./pages/auth/TwoFactor";
import TwoFactorSetup from "./pages/auth/SetupTwoFactor";

// =====================================================
// SECURITY
// =====================================================

import Security from "./pages/Security";
import TwoFactorAuthentication from "./pages/TwoFactoreAuthentication";
import SetupTwoFactor from "./pages/SetupFactor";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Home from "./pages/landing/Home";
import Profile from "./pages/Profile";

// =====================================================
// ADMIN PAGES
// =====================================================

import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUserManagement from "./pages/Admin/UsersManagement";
import AdminKycDetails from "./pages/Admin/KYC";
import AdminUserDetails from "./pages/Admin/UserDetails";
import Deposits from "./pages/Admin/Deposits";
import AdminDepositDetails from "./pages/Admin/AdminDepositeDetails";
import AdminWithdrawals from "./pages/Admin/Withdrawals";
import AdminWithdrawalDetails from "./pages/Admin/AdminWithdrawalDetails";
import PaymentMethods from "./pages/Admin/PaymentMethod";

// =====================================================
// USER PAGES
// =====================================================

import UserDashboard from "./pages/users/UserDashoard";
import Transactions from "./pages/users/Transactions";
import Deposit from "./pages/users/Deposit";
import Withdraw from "./pages/users/Withdrawals";
import KYC from "./pages/users/KYC";


function App() {
  return (
    <Router>
      <AuthProvider>

        <Routes>

          {/* =================================================
                        PUBLIC / GUEST ROUTES
                    ================================================= */}

          <Route element={<GuestLayout />}>

            <Route
              path="/"
              element={<Home />}
            />

          </Route>


          {/* =================================================
                        AUTHENTICATION ROUTES
                    ================================================= */}

          <Route element={<AuthLayout />}>

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />

            <Route
              path="/reset-password/:token"
              element={<ResetPassword />}
            />

            <Route
              path="/verify-email/:token"
              element={<VerifyEmail />}
            />

            <Route
              path="/disable-two-factor"
              element={<DisableTwoFactor />}
            />

            <Route
              path="/resend-verification"
              element={<ResendVerification />}
            />

            <Route
              path="/two-factor"
              element={<TwoFactorAuth />}
            />

            <Route
              path="/two-factor-setup"
              element={<TwoFactorSetup />}
            />

          </Route>


          {/* =================================================
                        ADMIN PROTECTED ROUTES
                    ================================================= */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              />
            }
          >

            {/* ---------------------------------------------
                            ADMIN LAYOUT

                            Everything inside this route will render
                            inside AdminLayout's <Outlet />
                        --------------------------------------------- */}

            <Route
              element={<AdminLayout />}
            >

              {/* Admin Dashboard */}

              <Route
                path="/adminDashboard"
                element={<AdminDashboard />}
              />

              {/* User Management */}

              <Route
                path="/userManagement"
                element={<AdminUserManagement />}
              />

              {/* User KYC */}

              <Route
                path="/admin/users/:userId/kyc"
                element={<AdminKycDetails />}
              />

              {/* User Details */}

              <Route
                path="/admin/users/:userId/details"
                element={<AdminUserDetails />}
              />

               {/* Deposits */}

              <Route
                path="/admin/payment-methods"
                element={<PaymentMethods />}
              />

              {/* Deposits */}

              <Route
                path="/deposits"
                element={<Deposits />}
              />

              {/* Deposit Details */}

              <Route
                path="/admin/deposits/:depositId"
                element={<AdminDepositDetails />}
              />

              {/* Withdrawals */}

              <Route
                path="/admin/withdrawals"
                element={<AdminWithdrawals />}
              />

              {/* Withdrawal Details */}

              <Route
                path="/admin/withdrawals/:withdrawalId"
                element={<AdminWithdrawalDetails />}
              />

              {/* Admin Profile */}

              <Route
                path="/admin/profile"
                element={<Profile />}
              />

              {/* Admin Security */}

              <Route
                path="/admin/security"
                element={<Security />}
              />

              {/* Admin 2FA */}

              <Route
                path="/admin/security/2fa/setup"
                element={<TwoFactorAuthentication />}
              />

            </Route>

          </Route>


          {/* =================================================
                        USER PROTECTED ROUTES
                    ================================================= */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["user"]}
              />
            }
          >

            {/* ---------------------------------------------
                            USER LAYOUT

                            Everything inside this route will render
                            inside UserLayout's <Outlet />

                            This is where your SIDEBAR comes from.
                        --------------------------------------------- */}

            <Route
              element={<UserLayout />}
            >

              {/* User Dashboard */}

              <Route
                path="/user/dashboard"
                element={<UserDashboard />}
              />

              {/* User Profile */}

              <Route
                path="/user/profile"
                element={<Profile />}
              />

              {/* User Security */}

              <Route
                path="/user/security"
                element={<Security />}
              />

              {/* Transactions */}

              <Route
                path="/user/transactions"
                element={<Transactions />}
              />

              {/* Deposits */}

              <Route
                path="/user/deposits"
                element={<Deposit />}
              />

              {/* Withdraw */}

              <Route
                path="/user/withdraw"
                element={<Withdraw />}
              />

              {/* User 2FA Setup */}

              <Route
                path="/user/security/2fa/setup"
                element={
                  <TwoFactorAuthentication />
                }
              />

              {/* Alternative 2FA Setup */}

              <Route
                path="/user/setup-factor"
                element={<SetupTwoFactor />}
              />

              {/* KYC */}

              <Route
                path="/user/kyc"
                element={<KYC />}
              />

            </Route>

          </Route>

        </Routes>

      </AuthProvider>
    </Router>
  );
}

export default App;