import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaArrowsRotate,
    FaArrowTrendDown,
    FaArrowTrendUp,
    FaCheck,
    FaClock,
    FaCoins,
    FaCreditCard,
    FaEye,
    FaMagnifyingGlass,
    FaTriangleExclamation,
    FaXmark,
} from "react-icons/fa6";

import api from "../../library/api";

const STATUS_OPTIONS = [
    "all",
    "pending",
    "processing",
    "successful",
    "failed",
    "cancelled",
    "expired",
];

const PROVIDER_OPTIONS = ["all", "paystack", "flutterwave", "stripe"];

const CURRENCY_OPTIONS = ["all", "USD", "NGN", "CAD", "EUR"];

const emptySummary = {
    totalDeposits: 0,
    successfulDeposits: 0,
    pendingDeposits: 0,
    processingDeposits: 0,
    failedDeposits: 0,
    cancelledDeposits: 0,
    expiredDeposits: 0,
};

const emptyVolume = {
    USD: "0",
    NGN: "0",
    CAD: "0",
    EUR: "0",
};

function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatAmount(amount, currency = "USD") {
    if (amount === null || amount === undefined) {
        return `${currency} 0.00`;
    }

    let value = amount;

    if (typeof amount === "object" && amount.$numberDecimal) {
        value = amount.$numberDecimal;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return `${currency} 0.00`;
    }

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericValue);
}

function formatStatus(status) {
    if (!status) return "Unknown";

    return status
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClasses(status) {
    switch (status) {
        case "successful":
            return "bg-success/10 text-success border-success/20";

        case "processing":
            return "bg-brand/10 text-brand border-brand/20";

        case "pending":
            return "bg-warning/10 text-warning border-warning/20";

        case "failed":
        case "cancelled":
        case "expired":
            return "bg-danger/10 text-danger border-danger/20";

        default:
            return "bg-surface-800 text-surface-300 border-surface-700";
    }
}

function getProviderClasses(provider) {
    switch (provider?.toLowerCase()) {
        case "paystack":
            return "bg-success/10 text-success";

        case "flutterwave":
            return "bg-warning/10 text-warning";

        case "stripe":
            return "bg-brand/10 text-brand";

        default:
            return "bg-surface-800 text-surface-300";
    }
}

function StatCard({
    title,
    value,
    description,
    icon,
    iconClass = "bg-brand/10 text-brand",
}) {
    return (
        <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-surface-400">{title}</p>

                    <h3 className="mt-2 text-2xl font-bold text-white">
                        {value}
                    </h3>

                    {description && (
                        <p className="mt-2 text-xs text-surface-500">
                            {description}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

function VolumeCard({ currency, amount }) {
    return (
        <div className="rounded-2xl border border-surface-700 bg-surface-900 p-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-surface-400">
                    {currency}
                </span>

                <FaCoins className="text-brand" />
            </div>

            <p className="mt-3 text-lg font-bold text-white">
                {formatAmount(amount, currency)}
            </p>

            <p className="mt-1 text-xs text-surface-500">
                Successful deposit volume
            </p>
        </div>
    );
}

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                status
            )}`}
        >
            {formatStatus(status)}
        </span>
    );
}

function VerificationBadge({ deposit }) {
    if (deposit.status !== "successful") {
        return (
            <span className="text-xs text-surface-500">
                Not verified
            </span>
        );
    }

    return (
        <div className="flex flex-col gap-1">
            <span className="inline-flex w-fit items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">
                <FaCheck size={10} />
                Verified
            </span>

            {deposit.verificationMethod && (
                <span className="text-[11px] capitalize text-surface-500">
                    {deposit.verificationMethod.replace(/_/g, " ")}
                </span>
            )}
        </div>
    );
}

export default function Deposits() {
    const [deposits, setDeposits] = useState([]);

    const [summary, setSummary] = useState(emptySummary);
    const [volumeByCurrency, setVolumeByCurrency] =
        useState(emptyVolume);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [provider, setProvider] = useState("all");
    const [currency, setCurrency] = useState("all");

    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalDeposits: 0,
        currentPage: 1,
        perPage: 20,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const loadDeposits = async ({
        showLoader = true,
        requestedPage = page,
    } = {}) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

            const params = new URLSearchParams();

            params.set("page", requestedPage);
            params.set("limit", 20);

            if (search.trim()) {
                params.set("search", search.trim());
            }

            if (status !== "all") {
                params.set("status", status);
            }

            if (provider !== "all") {
                params.set("provider", provider);
            }

            if (currency !== "all") {
                params.set("currency", currency);
            }

            const response = await api.get(
                `/admin/deposits?${params.toString()}`
            );

            const data = response?.data?.data || {};

            setDeposits(data.deposits || []);

            setSummary({
                ...emptySummary,
                ...(data.summary || {}),
            });

            setVolumeByCurrency({
                ...emptyVolume,
                ...(data.volumeByCurrency || {}),
            });

            setPagination({
                totalDeposits: data.pagination?.totalDeposits || 0,
                currentPage: data.pagination?.currentPage || requestedPage,
                perPage: data.pagination?.perPage || 20,
                totalPages: data.pagination?.totalPages || 1,
                hasNextPage: Boolean(data.pagination?.hasNextPage),
                hasPreviousPage: Boolean(
                    data.pagination?.hasPreviousPage
                ),
            });
        } catch (err) {
            console.error("Failed to load deposits:", err);

            setError(
                err?.response?.data?.message ||
                "Unable to load deposits. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadDeposits({
            showLoader: true,
            requestedPage: 1,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, provider, currency]);

    const handleSearch = (event) => {
        event.preventDefault();

        setPage(1);

        loadDeposits({
            showLoader: true,
            requestedPage: 1,
        });
    };

    const handleReset = () => {
        setSearch("");
        setStatus("all");
        setProvider("all");
        setCurrency("all");
        setPage(1);
    };

    const handlePreviousPage = () => {
        if (!pagination.hasPreviousPage) return;

        const nextPage = page - 1;

        setPage(nextPage);

        loadDeposits({
            showLoader: true,
            requestedPage: nextPage,
        });
    };

    const handleNextPage = () => {
        if (!pagination.hasNextPage) return;

        const nextPage = page + 1;

        setPage(nextPage);

        loadDeposits({
            showLoader: true,
            requestedPage: nextPage,
        });
    };

    const filteredDeposits = useMemo(() => {
        return deposits;
    }, [deposits]);

    return (
        <div className="min-h-screen bg-surface-950 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px] space-y-6">
                {/* HEADER */}
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <FaCreditCard />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Deposits
                                </h1>

                                <p className="text-sm text-surface-400">
                                    Monitor and manage customer deposits.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            loadDeposits({
                                showLoader: false,
                                requestedPage: page,
                            })
                        }
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-white transition hover:border-brand/40 hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FaArrowsRotate
                            className={refreshing ? "animate-spin" : ""}
                        />

                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* ERROR */}
                {error && (
                    <div className="flex items-center justify-between gap-4 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                        <div className="flex items-center gap-3">
                            <FaTriangleExclamation />

                            <span>{error}</span>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                loadDeposits({
                                    showLoader: true,
                                    requestedPage: page,
                                })
                            }
                            className="rounded-lg border border-danger/20 px-3 py-1.5 text-xs font-medium hover:bg-danger/10"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* SUMMARY */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="Total Deposits"
                        value={summary.totalDeposits}
                        description="All deposit records"
                        icon={<FaCreditCard />}
                    />

                    <StatCard
                        title="Successful"
                        value={summary.successfulDeposits}
                        description="Successfully verified deposits"
                        icon={<FaCheck />}
                        iconClass="bg-success/10 text-success"
                    />

                    <StatCard
                        title="Pending / Processing"
                        value={
                            Number(summary.pendingDeposits || 0) +
                            Number(summary.processingDeposits || 0)
                        }
                        description="Deposits awaiting completion"
                        icon={<FaClock />}
                        iconClass="bg-warning/10 text-warning"
                    />

                    <StatCard
                        title="Failed"
                        value={
                            Number(summary.failedDeposits || 0) +
                            Number(summary.cancelledDeposits || 0) +
                            Number(summary.expiredDeposits || 0)
                        }
                        description="Unsuccessful deposit attempts"
                        icon={<FaArrowTrendDown />}
                        iconClass="bg-danger/10 text-danger"
                    />
                </div>

                {/* VOLUME */}
                <section>
                    <div className="mb-3">
                        <h2 className="text-lg font-semibold text-white">
                            Deposit Volume
                        </h2>

                        <p className="text-sm text-surface-500">
                            Successful customer deposit volume by currency.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {CURRENCY_OPTIONS.slice(1).map((item) => (
                            <VolumeCard
                                key={item}
                                currency={item}
                                amount={volumeByCurrency[item]}
                            />
                        ))}
                    </div>
                </section>

                {/* FILTERS */}
                <section className="rounded-2xl border border-surface-700 bg-surface-900 p-4 sm:p-5">
                    <div className="mb-4">
                        <h2 className="text-base font-semibold text-white">
                            Search & Filters
                        </h2>

                        <p className="mt-1 text-xs text-surface-500">
                            Find deposits by customer, provider, currency or
                            status.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="grid gap-3 lg:grid-cols-[minmax(250px,1fr)_180px_180px_150px_auto_auto]"
                    >
                        {/* SEARCH */}
                        <div className="relative">
                            <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search name, email or reference..."
                                className="w-full rounded-xl border border-surface-700 bg-surface-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-surface-600 focus:border-brand/50"
                            />
                        </div>

                        {/* STATUS */}
                        <select
                            value={status}
                            onChange={(event) =>
                                setStatus(event.target.value)
                            }
                            className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50"
                        >
                            {STATUS_OPTIONS.map((item) => (
                                <option key={item} value={item}>
                                    {item === "all"
                                        ? "All Statuses"
                                        : formatStatus(item)}
                                </option>
                            ))}
                        </select>

                        {/* PROVIDER */}
                        <select
                            value={provider}
                            onChange={(event) =>
                                setProvider(event.target.value)
                            }
                            className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50"
                        >
                            {PROVIDER_OPTIONS.map((item) => (
                                <option key={item} value={item}>
                                    {item === "all"
                                        ? "All Providers"
                                        : item.charAt(0).toUpperCase() +
                                        item.slice(1)}
                                </option>
                            ))}
                        </select>

                        {/* CURRENCY */}
                        <select
                            value={currency}
                            onChange={(event) =>
                                setCurrency(event.target.value)
                            }
                            className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand/50"
                        >
                            {CURRENCY_OPTIONS.map((item) => (
                                <option key={item} value={item}>
                                    {item === "all"
                                        ? "All Currencies"
                                        : item}
                                </option>
                            ))}
                        </select>

                        <button
                            type="submit"
                            className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                        >
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-xl border border-surface-700 bg-surface-800 px-5 py-2.5 text-sm font-medium text-surface-300 transition hover:bg-surface-700 hover:text-white"
                        >
                            Reset
                        </button>
                    </form>
                </section>

                {/* TABLE */}
                <section className="overflow-hidden rounded-2xl border border-surface-700 bg-surface-900">
                    <div className="flex flex-col justify-between gap-3 border-b border-surface-700 p-5 sm:flex-row sm:items-center">
                        <div>
                            <h2 className="text-base font-semibold text-white">
                                Deposit Transactions
                            </h2>

                            <p className="mt-1 text-xs text-surface-500">
                                {pagination.totalDeposits} deposit records
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-surface-500">
                            <FaArrowTrendUp className="text-success" />
                            Customer funds
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex min-h-[400px] items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <FaArrowsRotate className="animate-spin text-2xl text-brand" />

                                <p className="text-sm text-surface-500">
                                    Loading deposits...
                                </p>
                            </div>
                        </div>
                    ) : filteredDeposits.length === 0 ? (
                        <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-800 text-surface-500">
                                <FaCreditCard />
                            </div>

                            <h3 className="mt-4 text-base font-semibold text-white">
                                No deposits found
                            </h3>

                            <p className="mt-1 max-w-md text-sm text-surface-500">
                                There are no deposit records matching your
                                current search and filters.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* DESKTOP TABLE */}
                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[1100px]">
                                    <thead>
                                        <tr className="border-b border-surface-700 bg-surface-950/50">
                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                User
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Amount
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Provider
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Reference
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Verification
                                            </th>

                                            <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Date
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-surface-700">
                                        {filteredDeposits.map((deposit) => (
                                            <tr
                                                key={deposit._id}
                                                className="transition hover:bg-surface-800/40"
                                            >
                                                {/* USER */}
                                                <td className="px-5 py-4">
                                                    <div>
                                                        <p className="font-medium text-white">
                                                            {deposit.user?.name ||
                                                                "Unknown User"}
                                                        </p>

                                                        <p className="mt-1 text-xs text-surface-500">
                                                            {deposit.user?.email || "—"}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* AMOUNT */}
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-white">
                                                        {formatAmount(
                                                            deposit.amount,
                                                            deposit.currency
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-surface-500">
                                                        {deposit.currency}
                                                    </p>
                                                </td>

                                                {/* PROVIDER */}
                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ${getProviderClasses(
                                                            deposit.provider
                                                        )}`}
                                                    >
                                                        {deposit.provider || "Unknown"}
                                                    </span>
                                                </td>

                                                {/* REFERENCE */}
                                                <td className="max-w-[190px] px-5 py-4">
                                                    <p
                                                        className="truncate font-mono text-xs text-surface-300"
                                                        title={deposit.reference}
                                                    >
                                                        {deposit.reference || "—"}
                                                    </p>
                                                </td>

                                                {/* STATUS */}
                                                <td className="px-5 py-4">
                                                    <StatusBadge status={deposit.status} />
                                                </td>

                                                {/* VERIFICATION */}
                                                <td className="px-5 py-4">
                                                    <VerificationBadge deposit={deposit} />
                                                </td>

                                                {/* DATE */}
                                                <td className="whitespace-nowrap px-5 py-4 text-xs text-surface-400">
                                                    {formatDate(deposit.createdAt)}
                                                </td>

                                                {/* ACTION */}
                                                <td className="px-5 py-4 text-right">
                                                    <Link
                                                        to={`/admin/deposits/${deposit._id}`}
                                                        className="inline-flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-xs font-medium text-surface-300 transition hover:border-brand/40 hover:text-white"
                                                    >
                                                        <FaEye />
                                                        View
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* MOBILE CARDS */}
                            <div className="divide-y divide-surface-700 lg:hidden">
                                {filteredDeposits.map((deposit) => (
                                    <div
                                        key={deposit._id}
                                        className="p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-semibold text-white">
                                                    {deposit.user?.name ||
                                                        "Unknown User"}
                                                </p>

                                                <p className="mt-1 truncate text-xs text-surface-500">
                                                    {deposit.user?.email || "—"}
                                                </p>
                                            </div>

                                            <StatusBadge status={deposit.status} />
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-surface-500">
                                                    Amount
                                                </p>

                                                <p className="mt-1 font-semibold text-white">
                                                    {formatAmount(
                                                        deposit.amount,
                                                        deposit.currency
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-surface-500">
                                                    Provider
                                                </p>

                                                <p className="mt-1 capitalize text-surface-300">
                                                    {deposit.provider || "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-surface-500">
                                                    Reference
                                                </p>

                                                <p className="mt-1 truncate font-mono text-xs text-surface-300">
                                                    {deposit.reference || "—"}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-surface-500">
                                                    Date
                                                </p>

                                                <p className="mt-1 text-xs text-surface-300">
                                                    {formatDate(deposit.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-surface-800 pt-3">
                                            <VerificationBadge deposit={deposit} />

                                            <Link
                                                to={`/admin/deposits/${deposit._id}`}
                                                className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white"
                                            >
                                                <FaEye />
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* PAGINATION */}
                    {!loading && filteredDeposits.length > 0 && (
                        <div className="flex flex-col justify-between gap-3 border-t border-surface-700 p-4 sm:flex-row sm:items-center">
                            <p className="text-xs text-surface-500">
                                Page {pagination.currentPage} of{" "}
                                {pagination.totalPages}
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handlePreviousPage}
                                    disabled={!pagination.hasPreviousPage}
                                    className="rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-xs font-medium text-surface-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                <button
                                    type="button"
                                    onClick={handleNextPage}
                                    disabled={!pagination.hasNextPage}
                                    className="rounded-lg border border-surface-700 bg-surface-800 px-3 py-2 text-xs font-medium text-surface-300 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}