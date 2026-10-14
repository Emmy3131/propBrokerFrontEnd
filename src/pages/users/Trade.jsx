import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaRedo, FaExclamationTriangle } from "react-icons/fa";
import api from "../../library/api";
import TradeSummary from "../../components/Trading/TradeSummary";
import OrderForm from "../../components/Trading/OrderForm";
import OpenPositions from "../../components/Trading/OpenPosition";

const getPayload = (response) => response?.data?.data ?? response?.data ?? {};

const getList = (response, keys) => {
  const payload = getPayload(response);
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
};

const getId = (item) => String(item?._id ?? item?.id ?? "");

const getErrorMessage = (error) =>
  error?.response?.data?.message ??
  error?.response?.data?.error ??
  "Something went wrong. Please try again.";

const getAccountIdFromPosition = (position) =>
  String(position?.tradingAccount?._id ?? position?.tradingAccount?.id ?? position?.tradingAccount ?? "");

export default function Trade() {
  const [accounts, setAccounts] = useState([]);
  const [instruments, setInstruments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [accountId, setAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [closingId, setClosingId] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((account) => getId(account) === accountId),
    [accounts, accountId],
  );

  const loadTradingData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setRefreshing(true);

    try {
      const [accountsResponse, instrumentsResponse, positionsResponse] = await Promise.all([
        api.get("/trading-accounts"),
        api.get("/market/instruments"),
        api.get("/trading/positions", { params: { status: "open" } }),
      ]);

      const nextAccounts = getList(accountsResponse, ["accounts", "tradingAccounts", "results"]);
      const nextInstruments = getList(instrumentsResponse, ["instruments", "markets", "results"]);
      const nextPositions = getList(positionsResponse, ["positions", "results"]);

      const supportedInstruments = nextInstruments.filter((instrument) =>
        instrument.isActive !== false &&
        String(instrument.priceSource ?? "simulated").toLowerCase() === "simulated" &&
        String(instrument.quoteCurrency ?? "").toUpperCase() === "USD" &&
        Number(instrument.currentPrice?.$numberDecimal ?? instrument.currentPrice ?? 0) > 0,
      );

      setAccounts(nextAccounts);
      setInstruments(supportedInstruments);
      setPositions(nextPositions.filter((position) => position.status === "open"));
      setAccountId((previous) =>
        nextAccounts.some((account) => getId(account) === previous)
          ? previous
          : getId(nextAccounts[0]) || "",
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTradingData();
  }, [loadTradingData]);

  const handleCreateDemoAccount = async () => {
    if (creatingAccount || refreshing || submitting || closingId) return;
    setCreatingAccount(true);
    try {
      await api.post("/trading-accounts", { accountType: "demo" });
      toast.success("Demo trading account created with a $5,000 starting balance.");
      await loadTradingData(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setCreatingAccount(false);
    }
  };

  const handlePlaceOrder = async (order) => {
    if (!accountId || !selectedAccount) {
      toast.error("Please select a trading account.");
      return;
    }
    if (selectedAccount.status !== "active") {
      toast.error("Your selected trading account is not active.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/trading/orders", {
        accountId,
        symbol: order.symbol,
        side: order.side,
        quantity: Number(order.quantity),
        stopLoss: order.stopLoss === "" ? null : Number(order.stopLoss),
        takeProfit: order.takeProfit === "" ? null : Number(order.takeProfit),
      });
      toast.success(`${order.side === "buy" ? "Buy" : "Sell"} order placed successfully.`);
      await loadTradingData(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleClosePosition = async (position) => {
    const positionId = getId(position);
    if (!positionId) {
      toast.error("Unable to identify this position.");
      return;
    }
    if (!window.confirm(`Close your ${String(position.side ?? "").toUpperCase()} position on ${position.symbol ?? position.instrument?.symbol ?? "this instrument"}?`)) return;

    setClosingId(positionId);
    try {
      await api.post(`/trading/positions/${positionId}/close`);
      toast.success("Position closed successfully.");
      await loadTradingData(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setClosingId("");
    }
  };

  const handleUpdateRisk = async (positionId, values) => {
    try {
      await api.patch(`/trading/positions/${positionId}/risk`, {
        stopLoss: values.stopLoss === "" ? null : Number(values.stopLoss),
        takeProfit: values.takeProfit === "" ? null : Number(values.takeProfit),
      });
      toast.success("Stop-loss and take-profit updated.");
      await loadTradingData(false);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  };

  const displayedPositions = positions.filter(
    (position) => getAccountIdFromPosition(position) === accountId,
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-slate-950 text-slate-400">
        <FaRedo className="mr-3 animate-spin" /> Loading trading workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">Trading terminal</p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Trade</h1>
          <p className="mt-2 text-sm text-slate-400">Place simulated market orders and manage open positions.</p>
        </div>
        <button
          type="button"
          onClick={() => loadTradingData(false)}
          disabled={refreshing || submitting || Boolean(closingId)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FaRedo className={refreshing ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <TradeSummary account={selectedAccount} positions={displayedPositions} />

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <OrderForm
          accounts={accounts}
          accountId={accountId}
          setAccountId={setAccountId}
          selectedAccount={selectedAccount}
          instruments={instruments}
          onSubmit={handlePlaceOrder}
          submitting={submitting}
          refreshing={refreshing}
          creatingAccount={creatingAccount}
          onCreateDemoAccount={handleCreateDemoAccount}
        />
        <OpenPositions
          positions={displayedPositions}
          closingId={closingId}
          disabled={submitting || refreshing}
          onClose={handleClosePosition}
          onUpdateRisk={handleUpdateRisk}
        />
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-300">
        <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-400" />
        <p>This terminal is for simulated trading only. Prices, order fills, margin, and profit/loss are determined by your backend simulation.</p>
      </div>
    </div>
  );
}
