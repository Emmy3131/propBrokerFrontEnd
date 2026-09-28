import { useEffect, useMemo, useState } from "react";
import {
    FaArrowDown,
    FaWallet,
    FaShieldAlt,
    FaLock,
    FaCheckCircle,
    FaExclamationCircle,
    FaSpinner,
    FaCreditCard,
    FaInfoCircle,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import api from "../../library/api";

/*
=====================================================
SUPPORTED CURRENCIES
=====================================================
*/

const CURRENCIES = ["USD", "NGN", "CAD", "EUR"];

/*
=====================================================
SUPPORTED PROVIDERS
=====================================================
*/

const PROVIDERS = [
    {
        value: "paystack",
        label: "Paystack",
        description: "Secure card and bank payment",
    },
];

/*
=====================================================
CURRENCY SYMBOLS
=====================================================
*/

const currencySymbols = {
    USD: "$",
    NGN: "₦",
    CAD: "C$",
    EUR: "€",
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
        return `${currency} ${numericAmount.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        )}`;
    }
};

/*
=====================================================
MAIN COMPONENT
=====================================================
*/

const Deposit = () => {
    const navigate = useNavigate();

    /*
    =====================================================
    STATE
    =====================================================
    */

    const [amount, setAmount] = useState("");

    const [currency, setCurrency] = useState("USD");

    const [provider, setProvider] = useState("paystack");

    const [wallet, setWallet] = useState(null);

    const [loadingWallet, setLoadingWallet] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    /*
    =====================================================
    FETCH DASHBOARD / WALLET
    =====================================================
    */

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                setLoadingWallet(true);

                const response = await api.get("/users/dashboard");

                const dashboard = response?.data?.data;

                setWallet(dashboard?.wallet || null);

                /*
                -------------------------------------------------
                Use the user's wallet currency as the initial
                currency when available.
                -------------------------------------------------
                */

                if (dashboard?.wallet?.currency) {
                    const walletCurrency =
                        dashboard.wallet.currency;

                    if (CURRENCIES.includes(walletCurrency)) {
                        setCurrency(walletCurrency);
                    }
                }
            } catch (err) {
                console.error(
                    "Failed to load wallet information:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Unable to load your wallet information."
                );
            } finally {
                setLoadingWallet(false);
            }
        };

        fetchWallet();
    }, []);

    /*
    =====================================================
    AMOUNT NUMBER
    =====================================================
    */

    const numericAmount = useMemo(() => {
        return Number(amount || 0);
    }, [amount]);

    /*
    =====================================================
    VALIDATION
    =====================================================
    */

    const validationError = useMemo(() => {
        if (!amount) {
            return "";
        }

        if (Number.isNaN(numericAmount)) {
            return "Please enter a valid amount.";
        }

        if (numericAmount <= 0) {
            return "Deposit amount must be greater than zero.";
        }

        /*
        -------------------------------------------------
        Basic client-side limit.
    
        The authoritative limits should also be enforced
        by the backend.
        -------------------------------------------------
        */

        if (numericAmount < 10) {
            return `Minimum deposit is ${formatMoney(
                10,
                currency
            )}.`;
        }

        if (numericAmount > 1000000) {
            return `Maximum deposit is ${formatMoney(
                1000000,
                currency
            )}.`;
        }

        return "";
    }, [amount, numericAmount, currency]);

    /*
    =====================================================
    HANDLE AMOUNT
    =====================================================
    */

    const handleAmountChange = (event) => {
        const value = event.target.value;

        /*
        -------------------------------------------------
        Allow only numbers and decimal point.
        -------------------------------------------------
        */

        if (!/^\d*\.?\d*$/.test(value)) {
            return;
        }

        setAmount(value);

        setError("");
        setSuccess("");
    };

    /*
    =====================================================
    SUBMIT DEPOSIT
    =====================================================
    */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        /*
        -------------------------------------------------
        Validate amount
        -------------------------------------------------
        */

        if (!amount) {
            setError("Please enter a deposit amount.");
            return;
        }

        if (validationError) {
            setError(validationError);
            return;
        }

        /*
        -------------------------------------------------
        Make sure provider exists
        -------------------------------------------------
        */

        if (!provider) {
            setError("Please select a payment provider.");
            return;
        }

        try {
            setSubmitting(true);

            /*
            =================================================
            CREATE DEPOSIT
            =================================================
      
            The backend should:
      
            1. Authenticate the user
            2. Validate the wallet
            3. Create a pending Deposit
            4. Generate a payment reference
            5. Initialize Paystack
            6. Return paymentUrl
            */

            const response = await api.post("/deposits", {
                amount: numericAmount,
                currency,
                provider,
            });

            const responseData = response?.data?.data || {};

            /*
            -------------------------------------------------
            Depending on your controller structure, the
            payment URL may be returned directly or inside
            the deposit object.
            -------------------------------------------------
            */

            const paymentUrl =
                responseData.paymentUrl ||
                responseData.deposit?.paymentUrl ||
                responseData.authorizationUrl ||
                responseData.deposit?.authorizationUrl;

            /*
            =================================================
            REDIRECT TO PAYMENT
            =================================================
            */

            if (paymentUrl) {
                setSuccess(
                    "Deposit created successfully. Redirecting to secure payment..."
                );

                /*
                -------------------------------------------------
                Small delay so the user sees the success state.
                -------------------------------------------------
                */

                setTimeout(() => {
                    window.location.href = paymentUrl;
                }, 700);

                return;
            }

            /*
            -------------------------------------------------
            Deposit created but no payment URL returned.
            -------------------------------------------------
            */

            setSuccess(
                "Your deposit has been created successfully."
            );

            setAmount("");

            /*
            -------------------------------------------------
            Refresh dashboard/wallet information.
            -------------------------------------------------
            */

            try {
                const dashboardResponse = await api.get(
                    "/users/dashboard"
                );

                setWallet(
                    dashboardResponse?.data?.data?.wallet || null
                );
            } catch (refreshError) {
                console.error(
                    "Failed to refresh wallet:",
                    refreshError
                );
            }
        } catch (err) {
            console.error("Deposit creation failed:", err);

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Unable to create your deposit. Please try again.";

            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    /*
    =====================================================
    QUICK AMOUNTS
    =====================================================
    */

    const quickAmounts = [100, 500, 1000, 5000];

    /*
    =====================================================
    LOADING WALLET
    =====================================================
    */

    if (loadingWallet) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <FaSpinner className="animate-spin text-3xl text-brand-400" />

                    <p className="text-sm text-surface-400">
                        Loading deposit page...
                    </p>
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
        <div className="mx-auto max-w-6xl space-y-6">
            {/* =================================================
          PAGE HEADER
      ================================================= */}

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-2 text-sm font-medium text-brand-400">
                        Fund your account
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight text-surface-100 sm:text-3xl">
                        Make a Deposit
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-surface-400">
                        Add funds to your wallet securely through your
                        selected payment provider.
                    </p>
                </div>

                <Link
                    to="/user/transactions"
                    className="inline-flex items-center justify-center rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-surface-300 transition hover:border-surface-600 hover:bg-surface-800 hover:text-surface-100"
                >
                    View Transactions
                </Link>
            </div>

            {/* =================================================
          ALERTS
      ================================================= */}

            {error && (
                <div className="rounded-xl border border-danger-500/20 bg-danger-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <FaExclamationCircle className="mt-0.5 shrink-0 text-danger-400" />

                        <div>
                            <p className="text-sm font-medium text-danger-300">
                                Deposit Error
                            </p>

                            <p className="mt-1 text-sm text-danger-400/90">
                                {error}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="rounded-xl border border-success-500/20 bg-success-500/10 p-4">
                    <div className="flex items-start gap-3">
                        <FaCheckCircle className="mt-0.5 shrink-0 text-success-400" />

                        <p className="text-sm font-medium text-success-300">
                            {success}
                        </p>
                    </div>
                </div>
            )}

            {/* =================================================
          MAIN GRID
      ================================================= */}

            <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                {/* =================================================
            DEPOSIT FORM
        ================================================= */}

                <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5 shadow-xl sm:p-6">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success-500/10 text-success-400">
                            <FaArrowDown />
                        </div>

                        <div>
                            <h2 className="font-semibold text-surface-100">
                                Deposit Funds
                            </h2>

                            <p className="text-sm text-surface-500">
                                Enter the amount you want to deposit.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        {/* =================================================
                CURRENCY
            ================================================= */}

                        <div>
                            <label
                                htmlFor="currency"
                                className="mb-2 block text-sm font-medium text-surface-300"
                            >
                                Currency
                            </label>

                            <select
                                id="currency"
                                value={currency}
                                onChange={(event) => {
                                    setCurrency(event.target.value);
                                    setError("");
                                    setSuccess("");
                                }}
                                disabled={submitting}
                                className="h-12 w-full rounded-xl border border-surface-700 bg-surface-950 px-4 text-sm text-surface-100 outline-none transition focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {CURRENCIES.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* =================================================
                AMOUNT
            ================================================= */}

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label
                                    htmlFor="amount"
                                    className="block text-sm font-medium text-surface-300"
                                >
                                    Deposit Amount
                                </label>

                                <span className="text-xs text-surface-500">
                                    Minimum: {formatMoney(10, currency)}
                                </span>
                            </div>

                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-surface-500">
                                    {currencySymbols[currency] || currency}
                                </span>

                                <input
                                    id="amount"
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                    disabled={submitting}
                                    className="h-14 w-full rounded-xl border border-surface-700 bg-surface-950 pl-10 pr-4 text-xl font-semibold text-surface-100 outline-none transition placeholder:text-surface-700 focus:border-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                                />
                            </div>

                            {validationError && (
                                <p className="mt-2 text-xs text-danger-400">
                                    {validationError}
                                </p>
                            )}

                            {/* QUICK AMOUNTS */}

                            <div className="mt-3 flex flex-wrap gap-2">
                                {quickAmounts.map((quickAmount) => (
                                    <button
                                        key={quickAmount}
                                        type="button"
                                        disabled={submitting}
                                        onClick={() =>
                                            setAmount(String(quickAmount))
                                        }
                                        className="rounded-lg border border-surface-700 bg-surface-800 px-3 py-1.5 text-xs font-medium text-surface-400 transition hover:border-brand-500/40 hover:bg-brand-500/10 hover:text-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {formatMoney(
                                            quickAmount,
                                            currency
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* =================================================
                PROVIDER
            ================================================= */}

                        <div>
                            <label className="mb-2 block text-sm font-medium text-surface-300">
                                Payment Provider
                            </label>

                            <div className="space-y-3">
                                {PROVIDERS.map((item) => {
                                    const selected =
                                        provider === item.value;

                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            disabled={submitting}
                                            onClick={() =>
                                                setProvider(item.value)
                                            }
                                            className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${selected
                                                    ? "border-brand-500/50 bg-brand-500/10"
                                                    : "border-surface-700 bg-surface-950 hover:border-surface-600"
                                                } disabled:cursor-not-allowed disabled:opacity-60`}
                                        >
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected
                                                        ? "bg-brand-500/15 text-brand-400"
                                                        : "bg-surface-800 text-surface-500"
                                                    }`}
                                            >
                                                <FaCreditCard />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-surface-100">
                                                    {item.label}
                                                </p>

                                                <p className="mt-0.5 text-xs text-surface-500">
                                                    {item.description}
                                                </p>
                                            </div>

                                            <div
                                                className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected
                                                        ? "border-brand-500 bg-brand-500"
                                                        : "border-surface-600"
                                                    }`}
                                            >
                                                {selected && (
                                                    <div className="h-2 w-2 rounded-full bg-white" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* =================================================
                SUBMIT
            ================================================= */}

                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                !amount ||
                                Boolean(validationError)
                            }
                            className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitting ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Creating Deposit...
                                </>
                            ) : (
                                <>
                                    <FaArrowDown />
                                    Continue to Payment
                                </>
                            )}
                        </button>

                        {/* =================================================
                SECURITY
            ================================================= */}

                        <div className="flex items-start gap-3 rounded-xl border border-surface-700 bg-surface-950 p-4">
                            <FaShieldAlt className="mt-0.5 shrink-0 text-success-400" />

                            <div>
                                <p className="text-xs font-medium text-surface-200">
                                    Secure payment
                                </p>

                                <p className="mt-1 text-xs leading-5 text-surface-500">
                                    Your payment will be processed securely
                                    by the selected payment provider. Your
                                    wallet is only credited after the payment
                                    is successfully verified.
                                </p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* =================================================
            SIDEBAR
        ================================================= */}

                <div className="space-y-6">
                    {/* =================================================
              WALLET CARD
          ================================================= */}

                    <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5 shadow-xl">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400">
                                <FaWallet />
                            </div>

                            <div>
                                <p className="text-xs text-surface-500">
                                    Current Wallet
                                </p>

                                <h3 className="font-semibold text-surface-100">
                                    {wallet?.currency || currency}
                                </h3>
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs text-surface-500">
                                Available Balance
                            </p>

                            <p className="mt-1 text-2xl font-bold text-surface-100">
                                {formatMoney(
                                    wallet?.availableBalance || 0,
                                    wallet?.currency || currency
                                )}
                            </p>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <div className="rounded-xl bg-surface-950 p-3">
                                <p className="text-[11px] text-surface-500">
                                    Locked
                                </p>

                                <p className="mt-1 text-sm font-semibold text-surface-300">
                                    {formatMoney(
                                        wallet?.lockedBalance || 0,
                                        wallet?.currency || currency
                                    )}
                                </p>
                            </div>

                            <div className="rounded-xl bg-surface-950 p-3">
                                <p className="text-[11px] text-surface-500">
                                    Status
                                </p>

                                <p className="mt-1 text-sm font-semibold capitalize text-success-400">
                                    {wallet?.status || "Unknown"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
              DEPOSIT SUMMARY
          ================================================= */}

                    <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5 shadow-xl">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-800 text-surface-300">
                                <FaInfoCircle />
                            </div>

                            <h3 className="font-semibold text-surface-100">
                                Deposit Summary
                            </h3>
                        </div>

                        <div className="space-y-4">
                            <SummaryRow
                                label="Amount"
                                value={
                                    amount
                                        ? formatMoney(
                                            numericAmount,
                                            currency
                                        )
                                        : "—"
                                }
                            />

                            <SummaryRow
                                label="Currency"
                                value={currency}
                            />

                            <SummaryRow
                                label="Provider"
                                value="Paystack"
                            />

                            <div className="border-t border-surface-700 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-surface-400">
                                        You will deposit
                                    </span>

                                    <span className="text-lg font-bold text-success-400">
                                        {amount
                                            ? formatMoney(
                                                numericAmount,
                                                currency
                                            )
                                            : formatMoney(0, currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
              IMPORTANT NOTICE
          ================================================= */}

                    <div className="rounded-2xl border border-warning-500/20 bg-warning-500/5 p-5">
                        <div className="flex items-start gap-3">
                            <FaLock className="mt-0.5 shrink-0 text-warning-400" />

                            <div>
                                <h3 className="text-sm font-semibold text-warning-300">
                                    Important
                                </h3>

                                <p className="mt-2 text-xs leading-5 text-surface-500">
                                    Do not close the payment page until your
                                    payment has been completed. Your wallet
                                    balance will be updated after the payment
                                    provider confirms the transaction.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =================================================
          FOOTER LINKS
      ================================================= */}

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-surface-800 pt-5 text-xs text-surface-500">
                <Link
                    to="/user/dashboard"
                    className="transition hover:text-brand-400"
                >
                    Dashboard
                </Link>

                <Link
                    to="/user/transactions"
                    className="transition hover:text-brand-400"
                >
                    Transactions
                </Link>

                <Link
                    to="/user/withdraw"
                    className="transition hover:text-brand-400"
                >
                    Withdraw
                </Link>

                <Link
                    to="/user/security"
                    className="transition hover:text-brand-400"
                >
                    Security
                </Link>
            </div>
        </div>
    );
};

/*
=====================================================
SUMMARY ROW
=====================================================
*/

const SummaryRow = ({ label, value }) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-surface-500">
                {label}
            </span>

            <span className="text-sm font-medium text-surface-200">
                {value}
            </span>
        </div>
    );
};

export default Deposit;