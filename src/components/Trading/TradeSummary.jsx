import { FaChartLine, FaExchangeAlt, FaWallet } from "react-icons/fa";

const numeric = (value) => Number(value?.$numberDecimal ?? value ?? 0);
const money = (value) => new Intl.NumberFormat("en-US", {
  style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(Number.isFinite(numeric(value)) ? numeric(value) : 0);

function SummaryCard({ icon, label, value, valueColor = "text-white" }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

export default function TradeSummary({ account, positions }) {
  const balance = account?.balance ?? account?.equity ?? account?.initialBalance ?? 0;
  const pnl = positions.reduce((total, position) => total + numeric(position.unrealizedPnl), 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <SummaryCard icon={<FaWallet />} label="Selected account balance" value={money(balance)} />
      <SummaryCard icon={<FaChartLine />} label="Open positions" value={String(positions.length)} />
      <SummaryCard icon={<FaExchangeAlt />} label="Unrealized P&L" value={money(pnl)} valueColor={pnl >= 0 ? "text-emerald-400" : "text-red-400"} />
    </div>
  );
}
