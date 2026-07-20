import { useState } from "react";

export default function Navbar({ active, sticky = false }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/analyze", label: "Analyze" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className={`border-b border-zinc-800 px-6 sm:px-12 py-4 ${sticky ? "sticky top-0 bg-black z-50" : ""}`}>
      <div className="flex items-center justify-between">
        <a href="/" className="text-xl font-semibold tracking-tight shrink-0">ClearModel</a>

        <div className="hidden sm:flex items-center gap-14 text-[15px] text-zinc-400">
          {links.map(({ href, label }) => {
            const isActive = active === href;
            return (
              <a key={href} href={href} className={isActive ? "text-white" : "hover:text-white transition"}>
                {label}
              </a>
            );
          })}
        </div>

        <button
          className="sm:hidden text-zinc-300 p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          )}
        </button>
      </div>

      {open && (
        <div className="sm:hidden mt-4 flex flex-col gap-1 pb-2">
          {links.map(({ href, label }) => {
            const isActive = active === href;
            const linkClass = isActive
              ? "px-2 py-3 rounded-lg text-sm text-white bg-zinc-900"
              : "px-2 py-3 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-900";
            return (
              <a key={href} href={href} className={linkClass}>
                {label}
              </a>
            );
          })}
        </div>
      )}
    </nav>
  );
}