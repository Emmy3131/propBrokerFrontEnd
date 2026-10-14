import { useMemo } from "react";
import { FaChartLine, FaExclamationTriangle } from "react-icons/fa";

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const dateLabel = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function EquityCurve({
  history,
  loading = false,
  error = "",
}) {
  const points = history?.points ?? [];
  const summary = history?.summary ?? {};
  const account = history?.account ?? {};

  const chart = useMemo(() => {
    if (!points.length) return null;

    const values = points.map((point) => Number(point.equity) || 0);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const spread = max - min;
    const padding = spread === 0 ? Math.max(Math.abs(max) * 0.01, 1) : spread * 0.15;

    const low = min - padding;
    const high = max + padding;
    const range = high - low || 1;

    const width = 900;
    const height = 280;
    const left = 12;
    const right = 12;
    const top = 18;
    const bottom = 20;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;

    const coordinates = points.map((point, index) => {
      const x =
        points.length === 1
          ? width / 2
          : left + (index / (points.length - 1)) * plotWidth;

      const equity = Number(point.equity) || 0;
      const y = top + ((high - equity) / range) * plotHeight;

      return { x, y, equity, point };
    });

    return {
      width,
      height,
      coordinates,
      line: coordinates.map(({ x, y }) => `${x},${y}`).join(" "),
      first: coordinates[0],
      last: coordinates[coordinates.length - 1],
      min,
      max,
    };
  }, [points]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
      <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
            <FaChartLine size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-white">Equity performance</h2>
            <p className="mt-1 text-xs text-slate-400">
              Historical account equity in USD
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-500">
          {summary.snapshotCount ?? points.length} saved snapshots
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
        <Metric
          label="Current equity"
          value={money(account.equity)}
        />
        <Metric
          label="Peak equity"
          value={money(account.highestEquity)}
        />
        <Metric
          label="Maximum recorded drawdown"
          value={`${money(summary.maxDrawdownAmount)} (${(
            Number(summary.maxDrawdownPercent) || 0
          ).toFixed(2)}%)`}
          warning={Number(summary.maxDrawdownPercent) > 0}
        />
      </div>

      <div className="px-4 pb-5 sm:px-5">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            Loading equity history...
          </div>
        ) : error ? (
          <div className="flex min-h-48 items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
            <FaExclamationTriangle className="shrink-0" />
            <p>{error}</p>
          </div>
        ) : !chart ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-5 text-center">
            <FaChartLine className="mb-3 text-2xl text-slate-500" />
            <p className="font-medium text-slate-200">
              No equity history yet
            </p>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              Historical performance will appear after the backend starts
              recording equity snapshots for this account.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-xl bg-slate-950/60 p-2 sm:p-4">
              <svg
                viewBox={`0 0 ${chart.width} ${chart.height}`}
                role="img"
                aria-label="Historical account equity line chart"
                className="h-56 w-full overflow-visible sm:h-72"
                preserveAspectRatio="none"
              >
                {[0, 1, 2, 3].map((line) => {
                  const y = 18 + (line / 3) * 242;

                  return (
                    <line
                      key={line}
                      x1="12"
                      y1={y}
                      x2="888"
                      y2={y}
                      stroke="#334155"
                      strokeDasharray="4 6"
                      strokeWidth="1"
                    />
                  );
                })}

                {chart.coordinates.length > 1 && (
                  <polygon
                    points={[
                      `${chart.first.x},260`,
                      chart.line,
                      `${chart.last.x},260`,
                    ].join(" ")}
                    fill="rgba(34,211,238,0.08)"
                  />
                )}

                {chart.coordinates.length > 1 && (
                  <polyline
                    points={chart.line}
                    fill="none"
                    stroke="#22d3ee"
                    strokeWidth="3"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                  />
                )}

                {chart.coordinates.map(({ x, y, point }, index) => (
                  <circle
                    key={point.id ?? `${point.recordedAt}-${index}`}
                    cx={x}
                    cy={y}
                    r={index === chart.coordinates.length - 1 ? 5 : 2}
                    fill="#22d3ee"
                    stroke="#0f172a"
                    strokeWidth="2"
                  >
                    <title>
                      {`${dateLabel(point.recordedAt)} — ${money(point.equity)}`}
                    </title>
                  </circle>
                ))}
              </svg>
            </div>

            <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
              <span>{dateLabel(chart.first.point.recordedAt)}</span>
              <span>{dateLabel(chart.last.point.recordedAt)}</span>
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              This chart displays saved equity snapshots, not every market
              tick. Maximum drawdown reflects the saved history available
              to this request.
            </p>
          </>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value, warning = false }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p
        className={`mt-2 break-words text-lg font-semibold ${
          warning ? "text-amber-300" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}