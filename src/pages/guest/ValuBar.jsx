const ValueBar = () => {
  const items = [
    {
      title: "Fast Execution",
      text: "Built for responsive trading workflows.",
    },
    {
      title: "Multi-Asset Access",
      text: "Forex, crypto, indices and commodities.",
    },
    {
      title: "Secure Infrastructure",
      text: "Designed around account protection.",
    },
  ];

  return (
    <section className="border-y border-cyan-400/10 bg-[#061525]">
      <div className="section-container grid md:grid-cols-3">
        {items.map((item, index) => (
          <div
            key={item.title}
            className={`flex gap-4 px-5 py-7 ${
              index !== 2
                ? "border-b border-white/5 md:border-b-0 md:border-r"
                : ""
            }`}
          >
            <div className="text-xl text-cyan-300">✦</div>

            <div>
              <h3 className="text-sm font-semibold">
                {item.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {item.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ValueBar;