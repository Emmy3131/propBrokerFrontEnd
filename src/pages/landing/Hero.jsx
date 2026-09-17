import TradingPreview from "./TradingPreview.jsx";

const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="section-container relative grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1.5 text-[10px] font-semibold tracking-[0.18em] text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
            BROKER / PROP FIRM / TRADING PLATFORM
          </div>

          <h1 className="max-w-3xl text-5xl font-bold leading-[1.03] tracking-[-0.04em] sm:text-6xl xl:text-7xl">
            Trade. Prove
            <span className="text-cyan-300">
              {" "}
              Your Edge.
            </span>
            <br />
            <span className="text-slate-300">
              Scale Your Capital.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
            Access modern trading infrastructure,
            powerful tools and prop-firm opportunities
            built for traders who take their strategy
            seriously.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="/signup"
              className="cyan-button rounded-xl bg-cyan-400 px-6 py-3.5 text-center text-sm font-bold text-[#02111d] transition hover:bg-cyan-300"
            >
              Start Trading
            </a>

            <a
              href="#prop-firm"
              className="rounded-xl border border-cyan-400/30 px-6 py-3.5 text-center text-sm font-semibold text-white transition hover:bg-cyan-400/5"
            >
              Explore Prop Firm
            </a>
          </div>

          <div className="mt-9 grid grid-cols-3 gap-4 border-t border-white/5 pt-7">
            {[
              "Secure Infrastructure",
              "Fast Execution",
              "Risk Focused",
            ].map((item) => (
              <div
                key={item}
                className="text-[10px] text-slate-500 sm:text-xs"
              >
                <div className="mb-1 text-cyan-300">✓</div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <TradingPreview />
      </div>
    </section>
  );
}

export default Hero;