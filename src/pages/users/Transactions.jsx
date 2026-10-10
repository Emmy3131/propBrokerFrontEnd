import { useEffect, useMemo, useState } from "react";
import {
    FaArrowDown,
    FaArrowUp,
    FaExchangeAlt,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaWallet,
    FaClock,
    FaCheckCircle,
    FaExclamationCircle,
    FaTimesCircle,
    FaSpinner,
    FaFilter,
} from "react-icons/fa";

import api from "../../library/api";

const ITEMS_PER_PAGE = 10;

/*
=====================================================
STATUS CONFIGURATION
=====================================================
*/

const STATUS_CONFIG = {
    successful: {
        label: "Successful",
        className:
            "bg-success-500/10 text-success-400 border-success-500/20",
        icon: FaCheckCircle,
    },

    pending: {
        label: "Pending",
        className:
            "bg-warning-500/10 text-warning-400 border-warning-500/20",
        icon: FaClock,
    },

    processing: {
        label: "Processing",
        className:
            "bg-brand-500/10 text-brand-400 border-brand-500/20",
        icon: FaSpinner,
    },

    under_review: {
        label: "Under Review",
        className:
            "bg-warning-500/10 text-warning-400 border-warning-500/20",
        icon: FaClock,
    },

    approved: {
        label: "Approved",
        className:
            "bg-success-500/10 text-success-400 border-success-500/20",
        icon: FaCheckCircle,
    },

    failed: {
        label: "Failed",
        className:
            "bg-danger-500/10 text-danger-400 border-danger-500/20",
        icon: FaExclamationCircle,
    },

    rejected: {
        label: "Rejected",
        className:
            "bg-danger-500/10 text-danger-400 border-danger-500/20",
        icon: FaTimesCircle,
    },

    cancelled: {
        label: "Cancelled",
        className:
            "bg-surface-700/50 text-surface-300 border-surface-600",
        icon: FaTimesCircle,
    },

    expired: {
        label: "Expired",
        className:
            "bg-surface-700/50 text-surface-300 border-surface-600",
        icon: FaClock,
    },
};

/*
=====================================================
FORMAT MONEY
=====================================================
*/

const formatMoney = (amount, currency = "USD") => {
    const numericAmount = Number(amount || 0);

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericAmount);
    } catch {
        return `${currency} ${numericAmount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }
};

/*
=====================================================
FORMAT DATE
=====================================================
*/

const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "—";
    }

    return parsedDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

/*
=====================================================
FORMAT TIME
=====================================================
*/

const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

/*
=====================================================
FORMAT REFERENCE
=====================================================
*/

const shortenReference = (reference) => {
    if (!reference) return "—";

    if (reference.length <= 22) {
        return reference;
    }

    return `${reference.slice(0, 10)}...${reference.slice(-8)}`;
};

/*
=====================================================
MAIN COMPONENT
=====================================================
*/

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [activeType, setActiveType] = useState("all");

    const [activeStatus, setActiveStatus] = useState("all");

    const [searchTerm, setSearchTerm] = useState("");

    const [currentPage, setCurrentPage] = useState(1);

    /*
    =====================================================
    FETCH TRANSACTIONS
    =====================================================
    */

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await api.get("/users/transactions");

                const data = response?.data?.data?.transactions || [];

                setTransactions(data);
            } catch (err) {
                console.error("Failed to fetch transactions:", err);

                setError(
                    err?.response?.data?.message ||
                    "Unable to load your transactions. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    /*
    =====================================================
    FILTER TRANSACTIONS
    =====================================================
    */

    const filteredTransactions = useMemo(() => {
        let result = [...transactions];

        /*
        TYPE FILTER
        */

        if (activeType !== "all") {
            result = result.filter(
                (transaction) => transaction.type === activeType
            );
        }

        /*
        STATUS FILTER
        */

        if (activeStatus !== "all") {
            result = result.filter(
                (transaction) => transaction.status === activeStatus
            );
        }

        /*
        SEARCH
        */

        const search = searchTerm.trim().toLowerCase();

        if (search) {
            result = result.filter((transaction) => {
                return (
                    transaction.reference?.toLowerCase().includes(search) ||
                    transaction.provider?.toLowerCase().includes(search) ||
                    transaction.currency?.toLowerCase().includes(search) ||
                    transaction.status?.toLowerCase().includes(search) ||
                    transaction.type?.toLowerCase().includes(search)
                );
            });
        }

        return result;
    }, [
        transactions,
        activeType,
        activeStatus,
        searchTerm,
    ]);

    /*
    =====================================================
    RESET PAGE WHEN FILTERS CHANGE
    =====================================================
    */

    useEffect(() => {
        setCurrentPage(1);
    }, [activeType, activeStatus, searchTerm]);

    /*
    =====================================================
    PAGINATION
    =====================================================
    */

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE)
    );

    const paginatedTransactions = useMemo(() => {
        const startIndex =
            (currentPage - 1) * ITEMS_PER_PAGE;

        return filteredTransactions.slice(
            startIndex,
            startIndex + ITEMS_PER_PAGE
        );
    }, [filteredTransactions, currentPage]);

    /*
 

    /*
    =====================================================
    CLEAR FILTERS
    =====================================================
    */

    const clearFilters = () => {
        setActiveType("all");
        setActiveStatus("all");
        setSearchTerm("");
        setCurrentPage(1);
    };

    /*
    =====================================================
    LOADING STATE
    =====================================================
    */

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <FaSpinner className="animate-spin text-3xl text-brand-400" />

                    <p className="text-sm text-surface-400">
                        Loading transactions...
                    </p>
                </div>
            </div>
        );
    }

    /*
    =====================================================
    ERROR STATE
    =====================================================
    */

    if (error) {
        return (
            <div className="mx-auto max-w-7xl">
                <div className="rounded-2xl border border-danger-500/20 bg-danger-500/10 p-6">
                    <div className="flex items-start gap-4">
                        <FaExclamationCircle className="mt-1 shrink-0 text-xl text-danger-400" />

                        <div>
                            <h2 className="font-semibold text-surface-100">
                                Unable to load transactions
                            </h2>

                            <p className="mt-1 text-sm text-surface-400">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                                className="mt-4 rounded-lg bg-danger-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-danger-600"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /*
    =====================================================
    PAGE
    =====================================================
    */

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            {/* =================================================
          PAGE HEADER
      ================================================= */}

            <div>
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-2 text-sm font-medium text-brand-400">
                            Account activity
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight text-surface-100 sm:text-3xl">
                            Transactions
                        </h1>

                        <p className="mt-2 max-w-2xl text-sm text-surface-400">
                            View and track your deposits and withdrawals.
                        </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-surface-700 bg-surface-900 text-brand-400">
                        <FaExchangeAlt />
                    </div>
                </div>
            </div>

            


            {/* =================================================
          FILTER CARD
      ================================================= */}

            <div className="rounded-2xl border border-surface-700 bg-surface-900 p-4 shadow-xl sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                    <FaFilter className="text-sm text-brand-400" />

                    <h2 className="font-semibold text-surface-100">
                        Filter transactions
                    </h2>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto_auto]">
                    {/* SEARCH */}

                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-surface-500" />

                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search reference, provider..."
                            className="h-11 w-full rounded-xl border border-surface-700 bg-surface-950 pl-11 pr-4 text-sm text-surface-100 outline-none transition placeholder:text-surface-500 focus:border-brand-500"
                        />
                    </div>

                    {/* TYPE */}

                    <select
                        value={activeType}
                        onChange={(event) =>
                            setActiveType(event.target.value)
                        }
                        className="h-11 rounded-xl border border-surface-700 bg-surface-950 px-4 text-sm text-surface-200 outline-none focus:border-brand-500"
                    >
                        <option value="all">All Types</option>
                        <option value="deposit">Deposits</option>
                        <option value="withdrawal">Withdrawals</option>
                    </select>

                    {/* STATUS */}

                    <select
                        value={activeStatus}
                        onChange={(event) =>
                            setActiveStatus(event.target.value)
                        }
                        className="h-11 rounded-xl border border-surface-700 bg-surface-950 px-4 text-sm text-surface-200 outline-none focus:border-brand-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="successful">Successful</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="failed">Failed</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                    </select>

                    {/* CLEAR */}

                    <button
                        type="button"
                        onClick={clearFilters}
                        className="h-11 rounded-xl border border-surface-700 bg-surface-800 px-4 text-sm font-medium text-surface-300 transition hover:border-surface-600 hover:bg-surface-700 hover:text-surface-100"
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* =================================================
          TRANSACTIONS
      ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-surface-700 bg-surface-900 shadow-xl">
                {/* DESKTOP HEADER */}

                <div className="hidden border-b border-surface-700 px-6 py-4 md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr] md:gap-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                        Transaction
                    </p>

                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                        Type
                    </p>

                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                        Amount
                    </p>

                    <p className="text-xs font-semibold uppercase tracking-wider text-surface-500">
                        Status
                    </p>

                    <p className="text-right text-xs font-semibold uppercase tracking-wider text-surface-500">
                        Date
                    </p>
                </div>

                {/* EMPTY */}

                {paginatedTransactions.length === 0 ? (
                    <EmptyState
                        hasFilters={
                            activeType !== "all" ||
                            activeStatus !== "all" ||
                            searchTerm.trim() !== ""
                        }
                        onClear={clearFilters}
                    />
                ) : (
                    <div className="divide-y divide-surface-700">
                        {paginatedTransactions.map((transaction) => (
                            <TransactionRow
                                key={`${transaction.type}-${transaction.id}`}
                                transaction={transaction}
                            />
                        ))}
                    </div>
                )}

                {/* =================================================
            PAGINATION
        ================================================= */}

                {filteredTransactions.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredTransactions.length}
                        onPrevious={() =>
                            setCurrentPage((page) =>
                                Math.max(1, page - 1)
                            )
                        }
                        onNext={() =>
                            setCurrentPage((page) =>
                                Math.min(totalPages, page + 1)
                            )
                        }
                    />
                )}
            </div>
        </div>
    );
};

/*
=====================================================
SUMMARY CARD
=====================================================
*/

const SummaryCard = ({
    icon: Icon,
    label,
    value,
    iconClass = "text-brand-400",
    iconBg = "bg-brand-500/10",
}) => {
    return (
        <div className="rounded-2xl border border-surface-700 bg-surface-900 p-4 shadow-xl sm:p-5">
            <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconClass}`}
            >
                <Icon />
            </div>

            <p className="text-xs font-medium text-surface-500 sm:text-sm">
                {label}
            </p>

            <p className="mt-1 text-xl font-bold text-surface-100 sm:text-2xl">
                {value.toLocaleString()}
            </p>
        </div>
    );
};

/*
=====================================================
TRANSACTION ROW
=====================================================
*/

const TransactionRow = ({ transaction }) => {
    const isDeposit = transaction.type === "deposit";

    const status =
        STATUS_CONFIG[transaction.status] ||
        STATUS_CONFIG.pending;

    const StatusIcon = status.icon;

    return (
        <div className="px-4 py-5 transition hover:bg-surface-800/40 sm:px-6">
            {/* =================================================
          DESKTOP
      ================================================= */}

            <div className="hidden items-center gap-4 md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_1fr]">
                {/* TRANSACTION */}

                <div className="flex min-w-0 items-center gap-3">
                    <TransactionIcon isDeposit={isDeposit} />

                    <div className="min-w-0">
                        <p className="truncate font-medium text-surface-100">
                            {isDeposit ? "Deposit" : "Withdrawal"}
                        </p>

                        <p
                            title={transaction.reference}
                            className="truncate text-xs text-surface-500"
                        >
                            {shortenReference(transaction.reference)}
                        </p>
                    </div>
                </div>

                {/* TYPE */}

                <div>
                    <TypeBadge type={transaction.type} />
                </div>

                {/* AMOUNT */}

                <div>
                    <p
                        className={`font-semibold ${isDeposit
                                ? "text-success-400"
                                : "text-surface-100"
                            }`}
                    >
                        {isDeposit ? "+" : "-"}
                        {formatMoney(
                            transaction.amount,
                            transaction.currency
                        )}
                    </p>

                    <p className="mt-0.5 text-xs capitalize text-surface-500">
                        {transaction.provider || " "}
                    </p>
                </div>

                {/* STATUS */}

                <div>
                    <StatusBadge
                        status={transaction.status}
                        config={status}
                        icon={StatusIcon}
                    />
                </div>

                {/* DATE */}

                <div className="text-right">
                    <p className="text-sm text-surface-300">
                        {formatDate(transaction.createdAt)}
                    </p>

                    <p className="text-xs text-surface-500">
                        {formatTime(transaction.createdAt)}
                    </p>
                </div>
            </div>

            {/* =================================================
          MOBILE
      ================================================= */}

            <div className="md:hidden">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <TransactionIcon isDeposit={isDeposit} />

                        <div className="min-w-0">
                            <p className="font-medium text-surface-100">
                                {isDeposit ? "Deposit" : "Withdrawal"}
                            </p>

                            <p
                                title={transaction.reference}
                                className="max-w-[180px] truncate text-xs text-surface-500"
                            >
                                {transaction.reference || "No reference"}
                            </p>
                        </div>
                    </div>

                    <p
                        className={`shrink-0 text-right font-semibold ${isDeposit
                                ? "text-success-400"
                                : "text-surface-100"
                            }`}
                    >
                        {isDeposit ? "+" : "-"}
                        {formatMoney(
                            transaction.amount,
                            transaction.currency
                        )}
                    </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <TypeBadge type={transaction.type} />

                    <StatusBadge
                        status={transaction.status}
                        config={status}
                        icon={StatusIcon}
                    />

                    <div className="text-right">
                        <p className="text-xs text-surface-400">
                            {formatDate(transaction.createdAt)}
                        </p>

                        <p className="text-[11px] text-surface-600">
                            {formatTime(transaction.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-surface-800 pt-3">
                    <span className="text-xs text-surface-500">
                        Provider
                    </span>

                    <span className="text-xs font-medium capitalize text-surface-300">
                        {transaction.provider || "—"}
                    </span>
                </div>
            </div>
        </div>
    );
};

/*
=====================================================
TRANSACTION ICON
=====================================================
*/

const TransactionIcon = ({ isDeposit }) => {
    return (
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isDeposit
                    ? "bg-success-500/10 text-success-400"
                    : "bg-brand-500/10 text-brand-400"
                }`}
        >
            {isDeposit ? <FaArrowDown /> : <FaArrowUp />}
        </div>
    );
};

/*
=====================================================
TYPE BADGE
=====================================================
*/

const TypeBadge = ({ type }) => {
    const isDeposit = type === "deposit";

    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${isDeposit
                    ? "border-success-500/20 bg-success-500/10 text-success-400"
                    : "border-brand-500/20 bg-brand-500/10 text-brand-400"
                }`}
        >
            {isDeposit ? "Deposit" : "Withdrawal"}
        </span>
    );
};

/*
=====================================================
STATUS BADGE
=====================================================
*/

const StatusBadge = ({ status, config, icon: Icon }) => {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.className}`}
        >
            <Icon
                className={
                    status === "processing"
                        ? "animate-spin"
                        : ""
                }
            />

            {config.label}
        </span>
    );
};

/*
=====================================================
EMPTY STATE
=====================================================
*/

const EmptyState = ({ hasFilters, onClear }) => {
    return (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800 text-surface-500">
                <FaWallet className="text-2xl" />
            </div>

            <h3 className="mt-5 font-semibold text-surface-100">
                {hasFilters
                    ? "No matching transactions"
                    : "No transactions yet"}
            </h3>

            <p className="mt-2 max-w-sm text-sm text-surface-500">
                {hasFilters
                    ? "Try changing your filters or search term."
                    : "Your deposits and withdrawals will appear here once you start using your wallet."}
            </p>

            {hasFilters && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-5 rounded-lg border border-surface-700 bg-surface-800 px-4 py-2 text-sm font-medium text-surface-300 transition hover:bg-surface-700 hover:text-surface-100"
                >
                    Clear Filters
                </button>
            )}
        </div>
    );
};

/*
=====================================================
PAGINATION
=====================================================
*/

const Pagination = ({
    currentPage,
    totalPages,
    totalItems,
    onPrevious,
    onNext,
}) => {
    const startItem =
        totalItems === 0
            ? 0
            : (currentPage - 1) * ITEMS_PER_PAGE + 1;

    const endItem = Math.min(
        currentPage * ITEMS_PER_PAGE,
        totalItems
    );

    return (
        <div className="flex flex-col gap-4 border-t border-surface-700 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-surface-500 sm:text-sm">
                Showing{" "}
                <span className="font-medium text-surface-300">
                    {startItem}
                </span>{" "}
                to{" "}
                <span className="font-medium text-surface-300">
                    {endItem}
                </span>{" "}
                of{" "}
                <span className="font-medium text-surface-300">
                    {totalItems}
                </span>{" "}
                transactions
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentPage === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-700 bg-surface-800 text-surface-300 transition hover:bg-surface-700 hover:text-surface-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                >
                    <FaChevronLeft className="text-xs" />
                </button>

                <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand-500/10 px-3 text-sm font-medium text-brand-400">
                    {currentPage}
                </div>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={currentPage === totalPages}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-700 bg-surface-800 text-surface-300 transition hover:bg-surface-700 hover:text-surface-100 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                >
                    <FaChevronRight className="text-xs" />
                </button>
            </div>
        </div>
    );
};

export default Transactions;