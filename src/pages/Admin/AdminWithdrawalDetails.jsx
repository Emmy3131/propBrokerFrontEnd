import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaArrowsRotate,
    FaBan,
    FaBuildingColumns,
    FaCheck,
    FaCircleCheck,
    FaClock,
    FaCoins,
    FaCreditCard,
    FaEye,
    FaSpinner,
    FaTriangleExclamation,
    FaXmark,
} from "react-icons/fa6";

import api from "../../library/api";

const getDecimalValue = (value) => {
    if (value === null || value === undefined) {
        return 0;
    }

    if (typeof value === "object" && value.$numberDecimal) {
        return Number(value.$numberDecimal);
    }

    return Number(value);
};

const formatAmount = (value, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(getDecimalValue(value));
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
};

const getStatusClasses = (status) => {
    const classes = {
        pending:
            "bg-warning/10 text-warning border-warning/20",
        under_review:
            "bg-blue-500/10 text-blue-400 border-blue-500/20",
        approved:
            "bg-success/10 text-success border-success/20",
        processing:
            "bg-purple-500/10 text-purple-400 border-purple-500/20",
        successful:
            "bg-success/10 text-success border-success/20",
        rejected:
            "bg-danger/10 text-danger border-danger/20",
        failed:
            "bg-danger/10 text-danger border-danger/20",
        cancelled:
            "bg-surface-700 text-surface-300 border-surface-600",
    };

    return (
        classes[status] ||
        "bg-surface-700 text-surface-300 border-surface-600"
    );
};

const StatusBadge = ({ status }) => {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                status
            )}`}
        >
            {formatStatus(status)}
        </span>
    );
};

const InfoRow = ({ label, value }) => {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-surface-700/60 py-3 last:border-b-0">
            <span className="text-sm text-surface-400">
                {label}
            </span>

            <span className="text-right text-sm font-medium text-white">
                {value ?? "—"}
            </span>
        </div>
    );
};

const Section = ({
    title,
    icon,
    children,
}) => {
    return (
        <section className="rounded-2xl border border-surface-700 bg-surface-900 p-5">
            <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800 text-brand">
                    {icon}
                </div>

                <h2 className="text-base font-semibold text-white">
                    {title}
                </h2>
            </div>

            {children}
        </section>
    );
};

export default function AdminWithdrawalDetails() {
    const { withdrawalId } = useParams();
    const navigate = useNavigate();

    const [withdrawal, setWithdrawal] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [actionError, setActionError] =
        useState("");

    const [note, setNote] = useState("");

    const fetchWithdrawal = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                `/admin/withdrawals/${withdrawalId}`
            );

            setWithdrawal(response.data.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Unable to load withdrawal."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawal();
    }, [withdrawalId]);

    const performAction = async (
        action,
        body = {}
    ) => {
        try {
            setActionLoading(true);
            setActionError("");

            const response = await api.patch(
                `/admin/withdrawals/${withdrawalId}/${action}`,
                body
            );

            setWithdrawal(response.data.data);

            setNote("");

            await fetchWithdrawal();
        } catch (err) {
            console.error(err);

            setActionError(
                err.response?.data?.message ||
                `Unable to ${action} withdrawal.`
            );
        } finally {
            setActionLoading(false);
        }
    };

    const handleReview = () => {
        performAction("review", {
            reviewNote: note,
        });
    };

    const handleApprove = () => {
        performAction("approve", {
            reviewNote: note,
        });
    };

    const handleReject = () => {
        if (!note.trim()) {
            setActionError(
                "Please enter a rejection reason."
            );
            return;
        }

        performAction("reject", {
            rejectionReason: note,
        });
    };

    const handleProcess = () => {
        performAction("process");
    };

    const handleSuccess = () => {
        const confirmed = window.confirm(
            "Confirm that the withdrawal has actually been paid successfully. This will create the final withdrawal debit in the ledger."
        );

        if (!confirmed) return;

        performAction("success");
    };

    const handleCancel = () => {
        const confirmed = window.confirm(
            "Cancel this withdrawal and return the locked funds to the user's available balance?"
        );

        if (!confirmed) return;

        performAction("cancel", {
            reviewNote: note,
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-[500px] items-center justify-center">
                <FaSpinner className="animate-spin text-2xl text-brand" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-4">
                <Link
                    to="/admin/withdrawals"
                    className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white"
                >
                    <FaArrowLeft />
                    Back to withdrawals
                </Link>

                <div className="rounded-2xl border border-danger/20 bg-danger/10 p-6 text-danger">
                    {error}
                </div>
            </div>
        );
    }

    if (!withdrawal) {
        return null;
    }

    const user = withdrawal.user;
    const wallet = withdrawal.wallet;
    const bankDetails =
        withdrawal.bankDetails || {};

    const status = withdrawal.status;

    return (
        <div className="space-y-6 pb-10">
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <Link
                        to="/admin/withdrawals"
                        className="mb-3 inline-flex items-center gap-2 text-sm text-surface-400 hover:text-white"
                    >
                        <FaArrowLeft />
                        Back to withdrawals
                    </Link>

                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-white">
                            Withdrawal Details
                        </h1>

                        <StatusBadge status={status} />
                    </div>

                    <p className="mt-1 font-mono text-sm text-surface-400">
                        {withdrawal.reference}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchWithdrawal}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-surface-800"
                >
                    <FaArrowsRotate />
                    Refresh
                </button>
            </div>

            {/* ACTION ERROR */}
            {actionError && (
                <div className="flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger">
                    <FaTriangleExclamation className="mt-0.5 shrink-0" />
                    <span>{actionError}</span>
                </div>
            )}

            {/* MAIN SUMMARY */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">
                    <div className="mb-3 flex items-center gap-3 text-surface-400">
                        <FaCoins />
                        <span className="text-sm">
                            Withdrawal Amount
                        </span>
                    </div>

                    <p className="text-2xl font-bold text-white">
                        {formatAmount(
                            withdrawal.amount,
                            withdrawal.currency
                        )}
                    </p>

                    <p className="mt-1 text-xs text-surface-500">
                        {withdrawal.currency}
                    </p>
                </div>

                <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">
                    <div className="mb-3 flex items-center gap-3 text-surface-400">
                        <FaClock />
                        <span className="text-sm">
                            Requested
                        </span>
                    </div>

                    <p className="text-sm font-semibold text-white">
                        {formatDate(
                            withdrawal.createdAt
                        )}
                    </p>
                </div>

                <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5">
                    <div className="mb-3 flex items-center gap-3 text-surface-400">
                        <FaCreditCard />
                        <span className="text-sm">
                            Provider
                        </span>
                    </div>

                    <p className="text-lg font-bold capitalize text-white">
                        {withdrawal.provider}
                    </p>
                </div>
            </div>

            {/* ACTION PANEL */}
            <Section
                title="Admin Actions"
                icon={<FaEye />}
            >
                <div className="space-y-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-surface-300">
                            Review / Action Note
                        </label>

                        <textarea
                            value={note}
                            onChange={(e) =>
                                setNote(e.target.value)
                            }
                            rows={3}
                            placeholder="Add a review note or rejection reason..."
                            className="w-full rounded-xl border border-surface-700 bg-surface-800 px-4 py-3 text-sm text-white outline-none placeholder:text-surface-500 focus:border-brand"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {status === "pending" && (
                            <>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleReview}
                                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                                >
                                    <FaEye />
                                    Review
                                </button>

                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleApprove}
                                    className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    <FaCheck />
                                    Approve
                                </button>

                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleReject}
                                    className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    <FaXmark />
                                    Reject
                                </button>
                            </>
                        )}

                        {status === "under_review" && (
                            <>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleApprove}
                                    className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    <FaCheck />
                                    Approve
                                </button>

                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleReject}
                                    className="inline-flex items-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    <FaXmark />
                                    Reject
                                </button>
                            </>
                        )}

                        {status === "approved" && (
                            <>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleProcess}
                                    className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-500 disabled:opacity-50"
                                >
                                    <FaCreditCard />
                                    Start Processing
                                </button>

                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={handleCancel}
                                    className="inline-flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/20 disabled:opacity-50"
                                >
                                    <FaBan />
                                    Cancel
                                </button>
                            </>
                        )}

                        {status === "processing" && (
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={handleSuccess}
                                className="inline-flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                <FaCircleCheck />
                                Mark Successful
                            </button>
                        )}
                    </div>

                    {actionLoading && (
                        <div className="flex items-center gap-2 text-sm text-surface-400">
                            <FaSpinner className="animate-spin" />
                            Processing action...
                        </div>
                    )}
                </div>
            </Section>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* CUSTOMER */}
                <Section
                    title="Customer"
                    icon={<FaCreditCard />}
                >
                    <InfoRow
                        label="Name"
                        value={user?.name}
                    />

                    <InfoRow
                        label="Email"
                        value={user?.email}
                    />

                    <InfoRow
                        label="Phone"
                        value={user?.phone}
                    />

                    <InfoRow
                        label="Country"
                        value={user?.country}
                    />

                    <InfoRow
                        label="Account Status"
                        value={user?.status}
                    />

                    <div className="mt-4">
                        <Link
                            to={`/admin/users/${user?._id}/details`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-brand hover:underline"
                        >
                            View customer profile
                        </Link>
                    </div>
                </Section>

                {/* BANK */}
                <Section
                    title="Payout Destination"
                    icon={<FaBuildingColumns />}
                >
                    <InfoRow
                        label="Method"
                        value={withdrawal.payoutMethod}
                    />

                    <InfoRow
                        label="Bank"
                        value={bankDetails.bankName}
                    />

                    <InfoRow
                        label="Bank Code"
                        value={bankDetails.bankCode}
                    />

                    <InfoRow
                        label="Account Name"
                        value={bankDetails.accountName}
                    />

                    <InfoRow
                        label="Account Number"
                        value={
                            bankDetails.accountNumber ||
                            "****"
                        }
                    />
                </Section>

                {/* WALLET */}
                <Section
                    title="Wallet"
                    icon={<FaCoins />}
                >
                    <InfoRow
                        label="Currency"
                        value={wallet?.currency}
                    />

                    <InfoRow
                        label="Available Balance"
                        value={formatAmount(
                            wallet?.availableBalance,
                            wallet?.currency || withdrawal.currency
                        )}
                    />

                    <InfoRow
                        label="Locked Balance"
                        value={formatAmount(
                            wallet?.lockedBalance,
                            wallet?.currency || withdrawal.currency
                        )}
                    />

                    <InfoRow
                        label="Wallet Status"
                        value={wallet?.status}
                    />
                </Section>

                {/* PROVIDER */}
                <Section
                    title="Payment Provider"
                    icon={<FaCreditCard />}
                >
                    <InfoRow
                        label="Provider"
                        value={withdrawal.provider}
                    />

                    <InfoRow
                        label="Provider Reference"
                        value={
                            withdrawal.providerReference
                        }
                    />

                    <InfoRow
                        label="Provider Transaction"
                        value={
                            withdrawal.providerTransactionId
                        }
                    />

                    <InfoRow
                        label="Processed At"
                        value={formatDate(
                            withdrawal.processedAt
                        )}
                    />

                    <InfoRow
                        label="Completed At"
                        value={formatDate(
                            withdrawal.completedAt
                        )}
                    />
                </Section>
            </div>

            {/* REVIEW */}
            <Section
                title="Review Information"
                icon={<FaEye />}
            >
                <InfoRow
                    label="Reviewed At"
                    value={formatDate(
                        withdrawal.reviewedAt
                    )}
                />

                <InfoRow
                    label="Reviewed By"
                    value={
                        withdrawal.reviewedBy?.name ||
                        withdrawal.reviewedBy?.email
                    }
                />

                <InfoRow
                    label="Review Note"
                    value={
                        withdrawal.reviewNote
                    }
                />

                <InfoRow
                    label="Rejection Reason"
                    value={
                        withdrawal.rejectionReason
                    }
                />

                <InfoRow
                    label="Failure Reason"
                    value={
                        withdrawal.failureReason
                    }
                />
            </Section>

            {/* LEDGER */}
            <Section
                title="Ledger Entry"
                icon={<FaCoins />}
            >
                {withdrawal.ledgerEntry ? (
                    <>
                        <InfoRow
                            label="Type"
                            value={
                                withdrawal.ledgerEntry.type
                            }
                        />

                        <InfoRow
                            label="Direction"
                            value={
                                withdrawal.ledgerEntry.direction
                            }
                        />

                        <InfoRow
                            label="Amount"
                            value={formatAmount(
                                withdrawal.ledgerEntry.amount,
                                withdrawal.ledgerEntry.currency
                            )}
                        />

                        <InfoRow
                            label="Balance After"
                            value={formatAmount(
                                withdrawal.ledgerEntry
                                    .balanceAfter,
                                withdrawal.ledgerEntry.currency
                            )}
                        />

                        <InfoRow
                            label="Reference"
                            value={
                                withdrawal.ledgerEntry.reference
                            }
                        />

                        <InfoRow
                            label="Created"
                            value={formatDate(
                                withdrawal.ledgerEntry.createdAt
                            )}
                        />
                    </>
                ) : (
                    <div className="rounded-xl border border-surface-700 bg-surface-800 p-4 text-sm text-surface-400">
                        No final withdrawal ledger entry has
                        been created yet.
                    </div>
                )}
            </Section>

            {/* TIMELINE */}
            <Section
                title="Withdrawal Timeline"
                icon={<FaClock />}
            >
                <div className="space-y-4">
                    <InfoRow
                        label="Requested"
                        value={formatDate(
                            withdrawal.createdAt
                        )}
                    />

                    <InfoRow
                        label="Reviewed"
                        value={formatDate(
                            withdrawal.reviewedAt
                        )}
                    />

                    <InfoRow
                        label="Processing"
                        value={formatDate(
                            withdrawal.processedAt
                        )}
                    />

                    <InfoRow
                        label="Completed"
                        value={formatDate(
                            withdrawal.completedAt
                        )}
                    />
                </div>
            </Section>
        </div>
    );
}