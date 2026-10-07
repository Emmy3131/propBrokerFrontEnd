import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    FaArrowLeft,
    FaArrowsRotate,
    FaCheck,
    FaCircleInfo,
    FaClock,
    FaCoins,
    FaCreditCard,
    FaCopy,
    FaEnvelope,
    FaFileImage,
    FaIdCard,
    FaLink,
    FaMoneyBillTransfer,
    FaTriangleExclamation,
    FaUser,
    FaWallet,
    FaXmark,
} from "react-icons/fa6";

import api from "../../library/api";

/*
=====================================================
HELPERS
=====================================================
*/

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

    if (
        typeof amount === "object" &&
        amount !== null &&
        amount.$numberDecimal
    ) {
        value = amount.$numberDecimal;
    }

    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) {
        return `${currency} 0.00`;
    }

    try {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(numericValue);
    } catch {
        return `${currency} ${numericValue.toFixed(2)}`;
    }
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
            return "border-success/20 bg-success/10 text-success";

        case "processing":
            return "border-brand/20 bg-brand/10 text-brand";

        case "submitted":
        case "under_review":
            return "border-warning/20 bg-warning/10 text-warning";

        case "pending":
            return "border-surface-700 bg-surface-800 text-surface-300";

        case "rejected":
        case "cancelled":
        case "expired":
            return "border-danger/20 bg-danger/10 text-danger";

        default:
            return "border-surface-700 bg-surface-800 text-surface-300";
    }
}

function getPaymentTypeLabel(type) {
    if (!type) return "—";

    return type
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/*
=====================================================
STATUS BADGE
=====================================================
*/

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
                status
            )}`}
        >
            {status === "successful" && (
                <FaCheck className="mr-1.5" />
            )}

            {["pending", "submitted", "under_review"].includes(
                status
            ) && <FaClock className="mr-1.5" />}

            {status === "processing" && (
                <FaArrowsRotate className="mr-1.5" />
            )}

            {["rejected", "cancelled", "expired"].includes(
                status
            ) && <FaXmark className="mr-1.5" />}

            {formatStatus(status)}
        </span>
    );
}

/*
=====================================================
INFO ITEM
=====================================================
*/

function InfoItem({
    label,
    value,
    mono = false,
    copyable = false,
}) {
    const handleCopy = async () => {
        if (!value || value === "—") return;

        try {
            await navigator.clipboard.writeText(String(value));
        } catch (error) {
            console.error("Failed to copy:", error);
        }
    };

    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-surface-500">
                {label}
            </p>

            <div className="mt-1 flex items-center gap-2">
                <p
                    className={`break-all text-sm ${mono
                            ? "font-mono text-surface-300"
                            : "text-white"
                        }`}
                >
                    {value || "—"}
                </p>

                {copyable && value && value !== "—" && (
                    <button
                        type="button"
                        onClick={handleCopy}
                        title={`Copy ${label}`}
                        className="rounded p-1 text-surface-500 transition hover:bg-surface-800 hover:text-white"
                    >
                        <FaCopy size={11} />
                    </button>
                )}
            </div>
        </div>
    );
}

/*
=====================================================
SECTION
=====================================================
*/

function Section({
    title,
    description,
    icon,
    children,
    className = "",
}) {
    return (
        <section
            className={`rounded-2xl border border-surface-700 bg-surface-900 ${className}`}
        >
            <div className="border-b border-surface-700 p-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        {icon}
                    </div>

                    <div>
                        <h2 className="text-base font-semibold text-white">
                            {title}
                        </h2>

                        {description && (
                            <p className="mt-0.5 text-xs text-surface-500">
                                {description}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-5">{children}</div>
        </section>
    );
}

/*
=====================================================
TIMELINE
=====================================================
*/

function TimelineItem({
    label,
    date,
    description,
    active = false,
}) {
    return (
        <div className="relative flex gap-4">
            <div
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active
                        ? "bg-success/10 text-success"
                        : "bg-surface-800 text-surface-500"
                    }`}
            >
                {active ? (
                    <FaCheck size={12} />
                ) : (
                    <FaClock size={12} />
                )}
            </div>

            <div className="min-w-0 pb-5">
                <p className="text-sm font-medium text-white">
                    {label}
                </p>

                <p className="mt-1 text-xs text-surface-500">
                    {date ? formatDate(date) : "Not recorded"}
                </p>

                {description && (
                    <p className="mt-2 text-xs leading-5 text-surface-400">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

/*
=====================================================
ACTION MODAL
=====================================================
*/

function ActionModal({
    type,
    deposit,
    processing,
    rejectionReason,
    adminNote,
    setRejectionReason,
    setAdminNote,
    onClose,
    onConfirm,
}) {
    const isApprove = type === "approve";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-surface-700 bg-surface-900 shadow-2xl">
                {/* HEADER */}
                <div className="border-b border-surface-700 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div
                                className={`flex h-11 w-11 items-center justify-center rounded-full ${isApprove
                                        ? "bg-success/10 text-success"
                                        : "bg-danger/10 text-danger"
                                    }`}
                            >
                                {isApprove ? (
                                    <FaCheck />
                                ) : (
                                    <FaXmark />
                                )}
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    {isApprove
                                        ? "Approve Deposit"
                                        : "Reject Deposit"}
                                </h2>

                                <p className="mt-1 text-xs text-surface-500">
                                    {deposit.reference}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-lg p-2 text-surface-500 transition hover:bg-surface-800 hover:text-white disabled:opacity-50"
                        >
                            <FaXmark />
                        </button>
                    </div>
                </div>

                {/* BODY */}
                <div className="space-y-5 p-5">
                    <div
                        className={`rounded-xl border p-4 ${isApprove
                                ? "border-success/20 bg-success/10"
                                : "border-danger/20 bg-danger/10"
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <FaCircleInfo
                                className={`mt-0.5 shrink-0 ${isApprove
                                        ? "text-success"
                                        : "text-danger"
                                    }`}
                            />

                            <div>
                                {isApprove ? (
                                    <>
                                        <p className="text-sm font-semibold text-white">
                                            You are about to approve this
                                            deposit.
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-surface-400">
                                            This will credit{" "}
                                            <strong className="text-white">
                                                {formatAmount(
                                                    deposit.amount,
                                                    deposit.currency
                                                )}
                                            </strong>{" "}
                                            to the customer's{" "}
                                            <strong className="text-white">
                                                {deposit.currency}
                                            </strong>{" "}
                                            wallet.
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-semibold text-white">
                                            You are about to reject this
                                            deposit.
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-surface-400">
                                            The customer's wallet will not
                                            be credited.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {!isApprove && (
                        <div>
                            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-surface-400">
                                Rejection Reason
                            </label>

                            <textarea
                                value={rejectionReason}
                                onChange={(event) =>
                                    setRejectionReason(
                                        event.target.value
                                    )
                                }
                                rows={4}
                                placeholder="Enter the reason for rejecting this deposit..."
                                className="w-full rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-surface-600 focus:border-danger/50"
                            />
                        </div>
                    )}

                    <div>
                        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-surface-400">
                            Admin Note{" "}
                            <span className="normal-case text-surface-600">
                                (optional)
                            </span>
                        </label>

                        <textarea
                            value={adminNote}
                            onChange={(event) =>
                                setAdminNote(event.target.value)
                            }
                            rows={3}
                            placeholder="Add an internal note about this action..."
                            className="w-full rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-surface-600 focus:border-brand/50"
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <div className="flex flex-col-reverse gap-3 border-t border-surface-700 p-5 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-xl border border-surface-700 bg-surface-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-surface-700 disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={
                            processing ||
                            (!isApprove &&
                                !rejectionReason.trim())
                        }
                        className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${isApprove
                                ? "bg-success hover:bg-success/90"
                                : "bg-danger hover:bg-danger/90"
                            }`}
                    >
                        {processing ? (
                            <>
                                <FaArrowsRotate className="animate-spin" />
                                {isApprove
                                    ? "Approving..."
                                    : "Rejecting..."}
                            </>
                        ) : (
                            <>
                                {isApprove ? (
                                    <FaCheck />
                                ) : (
                                    <FaXmark />
                                )}

                                {isApprove
                                    ? "Approve Deposit"
                                    : "Reject Deposit"}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

/*
=====================================================
MAIN PAGE
=====================================================
*/

export default function AdminDepositDetails() {
    const { depositId } = useParams();

    const [deposit, setDeposit] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [actionType, setActionType] = useState(null);
    const [actionProcessing, setActionProcessing] =
        useState(false);

    const [rejectionReason, setRejectionReason] = useState("");
    const [adminNote, setAdminNote] = useState("");

    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /*
    =================================================
    LOAD DEPOSIT
    =================================================
    */

    const loadDeposit = async ({ showLoader = true } = {}) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");
            setActionError("");

            const response = await api.get(
                `/admin/deposits/${depositId}`
            );

            const data = response?.data?.data || {};

            setDeposit(data.deposit || null);
        } catch (err) {
            console.error(
                "Failed to load deposit details:",
                err
            );

            setError(
                err?.response?.data?.message ||
                "Unable to load deposit details."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /*
    =================================================
    INITIAL LOAD
    =================================================
    */

    useEffect(() => {
        if (!depositId) {
            setError("Deposit ID is missing.");
            setLoading(false);
            return;
        }

        loadDeposit();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depositId]);

    /*
    =================================================
    CAN ADMIN TAKE ACTION?
    =================================================

    We allow approval/rejection for deposits that
    have been submitted or are currently under review.

    Pending means the user has not confirmed payment yet.
    */

    const canTakeAction = useMemo(() => {
        if (!deposit) return false;

        return ["submitted", "under_review"].includes(
            deposit.status
        );
    }, [deposit]);

    /*
    =================================================
    OPEN APPROVE MODAL
    =================================================
    */

    const openApproveModal = () => {
        setActionError("");
        setSuccessMessage("");
        setRejectionReason("");
        setAdminNote("");
        setActionType("approve");
    };

    /*
    =================================================
    OPEN REJECT MODAL
    =================================================
    */

    const openRejectModal = () => {
        setActionError("");
        setSuccessMessage("");
        setRejectionReason("");
        setAdminNote("");
        setActionType("reject");
    };

    /*
    =================================================
    CLOSE MODAL
    =================================================
    */

    const closeActionModal = () => {
        if (actionProcessing) return;

        setActionType(null);
        setRejectionReason("");
        setAdminNote("");
        setActionError("");
    };

    /*
    =================================================
    APPROVE / REJECT
    =================================================
    */

    const handleAction = async () => {
        if (!deposit || !actionType) return;

        if (
            actionType === "reject" &&
            !rejectionReason.trim()
        ) {
            setActionError(
                "Please provide a rejection reason."
            );
            return;
        }

        try {
            setActionProcessing(true);
            setActionError("");
            setSuccessMessage("");

            let response;

            if (actionType === "approve") {
                response = await api.post(
                    `/admin/deposits/${deposit._id}/approve`,
                    {
                        adminNote:
                            adminNote.trim() || undefined,
                    }
                );
            } else {
                response = await api.post(
                    `/admin/deposits/${deposit._id}/reject`,
                    {
                        rejectionReason:
                            rejectionReason.trim(),
                        adminNote:
                            adminNote.trim() || undefined,
                    }
                );
            }

            const message =
                response?.data?.message ||
                (actionType === "approve"
                    ? "Deposit approved successfully."
                    : "Deposit rejected successfully.");

            setSuccessMessage(message);

            setActionType(null);
            setRejectionReason("");
            setAdminNote("");

            await loadDeposit({
                showLoader: false,
            });
        } catch (err) {
            console.error(
                `Failed to ${actionType} deposit:`,
                err
            );

            setActionError(
                err?.response?.data?.message ||
                `Unable to ${actionType} this deposit.`
            );
        } finally {
            setActionProcessing(false);
        }
    };

    /*
    =================================================
    LOADING
    =================================================
    */

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-surface-950">
                <div className="flex flex-col items-center gap-3">
                    <FaArrowsRotate className="animate-spin text-2xl text-brand" />

                    <p className="text-sm text-surface-500">
                        Loading deposit details...
                    </p>
                </div>
            </div>
        );
    }

    /*
    =================================================
    ERROR
    =================================================
    */

    if (error || !deposit) {
        return (
            <div className="min-h-screen bg-surface-950 p-6">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl border border-danger/20 bg-danger/10 p-6">
                        <div className="flex items-center gap-3 text-danger">
                            <FaTriangleExclamation />

                            <h2 className="font-semibold">
                                Unable to load deposit
                            </h2>
                        </div>

                        <p className="mt-3 text-sm text-surface-400">
                            {error || "Deposit not found."}
                        </p>

                        <div className="mt-5 flex gap-3">
                            <Link
                                to="/admin/deposits"
                                className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
                            >
                                <FaArrowLeft />
                                Back to Deposits
                            </Link>

                            <button
                                type="button"
                                onClick={() => loadDeposit()}
                                className="rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-white"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const user = deposit.user;
    const wallet = deposit.wallet;
    const paymentMethod = deposit.paymentMethod;
    const ledger = deposit.ledgerEntry;

    return (
        <div className="min-h-screen bg-surface-950 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1500px] space-y-6">
                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                        <Link
                            to="/admin/deposits"
                            className="mb-3 inline-flex items-center gap-2 text-sm text-surface-500 transition hover:text-white"
                        >
                            <FaArrowLeft />
                            Back to Deposits
                        </Link>

                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-2xl font-bold text-white">
                                Deposit Details
                            </h1>

                            <StatusBadge
                                status={deposit.status}
                            />
                        </div>

                        <p className="mt-2 font-mono text-xs text-surface-500">
                            {deposit.reference}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {canTakeAction && (
                            <>
                                <button
                                    type="button"
                                    onClick={openRejectModal}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20"
                                >
                                    <FaXmark />
                                    Reject
                                </button>

                                <button
                                    type="button"
                                    onClick={openApproveModal}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-success/90"
                                >
                                    <FaCheck />
                                    Approve Deposit
                                </button>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                loadDeposit({
                                    showLoader: false,
                                })
                            }
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-white transition hover:border-brand/40 hover:bg-surface-800 disabled:opacity-50"
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
                </div>

                {/* =================================================
                    ACTION ERROR
                ================================================= */}

                {actionError && (
                    <div className="rounded-xl border border-danger/20 bg-danger/10 p-4">
                        <div className="flex items-start gap-3">
                            <FaTriangleExclamation className="mt-0.5 shrink-0 text-danger" />

                            <div>
                                <p className="text-sm font-semibold text-white">
                                    Action failed
                                </p>

                                <p className="mt-1 text-sm text-surface-400">
                                    {actionError}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {successMessage && (
                    <div className="rounded-xl border border-success/20 bg-success/10 p-4">
                        <div className="flex items-center gap-3">
                            <FaCheck className="text-success" />

                            <p className="text-sm font-medium text-white">
                                {successMessage}
                            </p>
                        </div>
                    </div>
                )}

                {/* =================================================
                    AMOUNT HERO
                ================================================= */}

                <section className="overflow-hidden rounded-2xl border border-surface-700 bg-surface-900">
                    <div className="bg-gradient-to-r from-brand/10 via-transparent to-transparent p-6 sm:p-8">
                        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                            <div>
                                <p className="text-sm text-surface-400">
                                    Deposit Amount
                                </p>

                                <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                                    {formatAmount(
                                        deposit.amount,
                                        deposit.currency
                                    )}
                                </h2>

                                <p className="mt-2 text-xs text-surface-500">
                                    Created{" "}
                                    {formatDate(
                                        deposit.createdAt
                                    )}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3">
                                    <p className="text-xs text-surface-500">
                                        Currency
                                    </p>

                                    <p className="mt-1 font-semibold text-white">
                                        {deposit.currency ||
                                            "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3">
                                    <p className="text-xs text-surface-500">
                                        Payment Type
                                    </p>

                                    <p className="mt-1 font-semibold text-white">
                                        {getPaymentTypeLabel(
                                            deposit.paymentType
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3">
                                    <p className="text-xs text-surface-500">
                                        Submitted
                                    </p>

                                    <p
                                        className={`mt-1 font-semibold ${deposit.paymentSubmittedAt
                                                ? "text-success"
                                                : "text-warning"
                                            }`}
                                    >
                                        {deposit.paymentSubmittedAt
                                            ? "Yes"
                                            : "No"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3">
                                    <p className="text-xs text-surface-500">
                                        Credited
                                    </p>

                                    <p
                                        className={`mt-1 font-semibold ${deposit.creditedAt
                                                ? "text-success"
                                                : "text-warning"
                                            }`}
                                    >
                                        {deposit.creditedAt
                                            ? "Yes"
                                            : "No"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* =================================================
                    MAIN GRID
                ================================================= */}

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-6">
                        {/* =================================================
                            CUSTOMER
                        ================================================= */}

                        <Section
                            title="Customer"
                            description="Customer associated with this deposit."
                            icon={<FaUser />}
                        >
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-xl font-bold text-brand">
                                    {user?.profileImage ? (
                                        <img
                                            src={
                                                user.profileImage
                                            }
                                            alt={
                                                user?.name ||
                                                "User"
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        user?.name
                                            ?.split(" ")
                                            .map(
                                                (word) =>
                                                    word[0]
                                            )
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase() ||
                                        "U"
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-semibold text-white">
                                            {user?.name ||
                                                "Unknown User"}
                                        </h3>

                                        {user?._id && (
                                            <Link
                                                to={`/admin/users/${user._id}`}
                                                className="text-xs font-medium text-brand hover:underline"
                                            >
                                                View User
                                            </Link>
                                        )}
                                    </div>

                                    <p className="mt-1 text-sm text-surface-400">
                                        {user?.email ||
                                            "No email available"}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {user?.status && (
                                            <span className="rounded-full bg-surface-800 px-2.5 py-1 text-xs text-surface-300">
                                                {formatStatus(
                                                    user.status
                                                )}
                                            </span>
                                        )}

                                        {user?.role && (
                                            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs text-brand">
                                                {formatStatus(
                                                    user.role
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-5 border-t border-surface-700 pt-5 sm:grid-cols-2">
                                <InfoItem
                                    label="Email"
                                    value={user?.email}
                                />

                                <InfoItem
                                    label="Phone"
                                    value={user?.phone}
                                />

                                <InfoItem
                                    label="Country"
                                    value={user?.country}
                                />

                                <InfoItem
                                    label="User ID"
                                    value={user?._id}
                                    mono
                                    copyable
                                />
                            </div>
                        </Section>

                        {/* =================================================
                            PAYMENT METHOD
                        ================================================= */}

                        <Section
                            title="Payment Method"
                            description="Payment destination selected by the customer."
                            icon={<FaMoneyBillTransfer />}
                        >
                            {paymentMethod ? (
                                <>
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <InfoItem
                                            label="Method"
                                            value={
                                                paymentMethod.name
                                            }
                                        />

                                        <InfoItem
                                            label="Type"
                                            value={getPaymentTypeLabel(
                                                paymentMethod.type
                                            )}
                                        />

                                        <InfoItem
                                            label="Currency"
                                            value={
                                                paymentMethod.currency
                                            }
                                        />

                                        <InfoItem
                                            label="Status"
                                            value={formatStatus(
                                                paymentMethod.status
                                            )}
                                        />
                                    </div>

                                    {paymentMethod.bankName && (
                                        <div className="mt-6 border-t border-surface-700 pt-5">
                                            <h3 className="mb-4 text-sm font-semibold text-white">
                                                Bank Details
                                            </h3>

                                            <div className="grid gap-5 sm:grid-cols-2">
                                                <InfoItem
                                                    label="Bank Name"
                                                    value={
                                                        paymentMethod.bankName
                                                    }
                                                />

                                                <InfoItem
                                                    label="Account Name"
                                                    value={
                                                        paymentMethod.accountName
                                                    }
                                                />

                                                <InfoItem
                                                    label="Account Number"
                                                    value={
                                                        paymentMethod.accountNumber
                                                    }
                                                    mono
                                                    copyable
                                                />

                                                <InfoItem
                                                    label="Routing Number"
                                                    value={
                                                        paymentMethod.routingNumber
                                                    }
                                                    mono
                                                    copyable
                                                />

                                                <InfoItem
                                                    label="IBAN"
                                                    value={
                                                        paymentMethod.iban
                                                    }
                                                    mono
                                                    copyable
                                                />

                                                <InfoItem
                                                    label="SWIFT Code"
                                                    value={
                                                        paymentMethod.swiftCode
                                                    }
                                                    mono
                                                    copyable
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {paymentMethod.walletAddress && (
                                        <div className="mt-6 border-t border-surface-700 pt-5">
                                            <InfoItem
                                                label="Wallet Address"
                                                value={
                                                    paymentMethod.walletAddress
                                                }
                                                mono
                                                copyable
                                            />
                                        </div>
                                    )}

                                    {paymentMethod.network && (
                                        <div className="mt-5">
                                            <InfoItem
                                                label="Network"
                                                value={
                                                    paymentMethod.network
                                                }
                                            />
                                        </div>
                                    )}

                                    {paymentMethod.instructions && (
                                        <div className="mt-6 rounded-xl border border-brand/20 bg-brand/10 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wide text-brand">
                                                Payment Instructions
                                            </p>

                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-surface-300">
                                                {
                                                    paymentMethod.instructions
                                                }
                                            </p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <FaCircleInfo className="mt-0.5 text-warning" />

                                        <p className="text-sm text-surface-300">
                                            Payment method details are
                                            not available.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Section>

                        {/* =================================================
                            PAYMENT INFORMATION
                        ================================================= */}

                        <Section
                            title="Payment Information"
                            description="Information submitted by the customer."
                            icon={<FaCreditCard />}
                        >
                            <div className="grid gap-6 sm:grid-cols-2">
                                <InfoItem
                                    label="Internal Deposit Reference"
                                    value={deposit.reference}
                                    mono
                                    copyable
                                />

                                <InfoItem
                                    label="Transaction Reference"
                                    value={
                                        deposit.transactionReference
                                    }
                                    mono
                                    copyable
                                />

                                <InfoItem
                                    label="Payment Asset"
                                    value={
                                        deposit.paymentAsset
                                    }
                                />

                                <InfoItem
                                    label="Payment Network"
                                    value={
                                        deposit.paymentNetwork
                                    }
                                />

                                <InfoItem
                                    label="Payment Submitted"
                                    value={formatDate(
                                        deposit.paymentSubmittedAt
                                    )}
                                />

                                <InfoItem
                                    label="Deposit Expires"
                                    value={formatDate(
                                        deposit.expiresAt
                                    )}
                                />
                            </div>

                            {deposit.userNote && (
                                <div className="mt-6 border-t border-surface-700 pt-5">
                                    <p className="text-xs font-medium uppercase tracking-wide text-surface-500">
                                        Customer Note
                                    </p>

                                    <div className="mt-2 rounded-xl border border-surface-700 bg-surface-950 p-4">
                                        <p className="whitespace-pre-wrap text-sm leading-6 text-surface-300">
                                            {deposit.userNote}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </Section>

                        {/* =================================================
                            PAYMENT PROOF
                        ================================================= */}

                        {deposit.paymentProof?.url && (
                            <Section
                                title="Payment Proof"
                                description="Proof of payment submitted by the customer."
                                icon={<FaFileImage />}
                            >
                                <div className="overflow-hidden rounded-xl border border-surface-700 bg-surface-950">
                                    {deposit.paymentProof.mimeType?.startsWith(
                                        "image/"
                                    ) ? (
                                        <a
                                            href={
                                                deposit
                                                    .paymentProof
                                                    .url
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <img
                                                src={
                                                    deposit
                                                        .paymentProof
                                                        .url
                                                }
                                                alt="Payment proof"
                                                className="max-h-[600px] w-full object-contain"
                                            />
                                        </a>
                                    ) : (
                                        <div className="p-5">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold text-white">
                                                        {deposit
                                                            .paymentProof
                                                            .fileName ||
                                                            "Payment proof"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-surface-500">
                                                        {deposit
                                                            .paymentProof
                                                            .mimeType ||
                                                            "Uploaded file"}
                                                    </p>
                                                </div>

                                                <a
                                                    href={
                                                        deposit
                                                            .paymentProof
                                                            .url
                                                    }
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white"
                                                >
                                                    Open Proof
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                                    <InfoItem
                                        label="File Name"
                                        value={
                                            deposit
                                                .paymentProof
                                                .fileName
                                        }
                                    />

                                    <InfoItem
                                        label="Uploaded At"
                                        value={formatDate(
                                            deposit
                                                .paymentProof
                                                .uploadedAt
                                        )}
                                    />
                                </div>
                            </Section>
                        )}

                        {/* =================================================
                            WALLET
                        ================================================= */}

                        <Section
                            title="Wallet"
                            description="Wallet associated with this deposit."
                            icon={<FaWallet />}
                        >
                            {wallet ? (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="rounded-xl border border-surface-700 bg-surface-950 p-4">
                                            <p className="text-xs text-surface-500">
                                                Currency
                                            </p>

                                            <p className="mt-2 text-lg font-semibold text-white">
                                                {wallet.currency ||
                                                    "—"}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-surface-700 bg-surface-950 p-4">
                                            <p className="text-xs text-surface-500">
                                                Available Balance
                                            </p>

                                            <p className="mt-2 text-lg font-semibold text-white">
                                                {formatAmount(
                                                    wallet.availableBalance,
                                                    wallet.currency
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-surface-700 bg-surface-950 p-4">
                                            <p className="text-xs text-surface-500">
                                                Locked Balance
                                            </p>

                                            <p className="mt-2 text-lg font-semibold text-white">
                                                {formatAmount(
                                                    wallet.lockedBalance,
                                                    wallet.currency
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-5 border-t border-surface-700 pt-5 sm:grid-cols-2">
                                        <InfoItem
                                            label="Wallet ID"
                                            value={wallet._id}
                                            mono
                                            copyable
                                        />

                                        <InfoItem
                                            label="Wallet Status"
                                            value={formatStatus(
                                                wallet.status
                                            )}
                                        />

                                        <InfoItem
                                            label="Last Transaction"
                                            value={formatDate(
                                                wallet.lastTransactionAt
                                            )}
                                        />

                                        <InfoItem
                                            label="Wallet Created"
                                            value={formatDate(
                                                wallet.createdAt
                                            )}
                                        />
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
                                    No wallet information is associated
                                    with this deposit.
                                </div>
                            )}
                        </Section>

                        {/* =================================================
                            LEDGER
                        ================================================= */}

                        <Section
                            title="Ledger Entry"
                            description="Financial ledger record associated with this deposit."
                            icon={<FaCoins />}
                        >
                            {ledger ? (
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <InfoItem
                                        label="Ledger ID"
                                        value={ledger._id}
                                        mono
                                        copyable
                                    />

                                    <InfoItem
                                        label="Type"
                                        value={ledger.type}
                                    />

                                    <InfoItem
                                        label="Direction"
                                        value={ledger.direction}
                                    />

                                    <InfoItem
                                        label="Amount"
                                        value={formatAmount(
                                            ledger.amount,
                                            ledger.currency
                                        )}
                                    />

                                    <InfoItem
                                        label="Currency"
                                        value={ledger.currency}
                                    />

                                    <InfoItem
                                        label="Balance After"
                                        value={formatAmount(
                                            ledger.balanceAfter,
                                            ledger.currency
                                        )}
                                    />

                                    <InfoItem
                                        label="Reference"
                                        value={ledger.reference}
                                        mono
                                        copyable
                                    />

                                    <InfoItem
                                        label="Created"
                                        value={formatDate(
                                            ledger.createdAt
                                        )}
                                    />

                                    <div className="sm:col-span-2">
                                        <InfoItem
                                            label="Description"
                                            value={
                                                ledger.description
                                            }
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <FaCircleInfo className="mt-0.5 shrink-0 text-warning" />

                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                No ledger entry is
                                                linked yet.
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-surface-400">
                                                This is expected for
                                                deposits that have not
                                                been approved and
                                                credited.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Section>

                        {/* =================================================
                            FAILURE / REJECTION
                        ================================================= */}

                        {(deposit.failureReason ||
                            deposit.rejectionReason) && (
                                <Section
                                    title="Rejection / Failure Information"
                                    description="Reason the deposit was not successfully processed."
                                    icon={
                                        <FaTriangleExclamation />
                                    }
                                >
                                    <div className="space-y-4">
                                        {deposit.rejectionReason && (
                                            <div className="rounded-xl border border-danger/20 bg-danger/10 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-danger">
                                                    Rejection Reason
                                                </p>

                                                <p className="mt-2 text-sm leading-6 text-surface-300">
                                                    {
                                                        deposit.rejectionReason
                                                    }
                                                </p>
                                            </div>
                                        )}

                                        {deposit.failureReason && (
                                            <div className="rounded-xl border border-danger/20 bg-danger/10 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-danger">
                                                    Processing Failure
                                                </p>

                                                <p className="mt-2 text-sm leading-6 text-surface-300">
                                                    {
                                                        deposit.failureReason
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </Section>
                            )}
                    </div>

                    {/* =================================================
                        SIDEBAR
                    ================================================= */}

                    <div className="space-y-6">
                        {/* =================================================
                            ADMIN ACTIONS
                        ================================================= */}

                        <Section
                            title="Deposit Actions"
                            description="Review and process this deposit."
                            icon={<FaCheck />}
                        >
                            {canTakeAction ? (
                                <div className="space-y-3">
                                    <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                                        <div className="flex items-start gap-3">
                                            <FaClock className="mt-0.5 shrink-0 text-warning" />

                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Admin action required
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-surface-400">
                                                    Review the payment
                                                    information and
                                                    proof before
                                                    approving the
                                                    deposit.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={openApproveModal}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-semibold text-white transition hover:bg-success/90"
                                    >
                                        <FaCheck />
                                        Approve & Credit Wallet
                                    </button>

                                    <button
                                        type="button"
                                        onClick={openRejectModal}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm font-semibold text-danger transition hover:bg-danger/20"
                                    >
                                        <FaXmark />
                                        Reject Deposit
                                    </button>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-surface-700 bg-surface-950 p-4">
                                    <div className="flex items-start gap-3">
                                        {deposit.status ===
                                            "successful" ? (
                                            <FaCheck className="mt-0.5 text-success" />
                                        ) : deposit.status ===
                                            "rejected" ? (
                                            <FaXmark className="mt-0.5 text-danger" />
                                        ) : (
                                            <FaCircleInfo className="mt-0.5 text-surface-500" />
                                        )}

                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {deposit.status ===
                                                    "successful"
                                                    ? "Deposit completed"
                                                    : deposit.status ===
                                                        "rejected"
                                                        ? "Deposit rejected"
                                                        : `No action available for ${formatStatus(
                                                            deposit.status
                                                        )}`}
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-surface-500">
                                                {deposit.status ===
                                                    "successful"
                                                    ? "The wallet has already been credited."
                                                    : deposit.status ===
                                                        "rejected"
                                                        ? "This deposit has already been rejected."
                                                        : "The deposit cannot currently be approved or rejected."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Section>

                        {/* =================================================
                            VERIFICATION
                        ================================================= */}

                        <Section
                            title="Payment Submission"
                            description="Customer payment confirmation state."
                            icon={<FaCreditCard />}
                        >
                            <div
                                className={`rounded-xl border p-4 ${deposit.paymentSubmittedAt
                                        ? "border-success/20 bg-success/10"
                                        : "border-warning/20 bg-warning/10"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${deposit.paymentSubmittedAt
                                                ? "bg-success/10 text-success"
                                                : "bg-warning/10 text-warning"
                                            }`}
                                    >
                                        {deposit.paymentSubmittedAt ? (
                                            <FaCheck />
                                        ) : (
                                            <FaClock />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {deposit.paymentSubmittedAt
                                                ? "Payment Submitted"
                                                : "Awaiting Payment"}
                                        </p>

                                        <p className="mt-1 text-xs text-surface-500">
                                            {deposit.paymentSubmittedAt
                                                ? formatDate(
                                                    deposit.paymentSubmittedAt
                                                )
                                                : "The customer has not submitted payment confirmation."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <InfoItem
                                    label="Transaction Reference"
                                    value={
                                        deposit.transactionReference
                                    }
                                    mono
                                    copyable
                                />

                                <InfoItem
                                    label="Submitted At"
                                    value={formatDate(
                                        deposit.paymentSubmittedAt
                                    )}
                                />

                                <InfoItem
                                    label="Reviewed At"
                                    value={formatDate(
                                        deposit.reviewedAt
                                    )}
                                />

                                <InfoItem
                                    label="Reviewed By"
                                    value={
                                        deposit.reviewedBy?.name ||
                                        deposit.reviewedBy?.email ||
                                        deposit.reviewedBy?._id
                                    }
                                />
                            </div>
                        </Section>

                        {/* =================================================
                            WALLET CREDIT
                        ================================================= */}

                        <Section
                            title="Wallet Credit"
                            description="When funds were credited to the wallet."
                            icon={<FaWallet />}
                        >
                            <div
                                className={`rounded-xl border p-4 ${deposit.creditedAt
                                        ? "border-success/20 bg-success/10"
                                        : "border-surface-700 bg-surface-950"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${deposit.creditedAt
                                                ? "bg-success/10 text-success"
                                                : "bg-surface-800 text-surface-500"
                                            }`}
                                    >
                                        {deposit.creditedAt ? (
                                            <FaCheck />
                                        ) : (
                                            <FaClock />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {deposit.creditedAt
                                                ? "Wallet Credited"
                                                : "Not Credited"}
                                        </p>

                                        <p className="mt-1 text-xs text-surface-500">
                                            {deposit.creditedAt
                                                ? formatDate(
                                                    deposit.creditedAt
                                                )
                                                : "No wallet credit has occurred."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <InfoItem
                                    label="Credit Reference"
                                    value={
                                        deposit.creditReference
                                    }
                                    mono
                                    copyable
                                />

                                <InfoItem
                                    label="Ledger Entry"
                                    value={
                                        ledger?._id ||
                                        deposit.ledgerEntry
                                    }
                                    mono
                                    copyable
                                />

                                <InfoItem
                                    label="Approved At"
                                    value={formatDate(
                                        deposit.approvedAt
                                    )}
                                />

                                <InfoItem
                                    label="Approved By"
                                    value={
                                        deposit.approvedBy?.name ||
                                        deposit.approvedBy?.email ||
                                        deposit.approvedBy?._id
                                    }
                                />
                            </div>
                        </Section>

                        {/* =================================================
                            ADMIN NOTE
                        ================================================= */}

                        {deposit.adminNote && (
                            <Section
                                title="Admin Note"
                                description="Internal note associated with this deposit."
                                icon={<FaCircleInfo />}
                            >
                                <div className="rounded-xl border border-surface-700 bg-surface-950 p-4">
                                    <p className="whitespace-pre-wrap text-sm leading-6 text-surface-300">
                                        {deposit.adminNote}
                                    </p>
                                </div>
                            </Section>
                        )}

                        {/* =================================================
                            TIMELINE
                        ================================================= */}

                        <Section
                            title="Deposit Timeline"
                            description="Important deposit events."
                            icon={<FaClock />}
                        >
                            <div className="space-y-0">
                                <TimelineItem
                                    label="Deposit Created"
                                    date={deposit.createdAt}
                                    description="Deposit record created in the system."
                                    active
                                />

                                <TimelineItem
                                    label="Payment Submitted"
                                    date={
                                        deposit.paymentSubmittedAt
                                    }
                                    description="Customer confirmed that the payment was made."
                                    active={Boolean(
                                        deposit.paymentSubmittedAt
                                    )}
                                />

                                <TimelineItem
                                    label="Admin Review"
                                    date={deposit.reviewedAt}
                                    description="An administrator reviewed the deposit."
                                    active={Boolean(
                                        deposit.reviewedAt
                                    )}
                                />

                                <TimelineItem
                                    label="Deposit Approved"
                                    date={deposit.approvedAt}
                                    description="Administrator approved the deposit."
                                    active={Boolean(
                                        deposit.approvedAt
                                    )}
                                />

                                <TimelineItem
                                    label="Wallet Credited"
                                    date={deposit.creditedAt}
                                    description="Funds were credited to the customer's wallet."
                                    active={Boolean(
                                        deposit.creditedAt
                                    )}
                                />

                                <TimelineItem
                                    label="Deposit Rejected"
                                    date={deposit.rejectedAt}
                                    description={
                                        deposit.rejectionReason ||
                                        "Deposit was rejected by an administrator."
                                    }
                                    active={Boolean(
                                        deposit.rejectedAt
                                    )}
                                />
                            </div>
                        </Section>

                        {/* =================================================
                            QUICK LINKS
                        ================================================= */}

                        <Section
                            title="Quick Links"
                            description="Related records."
                            icon={<FaLink />}
                        >
                            <div className="space-y-2">
                                {user?._id && (
                                    <Link
                                        to={`/admin/users/${user._id}`}
                                        className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-surface-300 transition hover:border-brand/40 hover:text-white"
                                    >
                                        <span className="flex items-center gap-3">
                                            <FaUser />
                                            View Customer
                                        </span>

                                        <span>→</span>
                                    </Link>
                                )}

                                {user?._id && (
                                    <Link
                                        to={`/admin/users/${user._id}/kyc`}
                                        className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-surface-300 transition hover:border-brand/40 hover:text-white"
                                    >
                                        <span className="flex items-center gap-3">
                                            <FaIdCard />
                                            View KYC
                                        </span>

                                        <span>→</span>
                                    </Link>
                                )}

                                <Link
                                    to="/admin/deposits"
                                    className="flex items-center justify-between rounded-xl border border-surface-700 bg-surface-950 px-4 py-3 text-sm text-surface-300 transition hover:border-brand/40 hover:text-white"
                                >
                                    <span className="flex items-center gap-3">
                                        <FaCreditCard />
                                        All Deposits
                                    </span>

                                    <span>→</span>
                                </Link>
                            </div>
                        </Section>
                    </div>
                </div>
            </div>

            {/* =================================================
                APPROVE / REJECT MODAL
            ================================================= */}

            {actionType && (
                <ActionModal
                    type={actionType}
                    deposit={deposit}
                    processing={actionProcessing}
                    rejectionReason={rejectionReason}
                    adminNote={adminNote}
                    setRejectionReason={
                        setRejectionReason
                    }
                    setAdminNote={setAdminNote}
                    onClose={closeActionModal}
                    onConfirm={handleAction}
                />
            )}
        </div>
    );
}