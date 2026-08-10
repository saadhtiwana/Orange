import { redirect } from "next/navigation";

export default function Home() {
  // The Job Architect is the entry point to the product loop; there is no
  // separate landing page yet.
  redirect("/job");
}
