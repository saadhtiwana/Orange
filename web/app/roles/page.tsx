import { TopNav } from "@/components/top-nav";

import { RolesList } from "./roles-list";

export const metadata = {
  title: "Roles · Orange",
  description: "Open roles — describe one and Orange reads every CV against it.",
};

export default function RolesPage() {
  return (
    <div className="bg-paper flex min-h-screen flex-col text-[14px]">
      <TopNav active="ROLES" />
      <RolesList />
    </div>
  );
}
