const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Choose Your Path",
      text: "Broker account or prop-firm challenge.",
    },
    {
      number: "02",
      title: "Trade Your Strategy",
      text: "Use our infrastructure to execute your trades.",
    },
    {
      number: "03",
      title: "Prove Your Edge",
      text: "Demonstrate consistent risk management.",
    },
    {
      number: "04",
      title: "Scale",
      text: "Grow your trading opportunity.",
    },
  ];

  return (
    <section className="py-24">
      <div className="section-container">
        <div className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
          SIMPLE PROCESS
        </div>

        <h2 className="mt-3 text-4xl font-bold">
          How It Works
        </h2>

        <div className="mt-14 grid gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {index < 3 && (
                <div className="absolute left-[calc(100%+8px)] top-6 hidden h-px w-8 bg-cyan-400/20 md:block" />
              )}

              <div className="text-4xl font-bold text-cyan-300/20">
                {step.number}
              </div>

              <h3 className="mt-3 font-bold">
                {step.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;