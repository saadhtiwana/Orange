import { JobArchitectChat } from "./job-architect-chat";

export const metadata = {
  title: "Job Architect · Orange",
  description: "Describe a role and get a structured job description.",
};

export default function JobArchitectPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <h1 className="text-xl font-semibold">Job Architect</h1>
      <p className="mb-8 mt-1 text-sm text-zinc-500">
        Describe the role in your own words. Orange turns it into the structured job description
        every candidate is scored against.
      </p>
      <JobArchitectChat />
    </main>
  );
}
