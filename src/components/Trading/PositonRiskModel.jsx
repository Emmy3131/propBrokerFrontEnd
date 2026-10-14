import { useEffect, useState } from "react";
import { FaRedo, FaTimes } from "react-icons/fa";

const asInput = (value) => value == null ? "" : String(value?.$numberDecimal ?? value);
const currentPrice = (position) => Number(position.currentPrice?.$numberDecimal ?? position.currentPrice ?? position.entryPrice?.$numberDecimal ?? position.entryPrice ?? 0);

export default function PositionRiskModal({ position, onClose, onSave }) {
  const [stopLoss, setStopLoss] = useState(asInput(position.stopLoss));
  const [takeProfit, setTakeProfit] = useState(asInput(position.takeProfit));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const side = String(position.side ?? "buy").toLowerCase();
  const marketPrice = currentPrice(position);

  useEffect(() => {
    const handleKey = (event) => { if (event.key === "Escape" && !saving) onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, saving]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    const sl = stopLoss === "" ? null : Number(stopLoss);
    const tp = takeProfit === "" ? null : Number(takeProfit);
    if ((sl !== null && (!Number.isFinite(sl) || sl <= 0)) || (tp !== null && (!Number.isFinite(tp) || tp <= 0))) {
      setError("Enter positive prices, or leave a field empty to remove that level.");
      return;
    }
    if (sl !== null && tp !== null && ((side === "buy" && sl >= tp) || (side === "sell" && sl <= tp))) {
      setError("Stop-loss and take-profit levels conflict for this trade direction.");
      return;
    }
    if (sl !== null && ((side === "buy" && sl >= marketPrice) || (side === "sell" && sl <= marketPrice))) {
      setError("Stop-loss must be below market for a buy and above market for a sell.");
      return;
    }
    if (tp !== null && ((side === "buy" && tp <= marketPrice) || (side === "sell" && tp >= marketPrice))) {
      setError("Take-profit must be above market for a buy and below market for a sell.");
      return;
    }
    setSaving(true);
    try {
      const success = await onSave({ stopLoss, takeProfit });
      if (!success) setError("Could not update the risk levels. Check the error message and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="risk-modal-title" className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Position risk controls</p><h2 id="risk-modal-title" className="mt-1 text-xl font-bold">{position.instrument?.symbol ?? position.symbol ?? "Position"} · {side.toUpperCase()}</h2><p className="mt-1 text-sm text-slate-400">Current price: {marketPrice}</p></div><button type="button" onClick={onClose} disabled={saving} aria-label="Close dialog" className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50"><FaTimes /></button></div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="mb-2 block text-sm font-medium text-slate-300">Stop-loss price</label><input type="number" min="0.00000001" step="any" value={stopLoss} onChange={(event) => setStopLoss(event.target.value)} placeholder="Leave empty to remove stop-loss" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-red-400" /></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-300">Take-profit price</label><input type="number" min="0.00000001" step="any" value={takeProfit} onChange={(event) => setTakeProfit(event.target.value)} placeholder="Leave empty to remove take-profit" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-emerald-400" /></div>
          <p className="text-xs leading-5 text-slate-500">Leave a field empty to remove its existing level. Prices are checked again by the backend before saving.</p>
          {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50">Cancel</button><button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">{saving && <FaRedo className="animate-spin" />} {saving ? "Saving..." : "Save SL / TP"}</button></div>
        </form>
      </div>
    </div>
  );
}
