import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FaArrowsRotate,
    FaArrowTrendDown,
    FaArrowTrendUp,
    FaBuildingColumns,
    FaCheck,
    FaChevronLeft,
    FaChevronRight,
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
    { value: "", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "under_review", label: "Under Review" },
    { value: "approved", label: "Approved" },
    { value: "processing", label: "Processing" },
    { value: "successful", label: "Successful" },
    { value: "rejected", label: "Rejected" },
    { value: "failed", label: "Failed" },
    { value: "cancelled", label: "Cancelled" },
];

const PROVIDER_OPTIONS = [
    { value: "", label: "All providers" },
    { value: "paystack", label: "Paystack" },
    { value: "flutterwave", label: "Flutterwave" },
    { value: "manual", label: "Manual" },
];

const CURRENCY_OPTIONS = [
    { value: "", label: "All currencies" },
    { value: "USD", label: "USD" },
    { value: "NGN", label: "NGN" },
    { value: "CAD", label: "CAD" },
    { value: "EUR", label: "EUR" },
];

const getDecimalValue = (value) => {
    if (value === null || value === undefined) {
        return 0;
    }

    if (
        typeof value === "object" &&
        value.$numberDecimal !== undefined
    ) {
        return Number(value.$numberDecimal);
    }

    const number = Number(value);

    return Number.isFinite(number) ? number : 0;
};

const formatAmount = (amount, currency = "") => {
    const value = getDecimalValue(amount);

    try {
        return new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch {
        return value.toFixed(2);
    }
};

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleString();
};

const shortenReference = (reference) => {
    if (!reference) return "—";

    if (reference.length <= 18) {
        return reference;
    }

    return `${reference.slice(0, 9)}...${reference.slice(-6)}`;
};

const getStatusClasses = (status) => {
    switch (status) {
        case "successful":
            return "bg-success/10 text-success border-success/20";

        case "pending":
            return "bg-warning/10 text-warning border-warning/20";

        case "under_review":
            return "bg-brand/10 text-brand border-brand/20";

        case "approved":
            return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

        case "processing":
            return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

        case "rejected":
        case "failed":
            return "bg-danger/10 text-danger border-danger/20";

        case "cancelled":
            return "bg-surface-700 text-surface-300 border-surface-600";

        default:
            return "bg-surface-800 text-surface-300 border-surface-700";
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case "successful":
            return <FaCheck />;

        case "pending":
        case "under_review":
        case "approved":
        case "processing":
            return <FaClock />;

        case "rejected":
        case "failed":
            return <FaTriangleExclamation />;

        case "cancelled":
            return <FaXmark />;

        default:
            return <FaClock />;
    }
};

const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
};

const getInitials = (name) => {
    if (!name) return "U";

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
};

const maskAccountNumber = (accountNumber) => {
    if (!accountNumber) return "—";

    if (accountNumber.includes("*")) {
        return accountNumber;
    }

    return `******${accountNumber.slice(-4)}`;
};

const SummaryCard = ({
    title,
    value,
    subtitle,
    icon,
    iconClass,
}) => {
    return (
        <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm text-surface-400">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-white">
                        {value}
                    </p>

                    {subtitle && (
                        <p className="mt-1 text-xs text-surface-500">
                            {subtitle}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
};

const CurrencyCard = ({
    currency,
    amount,
}) => {
    return (
        <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-surface-500">
                        {currency}
                    </p>

                    <p className="mt-2 text-xl font-bold text-white">
                        {formatAmount(amount, currency)}
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <FaCoins />
                </div>
            </div>

            <p className="mt-2 text-xs text-surface-500">
                Successful withdrawals
            </p>
        </div>
    );
};

const StatusBadge = ({ status }) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                status
            )}`}
        >
            {getStatusIcon(status)}
            {formatStatus(status)}
        </span>
    );
};

const Withdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);

    const [summary, setSummary] = useState({
        totalWithdrawals: 0,
        pendingWithdrawals: 0,
        underReviewWithdrawals: 0,
        approvedWithdrawals: 0,
        processingWithdrawals: 0,
        successfulWithdrawals: 0,
        rejectedWithdrawals: 0,
        failedWithdrawals: 0,
        cancelledWithdrawals: 0,
    });

    const [volumeByCurrency, setVolumeByCurrency] =
        useState({
            USD: "0",
            NGN: "0",
            CAD: "0",
            EUR: "0",
        });

    const [pagination, setPagination] =
        useState({
            totalWithdrawals: 0,
            currentPage: 1,
            perPage: 20,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
        });

    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [provider, setProvider] =
        useState("");

    const [currency, setCurrency] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const fetchWithdrawals = useCallback(
        async (isRefresh = false) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const params = new URLSearchParams();

                params.set(
                    "page",
                    pagination.currentPage
                );

                params.set(
                    "limit",
                    pagination.perPage
                );

                if (search.trim()) {
                    params.set(
                        "search",
                        search.trim()
                    );
                }

                if (status) {
                    params.set("status", status);
                }

                if (provider) {
                    params.set(
                        "provider",
                        provider
                    );
                }

                if (currency) {
                    params.set(
                        "currency",
                        currency
                    );
                }

                const response =
                    await api.get(
                        `/admin/withdrawals?${params.toString()}`
                    );

                const responseData =
                    response?.data?.data;

                setWithdrawals(
                    responseData?.withdrawals || []
                );

                setSummary(
                    responseData?.summary || {
                        totalWithdrawals: 0,
                        pendingWithdrawals: 0,
                        underReviewWithdrawals: 0,
                        approvedWithdrawals: 0,
                        processingWithdrawals: 0,
                        successfulWithdrawals: 0,
                        rejectedWithdrawals: 0,
                        failedWithdrawals: 0,
                        cancelledWithdrawals: 0,
                    }
                );

                setVolumeByCurrency(
                    responseData?.volumeByCurrency || {
                        USD: "0",
                        NGN: "0",
                        CAD: "0",
                        EUR: "0",
                    }
                );

                setPagination(
                    responseData?.pagination || {
                        totalWithdrawals: 0,
                        currentPage: 1,
                        perPage: 20,
                        totalPages: 1,
                        hasNextPage: false,
                        hasPreviousPage: false,
                    }
                );
            } catch (err) {
                console.error(
                    "Failed to fetch withdrawals:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Failed to load withdrawals."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [
            pagination.currentPage,
            pagination.perPage,
            search,
            status,
            provider,
            currency,
        ]
    );

    useEffect(() => {
        fetchWithdrawals();
    }, [fetchWithdrawals]);

    const handleSearch = (event) => {
        event.preventDefault();

        setPagination((previous) => ({
            ...previous,
            currentPage: 1,
        }));

        setSearch(searchInput);
    };

    const handleFilterChange = (
        setter
    ) => {
        return (event) => {
            setter(event.target.value);

            setPagination((previous) => ({
                ...previous,
                currentPage: 1,
            }));
        };
    };

    const handleReset = () => {
        setSearchInput("");
        setSearch("");
        setStatus("");
        setProvider("");
        setCurrency("");

        setPagination((previous) => ({
            ...previous,
            currentPage: 1,
        }));
    };

    const handlePreviousPage = () => {
        if (!pagination.hasPreviousPage) {
            return;
        }

        setPagination((previous) => ({
            ...previous,
            currentPage:
                previous.currentPage - 1,
        }));
    };

    const handleNextPage = () => {
        if (!pagination.hasNextPage) {
            return;
        }

        setPagination((previous) => ({
            ...previous,
            currentPage:
                previous.currentPage + 1,
        }));
    };

    const hasFilters =
        search ||
        status ||
        provider ||
        currency;

    return (
        <div className="min-h-screen bg-surface-950 p-4 text-white sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1600px]">

                {/* =========================================
            HEADER
        ========================================= */}

                <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                <FaArrowTrendDown />
                            </div>

                            <div>
                                <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                    Withdrawals
                                </h1>

                                <p className="mt-1 text-sm text-surface-400">
                                    Manage and review customer withdrawal requests.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            fetchWithdrawals(true)
                        }
                        disabled={refreshing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-surface-200 transition hover:border-surface-600 hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaArrowsRotate
                            className={
                                refreshing
                                    ? "animate-spin"
                                    : ""
                            }
                        />

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>
                </div>

                {/* =========================================
            ERROR
        ========================================= */}

                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger/10 p-4 text-danger">
                        <FaTriangleExclamation className="mt-0.5 shrink-0" />

                        <div className="flex-1">
                            <p className="font-medium">
                                Unable to load withdrawals
                            </p>

                            <p className="mt-1 text-sm opacity-80">
                                {error}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                fetchWithdrawals()
                            }
                            className="text-sm font-medium underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* =========================================
            SUMMARY CARDS
        ========================================= */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                        title="Total Withdrawals"
                        value={summary.totalWithdrawals}
                        subtitle="All withdrawal requests"
                        icon={<FaCreditCard />}
                        iconClass="bg-brand/10 text-brand"
                    />

                    <SummaryCard
                        title="Pending"
                        value={summary.pendingWithdrawals}
                        subtitle="Awaiting review"
                        icon={<FaClock />}
                        iconClass="bg-warning/10 text-warning"
                    />

                    <SummaryCard
                        title="Processing"
                        value={
                            summary.processingWithdrawals +
                            summary.approvedWithdrawals
                        }
                        subtitle="Approved or being processed"
                        icon={<FaArrowTrendDown />}
                        iconClass="bg-indigo-500/10 text-indigo-400"
                    />

                    <SummaryCard
                        title="Successful"
                        value={summary.successfulWithdrawals}
                        subtitle="Completed withdrawals"
                        icon={<FaCheck />}
                        iconClass="bg-success/10 text-success"
                    />
                </div>

                {/* =========================================
            CURRENCY VOLUME
        ========================================= */}

                <div className="mt-6">
                    <div className="mb-3">
                        <h2 className="text-lg font-semibold text-white">
                            Withdrawal Volume
                        </h2>

                        <p className="text-sm text-surface-500">
                            Successful withdrawals by currency.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <CurrencyCard
                            currency="USD"
                            amount={
                                volumeByCurrency.USD
                            }
                        />

                        <CurrencyCard
                            currency="NGN"
                            amount={
                                volumeByCurrency.NGN
                            }
                        />

                        <CurrencyCard
                            currency="CAD"
                            amount={
                                volumeByCurrency.CAD
                            }
                        />

                        <CurrencyCard
                            currency="EUR"
                            amount={
                                volumeByCurrency.EUR
                            }
                        />
                    </div>
                </div>

                {/* =========================================
            FILTERS
        ========================================= */}

                <div className="mt-6 rounded-2xl border border-surface-700 bg-surface-900 p-4">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end">

                        <form
                            onSubmit={handleSearch}
                            className="flex flex-1 flex-col gap-2 sm:flex-row"
                        >
                            <div className="relative flex-1">
                                <FaMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-500" />

                                <input
                                    type="text"
                                    value={searchInput}
                                    onChange={(event) =>
                                        setSearchInput(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Search reference, user, email, account..."
                                    className="w-full rounded-xl border border-surface-700 bg-surface-950 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-surface-600 focus:border-brand"
                                />
                            </div>

                            <button
                                type="submit"
                                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                            >
                                Search
                            </button>
                        </form>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:w-[600px]">
                            <select
                                value={status}
                                onChange={handleFilterChange(
                                    setStatus
                                )}
                                className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
                            >
                                {STATUS_OPTIONS.map(
                                    (option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    )
                                )}
                            </select>

                            <select
                                value={provider}
                                onChange={handleFilterChange(
                                    setProvider
                                )}
                                className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
                            >
                                {PROVIDER_OPTIONS.map(
                                    (option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    )
                                )}
                            </select>

                            <select
                                value={currency}
                                onChange={handleFilterChange(
                                    setCurrency
                                )}
                                className="rounded-xl border border-surface-700 bg-surface-950 px-3 py-2.5 text-sm text-white outline-none focus:border-brand"
                            >
                                {CURRENCY_OPTIONS.map(
                                    (option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={handleReset}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-950 px-4 py-2.5 text-sm text-surface-300 transition hover:bg-surface-800"
                            >
                                <FaXmark />
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* =========================================
            CONTENT
        ========================================= */}

                <div className="mt-6 overflow-hidden rounded-2xl border border-surface-700 bg-surface-900">

                    {loading ? (
                        <div className="flex min-h-[400px] items-center justify-center">
                            <div className="flex flex-col items-center gap-3">
                                <FaArrowsRotate className="animate-spin text-2xl text-brand" />

                                <p className="text-sm text-surface-400">
                                    Loading withdrawals...
                                </p>
                            </div>
                        </div>
                    ) : withdrawals.length === 0 ? (
                        <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 text-surface-500">
                                <FaCreditCard className="text-2xl" />
                            </div>

                            <h3 className="mt-4 text-lg font-semibold text-white">
                                No withdrawals found
                            </h3>

                            <p className="mt-2 max-w-md text-sm text-surface-500">
                                There are no withdrawal requests matching your current filters.
                            </p>

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="mt-4 rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* =====================================
                  DESKTOP TABLE
              ===================================== */}

                            <div className="hidden overflow-x-auto lg:block">
                                <table className="w-full min-w-[1100px]">
                                    <thead>
                                        <tr className="border-b border-surface-700 bg-surface-950/50 text-left">
                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Withdrawal
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Customer
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Amount
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Destination
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Provider
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Status
                                            </th>

                                            <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Requested
                                            </th>

                                            <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-surface-500">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {withdrawals.map(
                                            (withdrawal) => (
                                                <tr
                                                    key={
                                                        withdrawal._id
                                                    }
                                                    className="border-b border-surface-800 transition hover:bg-surface-800/40"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 text-danger">
                                                                <FaArrowTrendDown />
                                                            </div>

                                                            <div>
                                                                <p className="font-medium text-white">
                                                                    {shortenReference(
                                                                        withdrawal.reference
                                                                    )}
                                                                </p>

                                                                <p className="mt-1 text-xs text-surface-500">
                                                                    {withdrawal.payoutMethod?.replace(
                                                                        "_",
                                                                        " "
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                                                                {getInitials(
                                                                    withdrawal.user
                                                                        ?.name
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate font-medium text-white">
                                                                    {withdrawal.user
                                                                        ?.name ||
                                                                        "Unknown user"}
                                                                </p>

                                                                <p className="truncate text-xs text-surface-500">
                                                                    {withdrawal.user
                                                                        ?.email ||
                                                                        "—"}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-white">
                                                            {formatAmount(
                                                                withdrawal.amount,
                                                                withdrawal.currency
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-xs text-surface-500">
                                                            {withdrawal.currency}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-start gap-2">
                                                            <FaBuildingColumns className="mt-1 shrink-0 text-surface-500" />

                                                            <div>
                                                                <p className="text-sm text-white">
                                                                    {withdrawal
                                                                        .bankDetails
                                                                        ?.bankName ||
                                                                        "—"}
                                                                </p>

                                                                <p className="mt-1 text-xs text-surface-500">
                                                                    {maskAccountNumber(
                                                                        withdrawal
                                                                            .bankDetails
                                                                            ?.accountNumber
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span className="capitalize text-sm text-surface-300">
                                                            {withdrawal.provider ||
                                                                "—"}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            status={
                                                                withdrawal.status
                                                            }
                                                        />
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm text-surface-300">
                                                            {formatDate(
                                                                withdrawal.createdAt
                                                            )}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <Link
                                                            to={`/admin/withdrawals/${withdrawal._id}`}
                                                            className="inline-flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-xs font-medium text-surface-300 transition hover:border-brand/40 hover:text-brand"
                                                        >
                                                            <FaEye />
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* =====================================
                  MOBILE CARDS
              ===================================== */}

                            <div className="divide-y divide-surface-800 lg:hidden">
                                {withdrawals.map(
                                    (withdrawal) => (
                                        <div
                                            key={
                                                withdrawal._id
                                            }
                                            className="p-4"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10 text-danger">
                                                        <FaArrowTrendDown />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-white">
                                                            {shortenReference(
                                                                withdrawal.reference
                                                            )}
                                                        </p>

                                                        <p className="mt-1 truncate text-xs text-surface-500">
                                                            {withdrawal.user
                                                                ?.name ||
                                                                "Unknown user"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <StatusBadge
                                                    status={
                                                        withdrawal.status
                                                    }
                                                />
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="rounded-xl bg-surface-950 p-3">
                                                    <p className="text-xs text-surface-500">
                                                        Amount
                                                    </p>

                                                    <p className="mt-1 font-semibold text-white">
                                                        {formatAmount(
                                                            withdrawal.amount,
                                                            withdrawal.currency
                                                        )}{" "}
                                                        <span className="text-xs text-surface-500">
                                                            {withdrawal.currency}
                                                        </span>
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-surface-950 p-3">
                                                    <p className="text-xs text-surface-500">
                                                        Provider
                                                    </p>

                                                    <p className="mt-1 capitalize text-sm font-medium text-white">
                                                        {withdrawal.provider ||
                                                            "—"}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-surface-950 p-3">
                                                    <p className="text-xs text-surface-500">
                                                        Bank
                                                    </p>

                                                    <p className="mt-1 truncate text-sm font-medium text-white">
                                                        {withdrawal
                                                            .bankDetails
                                                            ?.bankName ||
                                                            "—"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-surface-500">
                                                        {maskAccountNumber(
                                                            withdrawal
                                                                .bankDetails
                                                                ?.accountNumber
                                                        )}
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-surface-950 p-3">
                                                    <p className="text-xs text-surface-500">
                                                        Requested
                                                    </p>

                                                    <p className="mt-1 text-sm text-white">
                                                        {formatDate(
                                                            withdrawal.createdAt
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <Link
                                                    to={`/admin/withdrawals/${withdrawal._id}`}
                                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-950 px-4 py-2.5 text-sm font-medium text-surface-300 transition hover:border-brand/40 hover:text-brand"
                                                >
                                                    <FaEye />
                                                    View Withdrawal
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                            {/* =====================================
                  PAGINATION
              ===================================== */}

                            <div className="flex flex-col gap-3 border-t border-surface-700 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-surface-500">
                                    Page{" "}
                                    <span className="font-medium text-surface-300">
                                        {pagination.currentPage}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-medium text-surface-300">
                                        {pagination.totalPages}
                                    </span>{" "}
                                    ·{" "}
                                    <span className="font-medium text-surface-300">
                                        {pagination.totalWithdrawals}
                                    </span>{" "}
                                    withdrawals
                                </p>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={
                                            handlePreviousPage
                                        }
                                        disabled={
                                            !pagination.hasPreviousPage
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-surface-300 transition hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <FaChevronLeft />
                                        Previous
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            handleNextPage
                                        }
                                        disabled={
                                            !pagination.hasNextPage
                                        }
                                        className="inline-flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-surface-300 transition hover:bg-surface-800 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Next
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Withdrawals;