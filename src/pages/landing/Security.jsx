const Security = () =>  {
  const securityItems = [
    {
      title: "Two-Factor Authentication",
      text: "Add another layer of protection to your account.",
    },
    {
      title: "Secure Sessions",
      text: "Authentication sessions are designed around secure token management.",
    },
    {
      title: "Account Protection",
      text: "Built with account monitoring and security controls in mind.",
    },
    {
      title: "Email Verification",
      text: "Verify account ownership before accessing protected features.",
    },
  ];

  return (
    <section className="border-y border-white/5 bg-[#040d18] py-24">
      <div className="section-container grid gap-14 lg:grid-cols-2">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-cyan-300">
            SECURITY
          </div>

          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
            Your Security
            <span className="block text-cyan-300">
              Comes First.
            </span>
          </h2>

          <p className="mt-6 max-w-lg leading-7 text-slate-400">
            Your trading journey needs more than powerful
            tools. It needs a secure foundation designed to
            protect your account and sensitive information.
          </p>

          <div className="mt-8 flex items-center gap-3 text-sm text-cyan-300">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/5">
              ✓
            </span>

            Security-focused infrastructure
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {securityItems.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/5 bg-[#071525] p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                ✓
              </div>

              <h3 className="mt-5 font-semibold">
                {item.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default Security;