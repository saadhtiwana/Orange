"use client";

import { FormEvent, useState } from "react";

type UploadSuccess = {
  candidateId: string;
  profileId: string;
};

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<UploadSuccess | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!file) {
      setError("Choose a PDF or DOCX file first.");
      return;
    }

    const body = new FormData();
    body.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body,
      });

      const data = (await response.json()) as {
        candidateId?: string;
        profileId?: string;
        error?: string;
      };

      if (!response.ok) {
        setError(data.error ?? `Upload failed (${response.status}).`);
        return;
      }

      if (!data.candidateId || !data.profileId) {
        setError("Upload succeeded but the server response was incomplete.");
        return;
      }

      setSuccess({
        candidateId: data.candidateId,
        profileId: data.profileId,
      });
      setFile(null);
    } catch {
      setError("Network error — could not reach the upload endpoint.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-6 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Upload CV</h1>
        <p className="mt-1 text-sm text-zinc-600">
          PDF or DOCX, max 10MB. Parsing comes in Week 2.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={loading}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setError(null);
            setSuccess(null);
          }}
          className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
        />

        <button
          type="submit"
          disabled={loading || !file}
          className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {loading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {success ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          <p className="font-medium">Upload saved.</p>
          <p className="mt-1 font-mono text-xs">candidateId: {success.candidateId}</p>
          <p className="font-mono text-xs">profileId: {success.profileId}</p>
        </div>
      ) : null}
    </main>
  );
}
