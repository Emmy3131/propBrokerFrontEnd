import { useMemo } from "react";
import {
    FaChartLine,
    FaExclamationTriangle,
} from "react-icons/fa";

/*
=====================================================
FORMATTERS
=====================================================
*/

const money = (value) => {
    const amount = Number(value);

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);
};

const dateLabel = (value) => {
    if (!value) return "Unknown date";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Unknown date";
    }

    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const numberValue = (value, fallback = 0) => {
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
};

/*
=====================================================
EQUITY CURVE
=====================================================
*/

export default function EquityCurve({
    history,
    loading = false,
    error = "",
}) {
    const points = Array.isArray(history?.points)
        ? history.points
        : [];

    const summary = history?.summary ?? {};
    const account = history?.account ?? {};

    /*
    =================================================
    CHART DATA
    =================================================
    */

    const chart = useMemo(() => {
        if (!points.length) return null;

        const normalizedPoints = points.map((point) => {
            const equity = numberValue(point.equity);
            const peakEquity = Math.max(
                equity,
                numberValue(point.peakEquity, equity),
            );

            return {
                ...point,
                equity,
                peakEquity,
            };
        });

        const values = normalizedPoints.flatMap((point) => [
            point.equity,
            point.peakEquity,
        ]);

        const min = Math.min(...values);
        const max = Math.max(...values);
        const spread = max - min;

        const padding =
            spread === 0
                ? Math.max(Math.abs(max) * 0.01, 1)
                : spread * 0.15;

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

        const getX = (index) =>
            normalizedPoints.length === 1
                ? width / 2
                : left +
                  (index / (normalizedPoints.length - 1)) * plotWidth;

        const getY = (value) =>
            top + ((high - value) / range) * plotHeight;

        const coordinates = normalizedPoints.map((point, index) => ({
            x: getX(index),
            y: getY(point.equity),
            equity: point.equity,
            point,
        }));

        const peakCoordinates = normalizedPoints.map((point, index) => ({
            x: getX(index),
            y: getY(point.peakEquity),
            peakEquity: point.peakEquity,
            point,
        }));

        const line = coordinates
            .map(({ x, y }) => `${x},${y}`)
            .join(" ");

        const peakLine = peakCoordinates
            .map(({ x, y }) => `${x},${y}`)
            .join(" ");

        const areaPoints = [
            `${coordinates[0].x},${height - bottom}`,
            ...coordinates.map(({ x, y }) => `${x},${y}`),
            `${coordinates[coordinates.length - 1].x},${height - bottom}`,
        ].join(" ");

        return {
            width,
            height,
            left,
            right,
            top,
            bottom,
            coordinates,
            peakCoordinates,
            line,
            peakLine,
            areaPoints,
            first: coordinates[0],
            last: coordinates[coordinates.length - 1],
            min,
            max,
            gridLines: [0, 1, 2, 3].map((index) => ({
                y: top + (index / 3) * plotHeight,
            })),
        };
    }, [points]);

    /*
    =================================================
    METRICS
    =================================================
    */

    const currentEquity = account.equity;
    const peakEquity = account.highestEquity;

    const maxDrawdownAmount = numberValue(
        summary.maxDrawdownAmount,
    );

    const maxDrawdownPercent = numberValue(
        summary.maxDrawdownPercent,
    );

    const snapshotCount = numberValue(
        summary.snapshotCount,
        points.length,
    );

    /*
    =================================================
    RENDER
    =================================================
    */

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
            {/* Header */}

            <div className="flex flex-col justify-between gap-3 border-b border-slate-800 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
                        <FaChartLine size={18} />
                    </div>

                    <div>
                        <h2 className="font-semibold text-white">
                            Equity performance
                        </h2>

                        <p className="mt-1 text-xs text-slate-400">
                            Historical account equity in USD
                        </p>
                    </div>
                </div>

                <span className="text-xs text-slate-500">
                    {snapshotCount} saved snapshots
                </span>
            </div>

            {/* Summary metrics */}

            <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3">
                <Metric
                    label="Current equity"
                    value={money(currentEquity)}
                />

                <Metric
                    label="Peak equity"
                    value={money(peakEquity)}
                />

                <Metric
                    label="Maximum recorded drawdown"
                    value={`${money(maxDrawdownAmount)} (${maxDrawdownPercent.toFixed(2)}%)`}
                    warning={maxDrawdownPercent > 0}
                />
            </div>

            {/* Chart */}

            <div className="px-4 pb-5 sm:px-5">
                {loading ? (
                    <div
                        className="flex h-64 items-center justify-center text-sm text-slate-400"
                        role="status"
                    >
                        Loading equity history...
                    </div>
                ) : error ? (
                    <div
                        className="flex min-h-48 items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200"
                        role="alert"
                    >
                        <FaExclamationTriangle className="shrink-0" />

                        <p className="break-words">{error}</p>
                    </div>
                ) : !chart ? (
                    <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-5 text-center">
                        <FaChartLine className="mb-3 text-2xl text-slate-500" />

                        <p className="font-medium text-slate-200">
                            No equity history yet
                        </p>

                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                            Historical performance will appear after the
                            backend starts recording equity snapshots
                            for this account.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Chart legend */}

                        <div className="mb-3 flex flex-wrap gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-2">
                                <span className="h-0.5 w-5 bg-cyan-400" />
                                Current equity
                            </span>

                            <span className="flex items-center gap-2">
                                <span className="h-0.5 w-5 border-t-2 border-dashed border-amber-400" />
                                Peak equity
                            </span>
                        </div>

                        <div className="overflow-hidden rounded-xl bg-slate-950/60 p-2 sm:p-4">
                            <svg
                                viewBox={`0 0 ${chart.width} ${chart.height}`}
                                role="img"
                                aria-label="Historical account equity and peak equity chart"
                                className="h-56 w-full sm:h-72"
                                preserveAspectRatio="none"
                            >
                                {/* Horizontal grid lines */}

                                {chart.gridLines.map((line, index) => (
                                    <line
                                        key={index}
                                        x1={chart.left}
                                        y1={line.y}
                                        x2={chart.width - chart.right}
                                        y2={line.y}
                                        stroke="#334155"
                                        strokeDasharray="4 6"
                                        strokeWidth="1"
                                    />
                                ))}

                                {/* Equity area fill */}

                                {chart.coordinates.length > 1 && (
                                    <polygon
                                        points={chart.areaPoints}
                                        fill="rgba(34,211,238,0.08)"
                                    />
                                )}

                                {/* Peak equity line */}

                                {chart.peakCoordinates.length > 1 && (
                                    <polyline
                                        points={chart.peakLine}
                                        fill="none"
                                        stroke="#fbbf24"
                                        strokeWidth="2"
                                        strokeDasharray="7 6"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        vectorEffect="non-scaling-stroke"
                                    />
                                )}

                                {/* Current equity line */}

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

                                {/* Equity data points */}

                                {chart.coordinates.map(
                                    ({ x, y, point }, index) => (
                                        <circle
                                            key={
                                                point.id ??
                                                `${point.recordedAt}-${index}`
                                            }
                                            cx={x}
                                            cy={y}
                                            r={
                                                index ===
                                                chart.coordinates.length - 1
                                                    ? 5
                                                    : 2
                                            }
                                            fill="#22d3ee"
                                            stroke="#0f172a"
                                            strokeWidth="2"
                                        >
                                            <title>
                                                {`${dateLabel(point.recordedAt)} — ${money(point.equity)}`}
                                            </title>
                                        </circle>
                                    ),
                                )}
                            </svg>
                        </div>

                        {/* Time range */}

                        <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                            <span>
                                {dateLabel(chart.first.point.recordedAt)}
                            </span>

                            <span>
                                {dateLabel(chart.last.point.recordedAt)}
                            </span>
                        </div>

                        <p className="mt-3 text-xs leading-5 text-slate-500">
                            This chart displays saved equity snapshots, not
                            every market tick. Maximum drawdown reflects the
                            history calculated by the backend and may cover a
                            longer period than the snapshots shown here.
                        </p>
                    </>
                )}
            </div>
        </section>
    );
}

/*
=====================================================
METRIC CARD
=====================================================
*/

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