import { useEffect, useMemo, useState } from "react";

import {
  FaArrowDown,
  FaWallet,
  FaShieldAlt,
  FaLock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaUniversity,
  FaBitcoin,
  FaMobileAlt,
  FaCreditCard,
  FaInfoCircle,
  FaSyncAlt,
  FaHistory,
  FaCopy,
  FaCheck,
  FaArrowRight,
  FaReceipt,
} from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";

import api from "../../library/api";

const CURRENCIES = ["USD", "NGN", "CAD", "EUR"];

const currencySymbols = {
  USD: "$",
  NGN: "₦",
  CAD: "C$",
  EUR: "€",
};

const currencyNames = {
  USD: "US Dollar",
  NGN: "Nigerian Naira",
  CAD: "Canadian Dollar",
  EUR: "Euro",
};

const formatMoney = (amount, currency = "USD") => {
  const numericAmount = Number(amount || 0);

  if (!Number.isFinite(numericAmount)) {
    return `${currencySymbols[currency] || ""}0.00`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
};

const getPaymentMethodIcon = (type) => {
  switch (type) {
    case "bank_transfer":
      return FaUniversity;

    case "crypto":
      return FaBitcoin;

    case "mobile_money":
      return FaMobileAlt;

    default:
      return FaCreditCard;
  }
};

const getPaymentMethodLabel = (type) => {
  switch (type) {
    case "bank_transfer":
      return "Bank Transfer";

    case "crypto":
      return "Cryptocurrency";

    case "mobile_money":
      return "Mobile Money";

    default:
      return "Other Payment";
  }
};

const Deposit = () => {
  const navigate = useNavigate();

  /*
  =====================================================
  STEP
  =====================================================
  1 = Create deposit
  2 = Payment instructions / submit payment
  =====================================================
  */

  const [step, setStep] = useState(1);

  /*
  =====================================================
  FORM
  =====================================================
  */

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");

  /*
  =====================================================
  PAYMENT METHODS
  =====================================================
  */

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState(null);

  const [loadingPaymentMethods, setLoadingPaymentMethods] =
    useState(true);

  /*
  =====================================================
  WALLET
  =====================================================
  */

  const [wallet, setWallet] = useState(null);

  const [loadingWallet, setLoadingWallet] = useState(true);

  const [refreshingWallet, setRefreshingWallet] =
    useState(false);

  /*
  =====================================================
  DEPOSIT
  =====================================================
  */

  const [deposit, setDeposit] = useState(null);

  const [creatingDeposit, setCreatingDeposit] =
    useState(false);

  const [submittingPayment, setSubmittingPayment] =
    useState(false);

  /*
  =====================================================
  PAYMENT SUBMISSION
  =====================================================
  */

  const [transactionReference, setTransactionReference] =
    useState("");

  const [userNote, setUserNote] = useState("");

  /*
  =====================================================
  UI
  =====================================================
  */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedField, setCopiedField] = useState("");

  /*
  =====================================================
  FETCH WALLET
  =====================================================
  */

  const fetchWallet = async (selectedCurrency = currency) => {
    try {
      setError("");

      if (!refreshingWallet) {
        setLoadingWallet(true);
      }

      const response = await api.get("/wallets", {
        params: {
          currency: selectedCurrency,
        },
      });

      const walletData = response?.data?.data?.wallet;

      if (!walletData) {
        setWallet(null);
        return;
      }

      setWallet(walletData);
    } catch (err) {
      console.error("Wallet loading error:", err);

      const message =
        err?.response?.data?.message ||
        "Unable to load your wallet. Please try again.";

      setError(message);
      setWallet(null);
    } finally {
      setLoadingWallet(false);
      setRefreshingWallet(false);
    }
  };

  /*
  =====================================================
  FETCH PAYMENT METHODS
  =====================================================
  */

  const fetchPaymentMethods = async (
    selectedCurrency = currency
  ) => {
    try {
      setLoadingPaymentMethods(true);
      setError("");

      const response = await api.get(
        "/deposits/payment-methods",
        {
          params: {
            currency: selectedCurrency,
          },
        }
      );

      const methods =
        response?.data?.data?.paymentMethods || [];

      setPaymentMethods(methods);

      /*
      Automatically select first available method.
      */

      if (methods.length > 0) {
        setSelectedPaymentMethod(methods[0]);
      } else {
        setSelectedPaymentMethod(null);
      }
    } catch (err) {
      console.error(
        "Payment methods loading error:",
        err
      );

      const message =
        err?.response?.data?.message ||
        "Unable to load available payment methods.";

      setError(message);
      setPaymentMethods([]);
      setSelectedPaymentMethod(null);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  /*
  =====================================================
  INITIAL LOAD
  =====================================================
  */

  useEffect(() => {
    fetchWallet("USD");
    fetchPaymentMethods("USD");
  }, []);

  /*
  =====================================================
  CHANGE CURRENCY
  =====================================================
  */

  const handleCurrencyChange = async (newCurrency) => {
    setCurrency(newCurrency);
    setAmount("");
    setError("");
    setSuccess("");

    setRefreshingWallet(true);

    await Promise.all([
      fetchWallet(newCurrency),
      fetchPaymentMethods(newCurrency),
    ]);
  };

  /*
  =====================================================
  REFRESH WALLET
  =====================================================
  */

  const handleRefreshWallet = async () => {
    setRefreshingWallet(true);

    await fetchWallet(currency);
  };

  /*
  =====================================================
  AMOUNT INPUT
  =====================================================
  */

  const handleAmountChange = (event) => {
    const value = event.target.value;

    /*
    Allow numbers with up to 2 decimal places.
    */

    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }

    setAmount(value);

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  /*
  =====================================================
  FORMATTED AMOUNT
  =====================================================
  */

  const formattedAmount = useMemo(() => {
    if (!amount) {
      return formatMoney(0, currency);
    }

    return formatMoney(amount, currency);
  }, [amount, currency]);

  /*
  =====================================================
  CREATE DEPOSIT
  =====================================================
  */

  const handleCreateDeposit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    /*
    -----------------------------------------------------
    VALIDATE AMOUNT
    -----------------------------------------------------
    */

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    /*
    -----------------------------------------------------
    VALIDATE CURRENCY
    -----------------------------------------------------
    */

    if (!CURRENCIES.includes(currency)) {
      setError(
        "This currency is not currently supported."
      );
      return;
    }

    /*
    -----------------------------------------------------
    VALIDATE PAYMENT METHOD
    -----------------------------------------------------
    */

    if (!selectedPaymentMethod?._id) {
      setError(
        "Please select an available payment method."
      );
      return;
    }

    /*
    -----------------------------------------------------
    CREATE
    -----------------------------------------------------
    */

    try {
      setCreatingDeposit(true);

      const response = await api.post("/deposits", {
        amount: String(amount),
        currency,
        paymentMethodId: selectedPaymentMethod._id,
      });

      const depositData =
        response?.data?.data || null;

      if (!depositData) {
        throw new Error(
          "The server did not return deposit information."
        );
      }

      setDeposit(depositData);

      setStep(2);

      setSuccess(
        "Deposit created successfully. Follow the payment instructions below."
      );

      /*
      Refresh wallet just in case the backend created it.
      */

      await fetchWallet(currency);
    } catch (err) {
      console.error("Create deposit error:", err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Unable to create your deposit. Please try again.";

      setError(message);
    } finally {
      setCreatingDeposit(false);
    }
  };

  /*
  =====================================================
  SUBMIT PAYMENT
  =====================================================
  */

 const handleSubmitPayment = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!deposit?.depositId) {
        setError("Deposit information is missing.");
        return;
    }

    if (!transactionReference.trim()) {
        setError(
            "Please enter the transaction reference from your payment."
        );
        return;
    }

    try {
        setSubmittingPayment(true);

        const response = await api.post(
            `/deposits/${deposit.depositId}/submit`,
            {
                transactionReference:
                    transactionReference.trim(),

                userNote:
                    userNote.trim() || undefined,
            }
        );

        const updatedDeposit =
            response?.data?.data || null;

        if (updatedDeposit) {
            setDeposit((previous) => ({
                ...previous,
                ...updatedDeposit,
            }));
        }

        setSuccess(
            "Payment submitted successfully. Your deposit is now awaiting admin review."
        );

        setTimeout(() => {
            navigate(
                `/user/deposits/${deposit.depositId}`
            );
        }, 1200);
    } catch (err) {
        console.error(
            "Submit payment error:",
            err
        );

        const message =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            "Unable to submit your payment. Please try again.";

        setError(message);
    } finally {
        setSubmittingPayment(false);
    }
};

  /*
  =====================================================
  COPY TO CLIPBOARD
  =====================================================
  */

  const copyToClipboard = async (value, field) => {
    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        String(value)
      );

      setCopiedField(field);

      setTimeout(() => {
        setCopiedField("");
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  /*
  =====================================================
  PAYMENT METHOD DETAILS
  =====================================================
  */

  const paymentInstructions =
    deposit?.paymentMethod || selectedPaymentMethod;

  /*
  =====================================================
  LOADING
  =====================================================
  */

  if (
    loadingWallet ||
    loadingPaymentMethods
  ) {
    return (
      <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <FaSpinner className="animate-spin text-3xl text-brand-500 mx-auto mb-4" />

          <p className="text-surface-300">
            Loading deposit options...
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
    <div className="min-h-screen bg-surface-950 text-white px-4 py-6 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>

              <div className="flex items-center gap-3 mb-2">

                <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                  <FaArrowDown className="text-brand-400" />
                </div>

                <h1 className="text-2xl md:text-3xl font-bold">
                  Deposit Funds
                </h1>

              </div>

              <p className="text-surface-400">
                Add funds securely to your trading wallet.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <Link
                to="/user/transactions"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-surface-700 bg-surface-900 hover:bg-surface-800 transition text-sm"
              >
                <FaHistory />
                Transactions
              </Link>

              <Link
                to="/user/dashboard"
                className="hidden sm:inline-flex items-center px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 transition text-sm font-medium"
              >
                Dashboard
              </Link>

            </div>

          </div>

        </div>

        {/* =================================================
            STEP INDICATOR
        ================================================= */}

        <div className="mb-8">

          <div className="flex items-center max-w-2xl">

            <div className="flex items-center gap-3">

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${step >= 1
                  ? "bg-brand-500 text-white"
                  : "bg-surface-800 text-surface-500"
                  }`}
              >
                {step > 1 ? <FaCheck /> : "1"}
              </div>

              <div>
                <p className="text-sm font-medium">
                  Create Deposit
                </p>

                <p className="text-xs text-surface-500">
                  Amount & payment method
                </p>
              </div>

            </div>

            <div className="flex-1 h-px bg-surface-800 mx-4" />

            <div className="flex items-center gap-3">

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${step >= 2
                  ? "bg-brand-500 text-white"
                  : "bg-surface-800 text-surface-500"
                  }`}
              >
                2
              </div>

              <div>
                <p className="text-sm font-medium">
                  Make Payment
                </p>

                <p className="text-xs text-surface-500">
                  Submit transaction details
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-4 flex items-start gap-3">

            <FaExclamationCircle className="text-danger-400 mt-1 shrink-0" />

            <div>
              <p className="font-medium text-danger-300">
                Deposit Error
              </p>

              <p className="text-sm text-surface-300 mt-1">
                {error}
              </p>
            </div>

          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-success-500/30 bg-success-500/10 px-4 py-4 flex items-start gap-3">

            <FaCheckCircle className="text-success-400 mt-1 shrink-0" />

            <div>
              <p className="font-medium text-success-300">
                Deposit
              </p>

              <p className="text-sm text-surface-300 mt-1">
                {success}
              </p>
            </div>

          </div>
        )}

        {/* =================================================
            STEP 1
        ================================================= */}

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* =================================================
                FORM
            ================================================= */}

            <div className="lg:col-span-2">

              <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden">

                <div className="px-6 py-5 border-b border-surface-800">

                  <h2 className="text-lg font-semibold">
                    Create Deposit
                  </h2>

                  <p className="text-sm text-surface-400 mt-1">
                    Choose your currency, payment method,
                    and deposit amount.
                  </p>

                </div>

                <form
                  onSubmit={handleCreateDeposit}
                  className="p-6 space-y-6"
                >

                  {/* =================================================
                      CURRENCY
                  ================================================= */}

                  <div>

                    <label className="block text-sm font-medium text-surface-300 mb-2">
                      Deposit Currency
                    </label>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                      {CURRENCIES.map((item) => (

                        <button
                          key={item}
                          type="button"
                          onClick={() =>
                            handleCurrencyChange(item)
                          }
                          className={`p-4 rounded-xl border text-left transition ${currency === item
                            ? "border-brand-500 bg-brand-500/10"
                            : "border-surface-700 bg-surface-950 hover:border-surface-600"
                            }`}
                        >

                          <div className="flex items-center justify-between">

                            <div>

                              <p className="font-semibold">
                                {item}
                              </p>

                              <p className="text-xs text-surface-500 mt-1">
                                {currencyNames[item]}
                              </p>

                            </div>

                            <span
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${currency === item
                                ? "border-brand-500"
                                : "border-surface-600"
                                }`}
                            >
                              {currency === item && (
                                <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                              )}
                            </span>

                          </div>

                        </button>

                      ))}

                    </div>

                  </div>

                  {/* =================================================
                      WALLET
                  ================================================= */}

                  <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex items-center gap-3">

                        <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center">
                          <FaWallet className="text-brand-400" />
                        </div>

                        <div>

                          <p className="text-sm text-surface-400">
                            Destination Wallet
                          </p>

                          <p className="font-semibold">
                            {currency} Wallet
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={handleRefreshWallet}
                        disabled={refreshingWallet}
                        className="p-2 rounded-lg hover:bg-surface-800 transition text-surface-400 hover:text-white disabled:opacity-50"
                        title="Refresh wallet"
                      >
                        <FaSyncAlt
                          className={
                            refreshingWallet
                              ? "animate-spin"
                              : ""
                          }
                        />
                      </button>

                    </div>

                    <div className="mt-5 pt-5 border-t border-surface-800">

                      <p className="text-sm text-surface-500">
                        Available Balance
                      </p>

                      <p className="text-2xl font-bold mt-1">
                        {formatMoney(
                          wallet?.availableBalance || 0,
                          currency
                        )}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs">

                        <span
                          className={`w-2 h-2 rounded-full ${wallet?.status === "active"
                            ? "bg-success-500"
                            : "bg-danger-500"
                            }`}
                        />

                        <span className="text-surface-400">
                          Wallet{" "}
                          {wallet?.status || "unavailable"}
                        </span>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      AMOUNT
                  ================================================= */}

                  <div>

                    <label
                      htmlFor="depositAmount"
                      className="block text-sm font-medium text-surface-300 mb-2"
                    >
                      Deposit Amount
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium">
                        {currencySymbols[currency]}
                      </span>

                      <input
                        id="depositAmount"
                        type="text"
                        inputMode="decimal"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        disabled={creatingDeposit}
                        className="w-full pl-10 pr-4 py-4 rounded-xl bg-surface-950 border border-surface-700 text-white text-lg outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition disabled:opacity-60"
                      />

                    </div>

                    <div className="flex justify-between mt-2">

                      <p className="text-xs text-surface-500">
                        Enter the amount you want to deposit.
                      </p>

                      {amount && (
                        <p className="text-xs text-brand-400 font-medium">
                          {formattedAmount}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* =================================================
                      PAYMENT METHODS
                  ================================================= */}

                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <label className="block text-sm font-medium text-surface-300">
                        Payment Method
                      </label>

                      <span className="text-xs text-surface-500">
                        {paymentMethods.length} available
                      </span>

                    </div>

                    {paymentMethods.length === 0 ? (

                      <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-5">

                        <div className="flex items-start gap-3">

                          <FaInfoCircle className="text-warning-400 mt-1" />

                          <div>

                            <p className="font-medium text-warning-300">
                              No payment method available
                            </p>

                            <p className="text-sm text-surface-400 mt-1">
                              There are currently no active payment
                              methods for {currency}.
                              Please try another currency or contact
                              support.
                            </p>

                          </div>

                        </div>

                      </div>

                    ) : (

                      <div className="space-y-3">

                        {paymentMethods.map((method) => {

                          const Icon =
                            getPaymentMethodIcon(
                              method.type
                            );

                          const isSelected =
                            selectedPaymentMethod?._id ===
                            method._id;

                          return (
                            <button
                              key={method._id}
                              type="button"
                              onClick={() =>
                                setSelectedPaymentMethod(
                                  method
                                )
                              }
                              className={`w-full text-left rounded-xl border p-4 transition ${isSelected
                                ? "border-brand-500 bg-brand-500/10"
                                : "border-surface-700 bg-surface-950 hover:border-surface-600"
                                }`}
                            >

                              <div className="flex items-center gap-4">

                                <div
                                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${isSelected
                                    ? "bg-brand-500/20 text-brand-400"
                                    : "bg-surface-800 text-surface-400"
                                    }`}
                                >
                                  <Icon />
                                </div>

                                <div className="flex-1">

                                  <div className="flex items-center gap-2">

                                    <p className="font-semibold">
                                      {method.name}
                                    </p>

                                    {isSelected && (
                                      <FaCheckCircle className="text-success-400 text-sm" />
                                    )}

                                  </div>

                                  <p className="text-xs text-surface-500 mt-1">
                                    {getPaymentMethodLabel(
                                      method.type
                                    )}
                                    {" • "}
                                    {method.currency}
                                  </p>

                                </div>

                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected
                                    ? "border-brand-500"
                                    : "border-surface-600"
                                    }`}
                                >
                                  {isSelected && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                                  )}
                                </div>

                              </div>

                            </button>
                          );
                        })}

                      </div>

                    )}

                  </div>

                  {/* =================================================
                      SECURITY
                  ================================================= */}

                  <div className="rounded-xl bg-surface-950 border border-surface-800 p-4">

                    <div className="flex items-start gap-3">

                      <FaShieldAlt className="text-success-400 mt-1 shrink-0" />

                      <div>

                        <p className="font-medium text-sm">
                          Secure Deposit Process
                        </p>

                        <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                          Your deposit will not immediately credit
                          your wallet. After making payment, submit
                          your transaction details for verification.
                          Your wallet is credited only after admin
                          approval.

                        </p>

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      SUBMIT
                  ================================================= */}

                  <button
                    type="submit"
                    disabled={
                      creatingDeposit ||
                      !amount ||
                      Number(amount) <= 0 ||
                      !selectedPaymentMethod
                    }
                    className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-surface-700 disabled:text-surface-500 transition font-semibold flex items-center justify-center gap-3"
                  >

                    {creatingDeposit ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Creating Deposit...
                      </>
                    ) : (
                      <>
                        <FaArrowRight />
                        Continue to Payment
                      </>
                    )}

                  </button>

                </form>

              </div>

            </div>

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <div className="space-y-6">

              {/* SUMMARY */}

              <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">

                <h3 className="font-semibold mb-5">
                  Deposit Summary
                </h3>

                <div className="space-y-4">

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-surface-400">
                      Currency
                    </span>

                    <span className="font-medium">
                      {currency}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-surface-400">
                      Amount
                    </span>

                    <span className="font-medium">
                      {formattedAmount}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-surface-400">
                      Payment
                    </span>

                    <span className="font-medium text-right">
                      {selectedPaymentMethod?.name ||
                        "Not selected"}
                    </span>

                  </div>

                  <div className="border-t border-surface-800 pt-4 flex justify-between gap-4">

                    <span className="font-medium">
                      Total
                    </span>

                    <span className="text-xl font-bold text-brand-400">
                      {formattedAmount}
                    </span>

                  </div>

                </div>

              </div>

              {/* HOW IT WORKS */}

              <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">

                <h3 className="font-semibold mb-5">
                  How It Works
                </h3>

                <div className="space-y-5">

                  {[
                    [
                      "1",
                      "Create deposit",
                      "Enter your amount and select a payment method.",
                    ],
                    [
                      "2",
                      "Make payment",
                      "Follow the payment instructions provided.",
                    ],
                    [
                      "3",
                      "Submit payment",
                      "Enter your transaction reference after payment.",
                    ],
                    [
                      "4",
                      "Admin verification",
                      "Our team reviews and verifies the payment.",
                    ],
                    [
                      "5",
                      "Wallet credited",
                      "Approved deposits are added to your wallet.",
                    ],
                  ].map(
                    ([number, title, description]) => (
                      <div
                        key={number}
                        className="flex gap-3"
                      >

                        <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {number}
                        </div>

                        <div>

                          <p className="text-sm font-medium">
                            {title}
                          </p>

                          <p className="text-xs text-surface-500 mt-1">
                            {description}
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>

              {/* SECURITY */}

              <div className="rounded-2xl border border-surface-800 bg-surface-900 p-6">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
                    <FaLock className="text-success-400" />
                  </div>

                  <h3 className="font-semibold">
                    Your Security Matters
                  </h3>

                </div>

                <p className="text-sm text-surface-400 leading-relaxed">
                  Never share your password, OTP, card PIN,
                  or account credentials with anyone claiming
                  to be support.
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            STEP 2 — PAYMENT INSTRUCTIONS
        ================================================= */}

        {step === 2 && deposit && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* =================================================
                PAYMENT INSTRUCTIONS
            ================================================= */}

            <div className="lg:col-span-2">

              <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden">

                <div className="px-6 py-5 border-b border-surface-800">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-success-500/10 flex items-center justify-center">
                      <FaReceipt className="text-success-400" />
                    </div>

                    <div>

                      <h2 className="text-lg font-semibold">
                        Payment Instructions
                      </h2>

                      <p className="text-sm text-surface-400 mt-1">
                        Complete your payment using the information below.
                      </p>

                    </div>

                  </div>

                </div>

                <div className="p-6 space-y-6">

                  {/* DEPOSIT REFERENCE */}

                  <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-5">

                    <p className="text-xs text-surface-500 uppercase tracking-wider">
                      Deposit Reference
                    </p>

                    <div className="flex items-center gap-3 mt-2">

                      <p className="text-xl font-bold text-brand-400 break-all">
                        {deposit.reference}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            deposit.reference,
                            "reference"
                          )
                        }
                        className="p-2 rounded-lg bg-surface-800 hover:bg-surface-700 transition shrink-0"
                        title="Copy reference"
                      >
                        {copiedField === "reference" ? (
                          <FaCheck className="text-success-400" />
                        ) : (
                          <FaCopy />
                        )}
                      </button>

                    </div>

                    <p className="text-xs text-surface-500 mt-2">
                      Keep this reference for your records.
                    </p>

                  </div>

                  {/* AMOUNT */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">

                      <p className="text-xs text-surface-500">
                        Amount
                      </p>

                      <p className="text-2xl font-bold mt-1">
                        {formatMoney(
                          deposit.amount,
                          deposit.currency
                        )}
                      </p>

                    </div>

                    <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">

                      <p className="text-xs text-surface-500">
                        Payment Method
                      </p>

                      <p className="font-semibold mt-1">
                        {paymentInstructions?.name}
                      </p>

                      <p className="text-xs text-surface-500 mt-1">
                        {getPaymentMethodLabel(
                          paymentInstructions?.type
                        )}
                      </p>

                    </div>

                  </div>

                  {/* BANK DETAILS */}

                  {paymentInstructions?.type ===
                    "bank_transfer" && (
                      <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">

                        <h3 className="font-semibold mb-4">
                          Bank Transfer Details
                        </h3>

                        <div className="space-y-4">

                          {[
                            [
                              "Bank Name",
                              paymentInstructions.bankName,
                              "bankName",
                            ],
                            [
                              "Account Name",
                              paymentInstructions.accountName,
                              "accountName",
                            ],
                            [
                              "Account Number",
                              paymentInstructions.accountNumber,
                              "accountNumber",
                            ],
                            [
                              "Routing Number",
                              paymentInstructions.routingNumber,
                              "routingNumber",
                            ],
                            [
                              "IBAN",
                              paymentInstructions.iban,
                              "iban",
                            ],
                            [
                              "SWIFT Code",
                              paymentInstructions.swiftCode,
                              "swiftCode",
                            ],
                          ]
                            .filter(
                              ([, value]) =>
                                value
                            )
                            .map(
                              ([label, value, field]) => (
                                <div
                                  key={field}
                                  className="flex items-center justify-between gap-4 py-2 border-b border-surface-800 last:border-0"
                                >

                                  <span className="text-sm text-surface-400">
                                    {label}
                                  </span>

                                  <div className="flex items-center gap-2">

                                    <span className="text-sm font-medium text-right break-all">
                                      {value}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        copyToClipboard(
                                          value,
                                          field
                                        )
                                      }
                                      className="p-1.5 rounded-md hover:bg-surface-800 text-surface-400 hover:text-white"
                                    >
                                      {copiedField === field ? (
                                        <FaCheck className="text-success-400 text-xs" />
                                      ) : (
                                        <FaCopy className="text-xs" />
                                      )}
                                    </button>

                                  </div>

                                </div>
                              )
                            )}

                        </div>

                      </div>
                    )}

                  {/* CRYPTO DETAILS */}

                  {paymentInstructions?.type ===
                    "crypto" && (
                      <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">

                        <h3 className="font-semibold mb-4">
                          Cryptocurrency Payment
                        </h3>

                        <div className="space-y-4">

                          {paymentInstructions.network && (
                            <div>

                              <p className="text-xs text-surface-500">
                                Network
                              </p>

                              <p className="font-semibold mt-1">
                                {paymentInstructions.network}
                              </p>

                            </div>
                          )}

                          {paymentInstructions.walletAddress && (
                            <div>

                              <p className="text-xs text-surface-500">
                                Wallet Address
                              </p>

                              <div className="flex gap-2 mt-1">

                                <div className="flex-1 p-3 rounded-lg bg-surface-900 border border-surface-800 text-sm break-all">
                                  {
                                    paymentInstructions.walletAddress
                                  }
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(
                                      paymentInstructions.walletAddress,
                                      "walletAddress"
                                    )
                                  }
                                  className="p-3 rounded-lg bg-surface-800 hover:bg-surface-700"
                                >
                                  {copiedField ===
                                    "walletAddress" ? (
                                    <FaCheck className="text-success-400" />
                                  ) : (
                                    <FaCopy />
                                  )}
                                </button>

                              </div>

                            </div>
                          )}

                        </div>

                      </div>
                    )}

                  {/* OTHER INSTRUCTIONS */}

                  {paymentInstructions?.instructions && (
                    <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-5">

                      <div className="flex items-start gap-3">

                        <FaInfoCircle className="text-brand-400 mt-1 shrink-0" />

                        <div>

                          <h3 className="font-semibold">
                            Payment Instructions
                          </h3>

                          <p className="text-sm text-surface-400 mt-2 whitespace-pre-line leading-relaxed">
                            {
                              paymentInstructions.instructions
                            }
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* =================================================
                      SUBMIT PAYMENT
                  ================================================= */}

                  <form
                    onSubmit={handleSubmitPayment}
                    className="space-y-5"
                  >

                    <div className="border-t border-surface-800 pt-6">

                      <h3 className="font-semibold">
                        After You Make Payment
                      </h3>

                      <p className="text-sm text-surface-400 mt-1">
                        Enter the transaction reference supplied
                        by your bank or payment provider.
                      </p>

                    </div>

                    {/* TRANSACTION REFERENCE */}

                    <div>

                      <label
                        htmlFor="transactionReference"
                        className="block text-sm font-medium text-surface-300 mb-2"
                      >
                        Transaction Reference
                      </label>

                      <input
                        id="transactionReference"
                        type="text"
                        value={transactionReference}
                        onChange={(event) =>
                          setTransactionReference(
                            event.target.value
                          )
                        }
                        placeholder="Enter your transaction reference"
                        disabled={submittingPayment}
                        className="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
                      />

                    </div>

                    {/* NOTE */}

                    <div>

                      <label
                        htmlFor="userNote"
                        className="block text-sm font-medium text-surface-300 mb-2"
                      >
                        Additional Note
                        <span className="text-surface-600 font-normal">
                          {" "}
                          (optional)
                        </span>
                      </label>

                      <textarea
                        id="userNote"
                        value={userNote}
                        onChange={(event) =>
                          setUserNote(
                            event.target.value
                          )
                        }
                        placeholder="Add any information that may help us verify your payment..."
                        rows={4}
                        disabled={submittingPayment}
                        className="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition resize-none"
                      />

                    </div>

                    {/* WARNING */}

                    <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-4">

                      <div className="flex items-start gap-3">

                        <FaInfoCircle className="text-warning-400 mt-1 shrink-0" />

                        <p className="text-sm text-surface-300 leading-relaxed">
                          Only submit this form after you have
                          completed the payment. Your wallet will
                          not be credited until the payment has
                          been reviewed and approved.
                        </p>

                      </div>

                    </div>

                    <button
                      type="submit"
                      disabled={
                        submittingPayment ||
                        !transactionReference.trim()
                      }
                      className="w-full py-4 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-surface-700 disabled:text-surface-500 transition font-semibold flex items-center justify-center gap-3"
                    >

                      {submittingPayment ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Submitting Payment...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle />
                          I Have Made This Payment
                        </>
                      )}

                    </button>

                  </form>

                </div>

              </div>

            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <div className="space-y-6">

              {/* STATUS */}

              <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">

                <h3 className="font-semibold mb-5">
                  Deposit Status
                </h3>

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-full bg-warning-500/10 flex items-center justify-center">
                    <FaReceipt className="text-warning-400" />
                  </div>

                  <div>

                    <p className="font-semibold capitalize">
                      {deposit.status || "pending"}
                    </p>

                    <p className="text-xs text-surface-500 mt-1">
                      Awaiting payment submission
                    </p>

                  </div>

                </div>

              </div>

              {/* SUMMARY */}

              <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">

                <h3 className="font-semibold mb-5">
                  Deposit Summary
                </h3>

                <div className="space-y-4">

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-surface-400">
                      Reference
                    </span>

                    <span className="text-sm font-medium break-all text-right">
                      {deposit.reference}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-surface-400">
                      Currency
                    </span>

                    <span className="font-medium">
                      {deposit.currency}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-surface-400">
                      Amount
                    </span>

                    <span className="font-semibold">
                      {formatMoney(
                        deposit.amount,
                        deposit.currency
                      )}
                    </span>

                  </div>

                  <div className="flex justify-between gap-4">

                    <span className="text-sm text-surface-400">
                      Method
                    </span>

                    <span className="font-medium text-right">
                      {paymentInstructions?.name}
                    </span>

                  </div>

                </div>

              </div>

              {/* SECURITY */}

              <div className="rounded-2xl border border-surface-800 bg-surface-900 p-6">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
                    <FaLock className="text-success-400" />
                  </div>

                  <h3 className="font-semibold">
                    Important
                  </h3>

                </div>

                <p className="text-sm text-surface-400 leading-relaxed">
                  Never send money to a payment account that
                  is different from the payment details shown
                  on this page.
                </p>

              </div>

              {/* LINKS */}

              <div className="grid grid-cols-2 gap-3">

                <Link
                  to="/user/withdraw"
                  className="rounded-xl border border-surface-700 bg-surface-900 hover:bg-surface-800 p-4 text-center transition"
                >
                  <p className="text-sm font-medium">
                    Withdraw
                  </p>

                  <p className="text-xs text-surface-500 mt-1">
                    Manage funds
                  </p>
                </Link>

                <Link
                  to="/user/transactions"
                  className="rounded-xl border border-surface-700 bg-surface-900 hover:bg-surface-800 p-4 text-center transition"
                >
                  <p className="text-sm font-medium">
                    History
                  </p>

                  <p className="text-xs text-surface-500 mt-1">
                    View transactions
                  </p>
                </Link>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-surface-500">

          <FaLock />

          Deposits are securely reviewed before your wallet
          is credited.

        </div>

      </div>
    </div>
  );
};

export default Deposit;