
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

/*
=====================================================
CURRENCY CONFIGURATION

Deposits and the user's wallet are USD only.
Other currencies are available only in the converter.
=====================================================
*/

const DEPOSIT_CURRENCY = "USD";

const CONVERSION_CURRENCIES = ["USD", "NGN", "CAD", "EUR"];

const currencyNames = {
  USD: "US Dollar",
  NGN: "Nigerian Naira",
  CAD: "Canadian Dollar",
  EUR: "Euro",
};

const formatMoney = (amount, currency = "USD") => {
  const numericAmount = Number(amount || 0);

  if (!Number.isFinite(numericAmount)) {
    return "$0.00";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numericAmount);
  } catch {
    return `$${numericAmount.toFixed(2)}`;
  }
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
  2 = Payment instructions and submit payment
  =====================================================
  */

  const [step, setStep] = useState(1);

  /*
  =====================================================
  DEPOSIT FORM

  The actual deposit currency is always USD.
  =====================================================
  */

  const [amount, setAmount] = useState("");

  /*
  =====================================================
  DISPLAY-ONLY CURRENCY CONVERTER

  Conversion never changes the deposit amount or currency.
  =====================================================
  */

  const [conversionCurrency, setConversionCurrency] =
    useState("NGN");

  const [exchangeRates, setExchangeRates] = useState({});
  const [exchangeRateDate, setExchangeRateDate] = useState("");
  const [loadingExchangeRates, setLoadingExchangeRates] =
    useState(false);
  const [exchangeRateError, setExchangeRateError] = useState("");

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
  SINGLE USD WALLET
  =====================================================
  */

  const [wallet, setWallet] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [refreshingWallet, setRefreshingWallet] = useState(false);

  /*
  =====================================================
  DEPOSIT
  =====================================================
  */

  const [deposit, setDeposit] = useState(null);
  const [creatingDeposit, setCreatingDeposit] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);

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
  FETCH SINGLE USD WALLET

  Do not send a currency query. The backend should return
  or create the user's one USD wallet.
  =====================================================
  */

  const fetchWallet = async () => {
    try {
      setError("");

      const response = await api.get("/wallets");

      const walletData = response?.data?.data?.wallet;

      if (!walletData) {
        setWallet(null);
        setError(
          "Your USD wallet could not be found. Please refresh or contact support."
        );
        return;
      }

      setWallet(walletData);
    } catch (err) {
      console.error("Wallet loading error:", err);

      setWallet(null);

      setError(
        err?.response?.data?.message ||
          "Unable to load your USD wallet. Please try again."
      );
    } finally {
      setLoadingWallet(false);
      setRefreshingWallet(false);
    }
  };

  /*
  =====================================================
  FETCH USD PAYMENT METHODS
  =====================================================
  */

  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);

      const response = await api.get("/deposits/payment-methods", {
        params: {
          currency: DEPOSIT_CURRENCY,
        },
      });

      const methods =
        response?.data?.data?.paymentMethods || [];

      // Only show USD payment methods.
      const usdMethods = methods.filter(
        (method) => method.currency === DEPOSIT_CURRENCY
      );

      setPaymentMethods(usdMethods);

      setSelectedPaymentMethod((previous) => {
        if (
          previous?._id &&
          usdMethods.some((method) => method._id === previous._id)
        ) {
          return previous;
        }

        return usdMethods[0] || null;
      });
    } catch (err) {
      console.error("Payment methods loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load available USD payment methods."
      );

      setPaymentMethods([]);
      setSelectedPaymentMethod(null);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  /*
  =====================================================
  LIVE EXCHANGE RATES

  Rates are fetched relative to USD.
  They are for display only.
  =====================================================
  */

  useEffect(() => {
    const controller = new AbortController();

    const fetchExchangeRates = async () => {
      setLoadingExchangeRates(true);
      setExchangeRateError("");

      try {
        const response = await fetch(
          "https://open.er-api.com/v6/latest/USD",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Exchange-rate service unavailable.");
        }

        const data = await response.json();

        if (data?.result !== "success" || !data?.rates) {
          throw new Error("Exchange rates could not be retrieved.");
        }

        setExchangeRates(data.rates);
        setExchangeRateDate(data.time_last_update_utc || "");
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Exchange-rate loading error:", err);

        setExchangeRates({});
        setExchangeRateDate("");
        setExchangeRateError(
          "Live exchange rates are temporarily unavailable. You can still create a USD deposit."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingExchangeRates(false);
        }
      }
    };

    fetchExchangeRates();

    return () => controller.abort();
  }, []);

  /*
  =====================================================
  INITIAL LOAD
  =====================================================
  */

  useEffect(() => {
    fetchWallet();
    fetchPaymentMethods();
  }, []);

  /*
  =====================================================
  REFRESH WALLET
  =====================================================
  */

  const handleRefreshWallet = async () => {
    setRefreshingWallet(true);
    await fetchWallet();
  };

  /*
  =====================================================
  AMOUNT INPUT
  =====================================================
  */

  const handleAmountChange = (event) => {
    const value = event.target.value;

    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }

    setAmount(value);
    setError("");
    setSuccess("");
  };

  /*
  =====================================================
  FORMATTED AMOUNTS
  =====================================================
  */

  const formattedAmount = useMemo(
    () => formatMoney(amount || 0, DEPOSIT_CURRENCY),
    [amount]
  );

  const convertedAmount = useMemo(() => {
    const numericAmount = Number(amount);
    const rate = Number(exchangeRates?.[conversionCurrency]);

    if (
      !amount ||
      !Number.isFinite(numericAmount) ||
      !Number.isFinite(rate) ||
      rate <= 0
    ) {
      return null;
    }

    return numericAmount * rate;
  }, [amount, exchangeRates, conversionCurrency]);

  const conversionRate = Number(
    exchangeRates?.[conversionCurrency]
  );

  /*
  =====================================================
  CREATE DEPOSIT
  =====================================================
  */

  const handleCreateDeposit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!amount || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    if (!selectedPaymentMethod?._id) {
      setError("Please select an available USD payment method.");
      return;
    }

    if (selectedPaymentMethod.currency !== DEPOSIT_CURRENCY) {
      setError("Only USD payment methods are supported.");
      return;
    }

    if (wallet?.status !== "active") {
      setError(
        "Your USD wallet is unavailable or inactive. Please refresh your wallet or contact support."
      );
      return;
    }

    try {
      setCreatingDeposit(true);

      /*
      Always send USD.
      The converter value is never sent to the backend.
      */

      const response = await api.post("/deposits", {
        amount: String(amount),
        currency: DEPOSIT_CURRENCY,
        paymentMethodId: selectedPaymentMethod._id,
      });

      const responseData = response?.data?.data;

      // Supports APIs that return either the deposit directly
      // or an object containing { deposit }.
      const depositData = responseData?.deposit || responseData;

      if (!depositData || !(depositData.depositId || depositData._id)) {
        throw new Error(
          "The server did not return valid deposit information."
        );
      }

      const normalizedDeposit = {
        ...depositData,
        depositId: depositData.depositId || depositData._id,
        currency: DEPOSIT_CURRENCY,
      };

      setDeposit(normalizedDeposit);
      setStep(2);

      setSuccess(
        "USD deposit created successfully. Follow the payment instructions below."
      );

      await fetchWallet();
    } catch (err) {
      console.error("Create deposit error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err.message ||
          "Unable to create your deposit. Please try again."
      );
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

    const depositId = deposit?.depositId || deposit?._id;

    if (!depositId) {
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

      const response = await api.patch(
        `/deposits/${depositId}/submit`,
        {
          transactionReference: transactionReference.trim(),
          userNote: userNote.trim() || undefined,
        }
      );

      const responseData = response?.data?.data;
      const updatedDeposit = responseData?.deposit || responseData;

      if (updatedDeposit) {
        setDeposit((previous) => ({
          ...previous,
          ...updatedDeposit,
          depositId:
            updatedDeposit.depositId ||
            updatedDeposit._id ||
            previous?.depositId,
          currency: DEPOSIT_CURRENCY,
        }));
      }

      setSuccess(
        "Payment submitted successfully. Your USD deposit is awaiting admin review."
      );

      setTimeout(() => {
        navigate(`/user/deposits/${depositId}`);
      }, 1200);
    } catch (err) {
      console.error("Submit payment error:", err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to submit your payment. Please try again."
      );
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
    if (!value) return;

    try {
      await navigator.clipboard.writeText(String(value));

      setCopiedField(field);

      setTimeout(() => {
        setCopiedField("");
      }, 1500);
    } catch (err) {
      console.error("Copy failed:", err);
      setError("Unable to copy this value. Please copy it manually.");
    }
  };

  /*
  =====================================================
  PAYMENT INSTRUCTIONS
  =====================================================
  */

  const paymentInstructions =
    deposit?.paymentMethod || selectedPaymentMethod;

  /*
  =====================================================
  LOADING
  =====================================================
  */

  if (loadingWallet || loadingPaymentMethods) {
    return (
      <div className="min-h-screen bg-surface-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <FaSpinner className="animate-spin text-3xl text-brand-500 mx-auto mb-4" />
          <p className="text-surface-300">
            Loading your USD wallet and payment options...
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
        {/* HEADER */}

        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              Add funds securely to your USD trading wallet.
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

        {/* STEP INDICATOR */}

        <div className="mb-8">
          <div className="flex items-center max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold bg-brand-500 text-white">
                {step > 1 ? <FaCheck /> : "1"}
              </div>

              <div>
                <p className="text-sm font-medium">Create Deposit</p>
                <p className="text-xs text-surface-500">
                  Amount and payment method
                </p>
              </div>
            </div>

            <div className="flex-1 h-px bg-surface-800 mx-4" />

            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
                  step >= 2
                    ? "bg-brand-500 text-white"
                    : "bg-surface-800 text-surface-500"
                }`}
              >
                2
              </div>

              <div>
                <p className="text-sm font-medium">Make Payment</p>
                <p className="text-xs text-surface-500">
                  Submit transaction details
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS */}

        {error && (
          <div className="mb-6 rounded-xl border border-danger-500/30 bg-danger-500/10 px-4 py-4 flex items-start gap-3">
            <FaExclamationCircle className="text-danger-400 mt-1 shrink-0" />
            <div>
              <p className="font-medium text-danger-300">
                Deposit Error
              </p>
              <p className="text-sm text-surface-300 mt-1">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-success-500/30 bg-success-500/10 px-4 py-4 flex items-start gap-3">
            <FaCheckCircle className="text-success-400 mt-1 shrink-0" />
            <div>
              <p className="font-medium text-success-300">
                Deposit Update
              </p>
              <p className="text-sm text-surface-300 mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            STEP 1: CREATE DEPOSIT
        ===================================================== */}

        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-surface-800">
                  <h2 className="text-lg font-semibold">
                    Create USD Deposit
                  </h2>
                  <p className="text-sm text-surface-400 mt-1">
                    Enter your deposit amount and choose a USD payment
                    method.
                  </p>
                </div>

                <form
                  onSubmit={handleCreateDeposit}
                  className="p-6 space-y-6"
                >
                  {/* WALLET */}

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
                          <p className="font-semibold">USD Wallet</p>
                          <p className="text-xs text-surface-500 mt-1">
                            Your single account wallet
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
                            refreshingWallet ? "animate-spin" : ""
                          }
                        />
                      </button>
                    </div>

                    <div className="mt-5 pt-5 border-t border-surface-800">
                      <p className="text-sm text-surface-500">
                        Available Balance
                      </p>

                      <p className="text-2xl font-bold mt-1">
                        {formatMoney(wallet?.availableBalance || 0)}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            wallet?.status === "active"
                              ? "bg-success-500"
                              : "bg-danger-500"
                          }`}
                        />

                        <span className="text-surface-400">
                          Wallet {wallet?.status || "unavailable"}
                        </span>
                      </div>

                      {wallet?.lockedBalance !== undefined && (
                        <div className="mt-3 flex justify-between text-sm">
                          <span className="text-surface-500">
                            Locked Balance
                          </span>
                          <span className="text-surface-300">
                            {formatMoney(wallet.lockedBalance)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AMOUNT */}

                  <div>
                    <label
                      htmlFor="depositAmount"
                      className="block text-sm font-medium text-surface-300 mb-2"
                    >
                      Deposit Amount (USD)
                    </label>

                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 font-medium">
                        $
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

                    <div className="flex flex-wrap justify-between gap-2 mt-2">
                      <p className="text-xs text-surface-500">
                        Your deposit will always be submitted in USD.
                      </p>

                      {amount && (
                        <p className="text-xs text-brand-400 font-medium">
                          {formattedAmount}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* DISPLAY-ONLY CONVERTER */}

                  <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">
                          Currency Converter
                        </p>
                        <p className="text-xs text-surface-500 mt-1">
                          Indicative exchange rate only. Your deposit
                          remains in USD.
                        </p>
                      </div>

                      <div className="sm:w-48">
                        <label
                          htmlFor="conversionCurrency"
                          className="block text-xs text-surface-400 mb-2"
                        >
                          Show equivalent in
                        </label>

                        <select
                          id="conversionCurrency"
                          value={conversionCurrency}
                          onChange={(event) =>
                            setConversionCurrency(event.target.value)
                          }
                          className="w-full px-3 py-2.5 rounded-lg bg-surface-900 border border-surface-700 text-white outline-none focus:border-brand-500 transition"
                        >
                          {CONVERSION_CURRENCIES.map((item) => (
                            <option key={item} value={item}>
                              {item} — {currencyNames[item]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-surface-900 border border-surface-800 p-4">
                      <p className="text-xs text-surface-500">
                        Estimated equivalent
                      </p>

                      <p className="text-2xl font-bold text-brand-400 mt-1">
                        {conversionCurrency === "USD"
                          ? formatMoney(amount || 0, "USD")
                          : loadingExchangeRates
                            ? "Loading rate..."
                            : convertedAmount !== null
                              ? formatMoney(
                                  convertedAmount,
                                  conversionCurrency
                                )
                              : "—"}
                      </p>

                      {conversionCurrency !== "USD" &&
                        Number.isFinite(conversionRate) &&
                        conversionRate > 0 && (
                          <p className="text-xs text-surface-500 mt-2">
                            1 USD ={" "}
                            {conversionRate.toLocaleString("en-US", {
                              maximumFractionDigits: 6,
                            })}{" "}
                            {conversionCurrency}
                          </p>
                        )}

                      {loadingExchangeRates && (
                        <p className="text-xs text-surface-500 mt-2 flex items-center gap-2">
                          <FaSpinner className="animate-spin" />
                          Fetching exchange rates...
                        </p>
                      )}

                      {exchangeRateError && (
                        <p className="text-xs text-warning-400 mt-2">
                          {exchangeRateError}
                        </p>
                      )}

                      {!exchangeRateError && exchangeRateDate && (
                        <p className="text-xs text-surface-600 mt-2">
                          Rate source updated: {exchangeRateDate}
                        </p>
                      )}
                    </div>

                    <p className="text-xs text-surface-500 leading-relaxed mt-3">
                      This conversion is only an estimate. It does not
                      convert your deposit or change your wallet
                      currency. Your wallet is credited only after
                      admin approval.
                    </p>
                  </div>

                  {/* PAYMENT METHODS */}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-surface-300">
                        USD Payment Method
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
                              No USD payment method available
                            </p>
                            <p className="text-sm text-surface-400 mt-1">
                              There are currently no active USD payment
                              methods. Please contact support.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paymentMethods.map((method) => {
                          const Icon = getPaymentMethodIcon(method.type);
                          const isSelected =
                            selectedPaymentMethod?._id === method._id;

                          return (
                            <button
                              key={method._id}
                              type="button"
                              onClick={() =>
                                setSelectedPaymentMethod(method)
                              }
                              className={`w-full text-left rounded-xl border p-4 transition ${
                                isSelected
                                  ? "border-brand-500 bg-brand-500/10"
                                  : "border-surface-700 bg-surface-950 hover:border-surface-600"
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div
                                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                                    isSelected
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
                                    {getPaymentMethodLabel(method.type)}
                                    {" • USD"}
                                  </p>
                                </div>

                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                    isSelected
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

                  {/* SECURITY NOTE */}

                  <div className="rounded-xl bg-surface-950 border border-surface-800 p-4">
                    <div className="flex items-start gap-3">
                      <FaShieldAlt className="text-success-400 mt-1 shrink-0" />
                      <div>
                        <p className="font-medium text-sm">
                          Secure Deposit Process
                        </p>
                        <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                          Your deposit will not immediately credit your
                          wallet. After payment, submit your transaction
                          details for verification. Your wallet is
                          credited only after admin approval.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={
                      creatingDeposit ||
                      !amount ||
                      Number(amount) <= 0 ||
                      !selectedPaymentMethod ||
                      wallet?.status !== "active"
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

            {/* SIDEBAR */}

            <div className="space-y-6">
              <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-5">Deposit Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-surface-400">
                      Currency
                    </span>
                    <span className="font-medium">USD</span>
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
                      {selectedPaymentMethod?.name || "Not selected"}
                    </span>
                  </div>

                  <div className="border-t border-surface-800 pt-4 flex justify-between gap-4">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-brand-400">
                      {formattedAmount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-5">How It Works</h3>

                <div className="space-y-5">
                  {[
                    ["1", "Create deposit", "Enter your USD amount and choose a payment method."],
                    ["2", "Make payment", "Follow the payment instructions provided."],
                    ["3", "Submit payment", "Enter your transaction reference after payment."],
                    ["4", "Admin verification", "Our team reviews and verifies the payment."],
                    ["5", "Wallet credited", "Approved deposits are added to your USD wallet."],
                  ].map(([number, title, description]) => (
                    <div key={number} className="flex gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-400 flex items-center justify-center text-xs font-bold shrink-0">
                        {number}
                      </div>

                      <div>
                        <p className="text-sm font-medium">{title}</p>
                        <p className="text-xs text-surface-500 mt-1">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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
                  Never share your password, OTP, card PIN, or account
                  credentials with anyone claiming to be support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            STEP 2: PAYMENT INSTRUCTIONS
        ===================================================== */}

        {step === 2 && deposit && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        Complete your USD payment using the information
                        below.
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
                          copyToClipboard(deposit.reference, "reference")
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

                  {/* AMOUNT AND METHOD */}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">
                      <p className="text-xs text-surface-500">Amount</p>
                      <p className="text-2xl font-bold mt-1">
                        {formatMoney(deposit.amount)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">
                      <p className="text-xs text-surface-500">
                        Payment Method
                      </p>
                      <p className="font-semibold mt-1">
                        {paymentInstructions?.name || "Payment method"}
                      </p>
                      <p className="text-xs text-surface-500 mt-1">
                        {getPaymentMethodLabel(paymentInstructions?.type)}
                      </p>
                    </div>
                  </div>

                  {/* BANK DETAILS */}

                  {paymentInstructions?.type === "bank_transfer" && (
                    <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">
                      <h3 className="font-semibold mb-4">
                        Bank Transfer Details
                      </h3>

                      <div className="space-y-4">
                        {[
                          ["Bank Name", paymentInstructions.bankName, "bankName"],
                          ["Account Name", paymentInstructions.accountName, "accountName"],
                          ["Account Number", paymentInstructions.accountNumber, "accountNumber"],
                          ["Routing Number", paymentInstructions.routingNumber, "routingNumber"],
                          ["IBAN", paymentInstructions.iban, "iban"],
                          ["SWIFT Code", paymentInstructions.swiftCode, "swiftCode"],
                        ]
                          .filter(([, value]) => value)
                          .map(([label, value, field]) => (
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
                                  onClick={() => copyToClipboard(value, field)}
                                  className="p-1.5 rounded-md hover:bg-surface-800 text-surface-400 hover:text-white"
                                  title={`Copy ${label}`}
                                >
                                  {copiedField === field ? (
                                    <FaCheck className="text-success-400 text-xs" />
                                  ) : (
                                    <FaCopy className="text-xs" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* CRYPTO DETAILS */}

                  {paymentInstructions?.type === "crypto" && (
                    <div className="rounded-xl border border-surface-700 bg-surface-950 p-5">
                      <h3 className="font-semibold mb-4">
                        Cryptocurrency Payment
                      </h3>

                      {paymentInstructions.network && (
                        <div className="mb-4">
                          <p className="text-xs text-surface-500">Network</p>
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
                              {paymentInstructions.walletAddress}
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
                              title="Copy wallet address"
                            >
                              {copiedField === "walletAddress" ? (
                                <FaCheck className="text-success-400" />
                              ) : (
                                <FaCopy />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* GENERAL INSTRUCTIONS */}

                  {paymentInstructions?.instructions && (
                    <div className="rounded-xl border border-brand-500/20 bg-brand-500/5 p-5">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-brand-400 mt-1 shrink-0" />

                        <div>
                          <h3 className="font-semibold">
                            Payment Instructions
                          </h3>

                          <p className="text-sm text-surface-400 mt-2 whitespace-pre-line leading-relaxed">
                            {paymentInstructions.instructions}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUBMIT PAYMENT */}

                  <form
                    onSubmit={handleSubmitPayment}
                    className="space-y-5"
                  >
                    <div className="border-t border-surface-800 pt-6">
                      <h3 className="font-semibold">
                        After You Make Payment
                      </h3>
                      <p className="text-sm text-surface-400 mt-1">
                        Enter the transaction reference supplied by your
                        bank or payment provider.
                      </p>
                    </div>

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
                          setTransactionReference(event.target.value)
                        }
                        placeholder="Enter your transaction reference"
                        disabled={submittingPayment}
                        className="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="userNote"
                        className="block text-sm font-medium text-surface-300 mb-2"
                      >
                        Additional Note{" "}
                        <span className="text-surface-600 font-normal">
                          (optional)
                        </span>
                      </label>

                      <textarea
                        id="userNote"
                        value={userNote}
                        onChange={(event) => setUserNote(event.target.value)}
                        placeholder="Add information that may help us verify your payment..."
                        rows={4}
                        disabled={submittingPayment}
                        className="w-full px-4 py-3 rounded-xl bg-surface-950 border border-surface-700 text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition resize-none"
                      />
                    </div>

                    <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="text-warning-400 mt-1 shrink-0" />
                        <p className="text-sm text-surface-300 leading-relaxed">
                          Only submit this form after completing your
                          payment. Your USD wallet will not be credited
                          until your payment has been reviewed and
                          approved.
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

            {/* RIGHT SIDEBAR */}

            <div className="space-y-6">
              <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-5">Deposit Status</h3>

                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-warning-500/10 flex items-center justify-center">
                    <FaReceipt className="text-warning-400" />
                  </div>

                  <div>
                    <p className="font-semibold capitalize">
                      {(deposit.status || "pending").replaceAll("_", " ")}
                    </p>
                    <p className="text-xs text-surface-500 mt-1">
                      Awaiting payment submission
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface-900 border border-surface-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-5">Deposit Summary</h3>

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
                    <span className="font-medium">USD</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-surface-400">
                      Amount
                    </span>
                    <span className="font-semibold">
                      {formatMoney(deposit.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-sm text-surface-400">
                      Method
                    </span>
                    <span className="font-medium text-right">
                      {paymentInstructions?.name || "Payment method"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-surface-800 bg-surface-900 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-success-500/10 flex items-center justify-center">
                    <FaLock className="text-success-400" />
                  </div>
                  <h3 className="font-semibold">Important</h3>
                </div>

                <p className="text-sm text-surface-400 leading-relaxed">
                  Never send money to a payment account that differs from
                  the payment details displayed on this page.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/user/withdraw"
                  className="rounded-xl border border-surface-700 bg-surface-900 hover:bg-surface-800 p-4 text-center transition"
                >
                  <p className="text-sm font-medium">Withdraw</p>
                  <p className="text-xs text-surface-500 mt-1">
                    Manage funds
                  </p>
                </Link>

                <Link
                  to="/user/transactions"
                  className="rounded-xl border border-surface-700 bg-surface-900 hover:bg-surface-800 p-4 text-center transition"
                >
                  <p className="text-sm font-medium">History</p>
                  <p className="text-xs text-surface-500 mt-1">
                    View transactions
                  </p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER */}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-surface-500">
          <FaLock />
          Deposits are securely reviewed before your USD wallet is credited.
        </div>
      </div>
    </div>
  );
};

export default Deposit;
