import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowsRotate,
  FaCheck,
  FaClock,
  FaCoins,
  FaCreditCard,
  FaEnvelope,
  FaTriangleExclamation,
  FaEye,
  FaIdCard,
  FaMoneyBillTransfer,
//   FaShieldAlt,
    FaShieldHalved,
  FaUser,
  FaUserGroup,
  FaWallet,
  FaXmark,
} from "react-icons/fa6";

import api from "../../library/api";

const AdminUserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /*
  =====================================================
  FETCH USER DETAILS
  =====================================================
  */

  const fetchUserDetails = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        `/admin/users/${userId}/details`,
      );

setData(response.data?.data || null);
    } catch (err) {
    console.error("Failed to load user details:", err);

    setError(
        err.response?.data?.message ||
        "Unable to load user details.",
    );
} finally {
    setLoading(false);
    setRefreshing(false);
}
  };

/*
=====================================================
INITIAL LOAD
=====================================================
*/

useEffect(() => {
    if (userId) {
        fetchUserDetails();
    }
}, [userId]);

/*
=====================================================
HELPERS
=====================================================
*/

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString();
};

const formatDateOnly = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString();
};

const formatAmount = (amount, currency = "USD") => {
    if (amount === null || amount === undefined) {
        return "—";
    }

    const numericAmount = Number(amount);

    if (Number.isNaN(numericAmount)) {
        return `${amount} ${currency}`;
    }

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
        }).format(numericAmount);
    } catch {
        return `${amount} ${currency}`;
    }
};

const getInitials = (name = "") => {
    return (
        name
            .trim()
            .split(/\s+/)
            .slice(0, 2)
            .map((word) => word[0])
            .join("")
            .toUpperCase() || "U"
    );
};

/*
=====================================================
STATUS BADGE
=====================================================
*/

const getStatusClass = (status) => {
    switch (status) {
        case "active":
        case "verified":
        case "successful":
            return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

        case "pending":
        case "processing":
        case "under_review":
            return "bg-amber-500/10 text-amber-400 border-amber-500/20";

        case "suspended":
        case "rejected":
        case "failed":
            return "bg-red-500/10 text-red-400 border-red-500/20";

        case "blocked":
        case "closed":
        case "cancelled":
        case "expired":
            return "bg-gray-500/10 text-gray-400 border-gray-500/20";

        default:
            return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    }
};

const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

/*
=====================================================
LOADING STATE
=====================================================
*/

if (loading) {
    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="mx-auto max-w-7xl">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 w-48 rounded-lg bg-slate-800" />

                    <div className="h-48 rounded-2xl bg-slate-800" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="h-32 rounded-2xl bg-slate-800" />
                        <div className="h-32 rounded-2xl bg-slate-800" />
                        <div className="h-32 rounded-2xl bg-slate-800" />
                    </div>

                    <div className="h-96 rounded-2xl bg-slate-800" />
                </div>
            </div>
        </div>
    );
}

/*
=====================================================
ERROR STATE
=====================================================
*/

if (error || !data) {
    return (
        <div className="min-h-screen bg-slate-950 p-6">
            <div className="mx-auto max-w-4xl">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                    <FaArrowLeft />
                    Back
                </button>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                    <FaTriangleExclamation className="mx-auto mb-4 text-3xl text-red-400" />

                    <h2 className="text-xl font-semibold text-white">
                        Unable to load user
                    </h2>

                    <p className="mt-2 text-sm text-slate-400">
                        {error || "User details could not be found."}
                    </p>

                    <button
                        type="button"
                        onClick={() => fetchUserDetails()}
                        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                    >
                        <FaArrowsRotate />
                        Try Again
                    </button>
                </div>
            </div>
        </div>
    );
}

const {
    user,
    security,
    kyc,
    wallet,
    deposits,
    ledger,
    referrals,
    withdrawals,
    trading,
} = data;

const recentDeposits = deposits?.recent || [];
const ledgerEntries = ledger?.recent || [];

/*
=====================================================
MAIN PAGE
=====================================================
*/

return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
            {/* =================================================
            TOP BAR
        ================================================= */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex w-fit items-center gap-2 text-sm text-slate-400 transition hover:text-white"
                >
                    <FaArrowLeft />
                    Back to Users
                </button>

                <button
                    type="button"
                    disabled={refreshing}
                    onClick={() => fetchUserDetails(true)}
                    className="flex w-fit items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FaArrowsRotate
                        className={refreshing ? "animate-spin" : ""}
                    />
                    {refreshing ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {/* =================================================
            USER HEADER
        ================================================= */}

            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
                <div className="h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400" />

                <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.name}
                                    className="h-16 w-16 rounded-full border border-slate-700 object-cover"
                                />
                            ) : (
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 text-xl font-bold text-cyan-400">
                                    {getInitials(user.name)}
                                </div>
                            )}

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold text-white">
                                        {user.name}
                                    </h1>

                                    <span
                                        className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                            user.status,
                                        )}`}
                                    >
                                        {formatStatus(user.status)}
                                    </span>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-2">
                                        <FaEnvelope />
                                        {user.email}
                                    </span>

                                    {user.phone && (
                                        <span>{user.phone}</span>
                                    )}
                                </div>

                                <p className="mt-2 text-xs text-slate-500">
                                    User ID: {user._id}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Link
                                to={`/admin/users/${user._id}/kyc`}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-500/40 hover:text-white"
                            >
                                <FaIdCard />
                                View KYC
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
            SUMMARY CARDS
        ================================================= */}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Wallet */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between">
                        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                            <FaWallet />
                        </div>

                        <span
                            className={`rounded-full border px-2 py-1 text-xs ${getStatusClass(
                                wallet?.status,
                            )}`}
                        >
                            {formatStatus(wallet?.status)}
                        </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-400">
                        Available Balance
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                        {wallet
                            ? formatAmount(
                                wallet.availableBalance,
                                wallet.currency,
                            )
                            : "—"}
                    </h2>

                    {wallet && (
                        <p className="mt-1 text-xs text-slate-500">
                            Locked:{" "}
                            {formatAmount(
                                wallet.lockedBalance,
                                wallet.currency,
                            )}
                        </p>
                    )}
                </div>

                {/* Deposits */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between">
                        <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                            <FaCreditCard />
                        </div>

                        <span className="text-xs text-slate-500">
                            All time
                        </span>
                    </div>

                    <p className="mt-4 text-sm text-slate-400">
                        Successful Deposits
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                        {deposits?.summary?.successfulDeposits ?? 0}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Total deposits:{" "}
                        {deposits?.summary?.totalDeposits ?? 0}
                    </p>
                </div>

                {/* KYC */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between">
                        <div className="rounded-xl bg-purple-500/10 p-3 text-purple-400">
                            <FaIdCard />
                        </div>

                        {user.kycStatus && (
                            <span
                                className={`rounded-full border px-2 py-1 text-xs ${getStatusClass(
                                    user.kycStatus,
                                )}`}
                            >
                                {formatStatus(user.kycStatus)}
                            </span>
                        )}
                    </div>

                    <p className="mt-4 text-sm text-slate-400">
                        KYC Status
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                        {formatStatus(user.kycStatus)}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        {user.kycVerifiedAt
                            ? `Verified ${formatDateOnly(
                                user.kycVerifiedAt,
                            )}`
                            : "Verification date unavailable"}
                    </p>
                </div>

                {/* Referrals */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="flex items-center justify-between">
                        <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
                            <FaUserGroup />
                        </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-400">
                        Referred Users
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                        {referrals?.totalReferredUsers ?? 0}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                        Code: {referrals?.referralCode || "—"}
                    </p>
                </div>
            </section>

            {/* =================================================
            ACCOUNT + SECURITY
        ================================================= */}

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Account Information */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                            <FaUser />
                        </div>

                        <div>
                            <h2 className="font-semibold text-white">
                                Account Information
                            </h2>

                            <p className="text-xs text-slate-500">
                                User profile and account details
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InfoItem label="Full Name" value={user.name} />
                        <InfoItem label="Email" value={user.email} />
                        <InfoItem label="Phone" value={user.phone} />
                        <InfoItem label="Country" value={user.country} />
                        <InfoItem
                            label="Role"
                            value={formatStatus(user.role)}
                        />
                        <InfoItem
                            label="Account Status"
                            value={formatStatus(user.status)}
                        />
                        <InfoItem
                            label="Registered"
                            value={formatDate(user.createdAt)}
                        />
                        <InfoItem
                            label="Last Active"
                            value={formatDate(user.lastActiveAt)}
                        />
                    </div>
                </div>

                {/* Security */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                            <FaShieldHalved/>
                        </div>

                        <div>
                            <h2 className="font-semibold text-white">
                                Security
                            </h2>

                            <p className="text-xs text-slate-500">
                                Authentication and security status
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <SecurityRow
                            label="Email Verification"
                            enabled={security?.emailVerified}
                        />

                        <SecurityRow
                            label="Two-Factor Authentication"
                            enabled={security?.twoFactorEnabled}
                        />

                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-sm text-slate-400">
                                Last Login
                            </span>

                            <span className="text-sm text-slate-200">
                                {formatDate(security?.lastLoginAt)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-sm text-slate-400">
                                Last Active
                            </span>

                            <span className="text-sm text-slate-200">
                                {formatDate(security?.lastActiveAt)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">
                                2FA Last Used
                            </span>

                            <span className="text-sm text-slate-200">
                                {formatDate(
                                    security?.twoFactorLastUsedAt,
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================
            KYC
        ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                            <FaIdCard />
                        </div>

                        <div>
                            <h2 className="font-semibold text-white">
                                KYC Verification
                            </h2>

                            <p className="text-xs text-slate-500">
                                Identity verification information
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span
                            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusClass(
                                kyc?.status || user.kycStatus,
                            )}`}
                        >
                            {formatStatus(
                                kyc?.status || user.kycStatus,
                            )}
                        </span>

                        <Link
                            to={`/admin/users/${user._id}/kyc`}
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                            <FaEye />
                            View KYC
                        </Link>
                    </div>
                </div>

                {kyc ? (
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <InfoItem
                            label="Applicant Name"
                            value={`${kyc.firstName || ""} ${kyc.lastName || ""
                                }`.trim()}
                        />

                        <InfoItem
                            label="Date of Birth"
                            value={formatDateOnly(kyc.dateOfBirth)}
                        />

                        <InfoItem
                            label="Country"
                            value={kyc.country}
                        />

                        <InfoItem
                            label="Document Type"
                            value={formatStatus(
                                kyc.identityDocumentType,
                            )}
                        />

                        <InfoItem
                            label="City"
                            value={kyc.city}
                        />

                        <InfoItem
                            label="State"
                            value={kyc.state}
                        />

                        <InfoItem
                            label="Submitted"
                            value={formatDate(kyc.submittedAt)}
                        />

                        <InfoItem
                            label="Reviewed"
                            value={formatDate(kyc.reviewedAt)}
                        />
                    </div>
                ) : (
                    <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center">
                        <FaIdCard className="mx-auto mb-3 text-2xl text-slate-600" />

                        <p className="text-sm text-slate-400">
                            This user has not submitted KYC information.
                        </p>
                    </div>
                )}
            </section>

            {/* =================================================
            WALLET + DEPOSIT VOLUME
        ================================================= */}

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Wallet */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                            <FaWallet />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Wallet
                            </h2>

                            <p className="text-xs text-slate-500">
                                Current wallet state
                            </p>
                        </div>
                    </div>

                    {wallet ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FinancialBox
                                label="Available Balance"
                                value={formatAmount(
                                    wallet.availableBalance,
                                    wallet.currency,
                                )}
                            />

                            <FinancialBox
                                label="Locked Balance"
                                value={formatAmount(
                                    wallet.lockedBalance,
                                    wallet.currency,
                                )}
                            />

                            <InfoItem
                                label="Currency"
                                value={wallet.currency}
                            />

                            <InfoItem
                                label="Status"
                                value={formatStatus(wallet.status)}
                            />

                            <InfoItem
                                label="Last Transaction"
                                value={formatDate(
                                    wallet.lastTransactionAt,
                                )}
                            />
                        </div>
                    ) : (
                        <EmptyState text="No wallet found for this user." />
                    )}
                </div>

                {/* Deposit Volume */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-400">
                            <FaCoins />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Deposit Volume
                            </h2>

                            <p className="text-xs text-slate-500">
                                Successful deposits by currency
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {Object.entries(
                            deposits?.volumeByCurrency || {},
                        ).map(([currency, amount]) => (
                            <FinancialBox
                                key={currency}
                                label={currency}
                                value={formatAmount(amount, currency)}
                            />
                        ))}
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <MiniStat
                            label="Total"
                            value={
                                deposits?.summary?.totalDeposits ?? 0
                            }
                        />

                        <MiniStat
                            label="Pending"
                            value={
                                deposits?.summary?.pendingDeposits ?? 0
                            }
                        />

                        <MiniStat
                            label="Processing"
                            value={
                                deposits?.summary?.processingDeposits ?? 0
                            }
                        />

                        <MiniStat
                            label="Failed"
                            value={
                                deposits?.summary?.failedDeposits ?? 0
                            }
                        />
                    </div>
                </div>
            </section>

            {/* =================================================
            RECENT DEPOSITS
        ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 p-5">
                    <div>
                        <h2 className="font-semibold">
                            Recent Deposits
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Latest 20 deposit records
                        </p>
                    </div>

                    <FaCreditCard className="text-slate-600" />
                </div>

                {recentDeposits.length === 0 ? (
                    <EmptyState text="No deposits found for this user." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                                    <th className="px-5 py-4">
                                        Reference
                                    </th>

                                    <th className="px-5 py-4">
                                        Provider
                                    </th>

                                    <th className="px-5 py-4">
                                        Amount
                                    </th>

                                    <th className="px-5 py-4">
                                        Status
                                    </th>

                                    <th className="px-5 py-4">
                                        Verification
                                    </th>

                                    <th className="px-5 py-4">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentDeposits.map((deposit) => (
                                    <tr
                                        key={deposit._id}
                                        className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                                    >
                                        <td className="px-5 py-4">
                                            <p className="font-mono text-xs text-slate-300">
                                                {deposit.reference}
                                            </p>
                                        </td>

                                        <td className="px-5 py-4 text-sm capitalize text-slate-300">
                                            {deposit.provider}
                                        </td>

                                        <td className="px-5 py-4 text-sm font-semibold text-white">
                                            {formatAmount(
                                                deposit.amount,
                                                deposit.currency,
                                            )}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-xs ${getStatusClass(
                                                    deposit.status,
                                                )}`}
                                            >
                                                {formatStatus(
                                                    deposit.status,
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4 text-xs text-slate-400">
                                            {deposit.verificationMethod
                                                ? formatStatus(
                                                    deposit.verificationMethod,
                                                )
                                                : "—"}
                                        </td>

                                        <td className="px-5 py-4 text-xs text-slate-500">
                                            {formatDate(deposit.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* =================================================
            LEDGER
        ================================================= */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-800 p-5">
                    <div>
                        <h2 className="font-semibold">
                            Financial Ledger
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Immutable financial transaction history
                        </p>
                    </div>

                    <FaMoneyBillTransfer className="text-slate-600" />
                </div>

                {ledgerEntries.length === 0 ? (
                    <EmptyState text="No ledger entries found for this user." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead>
                                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
                                    <th className="px-5 py-4">
                                        Type
                                    </th>

                                    <th className="px-5 py-4">
                                        Direction
                                    </th>

                                    <th className="px-5 py-4">
                                        Amount
                                    </th>

                                    <th className="px-5 py-4">
                                        Balance After
                                    </th>

                                    <th className="px-5 py-4">
                                        Reference
                                    </th>

                                    <th className="px-5 py-4">
                                        Description
                                    </th>

                                    <th className="px-5 py-4">
                                        Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {ledgerEntries.map((entry) => {
                                    const isCredit =
                                        entry.direction === "CREDIT";

                                    return (
                                        <tr
                                            key={entry._id}
                                            className="border-b border-slate-800/70 transition hover:bg-slate-800/30"
                                        >
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-semibold text-slate-200">
                                                    {entry.type}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${isCredit
                                                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                            : "border-red-500/20 bg-red-500/10 text-red-400"
                                                        }`}
                                                >
                                                    {isCredit ? (
                                                        <FaCheck />
                                                    ) : (
                                                        <FaXmark />
                                                    )}

                                                    {entry.direction}
                                                </span>
                                            </td>

                                            <td
                                                className={`px-5 py-4 text-sm font-semibold ${isCredit
                                                        ? "text-emerald-400"
                                                        : "text-red-400"
                                                    }`}
                                            >
                                                {isCredit ? "+" : "-"}
                                                {formatAmount(
                                                    entry.amount,
                                                    entry.currency,
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-300">
                                                {formatAmount(
                                                    entry.balanceAfter,
                                                    entry.currency,
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-mono text-xs text-slate-400">
                                                    {entry.reference || "—"}
                                                </span>
                                            </td>

                                            <td className="max-w-[220px] px-5 py-4 text-xs text-slate-400">
                                                {entry.description || "—"}
                                            </td>

                                            <td className="px-5 py-4 text-xs text-slate-500">
                                                {formatDate(entry.createdAt)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* =================================================
            REFERRALS
        ================================================= */}

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Referral information */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                    <div className="mb-5 flex items-center gap-3">
                        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
                            <FaUserGroup />
                        </div>

                        <div>
                            <h2 className="font-semibold">
                                Referral Information
                            </h2>

                            <p className="text-xs text-slate-500">
                                User referral relationship
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <InfoItem
                            label="Referral Code"
                            value={referrals?.referralCode}
                        />

                        <InfoItem
                            label="Total Referred Users"
                            value={
                                referrals?.totalReferredUsers ?? 0
                            }
                        />

                        <div>
                            <p className="text-xs text-slate-500">
                                Referred By
                            </p>

                            {referrals?.referredBy ? (
                                <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                                    <p className="text-sm font-medium text-white">
                                        {referrals.referredBy.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-500">
                                        {referrals.referredBy.email}
                                    </p>

                                    <p className="mt-1 font-mono text-xs text-cyan-400">
                                        {referrals.referredBy.referralCode ||
                                            "—"}
                                    </p>
                                </div>
                            ) : (
                                <p className="mt-1 text-sm text-slate-400">
                                    No referrer
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Future modules */}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FutureModule
                        icon={<FaMoneyBillTransfer />}
                        title="Withdrawals"
                        available={withdrawals?.available}
                        message={withdrawals?.message}
                    />

                    <FutureModule
                        icon={<FaCoins />}
                        title="Trading"
                        available={trading?.available}
                        message={trading?.message}
                    />
                </div>
            </section>
        </div>
    </div>
);
};

/*
=======================================================
INFO ITEM
=======================================================
*/

const InfoItem = ({ label, value }) => {
    return (
        <div>
            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="mt-1 break-words text-sm text-slate-200">
                {value !== null &&
                    value !== undefined &&
                    value !== ""
                    ? value
                    : "—"}
            </p>
        </div>
    );
};

/*
=======================================================
SECURITY ROW
=======================================================
*/

const SecurityRow = ({ label, enabled }) => {
    return (
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-sm text-slate-400">
                {label}
            </span>

            <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${enabled
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                        : "border-slate-700 bg-slate-800 text-slate-400"
                    }`}
            >
                {enabled ? <FaCheck /> : <FaXmark />}

                {enabled ? "Enabled" : "Disabled"}
            </span>
        </div>
    );
};

/*
=======================================================
FINANCIAL BOX
=======================================================
*/

const FinancialBox = ({ label, value }) => {
    return (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-lg font-semibold text-white">
                {value}
            </p>
        </div>
    );
};

/*
=======================================================
MINI STAT
=======================================================
*/

const MiniStat = ({ label, value }) => {
    return (
        <div className="rounded-lg bg-slate-950/50 p-3">
            <p className="text-xs text-slate-500">
                {label}
            </p>

            <p className="mt-1 text-lg font-semibold text-white">
                {value}
            </p>
        </div>
    );
};

/*
=======================================================
EMPTY STATE
=======================================================
*/

const EmptyState = ({ text }) => {
    return (
        <div className="p-8 text-center">
            <FaClock className="mx-auto mb-3 text-xl text-slate-600" />

            <p className="text-sm text-slate-500">
                {text}
            </p>
        </div>
    );
};

/*
=======================================================
FUTURE MODULE
=======================================================
*/

const FutureModule = ({
    icon,
    title,
    available,
    message,
}) => {
    return (
        <div className="flex flex-col justify-between rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-5">
            <div>
                <div className="mb-4 w-fit rounded-lg bg-slate-800 p-3 text-slate-500">
                    {icon}
                </div>

                <h3 className="font-semibold text-slate-300">
                    {title}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                    {message}
                </p>
            </div>

            <span className="mt-5 inline-flex w-fit rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-500">
                {available ? "Available" : "Coming later"}
            </span>
        </div>
    );
};

export default AdminUserDetails;
