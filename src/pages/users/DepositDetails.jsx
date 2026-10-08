import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaSpinner,
    FaUniversity,
    FaFileInvoiceDollar,
} from "react-icons/fa";
import api from "../../library/api";

const DepositDetails = () => {
    const { depositId } = useParams();

    const [deposit, setDeposit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDeposit = async () => {
            if (!depositId) {
                setError("Deposit ID is missing.");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                /*
                =================================================
                GET USER DEPOSIT
                GET /api/v1/deposits/:id
                =================================================
                */

                const response = await api.get(
                    `/deposits/${depositId}`
                );

                /*
                Your backend may return:
        
                data: {
                  deposit: {...}
                }
        
                or:
        
                data: {...}
        
                Handle both safely.
                */

                const responseData = response?.data?.data;

                const depositData =
                    responseData?.deposit ||
                    responseData ||
                    null;

                setDeposit(depositData);
            } catch (err) {
                console.error(
                    "Fetch deposit details error:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Unable to load this deposit."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDeposit();
    }, [depositId]);

    /*
    =====================================================
    STATUS HELPERS
    =====================================================
    */

    const getStatusIcon = () => {
        switch (deposit?.status) {
            case "successful":
                return (
                    <FaCheckCircle className="text-emerald-400" />
                );

            case "rejected":
            case "cancelled":
            case "expired":
                return (
                    <FaTimesCircle className="text-red-400" />
                );

            case "processing":
            case "submitted":
            case "under_review":
            case "pending":
                return (
                    <FaClock className="text-yellow-400" />
                );

            default:
                return (
                    <FaClock className="text-slate-400" />
                );
        }
    };

    const getStatusClass = () => {
        switch (deposit?.status) {
            case "successful":
                return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";

            case "rejected":
            case "cancelled":
            case "expired":
                return "border-red-500/20 bg-red-500/10 text-red-400";

            case "processing":
            case "submitted":
            case "under_review":
            case "pending":
                return "border-yellow-500/20 bg-yellow-500/10 text-yellow-400";

            default:
                return "border-slate-700 bg-slate-800 text-slate-300";
        }
    };

    const formatStatus = (status) => {
        if (!status) {
            return "-";
        }

        return status
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    const formatPaymentType = (type) => {
        if (!type) {
            return "-";
        }

        return type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    const formatAmount = () => {
        const amount = Number(deposit?.amount || 0);

        return amount.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
        });
    };

    /*
    =====================================================
    LOADING
    =====================================================
    */

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 text-white">
                <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
                    <div className="flex items-center gap-3 text-slate-400">
                        <FaSpinner className="animate-spin text-cyan-400" />
                        <span>Loading deposit...</span>
                    </div>
                </div>
            </div>
        );
    }

    /*
    =====================================================
    ERROR
    =====================================================
    */

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 text-white">
                <div className="mx-auto max-w-5xl">
                    <Link
                        to="/user/deposits"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
                    >
                        <FaArrowLeft />
                        Back to Deposits
                    </Link>

                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                        <div className="flex items-start gap-3">
                            <FaTimesCircle className="mt-1 text-red-400" />

                            <div>
                                <h2 className="font-semibold text-red-300">
                                    Unable to load deposit
                                </h2>

                                <p className="mt-1 text-sm text-red-300/80">
                                    {error}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /*
    =====================================================
    DEPOSIT NOT FOUND
    =====================================================
    */

    if (!deposit) {
        return (
            <div className="min-h-screen bg-slate-950 p-6 text-white">
                <div className="mx-auto max-w-5xl">
                    <Link
                        to="/user/deposits"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
                    >
                        <FaArrowLeft />
                        Back to Deposits
                    </Link>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
                        <FaFileInvoiceDollar className="mx-auto mb-4 text-3xl text-slate-600" />

                        <h2 className="text-lg font-semibold">
                            Deposit not found
                        </h2>

                        <p className="mt-2 text-sm text-slate-400">
                            This deposit could not be found or may no longer
                            be available.
                        </p>
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

    return (
        <div className="min-h-screen bg-slate-950 p-4 text-white sm:p-6">
            <div className="mx-auto max-w-5xl">

                {/* Back */}
                <Link
                    to="/user/deposits"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-400 transition hover:text-cyan-300"
                >
                    <FaArrowLeft />
                    Back to Deposits
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="mb-2 text-sm text-slate-500">
                                Deposit
                            </p>

                            <h1 className="text-2xl font-bold sm:text-3xl">
                                Deposit Details
                            </h1>

                            <p className="mt-2 break-all text-sm text-slate-400">
                                Reference:{" "}
                                <span className="text-slate-300">
                                    {deposit.reference || "-"}
                                </span>
                            </p>
                        </div>

                        <div
                            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${getStatusClass()}`}
                        >
                            {getStatusIcon()}
                            {formatStatus(deposit.status)}
                        </div>
                    </div>
                </div>

                {/* Amount Card */}
                <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-slate-400">
                                Deposit Amount
                            </p>

                            <div className="mt-2 text-3xl font-bold">
                                {deposit.currency}{" "}
                                {formatAmount()}
                            </div>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                            <FaFileInvoiceDollar className="text-xl text-cyan-400" />
                        </div>
                    </div>
                </div>

                {/* Main Information */}
                <div className="grid gap-6 md:grid-cols-2">

                    {/* Deposit Information */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-5 text-lg font-semibold">
                            Deposit Information
                        </h2>

                        <div className="space-y-4">

                            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                                <span className="text-sm text-slate-400">
                                    Amount
                                </span>

                                <span className="text-right font-semibold">
                                    {deposit.currency}{" "}
                                    {formatAmount()}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                                <span className="text-sm text-slate-400">
                                    Status
                                </span>

                                <span className="flex items-center gap-2 text-right text-sm">
                                    {getStatusIcon()}
                                    {formatStatus(deposit.status)}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                                <span className="text-sm text-slate-400">
                                    Payment Type
                                </span>

                                <span className="text-right text-sm">
                                    {formatPaymentType(
                                        deposit.paymentType
                                    )}
                                </span>
                            </div>

                            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                                <span className="text-sm text-slate-400">
                                    Created
                                </span>

                                <span className="text-right text-sm text-slate-300">
                                    {formatDate(deposit.createdAt)}
                                </span>
                            </div>

                            {deposit.paymentSubmittedAt && (
                                <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                                    <span className="text-sm text-slate-400">
                                        Payment Submitted
                                    </span>

                                    <span className="text-right text-sm text-slate-300">
                                        {formatDate(
                                            deposit.paymentSubmittedAt
                                        )}
                                    </span>
                                </div>
                            )}

                            {deposit.creditedAt && (
                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-sm text-slate-400">
                                        Credited
                                    </span>

                                    <span className="text-right text-sm text-emerald-400">
                                        {formatDate(
                                            deposit.creditedAt
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-5 text-lg font-semibold">
                            Payment Information
                        </h2>

                        <div className="space-y-5">

                            {/* Payment Method */}
                            <div>
                                <p className="text-sm text-slate-400">
                                    Payment Method
                                </p>

                                <div className="mt-2 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10">
                                        <FaUniversity className="text-cyan-400" />
                                    </div>

                                    <p className="text-sm font-medium">
                                        {deposit.paymentMethod?.name ||
                                            "-"}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Type */}
                            <div>
                                <p className="text-sm text-slate-400">
                                    Payment Type
                                </p>

                                <p className="mt-1 text-sm">
                                    {formatPaymentType(
                                        deposit.paymentType
                                    )}
                                </p>
                            </div>

                            {/* Transaction Reference */}
                            <div>
                                <p className="text-sm text-slate-400">
                                    Transaction Reference
                                </p>

                                <p className="mt-1 break-all text-sm text-slate-200">
                                    {deposit.transactionReference ||
                                        "Not submitted"}
                                </p>
                            </div>

                            {/* Payment Asset */}
                            {deposit.paymentAsset && (
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Payment Asset
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {deposit.paymentAsset}
                                    </p>
                                </div>
                            )}

                            {/* Payment Network */}
                            {deposit.paymentNetwork && (
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Payment Network
                                    </p>

                                    <p className="mt-1 text-sm">
                                        {deposit.paymentNetwork}
                                    </p>
                                </div>
                            )}

                            {/* User Note */}
                            {deposit.userNote && (
                                <div>
                                    <p className="text-sm text-slate-400">
                                        Your Note
                                    </p>

                                    <p className="mt-1 rounded-lg bg-slate-950 p-3 text-sm leading-6 text-slate-300">
                                        {deposit.userNote}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Proof */}
                {deposit.paymentProof?.url && (
                    <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Payment Proof
                        </h2>

                        <a
                            href={deposit.paymentProof.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                            View Payment Proof
                        </a>
                    </div>
                )}

                {/* Rejection Information */}
                {deposit.status === "rejected" &&
                    (deposit.rejectionReason ||
                        deposit.adminNote) && (
                        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
                            <h2 className="mb-3 text-lg font-semibold text-red-300">
                                Deposit Rejected
                            </h2>

                            {deposit.rejectionReason && (
                                <div>
                                    <p className="text-sm text-red-300/70">
                                        Reason
                                    </p>

                                    <p className="mt-1 text-sm text-red-200">
                                        {deposit.rejectionReason}
                                    </p>
                                </div>
                            )}

                            {deposit.adminNote && (
                                <div className="mt-4">
                                    <p className="text-sm text-red-300/70">
                                        Admin Note
                                    </p>

                                    <p className="mt-1 text-sm text-red-200">
                                        {deposit.adminNote}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                {/* Processing / Review Message */}
                {[
                    "pending",
                    "submitted",
                    "under_review",
                    "processing",
                ].includes(deposit.status) && (
                        <div className="mt-6 rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
                            <div className="flex items-start gap-3">
                                <FaClock className="mt-1 text-yellow-400" />

                                <div>
                                    <h2 className="font-semibold text-yellow-300">
                                        Deposit is being processed
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-yellow-200/70">
                                        {deposit.status === "pending"
                                            ? "Your deposit has been created and is waiting for payment submission."
                                            : deposit.status === "submitted"
                                                ? "Your payment has been submitted and is waiting for admin review."
                                                : deposit.status === "under_review"
                                                    ? "Your payment is currently being reviewed."
                                                    : "Your deposit is being processed. Your wallet will be credited once processing is completed."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                {/* Successful Message */}
                {deposit.status === "successful" && (
                    <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                        <div className="flex items-start gap-3">
                            <FaCheckCircle className="mt-1 text-emerald-400" />

                            <div>
                                <h2 className="font-semibold text-emerald-300">
                                    Deposit successful
                                </h2>

                                <p className="mt-1 text-sm leading-6 text-emerald-200/70">
                                    Your payment has been approved and the
                                    deposited amount has been credited to your
                                    wallet.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DepositDetails;