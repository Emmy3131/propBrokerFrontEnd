import { useEffect, useState } from "react";
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
    FaIdCard,
    FaLink,
    FaTriangleExclamation,
    FaUser,
    FaWallet,
    FaXmark,
} from "react-icons/fa6";

import api from "../../library/api";

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
            return "border-success/20 bg-success/10 text-success";

        case "processing":
            return "border-brand/20 bg-brand/10 text-brand";

        case "pending":
            return "border-warning/20 bg-warning/10 text-warning";

        case "failed":
        case "cancelled":
        case "expired":
            return "border-danger/20 bg-danger/10 text-danger";

        default:
            return "border-surface-700 bg-surface-800 text-surface-300";
    }
}

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

            {status === "pending" && (
                <FaClock className="mr-1.5" />
            )}

            {["failed", "cancelled", "expired"].includes(status) && (
                <FaXmark className="mr-1.5" />
            )}

            {formatStatus(status)}
        </span>
    );
}

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
                {active ? <FaCheck size={12} /> : <FaClock size={12} />}
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

export default function AdminDepositDetails() {
    const { depositId } = useParams();

    const [deposit, setDeposit] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const loadDeposit = async ({
        showLoader = true,
    } = {}) => {
        try {
            if (showLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            setError("");

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

    useEffect(() => {
        if (!depositId) {
            setError("Deposit ID is missing.");
            setLoading(false);
            return;
        }

        loadDeposit();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depositId]);

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
    const ledger = deposit.ledgerEntry;

    return (
        <div className="min-h-screen bg-surface-950 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-[1500px] space-y-6">
                {/* HEADER */}
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

                            <StatusBadge status={deposit.status} />
                        </div>

                        <p className="mt-2 font-mono text-xs text-surface-500">
                            {deposit.reference}
                        </p>
                    </div>

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
                            className={refreshing ? "animate-spin" : ""}
                        />

                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* AMOUNT HERO */}
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
                                    Created {formatDate(deposit.createdAt)}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                <div className="rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3">
                                    <p className="text-xs text-surface-500">
                                        Provider
                                    </p>

                                    <p className="mt-1 capitalize font-semibold text-white">
                                        {deposit.provider || "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3">
                                    <p className="text-xs text-surface-500">
                                        Currency
                                    </p>

                                    <p className="mt-1 font-semibold text-white">
                                        {deposit.currency || "—"}
                                    </p>
                                </div>

                                <div className="rounded-xl border border-surface-700 bg-surface-950/60 px-4 py-3 col-span-2 sm:col-span-1">
                                    <p className="text-xs text-surface-500">
                                        Verification
                                    </p>

                                    <p
                                        className={`mt-1 font-semibold ${deposit.verifiedAt
                                                ? "text-success"
                                                : "text-warning"
                                            }`}
                                    >
                                        {deposit.verifiedAt
                                            ? "Verified"
                                            : "Not Verified"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MAIN GRID */}
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <div className="space-y-6">
                        {/* CUSTOMER */}
                        <Section
                            title="Customer"
                            description="Customer associated with this deposit."
                            icon={<FaUser />}
                        >
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand/10 text-xl font-bold text-brand">
                                    {user?.profileImage ? (
                                        <img
                                            src={user.profileImage}
                                            alt={user?.name || "User"}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        user?.name
                                            ?.split(" ")
                                            .map((word) => word[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase() || "U"
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h3 className="text-lg font-semibold text-white">
                                            {user?.name || "Unknown User"}
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
                                        {user?.email || "No email available"}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {user?.status && (
                                            <span className="rounded-full bg-surface-800 px-2.5 py-1 text-xs text-surface-300">
                                                {formatStatus(user.status)}
                                            </span>
                                        )}

                                        {user?.role && (
                                            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs text-brand">
                                                {formatStatus(user.role)}
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

                        {/* PAYMENT INFORMATION */}
                        <Section
                            title="Payment Information"
                            description="Provider and transaction references."
                            icon={<FaCreditCard />}
                        >
                            <div className="grid gap-6 sm:grid-cols-2">
                                <InfoItem
                                    label="Internal Reference"
                                    value={deposit.reference}
                                    mono
                                    copyable
                                />

                                <InfoItem
                                    label="Provider"
                                    value={
                                        deposit.provider
                                            ? deposit.provider
                                                .charAt(0)
                                                .toUpperCase() +
                                            deposit.provider.slice(1)
                                            : "—"
                                    }
                                />

                                <InfoItem
                                    label="Provider Reference"
                                    value={deposit.providerReference}
                                    mono
                                    copyable
                                />

                                <InfoItem
                                    label="Provider Transaction ID"
                                    value={deposit.providerTransactionId}
                                    mono
                                    copyable
                                />

                                <InfoItem
                                    label="Payment URL"
                                    value={
                                        deposit.paymentUrl
                                            ? "Payment checkout available"
                                            : "No payment URL"
                                    }
                                />

                                <InfoItem
                                    label="Verification Method"
                                    value={
                                        deposit.verificationMethod
                                            ? formatStatus(
                                                deposit.verificationMethod
                                            )
                                            : "Not verified"
                                    }
                                />
                            </div>

                            {deposit.paymentUrl && (
                                <div className="mt-6 border-t border-surface-700 pt-5">
                                    <a
                                        href={deposit.paymentUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-800 px-4 py-2.5 text-sm font-medium text-surface-300 transition hover:text-white"
                                    >
                                        <FaLink />
                                        Open Payment URL
                                    </a>
                                </div>
                            )}
                        </Section>

                        {/* WALLET */}
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
                                                {wallet.currency || "—"}
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
                                    No wallet information is associated with
                                    this deposit.
                                </div>
                            )}
                        </Section>

                        {/* LEDGER */}
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
                                            value={ledger.description}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-warning/20 bg-warning/10 p-4">
                                    <div className="flex items-start gap-3">
                                        <FaCircleInfo className="mt-0.5 shrink-0 text-warning" />

                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                No ledger entry is linked yet.
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-surface-400">
                                                This is expected for deposits that
                                                have not been successfully verified
                                                and credited.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Section>

                        {/* FAILURE */}
                        {deposit.failureReason && (
                            <Section
                                title="Failure Information"
                                description="Reason the deposit failed."
                                icon={<FaTriangleExclamation />}
                            >
                                <div className="rounded-xl border border-danger/20 bg-danger/10 p-4">
                                    <p className="text-sm leading-6 text-surface-300">
                                        {deposit.failureReason}
                                    </p>
                                </div>
                            </Section>
                        )}
                    </div>

                    {/* SIDEBAR */}
                    <div className="space-y-6">
                        {/* VERIFICATION */}
                        <Section
                            title="Verification"
                            description="Deposit verification state."
                            icon={<FaCheck />}
                        >
                            <div
                                className={`rounded-xl border p-4 ${deposit.verifiedAt
                                        ? "border-success/20 bg-success/10"
                                        : "border-warning/20 bg-warning/10"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full ${deposit.verifiedAt
                                                ? "bg-success/10 text-success"
                                                : "bg-warning/10 text-warning"
                                            }`}
                                    >
                                        {deposit.verifiedAt ? (
                                            <FaCheck />
                                        ) : (
                                            <FaClock />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {deposit.verifiedAt
                                                ? "Deposit Verified"
                                                : "Awaiting Verification"}
                                        </p>

                                        <p className="mt-1 text-xs text-surface-500">
                                            {deposit.verifiedAt
                                                ? formatDate(deposit.verifiedAt)
                                                : "No verification timestamp"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 space-y-4">
                                <InfoItem
                                    label="Verification Method"
                                    value={
                                        deposit.verificationMethod
                                            ? formatStatus(
                                                deposit.verificationMethod
                                            )
                                            : "—"
                                    }
                                />

                                <InfoItem
                                    label="Verified At"
                                    value={formatDate(
                                        deposit.verifiedAt
                                    )}
                                />
                            </div>
                        </Section>

                        {/* CREDIT */}
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
                                                ? "Credited"
                                                : "Not Credited"}
                                        </p>

                                        <p className="mt-1 text-xs text-surface-500">
                                            {deposit.creditedAt
                                                ? formatDate(
                                                    deposit.creditedAt
                                                )
                                                : "No credit timestamp"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* TIMELINE */}
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
                                    label="Payment Initialized"
                                    date={
                                        deposit.status !== "pending"
                                            ? deposit.updatedAt
                                            : null
                                    }
                                    description="Payment provider initialization was completed."
                                    active={
                                        deposit.status !== "pending"
                                    }
                                />

                                <TimelineItem
                                    label="Verified"
                                    date={deposit.verifiedAt}
                                    description="Payment was verified by the provider or server."
                                    active={Boolean(
                                        deposit.verifiedAt
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
                            </div>
                        </Section>

                        {/* QUICK LINKS */}
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
        </div>
    );
}