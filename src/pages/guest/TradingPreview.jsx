const TradingPreview = () => {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      {/* Glow */}

      <div className="absolute inset-10 rounded-full bg-cyan-400/10 blur-[80px]" />

      {/* Floating BTC */}

      <div className="float-card absolute -right-2 top-3 z-20 hidden rounded-2xl border border-cyan-400/25 bg-[#0a1625]/95 p-4 shadow-2xl sm:block">
        <div className="text-[10px] uppercase tracking-widest text-slate-500">
          BTC/USD
        </div>

        <div className="mt-1 text-lg font-bold">
          $64,235.12
        </div>

        <div className="text-xs text-cyan-300">
          +2.64%
        </div>
      </div>

      {/* Laptop */}

      <div className="relative overflow-hidden rounded-[22px] border border-cyan-400/25 bg-[#071321] p-3 shadow-[0_0_60px_rgba(0,184,255,.12)]">
        {/* Top */}

        <div className="mb-3 flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            <span className="h-2 w-2 rounded-full bg-slate-700" />
            <span className="h-2 w-2 rounded-full bg-slate-700" />
          </div>

          <span className="text-[8px] text-slate-600">
            EMMCORE TERMINAL
          </span>
        </div>

        <div className="grid grid-cols-[70px_1fr] gap-3">
          {/* Sidebar */}

          <div className="hidden space-y-2 sm:block">
            {[
              "EUR/USD",
              "GBP/USD",
              "BTC/USD",
              "ETH/USD",
              "GOLD",
            ].map((item, index) => (
              <div
                key={item}
                className={`rounded-lg px-2 py-2 text-[8px] ${
                  index === 0
                    ? "bg-cyan-400/10 text-cyan-300"
                    : "text-slate-600"
                }`}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Chart */}

          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500">
                  EUR/USD
                </div>
                <div className="text-sm font-bold text-cyan-300">
                  1.07342
                </div>
              </div>

              <div className="text-[9px] text-cyan-300">
                +0.82%
              </div>
            </div>

            <div className="relative h-[220px] overflow-hidden rounded-xl border border-white/5 bg-[#04101d]">
              {/* Grid */}

              <div className="absolute inset-0 grid-bg opacity-60" />

              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 500 240"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="area"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#00b8ff"
                      stopOpacity=".22"
                    />
                    <stop
                      offset="100%"
                      stopColor="#00b8ff"
                      stopOpacity="0"
                    />
                  </linearGradient>
                </defs>

                <path
                  d="M0 190 L30 175 L55 185 L80 140 L105 155 L130 125 L155 145 L180 115 L205 130 L230 85 L255 105 L280 92 L305 120 L330 75 L355 95 L380 62 L405 75 L430 38 L455 55 L500 22 L500 240 L0 240Z"
                  fill="url(#area)"
                />

                <path
                  className="chart-line"
                  d="M0 190 L30 175 L55 185 L80 140 L105 155 L130 125 L155 145 L180 115 L205 130 L230 85 L255 105 L280 92 L305 120 L330 75 L355 95 L380 62 L405 75 L430 38 L455 55 L500 22"
                  stroke="#22d3ee"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>

              {/* Time */}

              <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[7px] text-slate-600">
                <span>09:00</span>
                <span>12:00</span>
                <span>15:00</span>
                <span>18:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Laptop base */}

      <div className="mx-auto h-2 w-[85%] rounded-b-full bg-slate-700/50" />
    </div>
  );
}

export default TradingPreview