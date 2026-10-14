import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    FaArrowDown,
    FaArrowUp,
    FaChartLine,
    FaClock,
    FaExchangeAlt,
    FaExclamationTriangle,
    FaRedo,
    FaTimes,
    FaWallet,
} from "react-icons/fa";
import api from "../../library/api";



const formatMoney = (value) => {

    const number = Number(value?.$numberDecimal ?? value ?? 0);
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number.isFinite(number) ? number : 0);

};

const formatPrice = (value) => {
    const number = Number(value?.$numberDecimal ?? value ?? 0);
    if (!Number.isFinite(number)) return "—";
    return number.toLocaleString("en-US", {

    minimumFractionDigits: 2,
        maximumFractionDigits: 5,
    });

};

const getPayload = (response) =>
    response?.data?.data ?? response?.data ?? {};
const getList = (response, keys) => {
    const payload = getPayload(response);
    if (Array.isArray(payload)) return payload;
    for (const key of keys) {

        if (Array.isArray(payload?.[key])) {

            return payload[key];

        }

    }



    return [];

};



const getId = (item) =>

    item?._id?.toString?.() ??

    item?._id ??

    item?.id?.toString?.() ??

    item?.id ??

    "";



const getPositionPnl = (position) =>

    Number(

        position?.unrealizedPnl?.$numberDecimal ??

        position?.unrealizedPnl ??

        0

    );



const getInstrumentName = (position) =>

    position?.instrument?.symbol ??

    position?.symbol ??

    position?.instrument?.name ??

    "Unknown instrument";



const getErrorMessage = (error) =>

    error?.response?.data?.message ??

    error?.response?.data?.error ??

    "Something went wrong. Please try again.";



const getAccountBalance = (account) =>

    account?.balance?.$numberDecimal ??

    account?.balance ??

    account?.equity?.$numberDecimal ??

    account?.equity ??

    account?.initialBalance?.$numberDecimal ??

    account?.initialBalance ??

    0;



const getAccountIdFromPosition = (position) =>

    String(

        position?.tradingAccount?._id ??

        position?.tradingAccount?.id ??

        position?.tradingAccount ??

        ""

    );



export default function Trade() {

    const [accounts, setAccounts] = useState([]);

    const [instruments, setInstruments] = useState([]);

    const [positions, setPositions] = useState([]);



    const [accountId, setAccountId] = useState("");

    const [instrumentId, setInstrumentId] = useState("");

    const [side, setSide] = useState("buy");

    const [quantity, setQuantity] = useState("0.01");



    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [closingId, setClosingId] = useState("");

    const [creatingAccount, setCreatingAccount] = useState(false);



    const selectedAccount = accounts.find(

        (account) => getId(account) === accountId

    );



    const selectedInstrument = instruments.find(

        (instrument) => getId(instrument) === instrumentId

    );



    const currentPrice = Number(

        selectedInstrument?.currentPrice?.$numberDecimal ??

        selectedInstrument?.currentPrice ??

        0

    );



    const contractSize = Number(

        selectedInstrument?.contractSize?.$numberDecimal ??

        selectedInstrument?.contractSize ??

        1

    );



    const leverage = Number(

        selectedAccount?.leverage?.$numberDecimal ??

        selectedAccount?.leverage ??

        100

    );



    const numericQuantity = Number(quantity || 0);
    const estimatedNotional = currentPrice * numericQuantity * contractSize;
    const estimatedMargin = leverage > 0 ? estimatedNotional / leverage : 0;

    const loadTradingData = useCallback(async (showLoader = true) => {

        if (showLoader) {

            setLoading(true);

        } else {

            setRefreshing(true);

        }



        try {

            const [

                accountsResponse,

                instrumentsResponse,

                positionsResponse,

            ] = await Promise.all([

                api.get("/trading-accounts"),

                api.get("/market/instruments"),

                api.get("/trading/positions", {

                    params: { status: "open" },

                }),

            ]);



            const nextAccounts = getList(accountsResponse, [

                "accounts",

                "tradingAccounts",

                "results",

            ]);



            const nextInstruments = getList(instrumentsResponse, [

                "instruments",

                "markets",

                "results",

            ]);



            const nextPositions = getList(positionsResponse, [

                "positions",

                "results",

            ]);



            // The execution engine supports simulated USD-quoted instruments.

            const supportedInstruments = nextInstruments.filter(

                (instrument) =>

                    instrument.isActive !== false &&

                    String(instrument.priceSource ?? "simulated").toLowerCase() ===

                    "simulated" &&

                    String(instrument.quoteCurrency ?? "").toUpperCase() ===

                    "USD" &&

                    Number(

                        instrument.currentPrice?.$numberDecimal ??

                        instrument.currentPrice ??

                        0

                    ) > 0

            );



            setAccounts(nextAccounts);

            setInstruments(supportedInstruments);

            setPositions(

                nextPositions.filter(

                    (position) => position.status === "open"

                )

            );



            setAccountId((previous) =>

                nextAccounts.some((account) => getId(account) === previous)

                    ? previous

                    : getId(nextAccounts[0]) || ""

            );



            setInstrumentId((previous) =>

                supportedInstruments.some(

                    (instrument) => getId(instrument) === previous

                )

                    ? previous

                    : getId(supportedInstruments[0]) || ""

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
            await api.post("/trading-accounts", {
                accountType: "demo",
            });

            toast.success("Demo trading account created with a $5,000 starting balance.");

            await loadTradingData(false);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setCreatingAccount(false);
        }
    };



    const handlePlaceOrder = async (event) => {

        event.preventDefault();



        if (!accountId) {

            toast.error("Please select a trading account.");

            return;

        }



        if (!instrumentId || !selectedInstrument) {

            toast.error("Please select a supported trading instrument.");

            return;

        }



        if (

            !Number.isFinite(numericQuantity) ||

            numericQuantity < 0.01 ||

            numericQuantity > 100

        ) {

            toast.error("Quantity must be between 0.01 and 100.");

            return;

        }



        if (

            !Number.isFinite(currentPrice) ||

            currentPrice <= 0 ||

            !Number.isFinite(contractSize) ||

            contractSize <= 0

        ) {

            toast.error("The selected instrument has invalid pricing.");

            return;

        }



        if (

            !Number.isFinite(leverage) ||

            leverage <= 0

        ) {

            toast.error("Your trading account has invalid leverage settings.");

            return;

        }



        if (selectedAccount?.status !== "active") {

            toast.error("Your selected trading account is not active.");

            return;

        }



        setSubmitting(true);



        try {

            // These fields match tradingController.placeMarketOrder.

            await api.post("/trading/orders", {

                accountId,

                symbol: selectedInstrument.symbol,

                side,

                quantity: numericQuantity,

            });



            toast.success(

                `${side === "buy" ? "Buy" : "Sell"} order placed successfully.`

            );



            // Reload accounts and positions after the backend processes the order.

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
        const confirmed = window.confirm(

            `Close your ${String(position.side ?? "").toUpperCase()} position on ${getInstrumentName(position)}?`

        );

        if (!confirmed) return;
        setClosingId(positionId);
        try {

            await api.post(

                `/trading/positions/${positionId}/close`

            );



            toast.success("Position closed successfully.");



            await loadTradingData(false);

        } catch (error) {

            toast.error(getErrorMessage(error));

        } finally {

            setClosingId("");

        }

    };



    const displayedPositions = positions.filter(

        (position) =>

            getAccountIdFromPosition(position) === accountId

    );



    const totalUnrealizedPnl = displayedPositions.reduce(

        (total, position) => total + getPositionPnl(position),

        0

    );



    if (loading) {

        return (

            <div className="flex min-h-[50vh] items-center justify-center bg-slate-950 text-slate-400">

                <FaRedo className="mr-3 animate-spin" />

                Loading trading workspace...

            </div>

        );

    }



    return (

        <div className="min-h-screen space-y-6 bg-slate-950 p-4 text-slate-100 sm:p-6">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">

                        Trading terminal

                    </p>



                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">

                        Trade

                    </h1>



                    <p className="mt-2 text-sm text-slate-400">

                        Place simulated market orders and manage your open positions.

                    </p>

                </div>



                <button

                    type="button"

                    onClick={() => loadTradingData(false)}

                    disabled={refreshing || submitting || Boolean(closingId)}

                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"

                >

                    <FaRedo className={refreshing ? "animate-spin" : ""} />

                    Refresh

                </button>

            </div>



            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

                <SummaryCard

                    icon={<FaWallet />}

                    label="Selected account balance"

                    value={formatMoney(getAccountBalance(selectedAccount))}

                />



                <SummaryCard

                    icon={<FaChartLine />}

                    label="Open positions"

                    value={String(displayedPositions.length)}

                />



                <SummaryCard

                    icon={<FaExchangeAlt />}

                    label="Unrealized P&L"

                    value={formatMoney(totalUnrealizedPnl)}

                    valueColor={

                        totalUnrealizedPnl >= 0

                            ? "text-emerald-400"

                            : "text-red-400"

                    }

                />

            </div>



            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">

                <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 sm:p-6">

                    <div className="mb-6 flex items-center gap-3">

                        <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">

                            <FaExchangeAlt />

                        </div>



                        <div>

                            <h2 className="font-semibold">

                                Place market order

                            </h2>

                            <p className="mt-1 text-xs text-slate-400">

                                Orders use simulated instrument prices.

                            </p>

                        </div>

                    </div>



                    {accounts.length === 0 ? (

                        <div className="space-y-4">
                            <EmptyState message="You don't have a trading account yet. Create a demo account to start simulated trading with a $5,000 starting balance." />

                            <button
                                type="button"
                                onClick={handleCreateDemoAccount}
                                disabled={creatingAccount || refreshing || submitting || Boolean(closingId)}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3.5 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {creatingAccount ? (
                                    <>
                                        <FaRedo className="animate-spin" />
                                        Creating demo account...
                                    </>
                                ) : (
                                    <>
                                        <FaWallet />
                                        Create Demo Account
                                    </>
                                )}
                            </button>
                        </div>

                    ) : instruments.length === 0 ? (

                        <EmptyState message="No active, simulated USD-quoted instruments are available for trading." />

                    ) : (

                        <form

                            onSubmit={handlePlaceOrder}

                            className="space-y-5"

                        >

                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-300">

                                    Trading account

                                </label>



                                <select

                                    value={accountId}

                                    onChange={(event) =>

                                        setAccountId(event.target.value)

                                    }

                                    required

                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-500"

                                >

                                    {accounts.map((account) => (

                                        <option

                                            key={getId(account)}

                                            value={getId(account)}

                                        >

                                            {account.accountNumber ||

                                                `${account.accountType || "Trading"} account`}{" "}

                                            — {account.status || "unknown"}

                                        </option>

                                    ))}

                                </select>



                                {selectedAccount?.status !== "active" && (

                                    <p className="mt-2 flex items-center gap-2 text-xs text-amber-400">

                                        <FaExclamationTriangle />

                                        This account is not active.

                                    </p>

                                )}

                            </div>



                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-300">

                                    Instrument

                                </label>



                                <select

                                    value={instrumentId}

                                    onChange={(event) =>

                                        setInstrumentId(event.target.value)

                                    }

                                    required

                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-cyan-500"

                                >

                                    {instruments.map((instrument) => (

                                        <option

                                            key={getId(instrument)}

                                            value={getId(instrument)}

                                        >

                                            {instrument.symbol} — {instrument.name}

                                        </option>

                                    ))}

                                </select>

                            </div>



                            <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">

                                <div className="flex items-center justify-between gap-4">

                                    <div>

                                        <p className="text-xs text-slate-400">

                                            Simulated price

                                        </p>

                                        <p className="mt-1 text-xl font-bold">

                                            {formatPrice(currentPrice)}

                                        </p>

                                    </div>



                                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400">

                                        Simulated

                                    </span>

                                </div>



                                {selectedInstrument?.priceUpdatedAt && (

                                    <p className="mt-2 text-xs text-slate-500">

                                        Last updated:{" "}

                                        {new Date(

                                            selectedInstrument.priceUpdatedAt

                                        ).toLocaleString()}

                                    </p>

                                )}

                            </div>



                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-300">

                                    Order direction

                                </label>



                                <div className="grid grid-cols-2 gap-3">

                                    <button

                                        type="button"

                                        onClick={() => setSide("buy")}

                                        aria-pressed={side === "buy"}

                                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${side === "buy"

                                                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"

                                                : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"

                                            }`}

                                    >

                                        <FaArrowUp />

                                        Buy

                                    </button>



                                    <button

                                        type="button"

                                        onClick={() => setSide("sell")}

                                        aria-pressed={side === "sell"}

                                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold transition ${side === "sell"

                                                ? "border-red-500 bg-red-500/10 text-red-400"

                                                : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600"

                                            }`}

                                    >

                                        <FaArrowDown />

                                        Sell

                                    </button>

                                </div>

                            </div>



                            <div>

                                <label className="mb-2 block text-sm font-medium text-slate-300">

                                    Quantity

                                </label>



                                <input

                                    type="number"

                                    min="0.01"

                                    max="100"

                                    step="0.01"

                                    value={quantity}

                                    onChange={(event) =>

                                        setQuantity(event.target.value)

                                    }

                                    required

                                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-cyan-500"

                                />



                                <p className="mt-2 text-xs text-slate-500">

                                    Enter a quantity between 0.01 and 100.

                                </p>

                            </div>



                            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950 p-4">

                                <div className="flex items-center justify-between gap-3 text-sm">

                                    <span className="text-slate-400">

                                        Estimated notional

                                    </span>

                                    <span className="font-medium">

                                        {formatMoney(estimatedNotional)}

                                    </span>

                                </div>



                                <div className="flex items-center justify-between gap-3 text-sm">

                                    <span className="text-slate-400">

                                        Estimated margin

                                    </span>

                                    <span className="font-medium">

                                        {formatMoney(estimatedMargin)}

                                    </span>

                                </div>



                                <div className="flex items-center justify-between gap-3 text-sm">

                                    <span className="text-slate-400">

                                        Account leverage

                                    </span>

                                    <span className="font-medium">

                                        {leverage > 0

                                            ? `${leverage}:1`

                                            : "Not configured"}

                                    </span>

                                </div>

                            </div>



                            <button

                                type="submit"

                                disabled={

                                    submitting ||

                                    refreshing ||

                                    !accountId ||

                                    !instrumentId ||

                                    selectedAccount?.status !== "active"

                                }

                                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${side === "buy"

                                        ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"

                                        : "bg-red-500 text-white hover:bg-red-400"

                                    }`}

                            >

                                {submitting ? (

                                    <>

                                        <FaRedo className="animate-spin" />

                                        Submitting order...

                                    </>

                                ) : (

                                    <>

                                        {side === "buy" ? (

                                            <FaArrowUp />

                                        ) : (

                                            <FaArrowDown />

                                        )}

                                        {side === "buy"

                                            ? "Place Buy Order"

                                            : "Place Sell Order"}

                                    </>

                                )}

                            </button>

                        </form>

                    )}

                </section>



                <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">

                    <div className="flex items-center justify-between gap-3 border-b border-slate-800 p-5 sm:p-6">

                        <div>

                            <h2 className="font-semibold">

                                Open positions

                            </h2>

                            <p className="mt-1 text-xs text-slate-400">

                                Positions for the selected trading account.

                            </p>

                        </div>



                        <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-semibold">

                            {displayedPositions.length}

                        </span>

                    </div>



                    {displayedPositions.length === 0 ? (

                        <div className="p-8">

                            <EmptyState message="This account has no open positions. Place a simulated market order to get started." />

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[650px] text-left text-sm">

                                <thead className="bg-slate-950/70 text-xs uppercase tracking-wider text-slate-500">

                                    <tr>

                                        <th className="px-5 py-4 font-medium">

                                            Instrument

                                        </th>

                                        <th className="px-5 py-4 font-medium">

                                            Side

                                        </th>

                                        <th className="px-5 py-4 font-medium">

                                            Quantity

                                        </th>

                                        <th className="px-5 py-4 font-medium">

                                            Entry

                                        </th>

                                        <th className="px-5 py-4 font-medium">

                                            P&amp;L

                                        </th>

                                        <th className="px-5 py-4 font-medium">

                                            Action

                                        </th>

                                    </tr>

                                </thead>



                                <tbody className="divide-y divide-slate-800">

                                    {displayedPositions.map((position) => {

                                        const positionId = getId(position);

                                        const pnl = getPositionPnl(position);

                                        const positionSide =

                                            position.side?.toLowerCase();



                                        return (

                                            <tr

                                                key={positionId}

                                                className="transition hover:bg-slate-800/30"

                                            >

                                                <td className="px-5 py-4">

                                                    <p className="font-semibold">

                                                        {getInstrumentName(position)}

                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">

                                                        {position.tradingAccount?.accountNumber ||

                                                            "Trading account"}

                                                    </p>

                                                </td>



                                                <td className="px-5 py-4">

                                                    <span

                                                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${positionSide === "buy"

                                                                ? "bg-emerald-500/10 text-emerald-400"

                                                                : "bg-red-500/10 text-red-400"

                                                            }`}

                                                    >

                                                        {positionSide === "buy" ? (

                                                            <FaArrowUp />

                                                        ) : (

                                                            <FaArrowDown />

                                                        )}

                                                        {positionSide?.toUpperCase() || "—"}

                                                    </span>

                                                </td>



                                                <td className="px-5 py-4">

                                                    {formatPrice(position.quantity)}

                                                </td>



                                                <td className="px-5 py-4">

                                                    {formatPrice(position.entryPrice)}

                                                </td>



                                                <td

                                                    className={`px-5 py-4 font-semibold ${pnl >= 0

                                                            ? "text-emerald-400"

                                                            : "text-red-400"

                                                        }`}

                                                >

                                                    {formatMoney(pnl)}

                                                </td>



                                                <td className="px-5 py-4">

                                                    <button

                                                        type="button"

                                                        onClick={() =>

                                                            handleClosePosition(position)

                                                        }

                                                        disabled={

                                                            closingId === positionId ||

                                                            submitting ||

                                                            refreshing

                                                        }

                                                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"

                                                    >

                                                        {closingId === positionId ? (

                                                            <FaRedo className="animate-spin" />

                                                        ) : (

                                                            <FaTimes />

                                                        )}

                                                        Close

                                                    </button>

                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </div>



            <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm text-slate-300">

                <FaExclamationTriangle className="mt-0.5 shrink-0 text-amber-400" />

                <p>

                    This terminal is for simulated trading only. Prices, order

                    fills, margin, and profit/loss are determined by your backend

                    simulation. This page does not execute trades in a real market.

                </p>

            </div>

        </div>

    );

}



function SummaryCard({

    icon,

    label,

    value,

    valueColor = "text-white",

}) {

    return (

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">

            <div className="mb-4 flex items-center justify-between">

                <span className="text-sm text-slate-400">{label}</span>

                <span className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">

                    {icon}

                </span>

            </div>



            <p className={`text-2xl font-bold ${valueColor}`}>

                {value}

            </p>

        </div>

    );

}



function EmptyState({ message }) {

    return (

        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 px-5 py-10 text-center">

            <FaClock className="mb-3 text-2xl text-slate-500" />

            <p className="max-w-sm text-sm leading-6 text-slate-400">

                {message}

            </p>

        </div>

    );

}