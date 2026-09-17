const Challenges = () => {
  const challenges = [
    {
      amount: "$10K",
      popular: false,
    },
    {
      amount: "$50K",
      popular: true,
    },
    {
      amount: "$100K",
      popular: false,
    },
  ];

  return (
    <section
      id="prop-firm"
      className="border-y border-white/5 bg-[#040d18] py-24"
    >
      <div className="section-container">
        <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <div className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
              PROP FIRM CHALLENGES
            </div>

            <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
              Prove Your Edge.
              <span className="text-cyan-300">
                {" "}
                Get Funded.
              </span>
            </h2>

            <p className="mt-6 max-w-lg leading-7 text-slate-400">
              Choose an evaluation path, follow the rules,
              demonstrate your strategy and unlock larger
              trading opportunities.
            </p>

            <div className="mt-8 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-5">
              <div className="text-sm font-semibold">
                Built around disciplined trading
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Challenge rules, targets and account
                conditions will be clearly presented before
                you begin.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {challenges.map((challenge) => (
              <div
                key={challenge.amount}
                className={`relative rounded-2xl border p-5 ${
                  challenge.popular
                    ? "border-cyan-300/60 bg-cyan-400/[0.07]"
                    : "border-white/10 bg-[#071525]"
                }`}
              >
                {challenge.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-300 px-3 py-1 text-[8px] font-bold text-[#02111d]">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-3xl font-bold">
                  {challenge.amount}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Challenge Account
                </div>

                <div className="my-6 h-px bg-white/5" />

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Profit Target
                    </span>
                    <span>8%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Max Drawdown
                    </span>
                    <span>10%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Daily Drawdown
                    </span>
                    <span>5%</span>
                  </div>
                </div>

                <a
                  href="/signup"
                  className={`mt-7 block rounded-lg px-3 py-2.5 text-center text-xs font-bold ${
                    challenge.popular
                      ? "bg-cyan-300 text-[#02111d]"
                      : "border border-cyan-400/30 text-cyan-300"
                  }`}
                >
                  Start Challenge →
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export default Challenges;