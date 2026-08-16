import { TopNav } from "@/components/top-nav";

import { JobArchitectChat } from "./job-architect-chat";

export const metadata = {
  title: "Job Architect · Orange",
  description: "Describe a role and get a structured job description.",
};

export default function JobArchitectPage() {
  return (
    <div className="bg-paper flex min-h-screen flex-col text-[14px]">
      <TopNav active="ROLES" />
      <main className="o-fade-in mx-auto w-full max-w-5xl px-10 pt-12 pb-24">
        <div className="flex items-baseline gap-3">
          <span className="text-ink-2 font-serif text-[38px] leading-none italic">Job</span>
          <span className="text-[32px] font-extrabold tracking-[-0.03em] lowercase">architect</span>
        </div>
        <p className="text-ink-3 mt-3 mb-10 max-w-xl text-[13.5px] leading-[1.6]">
          Describe the role in your own words. Orange turns it into the structured job description
          every candidate is scored against.
        </p>
        <JobArchitectChat />
      </main>
    </div>
  );
}
