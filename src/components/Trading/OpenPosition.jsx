import { useState } from "react";
import { FaArrowDown, FaArrowUp, FaEdit, FaRedo, FaTimes } from "react-icons/fa";
import PositionRiskModal from "./PositonRiskModel";

const idOf = (item) => String(item?._id ?? item?.id ?? "");
const numeric = (value) => Number(value?.$numberDecimal ?? value ?? 0);
const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
const price = (value) => {
  const n = numeric(value);
  return Number.isFinite(n) ? n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 5 }) : "—";
};

export default function OpenPositions({ positions, closingId, disabled, onClose, onUpdateRisk }) {
  const [editingPosition, setEditingPosition] = useState(null);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 p-5 sm:p-6">
        <div><h2 className="font-semibold">Open positions</h2><p className="mt-1 text-xs text-slate-400">Manage exits and risk levels for this account.</p></div>
        <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-semibold">{positions.length}</span>
      </div>

      {positions.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">This account has no open positions. Place a simulated market order to get started.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500"><tr>
              <th className="px-5 py-4 font-medium">Instrument</th><th className="px-5 py-4 font-medium">Side</th><th className="px-5 py-4 font-medium">Qty</th><th className="px-5 py-4 font-medium">Entry</th><th className="px-5 py-4 font-medium">Stop-loss</th><th className="px-5 py-4 font-medium">Take-profit</th><th className="px-5 py-4 font-medium">P&amp;L</th><th className="px-5 py-4 font-medium">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-800">
              {positions.map((position) => {
                const id = idOf(position);
                const pnl = numeric(position.unrealizedPnl);
                const side = String(position.side ?? "").toLowerCase();
                return <tr key={id} className="transition hover:bg-slate-800/30">
                  <td className="px-5 py-4 font-semibold">{position.instrument?.symbol ?? position.symbol ?? "Unknown"}</td>
                  <td className="px-5 py-4"><span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${side === "buy" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{side === "buy" ? <FaArrowUp /> : <FaArrowDown />}{side.toUpperCase()}</span></td>
                  <td className="px-5 py-4">{price(position.quantity)}</td>
                  <td className="px-5 py-4">{price(position.entryPrice)}</td>
                  <td className="px-5 py-4 text-red-300">{position.stopLoss == null ? "—" : price(position.stopLoss)}</td>
                  <td className="px-5 py-4 text-emerald-300">{position.takeProfit == null ? "—" : price(position.takeProfit)}</td>
                  <td className={`px-5 py-4 font-semibold ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{money(pnl)}</td>
                  <td className="px-5 py-4"><div className="flex items-center gap-2">
                    <button type="button" onClick={() => setEditingPosition(position)} disabled={disabled || Boolean(closingId)} title="Edit stop-loss and take-profit" className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/10 disabled:opacity-50"><FaEdit /> SL / TP</button>
                    <button type="button" onClick={() => onClose(position)} disabled={disabled || closingId === id} className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50">{closingId === id ? <FaRedo className="animate-spin" /> : <FaTimes />} Close</button>
                  </div></td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
      )}

      {editingPosition && <PositionRiskModal position={editingPosition} onClose={() => setEditingPosition(null)} onSave={async (values) => {
        const success = await onUpdateRisk(idOf(editingPosition), values);
        if (success) setEditingPosition(null);
      }} />}
    </section>
  );
}
