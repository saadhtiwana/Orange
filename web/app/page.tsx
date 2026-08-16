import { redirect } from "next/navigation";

export default function Home() {
  // Roles is the recruiter's home — the list of open roles they work from.
  redirect("/roles");
}
