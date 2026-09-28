import { useEffect, useState } from "react";
import {
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaChartLine,
  FaShieldAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaArrowRight,
  FaExchangeAlt,
} from "react-icons/fa";

import { Link } from "react-router-dom";

import api from "../../library/api";

const UserDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  const wallet = dashboard?.wallet || {};
  const deposits = dashboard?.deposits || {};
  const withdrawals = dashboard?.withdrawals || {};
  const trading = dashboard?.trading || {};
  const recentDeposits = dashboard?.recentDeposits || [];

  // =========================================================
  // LOAD USER DASHBOARD
  // =========================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/users/dashboard");

        setDashboard(response.data.data);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            className="
              h-10 w-10
              animate-spin
              rounded-full
              border-4
              border-surface-700
              border-t-brand-500
            "
          />

          <p className="text-sm text-surface-400">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div
        className="
          rounded-2xl
          border border-danger-500/20
          bg-danger-500/5
          p-6
        "
      >
        <div className="flex items-start gap-4">
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              bg-danger-500/10
              text-danger-400
            "
          >
            <FaExclamationCircle />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Unable to load dashboard
            </h3>

            <p className="mt-1 text-sm text-surface-400">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="
                mt-4
                rounded-lg
                bg-brand-500
                px-4 py-2
                text-sm font-medium
                text-white
                transition
                hover:bg-brand-600
              "
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // USER
  // =========================================================

  const user = dashboard?.user || {};

  const firstName =
    user?.name?.split(" ")[0] || "Trader";

  return (
    <div className="space-y-6">

      {/* =====================================================
          WELCOME HEADER
      ===================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-2xl
          border border-surface-700
          bg-surface-900
          p-6
          sm:p-8
        "
      >
        {/* Decorative background */}
        <div
          className="
            pointer-events-none
            absolute -right-20 -top-20
            h-48 w-48
            rounded-full
            bg-brand-500/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute -bottom-20 -left-20
            h-40 w-40
            rounded-full
            bg-accent-500/5
            blur-3xl
          "
        />

        <div className="relative">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-brand-400">
                User Dashboard
              </p>

              <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
                Welcome back, {firstName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-surface-400">
                Manage your account, monitor your wallet and keep
                track of your trading activity from one place.
              </p>
            </div>

            <AccountStatus status={user.status} />
          </div>
        </div>
      </section>

      {/* =====================================================
          WALLET CARDS
      ===================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Wallet Overview
          </h2>

          <p className="mt-1 text-sm text-surface-400">
            Monitor your available funds and account activity.
          </p>
        </div>

        <div
          className="
            grid grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <WalletCard
            title="Available Balance"
            value={`${wallet.currency || "USD"} ${Number(
              wallet.balance || 0
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            description="Current wallet balance"
            icon={<FaWallet />}
            iconClass="bg-brand-500/10 text-brand-400"
          />

          <WalletCard
            title="Total Deposited"
            value={deposits.successful ?? 0}
            description="Successful deposits"
            icon={<FaArrowDown />}
            iconClass="bg-success-500/10 text-success-400"
          />

          <WalletCard
            title="Total Withdrawn"
            value={withdrawals.successful ?? 0}
            description="Completed withdrawals"
            icon={<FaArrowUp />}
            iconClass="bg-warning-500/10 text-warning-400"
          />

          <WalletCard
            title="Trading Balance"
            value={
              trading.balance !== null
                ? trading.balance
                : "Not available"
            }
            description="Trading account balance"
            icon={<FaChartLine />}
            iconClass="bg-accent-500/10 text-accent-400"
          />
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section
        className="
          rounded-2xl
          border border-surface-700
          bg-surface-900
          p-6
        "
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-surface-400">
            Quickly access the most important account functions.
          </p>
        </div>

        <div
          className="
            grid grid-cols-1
            gap-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <QuickAction
            to="/user/deposit"
            title="Make a Deposit"
            description="Fund your wallet"
            icon={<FaArrowDown />}
            iconClass="bg-success-500/10 text-success-400"
          />

          <QuickAction
            to="/user/withdraw"
            title="Withdraw Funds"
            description="Request a withdrawal"
            icon={<FaArrowUp />}
            iconClass="bg-warning-500/10 text-warning-400"
          />

          <QuickAction
            to="/user/transactions"
            title="Transactions"
            description="View your activity"
            icon={<FaExchangeAlt />}
            iconClass="bg-brand-500/10 text-brand-400"
          />

          <QuickAction
            to="/user/profile"
            title="My Profile"
            description="Manage your account"
            icon={<FaUser />}
            iconClass="bg-accent-500/10 text-accent-400"
          />
        </div>
      </section>

      {/* =====================================================
          ACCOUNT + SECURITY
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">

        {/* ACCOUNT VERIFICATION */}

        <section
          className="
            rounded-2xl
            border border-surface-700
            bg-surface-900
            p-6
          "
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Account Verification
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Keep your account information verified and up to date.
            </p>
          </div>

          <div className="space-y-3">

            <VerificationRow
              title="Email Verification"
              description={user.email || "Email address"}
              verified={user.emailVerified}
              icon={<FaEnvelope />}
            />

            <VerificationRow
              title="Identity Verification"
              description="KYC verification"
              verified={user.kycStatus === "verified"}
              pending={user.kycStatus === "pending"}
              icon={<FaIdCard />}
            />

            <VerificationRow
              title="Two-Factor Authentication"
              description="Additional account protection"
              verified={user.twoFactorEnabled}
              icon={<FaShieldAlt />}
            />

          </div>
        </section>

        {/* SECURITY */}

        <section
          className="
            rounded-2xl
            border border-surface-700
            bg-surface-900
            p-6
          "
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Security
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Manage your account security settings.
            </p>
          </div>

          <div className="space-y-3">

            <SecurityRow
              title="Account Status"
              value={user.status || "Unknown"}
              icon={<FaShieldAlt />}
            />

            <SecurityRow
              title="Email"
              value={user.email || "Not available"}
              icon={<FaEnvelope />}
            />

            <SecurityRow
              title="Two-Factor Authentication"
              value={
                user.twoFactorEnabled
                  ? "Enabled"
                  : "Not enabled"
              }
              icon={<FaShieldAlt />}
            />

            <Link
              to="/user/security"
              className="
                group
                flex items-center justify-between
                rounded-xl
                border border-surface-700
                bg-surface-950/40
                p-4
                transition
                hover:border-brand-500/30
                hover:bg-surface-800/50
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-lg
                    bg-brand-500/10
                    text-brand-400
                  "
                >
                  <FaShieldAlt />
                </div>

                <div>
                  <p className="text-sm font-medium text-surface-200">
                    Security Settings
                  </p>

                  <p className="mt-0.5 text-xs text-surface-500">
                    Manage password, 2FA and sessions
                  </p>
                </div>
              </div>

              <FaArrowRight
                className="
                  text-surface-500
                  transition
                  group-hover:translate-x-1
                  group-hover:text-brand-400
                "
              />
            </Link>

          </div>
        </section>
      </div>

      {/* =====================================================
          TRADING ACCOUNT
      ===================================================== */}

      <section
        className="
          rounded-2xl
          border border-surface-700
          bg-surface-900
          p-6
        "
      >
        <div
          className="
            mb-6
            flex flex-col gap-3
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h2 className="text-lg font-semibold text-white">
              Trading Account
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Your trading account performance will appear here.
            </p>
          </div>

          <div
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              bg-brand-500/10
              text-brand-400
            "
          >
            <FaChartLine />
          </div>
        </div>

        <div
          className="
            grid grid-cols-1
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <TradingCard
            title="Account Balance"
            value="—"
          />

          <TradingCard
            title="Profit / Loss"
            value="—"
          />

          <TradingCard
            title="Current Drawdown"
            value="—"
          />

          <TradingCard
            title="Active Challenge"
            value="—"
          />
        </div>

        <div
          className="
            mt-5
            rounded-xl
            border border-surface-700
            bg-surface-950/40
            p-4
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex h-9 w-9 shrink-0
                items-center justify-center
                rounded-lg
                bg-brand-500/10
                text-brand-400
              "
            >
              <FaChartLine />
            </div>

            <div>
              <p className="text-sm font-medium text-surface-200">
                Trading features are being prepared
              </p>

              <p className="mt-1 text-xs leading-5 text-surface-500">
                Your trading account statistics will appear here
                once the trading and challenge modules are connected
                to the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RECENT ACTIVITY
      ===================================================== */}

      <section
        className="
          overflow-hidden
          rounded-2xl
          border border-surface-700
          bg-surface-900
        "
      >
        <div
          className="
            flex flex-col gap-2
            border-b border-surface-700
            p-6
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Your latest account activity will appear here.
            </p>
          </div>

          <Link
            to="/user/transactions"
            className="
              inline-flex items-center gap-2
              text-sm font-medium
              text-brand-400
              transition
              hover:text-brand-300
            "
          >
            View all
            <FaArrowRight className="text-xs" />
          </Link>
        </div>

        <div className="p-6">
          <div
            className="
              flex flex-col
              items-center
              justify-center
              rounded-xl
              border border-dashed
              border-surface-700
              bg-surface-950/30
              px-6 py-12
              text-center
            "
          >
            <div
              className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                bg-surface-800
                text-surface-500
              "
            >
              <FaClock />
            </div>

            <h3 className="mt-4 text-sm font-medium text-surface-300">
              No recent activity
            </h3>

            <p className="mt-1 max-w-md text-xs text-surface-500">
              Deposits, withdrawals and other account activity
              will appear here.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};


// =========================================================
// WALLET CARD
// =========================================================

const WalletCard = ({
  title,
  value,
  description,
  icon,
  iconClass,
}) => {
  return (
    <div
      className="
        rounded-2xl
        border border-surface-700
        bg-surface-900
        p-5
        transition
        hover:border-brand-500/30
        hover:shadow-lg
        hover:shadow-black/10
      "
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-surface-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold text-white">
            {value}
          </p>

          <p className="mt-1 text-xs text-surface-500">
            {description}
          </p>
        </div>

        <div
          className={`
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            ${iconClass}
          `}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};


// =========================================================
// QUICK ACTION
// =========================================================

const QuickAction = ({
  to,
  title,
  description,
  icon,
  iconClass,
}) => {
  return (
    <Link
      to={to}
      className="
        group
        flex items-center justify-between
        rounded-xl
        border border-surface-700
        bg-surface-950/40
        p-4
        transition
        hover:border-brand-500/30
        hover:bg-surface-800/50
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-10 w-10
            items-center justify-center
            rounded-lg
            ${iconClass}
          `}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm font-medium text-surface-200">
            {title}
          </p>

          <p className="mt-0.5 text-xs text-surface-500">
            {description}
          </p>
        </div>
      </div>

      <FaArrowRight
        className="
          text-xs text-surface-600
          transition
          group-hover:translate-x-1
          group-hover:text-brand-400
        "
      />
    </Link>
  );
};


// =========================================================
// ACCOUNT STATUS
// =========================================================

const AccountStatus = ({ status }) => {
  const normalized = status?.toLowerCase();

  const config = {
    active: {
      label: "Account Active",
      className:
        "border-success-500/20 bg-success-500/10 text-success-400",
      icon: <FaCheckCircle />,
    },

    verified: {
      label: "Verified",
      className:
        "border-success-500/20 bg-success-500/10 text-success-400",
      icon: <FaCheckCircle />,
    },

    pending: {
      label: "Account Pending",
      className:
        "border-warning-500/20 bg-warning-500/10 text-warning-400",
      icon: <FaClock />,
    },

    suspended: {
      label: "Account Suspended",
      className:
        "border-warning-500/20 bg-warning-500/10 text-warning-400",
      icon: <FaExclamationCircle />,
    },

    blocked: {
      label: "Account Blocked",
      className:
        "border-danger-500/20 bg-danger-500/10 text-danger-400",
      icon: <FaExclamationCircle />,
    },
  };

  const current = config[normalized] || {
    label: "Account Status",
    className:
      "border-surface-700 bg-surface-800 text-surface-400",
    icon: <FaShieldAlt />,
  };

  return (
    <div
      className={`
        inline-flex w-fit
        items-center gap-2
        rounded-full
        border
        px-3 py-2
        text-xs font-medium
        ${current.className}
      `}
    >
      {current.icon}
      {current.label}
    </div>
  );
};


// =========================================================
// VERIFICATION ROW
// =========================================================

const VerificationRow = ({
  title,
  description,
  verified,
  pending,
  icon,
}) => {
  return (
    <div
      className="
        flex items-center justify-between
        gap-4
        rounded-xl
        border border-surface-700
        bg-surface-950/40
        p-4
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-lg
            bg-brand-500/10
            text-brand-400
          "
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-surface-200">
            {title}
          </p>

          <p className="mt-0.5 truncate text-xs text-surface-500">
            {description}
          </p>
        </div>
      </div>

      {pending ? (
        <span
          className="
            inline-flex shrink-0
            items-center gap-1.5
            rounded-full
            border border-warning-500/20
            bg-warning-500/10
            px-2.5 py-1
            text-xs font-medium
            text-warning-400
          "
        >
          <FaClock />
          Pending
        </span>
      ) : verified ? (
        <span
          className="
            inline-flex shrink-0
            items-center gap-1.5
            rounded-full
            border border-success-500/20
            bg-success-500/10
            px-2.5 py-1
            text-xs font-medium
            text-success-400
          "
        >
          <FaCheckCircle />
          Verified
        </span>
      ) : (
        <span
          className="
            inline-flex shrink-0
            items-center gap-1.5
            rounded-full
            border border-surface-700
            bg-surface-800
            px-2.5 py-1
            text-xs font-medium
            text-surface-400
          "
        >
          Not enabled
        </span>
      )}
    </div>
  );
};


// =========================================================
// SECURITY ROW
// =========================================================

const SecurityRow = ({
  title,
  value,
  icon,
}) => {
  return (
    <div
      className="
        flex items-center justify-between
        gap-4
        rounded-xl
        border border-surface-700
        bg-surface-950/40
        p-4
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            rounded-lg
            bg-brand-500/10
            text-brand-400
          "
        >
          {icon}
        </div>

        <p className="text-sm text-surface-300">
          {title}
        </p>
      </div>

      <span className="max-w-[50%] truncate text-right text-sm text-surface-400">
        {value}
      </span>
    </div>
  );
};


// =========================================================
// TRADING CARD
// =========================================================

const TradingCard = ({
  title,
  value,
}) => {
  return (
    <div
      className="
        rounded-xl
        border border-surface-700
        bg-surface-950/40
        p-4
      "
    >
      <p className="text-sm text-surface-400">
        {title}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
};

export default UserDashboard;