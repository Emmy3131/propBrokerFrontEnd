const Platform = () => {
  return (
    <section id="platform" className="overflow-hidden py-24">
      <div className="section-container grid items-center gap-14 lg:grid-cols-[1.2fr_.8fr]">
        {/* Dashboard */}

        <div className="order-2 lg:order-1">
          <div className="rounded-2xl border border-cyan-400/20 bg-[#061321] p-3 shadow-[0_0_70px_rgba(0,184,255,.08)]">
            <div className="mb-3 flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex gap-2">
                <span className="text-[9px] text-cyan-300">
                  EMMCORE
                </span>
                <span className="text-[9px] text-slate-600">
                  Dashboard
                </span>
                <span className="text-[9px] text-slate-600">
                  Markets
                </span>
              </div>

              <span className="text-[8px] text-slate-600">
                DEMO
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_180px]">
              <div className="rounded-xl border border-white/5 bg-[#030c17] p-4">
                <div className="flex justify-between">
                  <div>
                    <div className="text-xs text-slate-500">
                      EUR/USD
                    </div>
                    <div className="mt-1 text-2xl font-bold">
                      1.07342
                    </div>
                  </div>

                  <div className="text-xs text-cyan-300">
                    +0.82%
                  </div>
                </div>

                <div className="mt-6 h-[260px]">
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 600 300"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="platformArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#22d3ee"
                          stopOpacity=".18"
                        />
                        <stop
                          offset="100%"
                          stopColor="#22d3ee"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <path
                      d="M0 240 L30 220 L60 230 L90 180 L120 195 L150 160 L180 175 L210 135 L240 155 L270 100 L300 125 L330 110 L360 145 L390 90 L420 105 L450 65 L480 82 L510 42 L540 58 L600 15 L600 300 L0 300Z"
                      fill="url(#platformArea)"
                    />

                    <path
                      d="M0 240 L30 220 L60 230 L90 180 L120 195 L150 160 L180 175 L210 135 L240 155 L270 100 L300 125 L330 110 L360 145 L390 90 L420 105 L450 65 L480 82 L510 42 L540 58 L600 15"
                      stroke="#22d3ee"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                </div>

                <div className="flex justify-between text-[8px] text-slate-600">
                  <span>1m</span>
                  <span>5m</span>
                  <span>15m</span>
                  <span>1H</span>
                  <span>4H</span>
                  <span>1D</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/5 bg-[#030c17] p-4">
                <div className="text-xs text-slate-500">
                  Order
                </div>

                <div className="mt-5 space-y-3">
                  <div>
                    <label className="text-[9px] text-slate-600">
                      Instrument
                    </label>
                    <div className="mt-1 rounded-lg border border-white/5 p-2 text-xs">
                      EUR/USD
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] text-slate-600">
                      Volume
                    </label>
                    <div className="mt-1 rounded-lg border border-white/5 p-2 text-xs">
                      0.10
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3">
                    <button className="rounded-lg bg-cyan-400 py-2 text-[10px] font-bold text-[#02111d]">
                      Buy
                    </button>

                    <button className="rounded-lg border border-red-400/20 py-2 text-[10px] text-red-300">
                      Sell
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text */}

        <div className="order-1 lg:order-2">
          <div className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
            TRADING PLATFORM
          </div>

          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
            Trade Without
            <span className="block text-cyan-300">
              Limits.
            </span>
          </h2>

          <p className="mt-6 leading-7 text-slate-400">
            Everything you need to understand the market,
            manage your positions and build a disciplined
            trading workflow.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Advanced charting tools",
              "Real-time market data",
              "One-click execution",
              "Mobile and desktop access",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/10 text-xs text-cyan-300">
                  ✓
                </span>

                {item}
              </li>
            ))}
          </ul>

          <a
            href="/signup"
            className="mt-9 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-bold text-[#02111d]"
          >
            Open Trading Platform →
          </a>
        </div>
      </div>
    </section>
  );
}

export default Platform;