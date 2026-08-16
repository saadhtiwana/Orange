import Link from "next/link";

import { OrangeLogo } from "./orange-logo";
import { ThemeToggle } from "./theme-toggle";
import { btn } from "./ui";

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: "Roles", href: "/roles" },
  { label: "Candidates", href: "/pipeline" },
  { label: "Activity", href: "/pipeline" },
];

/** App-wide top bar: logo, section nav, theme toggle, primary action. */
export function TopNav({ active }: { active?: string }) {
  return (
    <header className="border-line bg-card flex h-[60px] flex-none items-center gap-4 border-b px-5 md:gap-8 md:px-10">
      <Link href="/pipeline" className="flex items-center gap-[9px]">
        <OrangeLogo />
        <span className="text-[17px] font-bold tracking-[-0.03em] lowercase">orange</span>
      </Link>

      <nav className="hidden gap-7 text-[14px] font-semibold md:flex">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={
              active === item.label
                ? "text-signal-ink"
                : "text-ink-2 hover:text-signal-ink transition-colors duration-200"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-[10px]">
        <ThemeToggle />
        <Link href="/upload" className={btn("primary")}>
          Upload CVs
        </Link>
      </div>
    </header>
  );
}
