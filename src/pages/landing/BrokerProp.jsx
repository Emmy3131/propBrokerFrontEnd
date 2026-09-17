import Icon from "../../components/Icon.jsx";

const BrokerProp = () => {
  return (
    <section id="about" className="py-24">
      <div className="section-container">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
              YOUR TRADING JOURNEY
            </div>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              One Platform.
              <span className="block text-cyan-300">
                Two Ways to Trade.
              </span>
            </h2>

            <p className="mt-6 max-w-md leading-7 text-slate-400">
              Whether you want to trade with your own
              capital or prove your skills through a
              prop-firm challenge, EmmCore gives you the
              infrastructure to move forward.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Broker */}

            <div className="group rounded-2xl border border-cyan-400/20 bg-[#071525] p-7 transition hover:-translate-y-1 hover:border-cyan-300/50">
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                <Icon size={25}>
                  <path d="M4 19V5" />
                  <path d="M4 19h17" />
                  <path d="m7 15 4-5 3 3 5-7" />
                </Icon>
              </div>

              <div className="text-xs tracking-[0.2em] text-cyan-300">
                BROKER
              </div>

              <h3 className="mt-2 text-2xl font-bold">
                Trade Your Market
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Access a modern trading environment
                designed around your strategy.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {[
                  "Forex",
                  "Crypto",
                  "Indices",
                  "Commodities",
                  "Trading tools",
                ].map((item) => (
                  <li key={item}>
                    <span className="mr-2 text-cyan-300">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="#markets"
                className="mt-7 inline-flex rounded-lg bg-cyan-400 px-4 py-2.5 text-xs font-bold text-[#02111d]"
              >
                Explore Markets →
              </a>
            </div>

            {/* Prop Firm */}

            <div className="group rounded-2xl border border-teal-300/20 bg-gradient-to-br from-[#071b25] to-[#071525] p-7 transition hover:-translate-y-1 hover:border-teal-300/50">
              <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-300/10 text-teal-300">
                <Icon size={25}>
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                  <path d="M6 3h12v8a6 6 0 0 1-12 0V3Z" />
                  <path d="M6 7H3a3 3 0 0 0 3 3M18 7h3a3 3 0 0 1-3 3" />
                </Icon>
              </div>

              <div className="text-xs tracking-[0.2em] text-teal-300">
                PROP FIRM
              </div>

              <h3 className="mt-2 text-2xl font-bold">
                Prove Your Edge
              </h3>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Demonstrate your trading ability and
                unlock opportunities to scale.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                {[
                  "Trading challenges",
                  "Evaluation accounts",
                  "Risk-based rules",
                  "Performance tracking",
                  "Scaling opportunities",
                ].map((item) => (
                  <li key={item}>
                    <span className="mr-2 text-teal-300">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <a
                href="#prop-firm"
                className="mt-7 inline-flex rounded-lg bg-teal-300 px-4 py-2.5 text-xs font-bold text-[#02111d]"
              >
                View Challenges →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export default BrokerProp;