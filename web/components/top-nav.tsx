import Link from "next/link";

import { OrangeLogo } from "./orange-logo";
import { ThemeToggle } from "./theme-toggle";

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "ROLES", href: "/roles" },
  { label: "CANDIDATES", href: "/pipeline" },
  { label: "ACTIVITY", href: "/pipeline" },
];

/** App-wide top bar: logo, section nav, theme toggle, primary action. */
export function TopNav({ active }: { active?: string }) {
  return (
    <header className="border-line flex h-[60px] flex-none items-center gap-4 border-b px-5 md:gap-8 md:px-10">
      <Link href="/pipeline" className="flex items-center gap-[9px]">
        <OrangeLogo />
        <span className="text-[17px] font-bold tracking-[-0.03em] lowercase">orange</span>
      </Link>

      <nav className="hidden gap-[22px] font-mono text-[10px] font-medium tracking-[0.08em] md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={
              active === item.label ? "text-ink" : "text-ink-3 hover:text-ink transition-colors"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-[10px]">
        <ThemeToggle />
        <Link
          href="/upload"
          className="bg-signal hover:bg-signal-hover inline-flex h-9 items-center rounded-lg px-[18px] font-mono text-[10.5px] font-semibold tracking-[0.08em] text-white transition-colors"
        >
          UPLOAD CVS
        </Link>
      </div>
    </header>
  );
}
