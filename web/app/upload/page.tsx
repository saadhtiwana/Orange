import { TopNav } from "@/components/top-nav";

import { CvUpload } from "./cv-upload";

export const metadata = {
  title: "Upload CVs · Orange",
  description: "Drop in résumés — Orange parses and ranks them in the background.",
};

export default function UploadPage() {
  return (
    <div className="bg-paper flex min-h-screen flex-col text-[14px]">
      <TopNav />
      <CvUpload />
    </div>
  );
}
