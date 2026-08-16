import Link from "next/link";

import { OrangeLogo } from "@/components/orange-logo";
import { btn, DisplayTitle } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="bg-paper flex min-h-screen flex-col text-[14px]">
      <header className="border-line bg-card flex h-[60px] flex-none items-center border-b px-10">
        <Link href="/roles" className="flex items-center gap-[9px]">
          <OrangeLogo />
          <span className="text-[17px] font-bold tracking-[-0.03em] lowercase">orange</span>
        </Link>
      </header>
      <main className="o-fade-in flex flex-1 flex-col items-center justify-center px-10 text-center">
        <DisplayTitle lead="Nothing" subject="here" size={34} className="justify-center" />
        <p className="text-ink-2 mt-3 max-w-sm text-[13px] leading-[1.6]">
          That page doesn&apos;t exist — nothing was deleted or moved.
        </p>
        <Link href="/roles" className={btn("primary", "mt-6")}>
          Back to roles
        </Link>
      </main>
    </div>
  );
}
