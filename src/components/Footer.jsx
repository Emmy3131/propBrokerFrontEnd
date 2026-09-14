 import { useState } from "react";

const Footer = () => {
  return (
    <footer className="bg-[#020812] pt-16 pb-8">
      <div className="section-container">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}

          <div>
            <a href="#" className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300">
                ◇
              </div>

              <span className="font-bold tracking-[0.18em]">
                EMMCORE
              </span>
            </a>

            <p className="mt-5 max-w-xs text-sm leading-6 text-slate-600">
              Modern trading infrastructure for traders
              looking to trade, prove and scale.
            </p>
          </div>

          {/* Markets */}

          <div>
            <h3 className="text-sm font-semibold">
              Markets
            </h3>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <a className="block hover:text-cyan-300" href="#markets">
                Forex
              </a>
              <a className="block hover:text-cyan-300" href="#markets">
                Crypto
              </a>
              <a className="block hover:text-cyan-300" href="#markets">
                Indices
              </a>
              <a className="block hover:text-cyan-300" href="#markets">
                Commodities
              </a>
            </div>
          </div>

          {/* Prop */}

          <div>
            <h3 className="text-sm font-semibold">
              Prop Firm
            </h3>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <a className="block hover:text-cyan-300" href="#prop-firm">
                Challenges
              </a>
              <a className="block hover:text-cyan-300" href="#prop-firm">
                Accounts
              </a>
              <a className="block hover:text-cyan-300" href="#prop-firm">
                Rules
              </a>
              <a className="block hover:text-cyan-300" href="#prop-firm">
                FAQ
              </a>
            </div>
          </div>

          {/* Company */}

          <div>
            <h3 className="text-sm font-semibold">
              Company
            </h3>

            <div className="mt-5 space-y-3 text-sm text-slate-600">
              <a className="block hover:text-cyan-300" href="#about">
                About
              </a>
              <a className="block hover:text-cyan-300" href="#security">
                Security
              </a>
              <a className="block hover:text-cyan-300" href="#">
                Contact
              </a>
              <a className="block hover:text-cyan-300" href="#">
                Terms
              </a>
              <a className="block hover:text-cyan-300" href="#">
                Privacy
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/5 pt-7 text-xs text-slate-700 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © 2026 EmmCore Global Networks. All rights
            reserved.
          </span>

          <span>
            Trade. Prove. Scale.
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;