import { useEffect, useState } from "react";
import {
  FaUsers,
  FaUserCheck,
  FaUserClock,
  FaEnvelopeOpen,
  FaShieldAlt,
  FaIdCard,
  FaUserPlus,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaWallet,
  FaMoneyBillWave,
  FaHourglassHalf,
  FaExclamationCircle,
  FaCoins,
} from "react-icons/fa";

import api from "../../library/api";

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD DASHBOARD DATA
  // =========================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/admin/dashboard");

        console.log("ADMIN DASHBOARD:", response.data);

        setDashboard(response.data.data);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);

        setError(
          error.response?.data?.message ||
          "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // =========================================================
  // LOADING STATE
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
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR STATE
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
            <FaTimesCircle />
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
                mt-4 rounded-lg
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
  // DATA
  // =========================================================

  const users = dashboard?.users || {};
  const kyc = dashboard?.kyc || {};
  const deposits = dashboard?.deposits || {};
  const recentUsers = dashboard?.recentUsers || [];

  const depositVolume = deposits.volume || {};

  // =========================================================
  // STAT CARDS
  // =========================================================

  const statCards = [
    {
      title: "Total Users",
      value: users.total ?? 0,
      icon: <FaUsers />,
      iconStyle: "bg-brand-500/10 text-brand-400",
    },
    {
      title: "Active Users",
      value: users.active ?? 0,
      icon: <FaUserCheck />,
      iconStyle: "bg-success-500/10 text-success-400",
    },
    {
      title: "Pending Users",
      value: users.pending ?? 0,
      icon: <FaUserClock />,
      iconStyle: "bg-warning-500/10 text-warning-400",
    },
    {
      title: "Verified Users",
      value: users.verified ?? 0,
      icon: <FaEnvelopeOpen />,
      iconStyle: "bg-accent-500/10 text-accent-400",
    },
  ];

  // =========================================================
  // DEPOSIT STAT CARDS
  // =========================================================

  const depositStatCards = [
    {
      title: "Total Deposits",
      value: deposits.total ?? 0,
      icon: <FaWallet />,
      iconStyle: "bg-brand-500/10 text-brand-400",
    },
    {
      title: "Successful Deposits",
      value: deposits.successful ?? 0,
      icon: <FaCheckCircle />,
      iconStyle: "bg-success-500/10 text-success-400",
    },
    {
      title: "Pending Deposits",
      value: deposits.pending ?? 0,
      icon: <FaHourglassHalf />,
      iconStyle: "bg-warning-500/10 text-warning-400",
    },
    {
      title: "Failed Deposits",
      value: deposits.failed ?? 0,
      icon: <FaExclamationCircle />,
      iconStyle: "bg-danger-500/10 text-danger-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div
        className="
          flex flex-col gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p className="text-sm font-medium text-brand-400">
            Admin Dashboard
          </p>

          <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
            Platform Overview
          </h1>

          <p className="mt-1 text-sm text-surface-400">
            Monitor users, verification, deposits and platform activity.
          </p>
        </div>

        <div
          className="
            inline-flex w-fit
            items-center gap-2
            rounded-full
            border border-success-500/20
            bg-success-500/10
            px-3 py-2
            text-xs font-medium
            text-success-400
          "
        >
          <span
            className="
              h-2 w-2
              rounded-full
              bg-success-500
              shadow-[0_0_8px_rgba(34,197,94,0.7)]
            "
          />

          System Operational
        </div>
      </div>

      {/* =====================================================
          USER STAT CARDS
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {statCards.map((card) => (
          <div
            key={card.title}
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
                  {card.title}
                </p>

                <p className="mt-2 text-3xl font-bold text-white">
                  {card.value.toLocaleString()}
                </p>
              </div>

              <div
                className={`
                  flex h-11 w-11
                  items-center justify-center
                  rounded-xl
                  ${card.iconStyle}
                `}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          DEPOSIT OVERVIEW
      ===================================================== */}

      <div
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
              Deposit Overview
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Monitor deposits and incoming funds across the platform.
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
            <FaMoneyBillWave />
          </div>
        </div>

        {/* DEPOSIT STAT CARDS */}

        <div
          className="
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {depositStatCards.map((card) => (
            <div
              key={card.title}
              className="
                rounded-xl
                border border-surface-700
                bg-surface-950/40
                p-4
                transition
                hover:border-brand-500/30
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-surface-400">
                    {card.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-white">
                    {(card.value ?? 0).toLocaleString()}
                  </p>
                </div>

                <div
                  className={`
                    flex h-10 w-10
                    items-center justify-center
                    rounded-lg
                    ${card.iconStyle}
                  `}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =====================================================
          DEPOSIT STATUS + VOLUME
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* DEPOSIT STATUS */}

        <div
          className="
            rounded-2xl
            border border-surface-700
            bg-surface-900
            p-6
          "
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Deposit Status
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Current payment status across all deposits.
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Successful"
              value={deposits.successful}
              icon={<FaCheckCircle />}
              iconClass="text-success-400 bg-success-500/10"
            />

            <StatusRow
              label="Pending"
              value={deposits.pending}
              icon={<FaClock />}
              iconClass="text-warning-400 bg-warning-500/10"
            />

            <StatusRow
              label="Processing"
              value={deposits.processing}
              icon={<FaHourglassHalf />}
              iconClass="text-brand-400 bg-brand-500/10"
            />

            <StatusRow
              label="Failed"
              value={deposits.failed}
              icon={<FaTimesCircle />}
              iconClass="text-danger-400 bg-danger-500/10"
            />

            <StatusRow
              label="Cancelled"
              value={deposits.cancelled}
              icon={<FaTimesCircle />}
              iconClass="text-surface-400 bg-surface-800"
            />

            <StatusRow
              label="Expired"
              value={deposits.expired}
              icon={<FaClock />}
              iconClass="text-surface-400 bg-surface-800"
            />
          </div>
        </div>

        {/* DEPOSIT VOLUME */}

        <div
          className="
            rounded-2xl
            border border-surface-700
            bg-surface-900
            p-6
          "
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Deposit Volume
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Successful deposit volume grouped by currency.
            </p>
          </div>

          <div className="space-y-4">
            <CurrencyRow
              currency="USD"
              label="US Dollar"
              value={depositVolume.USD}
              symbol="$"
            />

            <CurrencyRow
              currency="NGN"
              label="Nigerian Naira"
              value={depositVolume.NGN}
              symbol="₦"
            />

            <CurrencyRow
              currency="CAD"
              label="Canadian Dollar"
              value={depositVolume.CAD}
              symbol="C$"
            />

            <CurrencyRow
              currency="EUR"
              label="Euro"
              value={depositVolume.EUR}
              symbol="€"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          USER OVERVIEW + SECURITY
      ===================================================== */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* USER STATUS */}

        <div
          className="
            rounded-2xl
            border border-surface-700
            bg-surface-900
            p-6
          "
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              User Status
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Current status of registered users.
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Active"
              value={users.active}
              icon={<FaCheckCircle />}
              iconClass="text-success-400 bg-success-500/10"
            />

            <StatusRow
              label="Pending"
              value={users.pending}
              icon={<FaClock />}
              iconClass="text-warning-400 bg-warning-500/10"
            />

            <StatusRow
              label="Suspended"
              value={users.suspended}
              icon={<FaShieldAlt />}
              iconClass="text-warning-400 bg-warning-500/10"
            />

            <StatusRow
              label="Blocked"
              value={users.blocked}
              icon={<FaTimesCircle />}
              iconClass="text-danger-400 bg-danger-500/10"
            />

            <StatusRow
              label="Closed"
              value={users.closed}
              icon={<FaTimesCircle />}
              iconClass="text-surface-400 bg-surface-800"
            />
          </div>
        </div>

        {/* KYC OVERVIEW */}

        <div
          className="
            rounded-2xl
            border border-surface-700
            bg-surface-900
            p-6
          "
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              KYC Overview
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              Current identity verification status.
            </p>
          </div>

          <div className="space-y-4">
            <StatusRow
              label="Not Submitted"
              value={kyc.notSubmitted}
              icon={<FaIdCard />}
              iconClass="text-surface-400 bg-surface-800"
            />

            <StatusRow
              label="Pending Review"
              value={kyc.pending}
              icon={<FaClock />}
              iconClass="text-warning-400 bg-warning-500/10"
            />

            <StatusRow
              label="Verified"
              value={kyc.verified}
              icon={<FaCheckCircle />}
              iconClass="text-success-400 bg-success-500/10"
            />

            <StatusRow
              label="Rejected"
              value={kyc.rejected}
              icon={<FaTimesCircle />}
              iconClass="text-danger-400 bg-danger-500/10"
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          SECURITY OVERVIEW
      ===================================================== */}

      <div
        className="
          rounded-2xl
          border border-surface-700
          bg-surface-900
          p-6
        "
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white">
            Security Overview
          </h2>

          <p className="mt-1 text-sm text-surface-400">
            Account security and administration statistics.
          </p>
        </div>

        <div
          className="
            grid grid-cols-1 gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <SecurityCard
            title="Email Verified"
            value={users.verified}
            icon={<FaEnvelopeOpen />}
          />

          <SecurityCard
            title="Email Unverified"
            value={users.unverified}
            icon={<FaUserClock />}
          />

          <SecurityCard
            title="2FA Enabled"
            value={users.twoFactorEnabled}
            icon={<FaShieldAlt />}
          />

          <SecurityCard
            title="Administrators"
            value={users.admins}
            icon={<FaUserCheck />}
          />
        </div>
      </div>

      {/* =====================================================
          RECENT USERS
      ===================================================== */}

      <div
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
              Recent Users
            </h2>

            <p className="mt-1 text-sm text-surface-400">
              The latest users registered on the platform.
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
            <FaUserPlus />
          </div>
        </div>

        {/* DESKTOP TABLE */}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-700">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                  User
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                  KYC
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                  Joined
                </th>
              </tr>
            </thead>

            <tbody>
              {recentUsers.length > 0 ? (
                recentUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="
                      border-b border-surface-800
                      transition
                      hover:bg-surface-800/50
                    "
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-surface-100">
                          {user.name}
                        </p>

                        <p className="mt-1 text-xs text-surface-500">
                          {user.email}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="capitalize text-sm text-surface-300">
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={user.status} />
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={user.kycStatus} />
                    </td>

                    <td className="px-6 py-4 text-sm text-surface-400">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-sm text-surface-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE USERS */}

        <div className="divide-y divide-surface-800 md:hidden">
          {recentUsers.length > 0 ? (
            recentUsers.map((user) => (
              <div
                key={user._id}
                className="p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-surface-100">
                      {user.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-surface-500">
                      {user.email}
                    </p>
                  </div>

                  <StatusBadge status={user.status} />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-surface-500">
                      KYC
                    </p>

                    <p className="mt-1 text-sm capitalize text-surface-300">
                      {user.kycStatus?.replace("_", " ") || "N/A"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-surface-500">
                      Joined
                    </p>

                    <p className="mt-1 text-sm text-surface-300">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-surface-500">
              No users found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// =========================================================
// STATUS ROW
// =========================================================

const StatusRow = ({
  label,
  value,
  icon,
  iconClass,
}) => {
  return (
    <div
      className="
        flex items-center justify-between
        rounded-xl
        border border-surface-700
        bg-surface-950/40
        p-3
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            ${iconClass}
          `}
        >
          {icon}
        </div>

        <span className="text-sm text-surface-300">
          {label}
        </span>
      </div>

      <span className="font-semibold text-white">
        {value ?? 0}
      </span>
    </div>
  );
};

// =========================================================
// CURRENCY ROW
// =========================================================

const CurrencyRow = ({
  currency,
  label,
  value,
  symbol,
}) => {
  const formattedValue = Number(value || 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  return (
    <div
      className="
        flex items-center justify-between
        rounded-xl
        border border-surface-700
        bg-surface-950/40
        p-4
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex h-10 w-10
            items-center justify-center
            rounded-lg
            bg-brand-500/10
            text-brand-400
          "
        >
          <FaCoins />
        </div>

        <div>
          <p className="text-sm font-medium text-surface-200">
            {currency}
          </p>

          <p className="mt-0.5 text-xs text-surface-500">
            {label}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold text-white">
          {symbol}
          {formattedValue}
        </p>

        <p className="mt-0.5 text-xs text-surface-500">
          Successful volume
        </p>
      </div>
    </div>
  );
};

// =========================================================
// SECURITY CARD
// =========================================================

const SecurityCard = ({
  title,
  value,
  icon,
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
      <div
        className="
          flex h-9 w-9
          items-center justify-center
          rounded-lg
          bg-brand-500/10
          text-brand-400
        "
      >
        {icon}
      </div>

      <p className="mt-4 text-sm text-surface-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-white">
        {value ?? 0}
      </p>
    </div>
  );
};

// =========================================================
// STATUS BADGE
// =========================================================

const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();

  const styles = {
    active:
      "bg-success-500/10 text-success-400 border-success-500/20",

    verified:
      "bg-success-500/10 text-success-400 border-success-500/20",

    pending:
      "bg-warning-500/10 text-warning-400 border-warning-500/20",

    suspended:
      "bg-warning-500/10 text-warning-400 border-warning-500/20",

    blocked:
      "bg-danger-500/10 text-danger-400 border-danger-500/20",

    rejected:
      "bg-danger-500/10 text-danger-400 border-danger-500/20",

    closed:
      "bg-surface-800 text-surface-400 border-surface-700",

    not_submitted:
      "bg-surface-800 text-surface-400 border-surface-700",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2.5 py-1
        text-xs font-medium
        capitalize
        ${styles[normalizedStatus] ||
        "bg-surface-800 text-surface-400 border-surface-700"
        }
      `}
    >
      {status?.replace("_", " ") || "N/A"}
    </span>
  );
};

// =========================================================
// DATE FORMATTER
// =========================================================

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default AdminDashboard;