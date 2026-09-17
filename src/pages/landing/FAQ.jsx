import { useState } from "react";

const FAQ = () => {
  const [active, setActive] = useState(null);

  const questions = [
    [
      "What is EmmCore Broker?",
      "EmmCore is being built as a modern trading infrastructure combining broker services and prop-firm opportunities.",
    ],
    [
      "What markets can I trade?",
      "The platform is being designed to support markets such as forex, crypto, indices and commodities.",
    ],
    [
      "What is the Prop Firm?",
      "The prop-firm side is designed around trading evaluations where traders demonstrate their strategy and risk management.",
    ],
    [
      "How does the challenge work?",
      "A challenge evaluates trading performance against defined rules such as profit targets and drawdown limits.",
    ],
    [
      "How do withdrawals work?",
      "Withdrawal functionality will be available through the authenticated trader dashboard once the relevant trading and payment infrastructure is implemented.",
    ],
    [
      "Is two-factor authentication available?",
      "Yes. Two-factor authentication is part of the platform security architecture being implemented.",
    ],
  ];

  return (
    <section className="py-24">
      <div className="section-container grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
            FAQ
          </div>

          <h2 className="mt-4 text-4xl font-bold">
            Frequently Asked
            <span className="block text-cyan-300">
              Questions.
            </span>
          </h2>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            Everything you need to know about the EmmCore
            trading ecosystem.
          </p>
        </div>

        <div className="space-y-2">
          {questions.map(([question, answer], index) => {
            const isOpen = active === index;

            return (
              <div
                key={question}
                className="overflow-hidden rounded-xl border border-white/5 bg-[#071525]"
              >
                <button
                  onClick={() =>
                    setActive(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-5 px-5 py-4 text-left text-sm font-medium"
                >
                  <span>{question}</span>

                  <span className="text-lg text-cyan-300">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-white/5 px-5 py-4 text-sm leading-6 text-slate-500">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQ;