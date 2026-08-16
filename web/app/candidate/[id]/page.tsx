import { TopNav } from "@/components/top-nav";

import { CandidateAudit } from "./candidate-audit";

export const metadata = {
  title: "Candidate · Orange",
  description: "The full profile and the auditable reasoning behind the score.",
};

export default async function CandidatePage({ params }: PageProps<"/candidate/[id]">) {
  const { id } = await params;
  return (
    <div className="bg-paper flex min-h-screen flex-col text-[14px]">
      <TopNav active="CANDIDATES" />
      <CandidateAudit candidateId={id} />
    </div>
  );
}
