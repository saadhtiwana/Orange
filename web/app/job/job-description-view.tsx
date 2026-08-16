import { DisplayTitle } from "@/components/ui";
import type { JobDescription, Requirement } from "@/lib/contracts/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-line border-t pt-4">
      <h3 className="text-ink-3 mb-2 font-mono text-[10px] font-semibold tracking-[0.14em]">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-subtle border-line text-ink-2 rounded-xs border px-2 py-0.5 font-mono text-[10px]">
      {children}
    </span>
  );
}

function RequirementRow({ requirement }: { requirement: Requirement }) {
  const mustHave = requirement.importance === "must_have";
  return (
    <li className="flex items-center gap-3 py-2">
      <span className="text-[13.5px] font-semibold">{requirement.label}</span>
      <span
        className={
          mustHave
            ? "text-must-text bg-must-bg border-must-border rounded-xs border px-2 py-[2px] font-mono text-[8.5px] font-semibold tracking-[0.1em]"
            : "text-ink-3 border-line-2 rounded-xs border px-2 py-[2px] font-mono text-[8.5px] font-semibold tracking-[0.1em]"
        }
      >
        {mustHave ? "MUST" : "NICE"}
      </span>
      <span className="text-ink-2 ml-auto font-mono text-[11px] tabular-nums">
        {requirement.weight.toFixed(2)}
      </span>
    </li>
  );
}

/** Renders a contract-conforming JobDescription. Structure, not prose. */
export function JobDescriptionView({ jobDescription }: { jobDescription: JobDescription }) {
  const jd = jobDescription;
  const compensation = jd.compensation;
  const weightSum = (jd.requirements ?? []).reduce((sum, r) => sum + r.weight, 0);

  return (
    <article className="space-y-5 text-[13.5px]">
      <header>
        <DisplayTitle lead={jd.seniority} subject={jd.title} size={26} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill>{jd.employment_type}</Pill>
          <Pill>{jd.work_mode}</Pill>
          {(jd.locations ?? []).map((location) => (
            <Pill key={location}>{location}</Pill>
          ))}
        </div>
      </header>

      <p className="text-ink-2 leading-relaxed">{jd.summary}</p>

      {(jd.requirements ?? []).length > 0 && (
        <Section title={`REQUIREMENTS — ${jd.requirements!.length} · Σ ${weightSum.toFixed(2)}`}>
          <ul className="divide-line divide-y">
            {jd.requirements!.map((requirement) => (
              <RequirementRow key={requirement.id} requirement={requirement} />
            ))}
          </ul>
        </Section>
      )}

      {(jd.responsibilities ?? []).length > 0 && (
        <Section title="RESPONSIBILITIES">
          <ul className="text-ink-2 list-disc space-y-1 pl-5">
            {jd.responsibilities!.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="COMPENSATION">
        {compensation ? (
          <p className="text-ink-2">
            {[compensation.min, compensation.max].filter((v) => v != null).join(" – ") || "—"}{" "}
            {compensation.currency} per {compensation.period}
          </p>
        ) : (
          <p className="text-ink-3 italic">not discussed</p>
        )}
      </Section>

      {jd.meta && (
        <Section title="PROVENANCE">
          <p className="text-ink-3 font-mono text-[11px]">
            {jd.meta.model} · prompt v{jd.meta.prompt_version} · schema v{jd.schema_version}
          </p>
        </Section>
      )}
    </article>
  );
}
