const Markets = () => {
  const markets = [
    {
      name: "Forex",
      icon: "◎",
      pairs: [
        ["EUR/USD", "1.0734", "+0.82%"],
        ["GBP/USD", "1.2831", "+0.41%"],
        ["USD/JPY", "149.32", "-0.21%"],
      ],
    },
    {
      name: "Crypto",
      icon: "₿",
      pairs: [
        ["BTC/USD", "64,235", "+2.64%"],
        ["ETH/USD", "2,587", "+1.32%"],
        ["SOL/USD", "148.21", "+3.76%"],
      ],
    },
    {
      name: "Indices",
      icon: "▥",
      pairs: [
        ["NAS100", "19,842", "+1.12%"],
        ["S&P 500", "5,636", "+0.87%"],
        ["DOW JONES", "41,230", "+0.65%"],
      ],
    },
    {
      name: "Commodities",
      icon: "◯",
      pairs: [
        ["GOLD", "2,646", "+0.74%"],
        ["SILVER", "31.42", "+2.11%"],
        ["OIL", "71.56", "-0.32%"],
      ],
    },
  ];

  return (
    <section
      id="markets"
      className="border-y border-white/5 bg-[#040d18] py-24"
    >
      <div className="section-container">
        <div className="max-w-xl">
          <div className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
            MARKETS
          </div>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Trade the Markets
          </h2>

          <p className="mt-4 text-slate-400">
            Opportunities across global markets,
            presented through a modern trading experience.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {markets.map((market) => (
            <div
              key={market.name}
              className="rounded-2xl border border-white/5 bg-[#071525] p-5 transition hover:border-cyan-400/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl text-cyan-300">
                    {market.icon}
                  </span>

                  <span className="font-semibold">
                    {market.name}
                  </span>
                </div>

                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_#22d3ee]" />
              </div>

              <div className="mt-7 space-y-4">
                {market.pairs.map(
                  ([pair, price, change]) => (
                    <div
                      key={pair}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-400">
                        {pair}
                      </span>

                      <span className="text-slate-300">
                        {price}
                      </span>

                      <span
                        className={
                          change.startsWith("-")
                            ? "text-red-400"
                            : "text-cyan-300"
                        }
                      >
                        {change}
                      </span>
                    </div>
                  )
                )}
              </div>

              <a
                href="#platform"
                className="mt-7 block text-xs font-semibold text-cyan-300 hover:text-cyan-200"
              >
                View {market.name} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Markets;