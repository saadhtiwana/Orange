import { TopNav } from "@/components/top-nav";

import { PipelineBoard } from "./pipeline-board";

export const metadata = {
  title: "Pipeline · Orange",
  description: "The hiring pipeline — candidates ranked and moved across stages.",
};

export default function PipelinePage() {
  return (
    <div className="bg-paper flex h-screen flex-col overflow-hidden text-[14px]">
      <TopNav active="ROLES" />
      <PipelineBoard />
    </div>
  );
}
