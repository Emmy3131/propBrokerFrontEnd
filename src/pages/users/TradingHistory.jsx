
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

const formatMoney = (value, currency = "USD") =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value ?? 0));

const formatPrice = (value) =>
    value == null ? "—" : Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 5,
    });

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? "—"
        : date.toLocaleString();
};

const TradeHistory = () => {
    const [accounts, setAccounts] = useState([]);
    const [accountId, setAccountId] = useState("");
    const [trades, setTrades] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const [filters, setFilters] = useState({
        side: "",
        result: "",
        from: "",
        to: "",
    });

    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [loadingTrades, setLoadingTrades] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        const loadAccounts = async () => {
            setLoadingAccounts(true);

            try {
                const response = await api.get("/trading-accounts");

                if (!active) return;

                const list = getAccounts(response);
                setAccounts(list);

                if (list.length > 0) {
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

    const loadTrades = useCallback(async () => {
        setLoadingTrades(true);
        setError("");

        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
            };

            if (accountId) params.accountId = accountId;
            if (filters.side) params.side = filters.side;
            if (filters.result) params.result = filters.result;

            // Use complete local-day boundaries for date filters.
            if (filters.from) {
                params.from = new Date(
                    `${filters.from}T00:00:00`
                ).toISOString();
            }

            if (filters.to) {
                params.to = new Date(
                    `${filters.to}T23:59:59.999`
                ).toISOString();
            }

            const response = await api.get("/trading/history", {
                params,
            });

            const payload = response.data?.data || {};

            setTrades(
                Array.isArray(payload.trades) ? payload.trades : []
            );

            setPagination((current) => ({
                ...current,
                ...(payload.pagination || {}),
            }));
        } catch (err) {
            setTrades([]);
            setError(
                err.response?.data?.message ||
                "Unable to load trade history."
            );
        } finally {
            setLoadingTrades(false);
        }
    }, [
        accountId,
        filters,
        pagination.page,
        pagination.limit,
    ]);

    useEffect(() => {
        if (!loadingAccounts) {
            loadTrades();
        }
    }, [loadingAccounts, loadTrades]);

    const updateFilter = (name, value) => {
        setFilters((current) => ({
            ...current,
            [name]: value,
        }));

        setPagination((current) => ({
            ...current,
            page: 1,
        }));
    };

    const resetFilters = () => {
        setFilters({
            side: "",
            result: "",
            from: "",
            to: "",
        });

        setPagination((current) => ({
            ...current,
            page: 1,
        }));
    };

    const currency = "USD";

    return (
        <div className="min-h-screen bg-[#030914] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl space-y-6">
                <div>
                    <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-400">
                        Trading
                    </p>
                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
                        Trade History
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Review your closed trades and realized results.
                    </p>
                </div>

                <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <label className="block text-sm text-slate-300">
                            Trading account
                            <select
                                value={accountId}
                                onChange={(event) => {
                                    setAccountId(event.target.value);
                                    setPagination((current) => ({
                                        ...current,
                                        page: 1,
                                    }));
                                }}
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

                                {accounts.map((account) => (
                                    <option
                                        key={account._id}
                                        value={account._id}
                                    >
                                        {account.accountNumber || "Trading account"}{" "}
                                        · {account.accountType || "demo"}{" "}
                                        · {account.status || "active"}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block text-sm text-slate-300">
                            Direction
                            <select
                                value={filters.side}
                                onChange={(event) =>
                                    updateFilter("side", event.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-[#030914] px-3 py-3 text-white outline-none focus:border-cyan-500"
                            >
                                <option value="">All directions</option>
                                <option value="buy">Buy</option>
                                <option value="sell">Sell</option>
                            </select>
                        </label>

                        <label className="block text-sm text-slate-300">
                            Result
                            <select
                                value={filters.result}
                                onChange={(event) =>
                                    updateFilter("result", event.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-[#030914] px-3 py-3 text-white outline-none focus:border-cyan-500"
                            >
                                <option value="">All results</option>
                                <option value="win">Winning trades</option>
                                <option value="loss">Losing trades</option>
                                <option value="breakeven">Breakeven trades</option>
                            </select>
                        </label>

                        <label className="block text-sm text-slate-300">
                            From date
                            <input
                                type="date"
                                value={filters.from}
                                max={filters.to || undefined}
                                onChange={(event) =>
                                    updateFilter("from", event.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-[#030914] px-3 py-3 text-white outline-none focus:border-cyan-500"
                            />
                        </label>

                        <label className="block text-sm text-slate-300">
                            To date
                            <input
                                type="date"
                                value={filters.to}
                                min={filters.from || undefined}
                                onChange={(event) =>
                                    updateFilter("to", event.target.value)
                                }
                                className="mt-2 w-full rounded-xl border border-slate-700 bg-[#030914] px-3 py-3 text-white outline-none focus:border-cyan-500"
                            />
                        </label>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-cyan-500 hover:text-cyan-300"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>
                </section>

                {error && (
                    <div
                        role="alert"
                        className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"
                    >
                        {error}
                        <button
                            type="button"
                            onClick={loadTrades}
                            className="ml-3 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 sm:px-5">
                        <div>
                            <h2 className="font-semibold">Closed positions</h2>
                            <p className="mt-1 text-sm text-slate-400">
                                {pagination.total} recorded trades
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={loadTrades}
                            disabled={loadingTrades}
                            className="rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
                        >
                            {loadingTrades ? "Refreshing..." : "Refresh"}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[950px] text-left text-sm">
                            <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                                <tr>
                                    <th className="px-5 py-4">Instrument</th>
                                    <th className="px-5 py-4">Direction</th>
                                    <th className="px-5 py-4">Quantity</th>
                                    <th className="px-5 py-4">Entry price</th>
                                    <th className="px-5 py-4">Close price</th>
                                    <th className="px-5 py-4">Realized P&L</th>
                                    <th className="px-5 py-4">Closed at</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-800/80">
                                {loadingTrades ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-12 text-center text-slate-400"
                                        >
                                            Loading trade history...
                                        </td>
                                    </tr>
                                ) : trades.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-5 py-12 text-center"
                                        >
                                            <p className="font-medium text-slate-200">
                                                No closed trades found
                                            </p>
                                            <p className="mt-2 text-sm text-slate-400">
                                                Closed positions will appear here.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    trades.map((trade) => {
                                        const pnl = Number(trade.realizedPnl ?? 0);
                                        const symbol =
                                            trade.instrument?.symbol || trade.symbol || "—";

                                        return (
                                            <tr
                                                key={trade._id}
                                                className="transition hover:bg-white/[0.02]"
                                            >
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-white">
                                                        {symbol}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {trade.instrument?.name || "Simulated market"}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span
                                                        className={`rounded-lg px-2.5 py-1 text-xs font-bold uppercase ${trade.side === "buy"
                                                                ? "bg-emerald-500/10 text-emerald-400"
                                                                : "bg-rose-500/10 text-rose-400"
                                                            }`}
                                                    >
                                                        {trade.side}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-slate-300">
                                                    {formatPrice(trade.quantity)}
                                                </td>

                                                <td className="px-5 py-4 text-slate-300">
                                                    {formatPrice(trade.entryPrice)}
                                                </td>

                                                <td className="px-5 py-4 text-slate-300">
                                                    {formatPrice(trade.closePrice)}
                                                </td>

                                                <td
                                                    className={`px-5 py-4 font-semibold ${pnl > 0
                                                            ? "text-emerald-400"
                                                            : pnl < 0
                                                                ? "text-rose-400"
                                                                : "text-slate-300"
                                                        }`}
                                                >
                                                    {pnl > 0 ? "+" : ""}
                                                    {formatMoney(pnl, currency)}
                                                </td>

                                                <td className="px-5 py-4 text-slate-400">
                                                    {formatDate(trade.closedAt)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-4 py-4 sm:px-5">
                        <p className="text-sm text-slate-400">
                            Page {pagination.page} of{" "}
                            {Math.max(1, pagination.totalPages)}
                        </p>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                disabled={
                                    loadingTrades ||
                                    !pagination.hasPreviousPage
                                }
                                onClick={() =>
                                    setPagination((current) => ({
                                        ...current,
                                        page: current.page - 1,
                                    }))
                                }
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Previous
                            </button>

                            <button
                                type="button"
                                disabled={
                                    loadingTrades || !pagination.hasNextPage
                                }
                                onClick={() =>
                                    setPagination((current) => ({
                                        ...current,
                                        page: current.page + 1,
                                    }))
                                }
                                className="rounded-lg border border-slate-700 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default TradeHistory;
