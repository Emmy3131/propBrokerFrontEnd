import { useEffect, useState } from "react";
import {
  FaWallet,
  FaArrowDown,
  FaArrowUp,
  FaExchangeAlt,
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaShieldAlt,
} from "react-icons/fa";

import { Link } from "react-router-dom";
import api from "../../library/api";

const UserDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD
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
        <div className="flex flex-col items-center gap-3">
          <div
            className="
              h-9 w-9
              animate-spin
              rounded-full
              border-4
              border-surface-700
              border-t-brand-500
            "
          />

          <p className="text-sm text-surface-400">
            Loading dashboard...
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
        <div className="flex items-start gap-3">
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
            <h3 className="text-sm font-semibold text-white">
              Unable to load dashboard
            </h3>

            <p className="mt-1 text-sm text-surface-400">
              {error}
            </p>

            <button
              type="button"
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
  // DASHBOARD DATA
  // =========================================================

  const user = dashboard?.user || {};
  const wallet = dashboard?.wallet || {};

  const firstName = user?.name?.split(" ")[0] || "Trader";

  const balance = Number(wallet?.availableBalance || 0);

  const formattedBalance = balance.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-6">

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <section
        className="
          rounded-2xl
          border border-surface-700
          bg-surface-900
          p-6
          sm:p-7
        "
      >
        <div
          className="
            flex flex-col gap-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
              Dashboard
            </p>

            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Welcome back, {firstName}
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-surface-400">
              Manage your wallet and account activity from your
              dashboard.
            </p>
          </div>

          <AccountStatus status={user.status} />
        </div>
      </section>

      {/* =====================================================
          WALLET
      ===================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Wallet
          </h2>

          <p className="mt-1 text-sm text-surface-400">
            Your current available balance.
          </p>
        </div>

        <div
          className="
            rounded-2xl
            border border-surface-700
            bg-surface-900
            p-6
          "
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-surface-400">
                Available Balance
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                {wallet.currency || "$"} {formattedBalance}
              </p>

              <p className="mt-2 text-xs text-surface-500">
                Current wallet balance
              </p>
            </div>

            <div
              className="
                flex h-12 w-12 shrink-0
                items-center justify-center
                rounded-xl
                bg-brand-500/10
                text-lg
                text-brand-400
              "
            >
              <FaWallet />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-surface-400">
            Access your main account functions.
          </p>
        </div>

        <div
          className="
            grid grid-cols-1
            gap-3
            sm:grid-cols-3
          "
        >
          <QuickAction
            to="/user/deposits"
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
            description="View account activity"
            icon={<FaExchangeAlt />}
            iconClass="bg-brand-500/10 text-brand-400"
          />
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
            flex items-center justify-between
            gap-4
            border-b border-surface-700
            p-5
            sm:p-6
          "
        >
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Activity
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Your latest account activity.
            </p>
          </div>

          <Link
            to="/user/transactions"
            className="
              inline-flex shrink-0
              items-center gap-2
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

        <div className="p-5 sm:p-6">
          <div
            className="
              flex flex-col
              items-center
              justify-center
              rounded-xl
              border border-dashed
              border-surface-700
              bg-surface-950/30
              px-6 py-10
              text-center
            "
          >
            <div
              className="
                flex h-11 w-11
                items-center justify-center
                rounded-xl
                bg-surface-800
                text-surface-500
              "
            >
              <FaClock />
            </div>

            <h3 className="mt-3 text-sm font-medium text-surface-300">
              No recent activity
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-surface-500">
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
        bg-surface-900
        p-4
        transition
        hover:border-brand-500/30
        hover:bg-surface-800/40
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-lg
            ${iconClass}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">
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
          ml-3 shrink-0
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

export default UserDashboard;