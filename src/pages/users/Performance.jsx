
import { useCallback, useEffect, useState } from "react";
import api from "../../library/api";

const getAccounts = (response) => {
    const body = response?.data;

    const candidates = [
        body?.data?.accounts,
        body?.data?.tradingAccounts,
        body?.data,
        body?.accounts,
        body?.tradingAccounts,
    ];

    return candidates.find(Array.isArray) || [];
};

const money = (value) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

const StatCard = ({ label, value, detail, valueClass = "" }) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`mt-3 text-2xl font-bold ${valueClass}`}>
            {value}
        </p>
        {detail && (
            <p className="mt-2 text-xs text-slate-500">{detail}</p>
        )}
    </div>
);

const Performance = () => {
    const [accounts, setAccounts] = useState([]);
    const [accountId, setAccountId] = useState("");
    const [performance, setPerformance] = useState(null);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingPerformance, setLoadingPerformance] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadAccounts = async () => {
            try {
                const response = await api.get("/trading-accounts");

                if (!active) return;

                const list = getAccounts(response);
                setAccounts(list);

                if (list.length) {
                    setAccountId((current) => current || String(list[0]._id));
                }
            } catch (err) {
                if (active) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load your trading accounts."
                    );
                }
            } finally {
                if (active) setLoadingAccounts(false);
            }
        };

        loadAccounts();

        return () => {
            active = false;
        };
    }, []);

    const loadPerformance = useCallback(async () => {
        if (!accountId) {
            setPerformance(null);
            return;
        }

        setLoadingPerformance(true);
        setError("");

        try {
            const response = await api.get(
                `/trading/accounts/${accountId}/performance`
            );

            setPerformance(response.data?.data || null);
        } catch (err) {
            setPerformance(null);
            setError(
                err.response?.data?.message ||
                "Unable to load account performance."
            );
        } finally {
            setLoadingPerformance(false);
        }
    }, [accountId]);

    useEffect(() => {
        if (!loadingAccounts && accountId) {
            loadPerformance();
        }
    }, [loadingAccounts, accountId, loadPerformance]);

    const balances = performance?.balances;
    const stats = performance?.performance;
    const challenge = performance?.challenge;
    const account = performance?.account;

    const statusColor = {
        active: "text-emerald-400 bg-emerald-500/10",
        paused: "text-amber-400 bg-amber-500/10",
        breached: "text-rose-400 bg-rose-500/10",
        completed: "text-cyan-300 bg-cyan-500/10",
        closed: "text-slate-400 bg-slate-500/10",
    };

    return (
        <div className="min-h-screen bg-[#030914] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
                            Analytics
                        </p>
                        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                            Account Performance
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                            Track your trading results and challenge progress.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {account && (
                            <span
                                className={`rounded-full px-3 py-2 text-xs font-semibold uppercase ${statusColor[account.status] ||
                                    "bg-slate-800 text-slate-300"
                                    }`}
                            >
                                {account.status}
                            </span>
                        )}

                        <button
                            type="button"
                            onClick={loadPerformance}
                            disabled={!accountId || loadingPerformance}
                            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-500 hover:text-cyan-300 disabled:opacity-50"
                        >
                            {loadingPerformance ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>
                </header>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <label className="block max-w-xl text-sm text-slate-300">
                        Trading account
                        <select
                            value={accountId}
                            onChange={(event) => setAccountId(event.target.value)}
                            disabled={loadingAccounts || accounts.length === 0}
                            className="mt-2 w-full rounded-xl border border-slate-700 bg-[#030914] px-3 py-3 text-white outline-none focus:border-cyan-500"
                        >
                            {accounts.length === 0 && (
                                <option value="">
                                    {loadingAccounts
                                        ? "Loading accounts..."
                                        : "No trading accounts found"}
                                </option>
                            )}

                            {accounts.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.accountNumber || "Trading account"} ·{" "}
                                    {item.accountType || "demo"}
                                </option>
                            ))}
                        </select>
                    </label>
                </section>

                {error && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                    >
                        {error}
                        <button
                            type="button"
                            onClick={loadPerformance}
                            className="ml-3 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loadingPerformance ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center text-slate-400">
                        Loading account performance...
                    </div>
                ) : performance ? (
                    <>
                        <section>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h2 className="font-semibold">Account overview</h2>
                                <span className="text-xs uppercase tracking-wider text-slate-500">
                                    {account?.accountNumber} · {account?.accountType}
                                </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <StatCard
                                    label="Account balance"
                                    value={money(balances?.balance)}
                                    detail={`Initial balance: ${money(
                                        balances?.initialBalance
                                    )}`}
                                />

                                <StatCard
                                    label="Current equity"
                                    value={money(balances?.equity)}
                                    detail={`Unrealized P&L: ${money(
                                        balances?.unrealizedPnl
                                    )}`}
                                />

                                <StatCard
                                    label="Net realized P&L"
                                    value={money(stats?.netRealizedPnl)}
                                    valueClass={
                                        Number(stats?.netRealizedPnl) > 0
                                            ? "text-emerald-400"
                                            : Number(stats?.netRealizedPnl) < 0
                                                ? "text-rose-400"
                                                : "text-white"
                                    }
                                    detail={`Gross profit: ${money(
                                        stats?.grossProfit
                                    )}`}
                                />

                                <StatCard
                                    label="Highest equity"
                                    value={money(balances?.highestEquity)}
                                    detail="Highest recorded account equity"
                                />
                            </div>
                        </section>

                        <section>
                            <h2 className="mb-3 font-semibold">
                                Trading statistics
                            </h2>

                            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <StatCard
                                    label="Closed trades"
                                    value={stats?.totalClosedTrades ?? 0}
                                    detail={`${stats?.buyTrades ?? 0} buys · ${stats?.sellTrades ?? 0
                                        } sells`}
                                />

                                <StatCard
                                    label="Win rate"
                                    value={`${Number(
                                        stats?.winRatePercent ?? 0
                                    ).toFixed(2)}%`}
                                    detail={`${stats?.winningTrades ?? 0} wins · ${stats?.losingTrades ?? 0
                                        } losses`}
                                />

                                <StatCard
                                    label="Profit factor"
                                    value={
                                        stats?.profitFactor == null
                                            ? "—"
                                            : Number(stats.profitFactor).toFixed(2)
                                    }
                                    detail="Gross profit divided by gross loss"
                                />

                                <StatCard
                                    label="Gross loss"
                                    value={money(stats?.grossLoss)}
                                    valueClass="text-rose-400"
                                    detail={`${stats?.breakevenTrades ?? 0} breakeven trades`}
                                />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold">
                                        Challenge progress
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {challenge?.isDemo
                                            ? "Demo accounts have no profit target."
                                            : "Progress toward your configured profit target."}
                                    </p>
                                </div>

                                {!challenge?.isDemo && (
                                    <p className="text-xl font-bold text-cyan-300">
                                        {Number(
                                            challenge?.targetProgressPercent ?? 0
                                        ).toFixed(2)}%
                                    </p>
                                )}
                            </div>

                            {!challenge?.isDemo && (
                                <>
                                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                                        <div
                                            className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                                            style={{
                                                width: `${Math.max(
                                                    0,
                                                    Math.min(
                                                        100,
                                                        Number(
                                                            challenge?.targetProgressPercent ?? 0
                                                        )
                                                    )
                                                )}%`,
                                            }}
                                        />
                                    </div>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Profit target
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {money(challenge?.targetProfit)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {challenge?.profitTargetPercent}% of initial balance
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Achieved profit
                                            </p>
                                            <p className="mt-1 font-semibold">
                                                {money(challenge?.achievedProfit)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Current drawdown
                                            </p>
                                            <p className="mt-1 font-semibold text-rose-400">
                                                {money(challenge?.drawdownAmount)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {Number(
                                                    challenge?.drawdownPercent ?? 0
                                                ).toFixed(2)}% of initial balance
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </section>
                    </>
                ) : !error ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-12 text-center">
                        <h2 className="font-semibold">No performance data</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Select a trading account to view its statistics.
                        </p>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Performance;
