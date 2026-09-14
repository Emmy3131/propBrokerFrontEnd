import { useState } from "react";
import Icon from "./Icon.jsx";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  const links = [
    ["Markets", "#markets"],
    ["Trading", "#platform"],
    ["Prop Firm", "#prop-firm"],
    ["Platform", "#platform"],
    ["About", "#about"],
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030914]/85 backdrop-blur-xl">
      <div className="section-container flex h-[72px] items-center justify-between">
        {/* LOGO */}

        <a href="#" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/50 bg-cyan-400/10 text-cyan-300">
            <Icon size={21}>
              <path d="M12 3 20 7.5v9L12 21l-8-4.5v-9L12 3Z" />
              <path d="m8.5 10 3.5-2 3.5 2v4l-3.5 2-3.5-2v-4Z" />
            </Icon>
          </div>

          <div>
            <div className="text-base font-bold tracking-[0.18em]">
              EMMCORE
            </div>
            <div className="hidden text-[8px] tracking-[0.28em] text-slate-500 sm:block">
              TRADE. PROVE. SCALE.
            </div>
          </div>
        </a>

        {/* DESKTOP NAV */}

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* ACTIONS */}

        <div className="hidden items-center gap-3 sm:flex">
          <a
            href="/login"
            className="rounded-lg border border-cyan-400/30 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300 hover:bg-cyan-400/5"
          >
            Login
          </a>

          <a
            href="/signup"
            className="cyan-button rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-[#02111d] transition hover:bg-cyan-300"
          >
            Get Started
          </a>
        </div>

        {/* MOBILE BUTTON */}

        <button
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
          aria-label="Toggle navigation"
        >
          {open ? (
            <Icon>
              <path d="m6 6 12 12M18 6 6 18" />
            </Icon>
          ) : (
            <Icon>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </Icon>
          )}
        </button>
      </div>

      {/* MOBILE NAV */}

      {open && (
        <div className="border-t border-white/5 bg-[#030914] lg:hidden">
          <nav className="section-container flex flex-col gap-1 py-4">
            {links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
              >
                {label}
              </a>
            ))}

            <div className="mt-3 flex gap-3 border-t border-white/5 pt-4 sm:hidden">
              <a
                href="/login"
                className="flex-1 rounded-lg border border-white/10 px-4 py-3 text-center text-sm"
              >
                Login
              </a>

              <a
                href="/signup"
                className="flex-1 rounded-lg bg-cyan-400 px-4 py-3 text-center text-sm font-semibold text-[#02111d]"
              >
                Get Started
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default NavBar;