import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  FaArrowDown,
  FaArrowRight,
  FaBuildingColumns,
  FaCheck,
  FaCircleInfo,
  FaClock,
  FaLock,
  FaMoneyBillTransfer,
  FaShieldHalved,
  FaTriangleExclamation,
  FaWallet,
  FaRotate,
} from "react-icons/fa6";
import api from "../../library/api";

const CURRENCY_OPTIONS = ["USD", "NGN", "CAD", "EUR"];

const INITIAL_FORM = {
  amount: "",
  currency: "USD",
  payoutMethod: "bank_transfer",
  bankName: "",
  bankCode: "",
  accountName: "",
  accountNumber: "",
};

const formatMoney = (value, currency = "USD") => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const Withdraw = () => {
  const [wallet, setWallet] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [withdrawal, setWithdrawal] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadWallet = async () => {
      try {
        setLoadingWallet(true);
        setError("");

        // Keep the existing dashboard endpoint as the source of the user's
        // current wallet. The conversion endpoint returns the updated target wallet.
        const response = await api.get("/users/dashboard");
        const dashboard = response?.data?.data;

        if (!dashboard) {
          throw new Error("Unable to load wallet information.");
        }

        const loadedWallet = dashboard.wallet || null;
        if (mounted) {
          setWallet(loadedWallet);
          if (loadedWallet?.currency) {
            setForm((prev) => ({ ...prev, currency: loadedWallet.currency }));
          }
        }
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err, "Unable to load your wallet information."));
        }
      } finally {
        if (mounted) setLoadingWallet(false);
      }
    };

    loadWallet();
    return () => {
      mounted = false;
    };
  }, []);

  const availableBalance = Number(wallet?.availableBalance || 0);
  const lockedBalance = Number(wallet?.lockedBalance || 0);
  const walletCurrency = wallet?.currency || "USD";
  const enteredAmount = Number(form.amount || 0);
  const remainingBalance = Math.max(availableBalance - enteredAmount, 0);
  const currencyMismatch = form.currency !== walletCurrency;

  const quickAmounts = useMemo(
    () => [100, 500, 1000, 5000].filter((amount) => amount <= availableBalance),
    [availableBalance]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleConvertCurrency = async () => {
    if (!wallet?.currency) {
      toast.error("Your source wallet could not be identified.");
      return;
    }

    if (form.currency === wallet.currency) {
      toast.error("Choose a different currency to convert to.");
      return;
    }

    if (availableBalance <= 0) {
      toast.error(`Your ${walletCurrency} wallet has no available balance to convert.`);
      return;
    }

    const confirmed = window.confirm(
      `Convert your entire available balance of ${formatMoney(
        availableBalance,
        walletCurrency
      )} to ${form.currency}?\n\nThis moves the funds into your ${form.currency} wallet. Your locked balance will not be converted.`
    );

    if (!confirmed) return;

    try {
      setConverting(true);
      setError("");
      setSuccess("");

      const response = await api.post("/wallets/convert", {
        fromCurrency: walletCurrency,
        toCurrency: form.currency,
      });

      const conversion = response?.data?.data?.conversion;
      if (!conversion?.targetWallet) {
        throw new Error("Conversion completed, but the updated wallet was not returned.");
      }

      const targetWallet = {
        ...conversion.targetWallet,
        _id: conversion.targetWallet.id || conversion.targetWallet._id,
      };

      setWallet(targetWallet);
      setForm((prev) => ({
        ...prev,
        currency: conversion.toCurrency,
        amount: "",
      }));

      const message = `Converted ${conversion.sourceAmount} ${conversion.fromCurrency} to ${conversion.convertedAmount} ${conversion.toCurrency}.`;
      setSuccess(message);
      toast.success(message);
    } catch (err) {
      const message = getErrorMessage(err, "Currency conversion failed. Please try again.");
      setError(message);
      toast.error(message);
    } finally {
      setConverting(false);
    }
  };

  const validateForm = () => {
    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return "Please enter a valid withdrawal amount.";
    }
    if (amount < 10) {
      return `The minimum withdrawal amount is ${form.currency} 10.`;
    }
    if (amount > availableBalance) {
      return "Withdrawal amount cannot exceed your available balance.";
    }
    if (currencyMismatch) {
      return `Convert your wallet from ${walletCurrency} to ${form.currency} before requesting a withdrawal.`;
    }
    if (!form.payoutMethod) {
      return "Please select a payout method.";
    }
    if (form.payoutMethod === "bank_transfer") {
      if (!form.bankName.trim()) return "Please enter your bank name.";
      if (!form.accountName.trim()) return "Please enter the account name.";
      if (!form.accountNumber.trim()) return "Please enter your account number.";
      if (!/^\d{6,20}$/.test(form.accountNumber.trim())) {
        return "Please enter a valid account number.";
      }
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setWithdrawal(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post("/withdrawals", {
        amount: Number(form.amount),
        currency: form.currency,
        payoutMethod: form.payoutMethod,
        bankDetails:
          form.payoutMethod === "bank_transfer"
            ? {
                bankName: form.bankName.trim(),
                bankCode: form.bankCode.trim() || null,
                accountName: form.accountName.trim(),
                accountNumber: form.accountNumber.trim(),
              }
            : undefined,
      });

      const data = response?.data?.data;
      const createdWithdrawal = data?.withdrawal || data || null;
      setWithdrawal(createdWithdrawal);

      const message =
        response?.data?.message ||
        "Your withdrawal request has been submitted successfully.";
      setSuccess(message);
      toast.success(message);

      setForm((prev) => ({
        ...prev,
        amount: "",
        bankName: "",
        bankCode: "",
        accountName: "",
        accountNumber: "",
      }));
    } catch (err) {
      const message = getErrorMessage(err, "Unable to submit your withdrawal request.");
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingWallet) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-surface-700 border-t-brand-500" />
          <div>
            <p className="font-medium text-surface-100">Loading wallet</p>
            <p className="mt-1 text-sm text-surface-400">
              Please wait while we load your balance.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-sm text-surface-400">
          <Link to="/user/dashboard" className="transition hover:text-surface-100">
            Dashboard
          </Link>
          <FaArrowRight className="text-xs" />
          <span className="text-surface-200">Withdraw</span>
        </div>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-bold text-surface-100 sm:text-3xl">
              Withdraw Funds
            </h1>
          </div>
          <Link
            to="/user/transactions"
            className="inline-flex w-fit items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-4 py-2.5 text-sm font-medium text-surface-200 transition hover:border-surface-600 hover:bg-surface-800"
          >
            <FaMoneyBillTransfer />
            View Transactions
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger-500/30 bg-danger-500/10 p-4">
          <FaTriangleExclamation className="mt-0.5 shrink-0 text-danger-400" />
          <div>
            <p className="font-medium text-danger-300">Request failed</p>
            <p className="mt-1 text-sm text-danger-400">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-success-500/30 bg-success-500/10 p-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-500/20">
            <FaCheck className="text-sm text-success-400" />
          </div>
          <div>
            <p className="font-medium text-success-300">Successful</p>
            <p className="mt-1 text-sm text-success-400">{success}</p>
            {withdrawal?.reference && (
              <p className="mt-2 text-xs text-success-400">
                Reference: <span className="font-mono text-success-300">{withdrawal.reference}</span>
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          

          <form onSubmit={handleSubmit} className="rounded-2xl border border-surface-700 bg-surface-900">
            <div className="border-b border-surface-700 p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-surface-100">Withdrawal Details</h2>
              <p className="mt-1 text-sm text-surface-400">
                Enter the amount, and provide your destination.
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              <div>

                {currencyMismatch && (
                  <div className="mt-3 rounded-xl border border-warning-500/20 bg-warning-500/10 p-4">
                    <div className="flex items-start gap-2">
                      <FaTriangleExclamation className="mt-0.5 shrink-0 text-warning-400" />
                      <div>
                        <p className="text-sm font-medium text-warning-300">
                          Your balance is in {walletCurrency}, not {form.currency}.
                        </p>
                        <p className="mt-1 text-xs leading-5 text-warning-300/90">
                          Convert your entire available {walletCurrency} balance into {form.currency}
                          before withdrawing. Your locked balance will remain in {walletCurrency}.
                          The conversion uses the backend exchange-rate service.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleConvertCurrency}
                      disabled={converting || availableBalance <= 0}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-warning-500 px-4 py-3 text-sm font-semibold text-surface-950 transition hover:bg-warning-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {converting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-surface-950/30 border-t-surface-950" />
                          Converting balance...
                        </>
                      ) : (
                        <>
                          <FaRotate />
                          Convert {walletCurrency} to {form.currency}
                        </>
                      )}
                    </button>
                    <p className="mt-2 text-xs text-warning-300/80">
                      This is a real wallet transfer, not just a display change. Confirm the conversion in the prompt.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="amount" className="mb-2 block text-sm font-medium text-surface-200">
                  Withdrawal Amount
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-surface-500">
                    {form.currency}
                  </span>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    disabled={currencyMismatch}
                    className="w-full rounded-xl border border-surface-700 bg-surface-950 py-3.5 pl-16 pr-4 text-surface-100 outline-none transition placeholder:text-surface-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-surface-500">Minimum withdrawal: {form.currency} 10</span>
                  <span className="text-right text-surface-400">
                    Available: <span className="font-medium text-surface-200">{formatMoney(availableBalance, walletCurrency)}</span>
                  </span>
                </div>
              </div>

              {!currencyMismatch && quickAmounts.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-surface-500">Quick amount</p>
                  <div className="flex flex-wrap gap-2">
                    {quickAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, amount: String(amount) }))}
                        className="rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-sm text-surface-300 transition hover:border-brand-500/50 hover:text-surface-100"
                      >
                        {formatMoney(amount, form.currency)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="payoutMethod" className="mb-2 block text-sm font-medium text-surface-200">
                  Payout Method
                </label>
                <select
                  id="payoutMethod"
                  name="payoutMethod"
                  value={form.payoutMethod}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-surface-700 bg-surface-950 px-4 py-3.5 text-surface-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {form.payoutMethod === "bank_transfer" && (
                <div className="rounded-2xl border border-surface-700 bg-surface-950 p-4 sm:p-5">
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10">
                      <FaBuildingColumns className="text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-surface-100">Bank Account</h3>
                      <p className="mt-1 text-xs leading-5 text-surface-500">
                        Provide the account that should receive the withdrawal.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput label="Bank Name" name="bankName" value={form.bankName} onChange={handleChange} placeholder="e.g. Access Bank" />
                    <FormInput label="Bank Code" name="bankCode" value={form.bankCode} onChange={handleChange} placeholder="Optional" />
                    <FormInput label="Account Name" name="accountName" value={form.accountName} onChange={handleChange} placeholder="Account holder name" />
                    <FormInput label="Account Number" name="accountNumber" value={form.accountNumber} onChange={handleChange} placeholder="Account number" inputMode="numeric" />
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 rounded-xl border border-surface-700 bg-surface-950 p-4">
                <FaLock className="mt-0.5 shrink-0 text-brand-400" />
                <div>
                  <p className="text-sm font-medium text-surface-200">Withdrawal security</p>
                  <p className="mt-1 text-xs leading-5 text-surface-500">
                    Withdrawal requests may be reviewed before funds are released. Never share your password, OTP, recovery codes, or authentication secrets.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || converting || availableBalance <= 0 || currencyMismatch}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-3.5 font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <FaArrowDown />
                    Request Withdrawal
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
                <FaMoneyBillTransfer className="text-brand-400" />
              </div>
              <div>
                <h2 className="font-semibold text-surface-100">Withdrawal Summary</h2>
                <p className="text-xs text-surface-500">Review before submitting</p>
              </div>
            </div>
            <div className="space-y-4">
              <SummaryRow label="Amount" value={enteredAmount > 0 && !currencyMismatch ? formatMoney(enteredAmount, form.currency) : "—"} />
              <SummaryRow label="Currency" value={form.currency} />
              <SummaryRow label="Method" value={form.payoutMethod === "bank_transfer" ? "Bank Transfer" : "Other"} />
              <div className="border-t border-surface-700 pt-4">
                <SummaryRow label="Balance after request" value={currencyMismatch ? "Convert currency first" : formatMoney(remainingBalance, walletCurrency)} valueClass="text-success-400" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-700 bg-surface-900 p-5 sm:p-6">
            <h2 className="font-semibold text-surface-100">How withdrawals work</h2>
            <div className="mt-5 space-y-5">
              <Step number="1" icon={<FaWallet />} title="Choose currency" description="Select the currency you want to withdraw in." />
              <Step number="2" icon={<FaRotate />} title="Convert if needed" description="Confirm conversion to move your available balance into the selected wallet." />
              <Step number="3" icon={<FaShieldHalved />} title="Security review" description="Your request may be checked before processing." />
              <Step number="4" icon={<FaCheck />} title="Funds sent" description="The withdrawal is completed once the payout succeeds." />
            </div>
          </div>

          <div className="rounded-2xl border border-brand-500/20 bg-brand-500/5 p-5">
            <div className="flex items-start gap-3">
              <FaCircleInfo className="mt-0.5 shrink-0 text-brand-400" />
              <div>
                <p className="text-sm font-medium text-surface-200">Need help?</p>
                <p className="mt-1 text-xs leading-5 text-surface-500">
                  If you have a problem with a withdrawal, check your transaction history or contact support.
                </p>
                <Link to="/user/transactions" className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-brand-400 transition hover:text-brand-300">
                  View transaction history <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const BalanceItem = ({ label, value, valueClass = "text-surface-100" }) => (
  <div className="rounded-xl border border-surface-700 bg-surface-950 p-4">
    <p className="text-xs text-surface-500">{label}</p>
    <p className={`mt-2 text-lg font-semibold ${valueClass}`}>{value}</p>
  </div>
);

const FormInput = ({ label, name, value, onChange, placeholder, inputMode }) => (
  <div>
    <label htmlFor={name} className="mb-2 block text-xs font-medium text-surface-300">{label}</label>
    <input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      inputMode={inputMode}
      className="w-full rounded-xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-surface-100 outline-none transition placeholder:text-surface-600 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
    />
  </div>
);

const SummaryRow = ({ label, value, valueClass = "text-surface-100" }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-sm text-surface-500">{label}</span>
    <span className={`text-right text-sm font-medium ${valueClass}`}>{value}</span>
  </div>
);

const Step = ({ number, icon, title, description }) => (
  <div className="flex gap-3">
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-400">
      {icon}
      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-surface-800 text-[9px] font-bold text-surface-300">{number}</span>
    </div>
    <div>
      <p className="text-sm font-medium text-surface-200">{title}</p>
      <p className="mt-1 text-xs leading-5 text-surface-500">{description}</p>
    </div>
  </div>
);

export default Withdraw;
