import { useMemo, useState } from "react";
import { FaArrowDown, FaArrowUp, FaExchangeAlt, FaRedo, FaWallet } from "react-icons/fa";

const getId = (item) => String(item?._id ?? item?.id ?? "");
const numeric = (value) => Number(value?.$numberDecimal ?? value ?? 0);
const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
const price = (value) => Number.isFinite(value) ? value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 5 }) : "—";

function EmptyState({ message }) {
  return <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-5 py-10 text-center"><p className="max-w-sm text-sm leading-6 text-slate-400">{message}</p></div>;
}

export default function OrderForm({ accounts, accountId, setAccountId, selectedAccount, instruments, onSubmit, submitting, refreshing, creatingAccount, onCreateDemoAccount }) {
  const [instrumentId, setInstrumentId] = useState("");
  const [side, setSide] = useState("buy");
  const [quantity, setQuantity] = useState("0.01");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  const selectedInstrument = useMemo(
    () => instruments.find((instrument) => getId(instrument) === instrumentId) ?? instruments[0],
    [instruments, instrumentId],
  );
  const currentPrice = numeric(selectedInstrument?.currentPrice);
  const contractSize = numeric(selectedInstrument?.contractSize ?? 1);
  const leverage = numeric(selectedAccount?.leverage ?? 100);
  const numericQuantity = Number(quantity || 0);
  const notional = currentPrice * numericQuantity * contractSize;
  const margin = leverage > 0 ? notional / leverage : 0;

  const submit = (event) => {
    event.preventDefault();
    if (!selectedInstrument) return;
    if (!Number.isFinite(numericQuantity) || numericQuantity < 0.01 || numericQuantity > 100) {
      return;
    }
    const sl = stopLoss === "" ? null : Number(stopLoss);
    const tp = takeProfit === "" ? null : Number(takeProfit);
    if ((sl !== null && (!Number.isFinite(sl) || sl <= 0)) || (tp !== null && (!Number.isFinite(tp) || tp <= 0))) return;
    if (sl !== null && tp !== null && ((side === "buy" && sl >= tp) || (side === "sell" && sl <= tp))) {
      return;
    }
    onSubmit({ symbol: selectedInstrument.symbol, side, quantity, stopLoss, takeProfit });
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400"><FaExchangeAlt /></div>
        <div><h2 className="font-semibold">Place market order</h2><p className="mt-1 text-xs text-slate-400">Orders use simulated instrument prices.</p></div>
      </div>

      {accounts.length === 0 ? (
        <div className="space-y-4">
          <EmptyState message="You don't have a trading account yet. Create a demo account with a $5,000 simulated starting balance." />
          <button type="button" onClick={onCreateDemoAccount} disabled={creatingAccount || refreshing || submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50">
            {creatingAccount ? <><FaRedo className="animate-spin" /> Creating account...</> : <><FaWallet /> Create Demo Account</>}
          </button>
        </div>
      ) : instruments.length === 0 ? (
        <EmptyState message="No active simulated USD-quoted instruments are available." />
      ) : (
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Trading account</label>
            <select value={accountId} onChange={(event) => setAccountId(event.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-500">
              {accounts.map((account) => <option key={getId(account)} value={getId(account)}>{account.accountNumber || `${account.accountType || "Trading"} account`} — {account.status || "unknown"}</option>)}
            </select>
            {selectedAccount?.status !== "active" && <p className="mt-2 text-xs text-amber-400">This account is not active.</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Instrument</label>
            <select value={getId(selectedInstrument)} onChange={(event) => setInstrumentId(event.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-500">
              {instruments.map((instrument) => <option key={getId(instrument)} value={getId(instrument)}>{instrument.symbol} — {instrument.name}</option>)}
            </select>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-4"><div><p className="text-xs text-slate-400">Simulated price</p><p className="mt-1 text-xl font-bold">{price(currentPrice)}</p></div><span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400">Simulated</span></div>
            {selectedInstrument?.priceUpdatedAt && <p className="mt-2 text-xs text-slate-500">Last updated: {new Date(selectedInstrument.priceUpdatedAt).toLocaleString()}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Order direction</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setSide("buy")} aria-pressed={side === "buy"} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${side === "buy" ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-slate-700 bg-slate-950 text-slate-400"}`}><FaArrowUp /> Buy</button>
              <button type="button" onClick={() => setSide("sell")} aria-pressed={side === "sell"} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${side === "sell" ? "border-red-500 bg-red-500/10 text-red-400" : "border-slate-700 bg-slate-950 text-slate-400"}`}><FaArrowDown /> Sell</button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">Quantity</label>
            <input type="number" min="0.01" max="100" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} required className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500" />
            <p className="mt-2 text-xs text-slate-500">Quantity range: 0.01–100</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Risk controls</h3><span className="text-xs text-slate-500">Optional</span></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className="mb-2 block text-xs font-medium text-slate-400">Stop-loss price</label><input type="number" min="0.00000001" step="any" value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} placeholder="No stop-loss" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-red-400" /></div>
              <div><label className="mb-2 block text-xs font-medium text-slate-400">Take-profit price</label><input type="number" min="0.00000001" step="any" value={takeProfit} onChange={(event) => setTakeProfit(event.target.value)} placeholder="No take-profit" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm outline-none focus:border-emerald-400" /></div>
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-500">Buy: stop-loss should be below the current price and take-profit above it. Sell: reverse those levels.</p>
          </div>

          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-400">Estimated notional</span><span className="font-medium">{money(notional)}</span></div>
            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-400">Estimated margin</span><span className="font-medium">{money(margin)}</span></div>
            <div className="flex items-center justify-between gap-4 text-sm"><span className="text-slate-400">Account leverage</span><span className="font-medium">{leverage > 0 ? `${leverage}:1` : "Not configured"}</span></div>
          </div>

          <button type="submit" disabled={submitting || refreshing || !accountId || !selectedInstrument || selectedAccount?.status !== "active"} className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${side === "buy" ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400" : "bg-red-500 text-white hover:bg-red-400"}`}>
            {submitting ? <><FaRedo className="animate-spin" /> Submitting order...</> : <>{side === "buy" ? <FaArrowUp /> : <FaArrowDown />}{side === "buy" ? "Place Buy Order" : "Place Sell Order"}</>}
          </button>
        </form>
      )}
    </section>
  );
}
