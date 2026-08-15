/**
 * Mock data for the pipeline API, hand-written in the shapes the real agents
 * will emit (lib/contracts/types.ts). Invariants the real system guarantees are
 * kept here too, enforced by fixtures.test.ts:
 *
 *  - every score references an existing job and candidate
 *  - every requirement_result references a requirement on the scored job
 *  - every evidence quote appears verbatim in the candidate's raw_text
 *
 * Two candidates (Ayesha, Daniel) deliberately have no score: freshly uploaded
 * CVs sit in the "applied" column while parsing and ranking run, and the UI
 * must render that state.
 */
import type { CandidateProfile, JobDescription, ScoreWithEvidence } from "@/lib/contracts/types";
import type { PipelineStage } from "@/lib/pipeline/types";

export const MOCK_JOB: JobDescription = {
  id: "job_mock_backend",
  schema_version: "1.0",
  title: "Senior Backend Engineer",
  summary:
    "Own the payments platform's core services: Python APIs on PostgreSQL, " +
    "processing transactions for merchants across Europe.",
  seniority: "senior",
  employment_type: "full_time",
  work_mode: "hybrid",
  locations: ["Berlin, Germany"],
  experience_years: { min: 5, max: null },
  requirements: [
    {
      id: "req_python_5y",
      kind: "skill",
      label: "Python, 5+ years",
      importance: "must_have",
      min_years: 5,
      weight: 0.3,
    },
    {
      id: "req_postgres",
      kind: "skill",
      label: "PostgreSQL in production",
      importance: "must_have",
      weight: 0.25,
    },
    {
      id: "req_api_design",
      kind: "skill",
      label: "REST API design and versioning",
      importance: "must_have",
      weight: 0.2,
    },
    {
      id: "req_payments",
      kind: "experience",
      label: "Payments or fintech domain experience",
      importance: "nice_to_have",
      weight: 0.15,
    },
    {
      id: "req_degree_cs",
      kind: "education",
      label: "Bachelor's in computer science or related field",
      importance: "nice_to_have",
      weight: 0.1,
    },
  ],
  responsibilities: [
    "Design and run the transaction-processing services",
    "Evolve the public merchant API without breaking integrations",
    "Mentor mid-level engineers on the platform team",
  ],
  keywords: ["python", "postgresql", "payments", "rest", "berlin"],
  meta: {
    generated_at: "2026-08-04T10:00:00Z",
    model: "mock",
    prompt_version: "0.0-mock",
  },
};

export const MOCK_JOBS: JobDescription[] = [MOCK_JOB];

export const MOCK_CANDIDATES: CandidateProfile[] = [
  {
    id: "cand_01",
    schema_version: "1.0",
    full_name: "Lena Hoffmann",
    headline: "Backend engineer — payments infrastructure",
    summary: "Eight years building Python services for payment processing.",
    location: { city: "Berlin", country: "Germany", timezone: "Europe/Berlin" },
    emails: ["lena.hoffmann@example.com"],
    total_years_experience: 8,
    skills: [
      { name: "Python", years: 8 },
      { name: "PostgreSQL", years: 7 },
      { name: "FastAPI", years: 4 },
      { name: "Kafka", years: 3 },
    ],
    work_experience: [
      {
        company: "Zahlwerk",
        title: "Senior Backend Engineer",
        start: "2021-03",
        is_current: true,
        location: "Berlin",
        highlights: [
          "Led the Python team that rebuilt SEPA payment processing on PostgreSQL",
          "Designed the versioned merchant REST API used by 2,000+ integrations",
        ],
        skills: ["Python", "PostgreSQL", "FastAPI"],
      },
    ],
    education: [
      {
        institution: "TU Berlin",
        degree_level: "master",
        field: "Computer Science",
        end: "2018",
      },
    ],
    logistics: { open_to_remote: true, notice_period: "3 months" },
    source: {
      file_name: "lena_hoffmann_cv.pdf",
      file_type: "pdf",
      parsed_at: "2026-08-08T09:12:00Z",
    },
    raw_text:
      "Lena Hoffmann — Backend engineer, payments infrastructure. Berlin.\n" +
      "Zahlwerk (2021–present), Senior Backend Engineer.\n" +
      "Led the Python team that rebuilt SEPA payment processing on PostgreSQL.\n" +
      "Designed the versioned merchant REST API used by 2,000+ integrations.\n" +
      "Eight years of Python in production.\n" +
      "MSc Computer Science, TU Berlin, 2018.",
  },
  {
    id: "cand_02",
    schema_version: "1.0",
    full_name: "Tariq Mahmood",
    headline: "Staff engineer, core banking APIs",
    summary: "Platform engineer with a decade across fintech backends.",
    location: { city: "Munich", country: "Germany", timezone: "Europe/Berlin" },
    emails: ["tariq.mahmood@example.com"],
    total_years_experience: 10,
    skills: [
      { name: "Python", years: 9 },
      { name: "PostgreSQL", years: 8 },
      { name: "Django", years: 6 },
      { name: "AWS", years: 5 },
    ],
    work_experience: [
      {
        company: "Finlayer",
        title: "Staff Engineer",
        start: "2019-06",
        is_current: true,
        location: "Munich",
        highlights: [
          "Owns the core banking REST API, nine years of Python behind it",
          "Scaled a PostgreSQL ledger to 40M transactions a month",
        ],
        skills: ["Python", "PostgreSQL", "Django"],
      },
    ],
    education: [
      {
        institution: "LUMS",
        degree_level: "bachelor",
        field: "Computer Science",
        end: "2015",
      },
    ],
    logistics: { open_to_remote: false, notice_period: "2 months" },
    source: {
      file_name: "tariq_mahmood_cv.pdf",
      file_type: "pdf",
      parsed_at: "2026-08-08T09:14:00Z",
    },
    raw_text:
      "Tariq Mahmood — Staff engineer, core banking APIs. Munich, willing to relocate to Berlin.\n" +
      "Finlayer (2019–present), Staff Engineer.\n" +
      "Owns the core banking REST API, nine years of Python behind it.\n" +
      "Scaled a PostgreSQL ledger to 40M transactions a month.\n" +
      "BSc Computer Science, LUMS, 2015.",
  },
  {
    id: "cand_03",
    schema_version: "1.0",
    full_name: "Priya Nair",
    headline: "Backend engineer — data-heavy products",
    summary: "Six years of Python services on PostgreSQL, mostly analytics products.",
    location: { city: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam" },
    emails: ["priya.nair@example.com"],
    total_years_experience: 6,
    skills: [
      { name: "Python", years: 6 },
      { name: "PostgreSQL", years: 5 },
      { name: "FastAPI", years: 3 },
      { name: "Airflow", years: 4 },
    ],
    work_experience: [
      {
        company: "Graphlake",
        title: "Backend Engineer",
        start: "2020-01",
        is_current: true,
        location: "Amsterdam",
        highlights: [
          "Six years of Python building FastAPI services on PostgreSQL",
          "Runs the query API serving 300 enterprise dashboards",
        ],
        skills: ["Python", "PostgreSQL", "FastAPI"],
      },
    ],
    education: [
      {
        institution: "University of Amsterdam",
        degree_level: "master",
        field: "Artificial Intelligence",
        end: "2019",
      },
    ],
    logistics: { open_to_remote: true, requires_sponsorship: false },
    source: {
      file_name: "priya_nair_cv.pdf",
      file_type: "pdf",
      parsed_at: "2026-08-08T09:16:00Z",
    },
    raw_text:
      "Priya Nair — Backend engineer, data-heavy products. Amsterdam.\n" +
      "Graphlake (2020–present), Backend Engineer.\n" +
      "Six years of Python building FastAPI services on PostgreSQL.\n" +
      "Runs the query API serving 300 enterprise dashboards.\n" +
      "No payments background.\n" +
      "MSc Artificial Intelligence, University of Amsterdam, 2019.",
  },
  {
    id: "cand_04",
    schema_version: "1.0",
    full_name: "Jonas Weber",
    headline: "Full-stack developer leaning backend",
    summary: "Five years of Django work, one checkout integration project.",
    location: { city: "Leipzig", country: "Germany", timezone: "Europe/Berlin" },
    emails: ["jonas.weber@example.com"],
    total_years_experience: 5,
    skills: [
      { name: "Python", years: 5 },
      { name: "Django", years: 5 },
      { name: "PostgreSQL", years: 4 },
      { name: "React", years: 3 },
    ],
    work_experience: [
      {
        company: "Kaufbar",
        title: "Full-stack Developer",
        start: "2021-09",
        is_current: true,
        location: "Leipzig",
        highlights: [
          "Five years of Python and Django on an e-commerce monolith",
          "Integrated the Stripe checkout flow and its webhook handling",
        ],
        skills: ["Python", "Django", "PostgreSQL"],
      },
    ],
    education: [
      {
        institution: "HTWK Leipzig",
        degree_level: "bachelor",
        field: "Media Informatics",
        end: "2020",
      },
    ],
    logistics: { open_to_remote: true },
    source: {
      file_name: "jonas_weber_cv.pdf",
      file_type: "pdf",
      parsed_at: "2026-08-08T09:18:00Z",
    },
    raw_text:
      "Jonas Weber — Full-stack developer leaning backend. Leipzig.\n" +
      "Kaufbar (2021–present), Full-stack Developer.\n" +
      "Five years of Python and Django on an e-commerce monolith.\n" +
      "Integrated the Stripe checkout flow and its webhook handling.\n" +
      "BSc Media Informatics, HTWK Leipzig, 2020.",
  },
  {
    id: "cand_05",
    schema_version: "1.0",
    full_name: "Sofia Ricci",
    headline: "Backend developer",
    summary: "Four years of Python, deep PostgreSQL, no payments exposure.",
    location: { city: "Milan", country: "Italy", timezone: "Europe/Rome" },
    emails: ["sofia.ricci@example.com"],
    total_years_experience: 4,
    skills: [
      { name: "Python", years: 4 },
      { name: "PostgreSQL", years: 4 },
      { name: "Flask", years: 3 },
    ],
    work_experience: [
      {
        company: "Logivia",
        title: "Backend Developer",
        start: "2022-02",
        is_current: true,
        location: "Milan",
        highlights: [
          "Four years of Python on logistics tracking services",
          "Tuned PostgreSQL partitioning for the shipment-events store",
        ],
        skills: ["Python", "PostgreSQL", "Flask"],
      },
    ],
    education: [
      {
        institution: "Politecnico di Milano",
        degree_level: "bachelor",
        field: "Computer Engineering",
        end: "2021",
      },
    ],
    logistics: { open_to_remote: true, requires_sponsorship: false },
    source: {
      file_name: "sofia_ricci_cv.pdf",
      file_type: "pdf",
      parsed_at: "2026-08-08T09:20:00Z",
    },
    raw_text:
      "Sofia Ricci — Backend developer. Milan.\n" +
      "Logivia (2022–present), Backend Developer.\n" +
      "Four years of Python on logistics tracking services.\n" +
      "Tuned PostgreSQL partitioning for the shipment-events store.\n" +
      "BSc Computer Engineering, Politecnico di Milano, 2021.",
  },
  {
    id: "cand_06",
    schema_version: "1.0",
    full_name: "Marek Kowalski",
    headline: "Frontend engineer exploring backend roles",
    summary: "Seven years of frontend work; backend experience limited to scripts.",
    location: { city: "Warsaw", country: "Poland", timezone: "Europe/Warsaw" },
    emails: ["marek.kowalski@example.com"],
    total_years_experience: 7,
    skills: [
      { name: "TypeScript", years: 7 },
      { name: "React", years: 6 },
      { name: "Python", years: 1 },
    ],
    work_experience: [
      {
        company: "Pixelform",
        title: "Senior Frontend Engineer",
        start: "2019-04",
        is_current: true,
        location: "Warsaw",
        highlights: [
          "Seven years of React and TypeScript product work",
          "Wrote occasional Python scripts for build tooling",
        ],
        skills: ["TypeScript", "React"],
      },
    ],
    education: [
      {
        institution: "Warsaw University of Technology",
        degree_level: "bachelor",
        field: "Computer Science",
        end: "2018",
      },
    ],
    logistics: { open_to_remote: true },
    source: {
      file_name: "marek_kowalski_cv.pdf",
      file_type: "pdf",
      parsed_at: "2026-08-08T09:22:00Z",
    },
    raw_text:
      "Marek Kowalski — Frontend engineer exploring backend roles. Warsaw.\n" +
      "Pixelform (2019–present), Senior Frontend Engineer.\n" +
      "Seven years of React and TypeScript product work.\n" +
      "Wrote occasional Python scripts for build tooling.\n" +
      "No production database experience listed.\n" +
      "BSc Computer Science, Warsaw University of Technology, 2018.",
  },
  {
    id: "cand_07",
    schema_version: "1.0",
    full_name: "Ayesha Khan",
    headline: "Software engineer — distributed systems",
    location: { city: "Berlin", country: "Germany", timezone: "Europe/Berlin" },
    emails: ["ayesha.khan@example.com"],
    total_years_experience: 6,
    skills: [
      { name: "Python", years: 6 },
      { name: "Go", years: 3 },
      { name: "PostgreSQL", years: 5 },
    ],
    work_experience: [
      {
        company: "Meshgrid",
        title: "Software Engineer",
        start: "2020-05",
        is_current: true,
        location: "Berlin",
        highlights: ["Builds Python services for a service-mesh control plane"],
        skills: ["Python", "Go", "PostgreSQL"],
      },
    ],
    education: [
      {
        institution: "NUST",
        degree_level: "bachelor",
        field: "Software Engineering",
        end: "2019",
      },
    ],
    source: {
      file_name: "ayesha_khan_cv.pdf",
      file_type: "pdf",
      parsed_at: "2026-08-10T17:41:00Z",
    },
    raw_text:
      "Ayesha Khan — Software engineer, distributed systems. Berlin.\n" +
      "Meshgrid (2020–present), Software Engineer.\n" +
      "Builds Python services for a service-mesh control plane.\n" +
      "BSc Software Engineering, NUST, 2019.",
  },
  {
    id: "cand_08",
    schema_version: "1.0",
    full_name: "Daniel Okafor",
    headline: "Backend engineer",
    location: { city: "London", country: "United Kingdom", timezone: "Europe/London" },
    emails: ["daniel.okafor@example.com"],
    total_years_experience: 5,
    skills: [
      { name: "Python", years: 5 },
      { name: "MySQL", years: 4 },
      { name: "Redis", years: 3 },
    ],
    work_experience: [
      {
        company: "Cartlane",
        title: "Backend Engineer",
        start: "2021-01",
        is_current: true,
        location: "London",
        highlights: ["Runs order-management Python services for a marketplace"],
        skills: ["Python", "MySQL"],
      },
    ],
    education: [
      {
        institution: "University of Lagos",
        degree_level: "bachelor",
        field: "Computer Science",
        end: "2020",
      },
    ],
    logistics: { requires_sponsorship: true },
    source: {
      file_name: "daniel_okafor_cv.pdf",
      file_type: "pdf",
      parsed_at: "2026-08-10T17:44:00Z",
    },
    raw_text:
      "Daniel Okafor — Backend engineer. London, requires visa sponsorship for Germany.\n" +
      "Cartlane (2021–present), Backend Engineer.\n" +
      "Runs order-management Python services for a marketplace.\n" +
      "BSc Computer Science, University of Lagos, 2020.",
  },
];

const SCORE_META = {
  model: "mock",
  prompt_version: "0.0-mock",
  scored_at: "2026-08-10T18:00:00Z",
} as const;

export const MOCK_SCORES: ScoreWithEvidence[] = [
  {
    schema_version: "1.0",
    job_id: "job_mock_backend",
    candidate_id: "cand_01",
    overall: { score: 92, band: "strong", confidence: 0.93 },
    summary:
      "Direct hit: senior payments engineer in Berlin with eight years of Python " +
      "on PostgreSQL and ownership of a versioned merchant API.",
    strengths: [
      "Payments domain depth at a Berlin fintech",
      "Owned a versioned public REST API at scale",
    ],
    gaps: ["Three-month notice period"],
    risks: [],
    dimensions: [
      {
        dimension: "skills",
        score: 95,
        weight: 0.4,
        rationale: "Python, PostgreSQL, and API design all exceed the bar.",
        evidence: [
          {
            quote: "Led the Python team that rebuilt SEPA payment processing on PostgreSQL",
            locator: "work_experience[0].highlights[0]",
            confidence: 0.95,
            polarity: "supports",
            requirement_id: "req_python_5y",
          },
          {
            quote: "Designed the versioned merchant REST API used by 2,000+ integrations",
            locator: "work_experience[0].highlights[1]",
            confidence: 0.92,
            polarity: "supports",
            requirement_id: "req_api_design",
          },
        ],
      },
      {
        dimension: "experience",
        score: 94,
        weight: 0.3,
        rationale: "Eight years total, five in payments specifically.",
        evidence: [
          {
            quote: "Eight years of Python in production.",
            locator: "raw_text",
            confidence: 0.9,
            polarity: "supports",
            requirement_id: "req_python_5y",
          },
        ],
      },
      {
        dimension: "education",
        score: 90,
        weight: 0.15,
        rationale: "MSc in Computer Science from TU Berlin.",
      },
      {
        dimension: "logistics",
        score: 85,
        weight: 0.15,
        rationale: "Already in Berlin; notice period is the only friction.",
      },
    ],
    requirement_results: [
      { requirement_id: "req_python_5y", met: "yes" },
      { requirement_id: "req_postgres", met: "yes" },
      { requirement_id: "req_api_design", met: "yes" },
      { requirement_id: "req_payments", met: "yes" },
      { requirement_id: "req_degree_cs", met: "yes" },
    ],
    meta: SCORE_META,
  },
  {
    schema_version: "1.0",
    job_id: "job_mock_backend",
    candidate_id: "cand_02",
    overall: { score: 88, band: "strong", confidence: 0.9 },
    summary:
      "Ten-year fintech platform engineer who owns a core banking API on a " +
      "high-volume PostgreSQL ledger; based in Munich, open to relocating.",
    strengths: ["Core banking API ownership", "PostgreSQL at 40M transactions a month"],
    gaps: ["Not Berlin-based today"],
    risks: ["Relocation adds start-date uncertainty"],
    dimensions: [
      {
        dimension: "skills",
        score: 92,
        weight: 0.4,
        rationale: "Nine years of Python and heavy production PostgreSQL.",
        evidence: [
          {
            quote: "Owns the core banking REST API, nine years of Python behind it",
            locator: "work_experience[0].highlights[0]",
            confidence: 0.93,
            polarity: "supports",
            requirement_id: "req_python_5y",
          },
          {
            quote: "Scaled a PostgreSQL ledger to 40M transactions a month",
            locator: "work_experience[0].highlights[1]",
            confidence: 0.94,
            polarity: "supports",
            requirement_id: "req_postgres",
          },
        ],
      },
      {
        dimension: "experience",
        score: 93,
        weight: 0.3,
        rationale: "A decade in fintech backends, above the five-year minimum.",
      },
      {
        dimension: "education",
        score: 85,
        weight: 0.15,
        rationale: "BSc in Computer Science.",
      },
      {
        dimension: "logistics",
        score: 70,
        weight: 0.15,
        rationale: "Munich-based for a hybrid Berlin role; relocation stated.",
        evidence: [
          {
            quote: "Munich, willing to relocate to Berlin.",
            locator: "raw_text",
            confidence: 0.85,
            polarity: "supports",
          },
        ],
      },
    ],
    requirement_results: [
      { requirement_id: "req_python_5y", met: "yes" },
      { requirement_id: "req_postgres", met: "yes" },
      { requirement_id: "req_api_design", met: "yes" },
      { requirement_id: "req_payments", met: "yes" },
      { requirement_id: "req_degree_cs", met: "yes" },
    ],
    meta: SCORE_META,
  },
  {
    schema_version: "1.0",
    job_id: "job_mock_backend",
    candidate_id: "cand_03",
    overall: { score: 78, band: "good", confidence: 0.84 },
    summary:
      "Solid Python-on-PostgreSQL engineer with six years of API work, but no " +
      "payments background and based in Amsterdam.",
    strengths: ["Six years of FastAPI services on PostgreSQL"],
    gaps: ["No payments or fintech exposure"],
    risks: [],
    dimensions: [
      {
        dimension: "skills",
        score: 86,
        weight: 0.4,
        rationale: "Stack matches exactly: Python, FastAPI, PostgreSQL.",
        evidence: [
          {
            quote: "Six years of Python building FastAPI services on PostgreSQL.",
            locator: "raw_text",
            confidence: 0.91,
            polarity: "supports",
            requirement_id: "req_python_5y",
          },
        ],
      },
      {
        dimension: "experience",
        score: 72,
        weight: 0.3,
        rationale: "Above the experience bar, but in analytics, not payments.",
        evidence: [
          {
            quote: "No payments background.",
            locator: "raw_text",
            confidence: 0.88,
            polarity: "contradicts",
            requirement_id: "req_payments",
          },
        ],
      },
      {
        dimension: "education",
        score: 88,
        weight: 0.15,
        rationale: "MSc in Artificial Intelligence.",
      },
      {
        dimension: "logistics",
        score: 65,
        weight: 0.15,
        rationale: "Amsterdam-based; hybrid Berlin attendance unresolved.",
      },
    ],
    requirement_results: [
      { requirement_id: "req_python_5y", met: "yes" },
      { requirement_id: "req_postgres", met: "yes" },
      { requirement_id: "req_api_design", met: "yes" },
      { requirement_id: "req_payments", met: "no" },
      { requirement_id: "req_degree_cs", met: "yes" },
    ],
    meta: SCORE_META,
  },
  {
    schema_version: "1.0",
    job_id: "job_mock_backend",
    candidate_id: "cand_04",
    overall: { score: 74, band: "good", confidence: 0.8 },
    summary:
      "Meets the Python bar through Django monolith work and has touched " +
      "payments via a Stripe integration; API design depth is unproven.",
    strengths: ["Hands-on Stripe checkout and webhook integration"],
    gaps: ["No public API ownership", "Backend experience is monolith-shaped"],
    risks: ["Full-stack split may mean shallower backend depth"],
    dimensions: [
      {
        dimension: "skills",
        score: 74,
        weight: 0.4,
        rationale: "Five years of Python and Django; API design untested.",
        evidence: [
          {
            quote: "Five years of Python and Django on an e-commerce monolith.",
            locator: "raw_text",
            confidence: 0.87,
            polarity: "supports",
            requirement_id: "req_python_5y",
          },
        ],
      },
      {
        dimension: "experience",
        score: 76,
        weight: 0.3,
        rationale: "At the five-year minimum, with real checkout exposure.",
        evidence: [
          {
            quote: "Integrated the Stripe checkout flow and its webhook handling.",
            locator: "raw_text",
            confidence: 0.82,
            polarity: "supports",
            requirement_id: "req_payments",
          },
        ],
      },
      {
        dimension: "education",
        score: 70,
        weight: 0.15,
        rationale: "Bachelor's in Media Informatics, adjacent to CS.",
      },
      {
        dimension: "logistics",
        score: 78,
        weight: 0.15,
        rationale: "In Germany; Leipzig–Berlin hybrid is workable.",
      },
    ],
    requirement_results: [
      { requirement_id: "req_python_5y", met: "yes" },
      { requirement_id: "req_postgres", met: "yes" },
      { requirement_id: "req_api_design", met: "partial" },
      { requirement_id: "req_payments", met: "partial" },
      { requirement_id: "req_degree_cs", met: "partial" },
    ],
    meta: SCORE_META,
  },
  {
    schema_version: "1.0",
    job_id: "job_mock_backend",
    candidate_id: "cand_05",
    overall: { score: 66, band: "fair", confidence: 0.82 },
    summary:
      "Strong PostgreSQL fundamentals but a year short of the experience " +
      "minimum and no payments exposure.",
    strengths: ["PostgreSQL partitioning and tuning depth"],
    gaps: ["Four years of experience against a five-year minimum"],
    risks: [],
    dimensions: [
      {
        dimension: "skills",
        score: 78,
        weight: 0.4,
        rationale: "Good Python and notably deep PostgreSQL work.",
        evidence: [
          {
            quote: "Tuned PostgreSQL partitioning for the shipment-events store.",
            locator: "raw_text",
            confidence: 0.89,
            polarity: "supports",
            requirement_id: "req_postgres",
          },
        ],
      },
      {
        dimension: "experience",
        score: 52,
        weight: 0.3,
        rationale: "Four years total, below the stated minimum of five.",
        evidence: [
          {
            quote: "Four years of Python on logistics tracking services.",
            locator: "raw_text",
            confidence: 0.9,
            polarity: "contradicts",
            requirement_id: "req_python_5y",
          },
        ],
      },
      {
        dimension: "education",
        score: 80,
        weight: 0.15,
        rationale: "BSc in Computer Engineering.",
      },
      {
        dimension: "logistics",
        score: 60,
        weight: 0.15,
        rationale: "Milan-based; would need relocation for hybrid Berlin.",
      },
    ],
    requirement_results: [
      { requirement_id: "req_python_5y", met: "no" },
      { requirement_id: "req_postgres", met: "yes" },
      { requirement_id: "req_api_design", met: "partial" },
      { requirement_id: "req_payments", met: "no" },
      { requirement_id: "req_degree_cs", met: "yes" },
    ],
    meta: SCORE_META,
  },
  {
    schema_version: "1.0",
    job_id: "job_mock_backend",
    candidate_id: "cand_06",
    overall: { score: 41, band: "weak", confidence: 0.88 },
    summary:
      "Accomplished frontend engineer, but the role's core requirements — " +
      "production Python, PostgreSQL, API ownership — are absent.",
    strengths: ["Strong engineering track record, wrong specialty"],
    gaps: ["One year of Python, scripts only", "No production database work"],
    risks: ["Would be a retraining hire, not a senior backend hire"],
    dimensions: [
      {
        dimension: "skills",
        score: 30,
        weight: 0.4,
        rationale: "Python is limited to build tooling scripts.",
        evidence: [
          {
            quote: "Wrote occasional Python scripts for build tooling.",
            locator: "raw_text",
            confidence: 0.9,
            polarity: "contradicts",
            requirement_id: "req_python_5y",
          },
          {
            quote: "No production database experience listed.",
            locator: "raw_text",
            confidence: 0.85,
            polarity: "absent",
            requirement_id: "req_postgres",
          },
        ],
      },
      {
        dimension: "experience",
        score: 38,
        weight: 0.3,
        rationale: "Seven years of engineering, none of it backend-owned.",
      },
      {
        dimension: "education",
        score: 80,
        weight: 0.15,
        rationale: "BSc in Computer Science.",
      },
      {
        dimension: "logistics",
        score: 60,
        weight: 0.15,
        rationale: "Warsaw-based, remote-open; hybrid Berlin unclear.",
      },
    ],
    requirement_results: [
      { requirement_id: "req_python_5y", met: "no" },
      { requirement_id: "req_postgres", met: "no" },
      { requirement_id: "req_api_design", met: "no" },
      { requirement_id: "req_payments", met: "no" },
      { requirement_id: "req_degree_cs", met: "yes" },
    ],
    meta: SCORE_META,
  },
];

/** Where each candidate starts on the board. Unscored CVs sit in "applied". */
export const MOCK_STAGES: Record<string, PipelineStage> = {
  cand_01: "shortlisted",
  cand_02: "offer",
  cand_03: "shortlisted",
  cand_04: "interview",
  cand_05: "applied",
  cand_06: "rejected",
  cand_07: "applied",
  cand_08: "applied",
};
