"use client";

import { useState } from "react";

type Theme = "light" | "dark";

/** Light/dark toggle. Sets `data-theme` on <html>, which flips every design
 *  token in globals.css. Defaults to light; the click drives the switch. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="border-line-2 text-ink-2 hover:border-ink hover:text-ink inline-flex h-[34px] items-center rounded-full border px-4 font-mono text-[10px] font-medium tracking-[0.1em] transition-colors"
    >
      {theme === "dark" ? "LIGHT" : "DARK"}
    </button>
  );
}
