const FinalCTA = () => {
  return (
    <section className="relative overflow-hidden border-y border-cyan-400/10 bg-[#061625] py-24">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <div className="section-container relative text-center">
        <div className="mx-auto max-w-3xl">
          <div className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
            YOUR NEXT MOVE
          </div>

          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">
            Ready to Trade
            <span className="text-cyan-300">
              {" "}
              Differently?
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-slate-400">
            Build your strategy. Prove your edge. Scale
            your opportunity.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/signup"
              className="cyan-button rounded-xl bg-cyan-300 px-7 py-3.5 text-sm font-bold text-[#02111d]"
            >
              Create Account →
            </a>

            <a
              href="#about"
              className="rounded-xl border border-white/10 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/5"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;