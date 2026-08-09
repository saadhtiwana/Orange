import type { JobDescription, Requirement } from "@/lib/contracts/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</h3>
      {children}
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
      {children}
    </span>
  );
}

function RequirementRow({ requirement }: { requirement: Requirement }) {
  const mustHave = requirement.importance === "must_have";

  return (
    <li className="flex items-baseline justify-between gap-3 py-1.5">
      <span className="flex items-baseline gap-2">
        <span
          className={
            mustHave
              ? "rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-orange-700 dark:bg-orange-950 dark:text-orange-400"
              : "rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] uppercase text-zinc-500 dark:bg-zinc-800"
          }
        >
          {mustHave ? "must" : "nice"}
        </span>
        <span>{requirement.label}</span>
        <span className="text-xs text-zinc-400">{requirement.kind}</span>
      </span>
      <span className="shrink-0 text-xs tabular-nums text-zinc-500">
        weight {requirement.weight.toFixed(2)}
      </span>
    </li>
  );
}

/** Renders a contract-conforming JobDescription. Structure, not prose. */
export function JobDescriptionView({ jobDescription }: { jobDescription: JobDescription }) {
  const jd = jobDescription;
  const compensation = jd.compensation;

  return (
    <article className="space-y-4 text-sm">
      <header>
        <h2 className="text-lg font-semibold">{jd.title}</h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Pill>{jd.seniority}</Pill>
          <Pill>{jd.employment_type}</Pill>
          <Pill>{jd.work_mode}</Pill>
          {(jd.locations ?? []).map((location) => (
            <Pill key={location}>{location}</Pill>
          ))}
        </div>
      </header>

      <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">{jd.summary}</p>

      {(jd.requirements ?? []).length > 0 && (
        <Section title={`Requirements (${jd.requirements!.length})`}>
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {jd.requirements!.map((requirement) => (
              <RequirementRow key={requirement.id} requirement={requirement} />
            ))}
          </ul>
        </Section>
      )}

      {(jd.responsibilities ?? []).length > 0 && (
        <Section title="Responsibilities">
          <ul className="list-disc space-y-1 pl-5 text-zinc-700 dark:text-zinc-300">
            {jd.responsibilities!.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      {compensation && (
        <Section title="Compensation">
          <p className="text-zinc-700 dark:text-zinc-300">
            {[compensation.min, compensation.max].filter((v) => v != null).join(" – ") || "—"}{" "}
            {compensation.currency} per {compensation.period}
          </p>
        </Section>
      )}

      {(jd.keywords ?? []).length > 0 && (
        <Section title="Keywords">
          <div className="flex flex-wrap gap-1.5">
            {jd.keywords!.map((keyword) => (
              <Pill key={keyword}>{keyword}</Pill>
            ))}
          </div>
        </Section>
      )}

      {jd.meta && (
        <Section title="Provenance">
          <p className="text-xs text-zinc-500">
            {jd.meta.model} · prompt v{jd.meta.prompt_version} · schema v{jd.schema_version}
          </p>
        </Section>
      )}
    </article>
  );
}
