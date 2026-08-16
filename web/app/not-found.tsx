import Link from "next/link";

import { OrangeLogo } from "@/components/orange-logo";

export default function NotFound() {
  return (
    <div className="bg-paper flex min-h-screen flex-col text-[14px]">
      <header className="border-line flex h-[60px] flex-none items-center px-10">
        <Link href="/roles" className="flex items-center gap-[9px]">
          <OrangeLogo />
          <span className="text-[17px] font-bold tracking-[-0.03em] lowercase">orange</span>
        </Link>
      </header>
      <main className="o-fade-in flex flex-1 flex-col items-center justify-center px-10 text-center">
        <div className="flex items-baseline gap-[10px]">
          <span className="text-ink-2 font-serif text-[40px] leading-none italic">Nothing</span>
          <span className="text-[34px] font-extrabold tracking-[-0.03em]">here</span>
        </div>
        <p className="text-ink-2 mt-3 max-w-sm text-[13px] leading-[1.6]">
          That page doesn&apos;t exist — nothing was deleted or moved.
        </p>
        <Link
          href="/roles"
          className="bg-signal hover:bg-signal-hover mt-6 inline-flex h-9 items-center rounded-lg px-[18px] font-mono text-[10.5px] font-semibold tracking-[0.08em] text-white transition-colors"
        >
          BACK TO ROLES
        </Link>
      </main>
    </div>
  );
}
