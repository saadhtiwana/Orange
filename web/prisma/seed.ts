import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Prisma } from "../app/generated/prisma/client";

/** Prisma Postgres local URLs (`prisma+postgres://...`) embed a TCP URL in api_key. */
function resolveConnectionString(url: string): string {
  if (!url.startsWith("prisma+postgres://")) return url;
  const apiKey = new URL(url).searchParams.get("api_key");
  if (!apiKey) {
    throw new Error("DATABASE_URL is prisma+postgres but missing api_key");
  }
  const decoded = JSON.parse(Buffer.from(apiKey, "base64").toString("utf8")) as {
    databaseUrl?: string;
  };
  if (!decoded.databaseUrl) {
    throw new Error("Could not decode databaseUrl from prisma+postgres api_key");
  }
  return decoded.databaseUrl;
}

const adapter = new PrismaPg({
  connectionString: resolveConnectionString(process.env.DATABASE_URL!),
});
const prisma = new PrismaClient({ adapter });

type SeedCandidate = {
  name: string;
  email: string;
  phone?: string;
  source: string;
  resumeUrl: string;
  rawText: string;
  parsedJson: Prisma.InputJsonValue;
  confidenceJson: Prisma.InputJsonValue;
};

const candidates: SeedCandidate[] = [
  {
    name: "Ayesha Khan",
    email: "ayesha.khan@email.com",
    phone: "+92-300-1112233",
    source: "linkedin",
    resumeUrl: "seed://resumes/ayesha-khan.pdf",
    rawText:
      "Ayesha Khan — Senior Software Engineer, Lahore. 6 years React/TypeScript/Node.",
    parsedJson: {
      skills: ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL", "AWS"],
      experience: [
        {
          company: "Careem",
          title: "Senior Software Engineer",
          duration: "2022–present",
          location: "Lahore, Pakistan",
        },
        {
          company: "Folio3",
          title: "Software Engineer",
          duration: "2019–2022",
          location: "Karachi, Pakistan",
        },
      ],
      education: [
        {
          school: "NUST",
          degree: "BS Computer Science",
          year: "2019",
        },
      ],
      location: "Lahore, Pakistan",
      yearsExperience: 6,
    },
    confidenceJson: { skills: 0.92, experience: 0.9, education: 0.95 },
  },
  {
    name: "Bilal Ahmed",
    email: "bilal.ahmed@email.com",
    phone: "+92-321-4455667",
    source: "referral",
    resumeUrl: "seed://resumes/bilal-ahmed.pdf",
    rawText:
      "Bilal Ahmed — Mid-level Backend Engineer, Islamabad. Python, FastAPI, Django.",
    parsedJson: {
      skills: ["Python", "FastAPI", "Django", "PostgreSQL", "Redis", "Docker"],
      experience: [
        {
          company: "Systems Limited",
          title: "Backend Engineer",
          duration: "2021–present",
          location: "Islamabad, Pakistan",
        },
        {
          company: "VentureDive",
          title: "Junior Backend Developer",
          duration: "2019–2021",
          location: "Islamabad, Pakistan",
        },
      ],
      education: [
        {
          school: "FAST-NUCES",
          degree: "BS Software Engineering",
          year: "2019",
        },
      ],
      location: "Islamabad, Pakistan",
      yearsExperience: 5,
    },
    confidenceJson: { skills: 0.9, experience: 0.88, education: 0.93 },
  },
  {
    name: "Hassan Raza",
    email: "hassan.raza@email.com",
    phone: "+92-333-7788990",
    source: "inbound",
    resumeUrl: "seed://resumes/hassan-raza.pdf",
    rawText:
      "Hassan Raza — Junior Full-Stack Developer, Karachi. Fresh grad + 1 year internship.",
    parsedJson: {
      skills: ["JavaScript", "React", "Express", "MongoDB", "Git"],
      experience: [
        {
          company: "10Pearls",
          title: "Software Engineering Intern",
          duration: "2024–2025",
          location: "Karachi, Pakistan",
        },
      ],
      education: [
        {
          school: "IBA Karachi",
          degree: "BS Computer Science",
          year: "2025",
        },
      ],
      location: "Karachi, Pakistan",
      yearsExperience: 1,
    },
    confidenceJson: { skills: 0.85, experience: 0.8, education: 0.94 },
  },
  {
    name: "Fatima Siddiqui",
    email: "fatima.siddiqui@email.com",
    phone: "+92-345-1122334",
    source: "linkedin",
    resumeUrl: "seed://resumes/fatima-siddiqui.pdf",
    rawText:
      "Fatima Siddiqui — Staff Engineer / Tech Lead, Lahore. Distributed systems.",
    parsedJson: {
      skills: [
        "Go",
        "Kubernetes",
        "gRPC",
        "PostgreSQL",
        "System Design",
        "TypeScript",
      ],
      experience: [
        {
          company: "Bykea",
          title: "Staff Software Engineer",
          duration: "2021–present",
          location: "Lahore, Pakistan",
        },
        {
          company: "Arbisoft",
          title: "Senior Software Engineer",
          duration: "2017–2021",
          location: "Lahore, Pakistan",
        },
        {
          company: "Tintash",
          title: "Software Engineer",
          duration: "2014–2017",
          location: "Lahore, Pakistan",
        },
      ],
      education: [
        {
          school: "LUMS",
          degree: "MS Computer Science",
          year: "2014",
        },
      ],
      location: "Lahore, Pakistan",
      yearsExperience: 11,
    },
    confidenceJson: { skills: 0.94, experience: 0.93, education: 0.96 },
  },
  {
    name: "Usman Ali",
    email: "usman.ali@email.com",
    phone: "+92-312-5566778",
    source: "job_board",
    resumeUrl: "seed://resumes/usman-ali.pdf",
    rawText:
      "Usman Ali — Mobile Engineer, Faisalabad. React Native and Flutter.",
    parsedJson: {
      skills: ["React Native", "Flutter", "Dart", "TypeScript", "Firebase"],
      experience: [
        {
          company: "Emumba",
          title: "Mobile Engineer",
          duration: "2020–present",
          location: "Islamabad (remote from Faisalabad)",
        },
        {
          company: "Freelance",
          title: "Android Developer",
          duration: "2018–2020",
          location: "Faisalabad, Pakistan",
        },
      ],
      education: [
        {
          school: "UET Lahore",
          degree: "BS Computer Engineering",
          year: "2018",
        },
      ],
      location: "Faisalabad, Pakistan",
      yearsExperience: 6,
    },
    confidenceJson: { skills: 0.89, experience: 0.87, education: 0.91 },
  },
  {
    name: "Sana Malik",
    email: "sana.malik@email.com",
    phone: "+92-301-9988776",
    source: "linkedin",
    resumeUrl: "seed://resumes/sana-malik.pdf",
    rawText:
      "Sana Malik — DevOps Engineer, Rawalpindi. CI/CD, AWS, Terraform.",
    parsedJson: {
      skills: ["AWS", "Terraform", "Kubernetes", "CI/CD", "Docker", "Python"],
      experience: [
        {
          company: "Contour Software",
          title: "DevOps Engineer",
          duration: "2021–present",
          location: "Rawalpindi, Pakistan",
        },
        {
          company: "NetSol Technologies",
          title: "Junior SRE",
          duration: "2019–2021",
          location: "Lahore, Pakistan",
        },
      ],
      education: [
        {
          school: "COMSATS Islamabad",
          degree: "BS Information Technology",
          year: "2019",
        },
      ],
      location: "Rawalpindi, Pakistan",
      yearsExperience: 5,
    },
    confidenceJson: { skills: 0.91, experience: 0.88, education: 0.92 },
  },
  {
    name: "Omar Farooq",
    email: "omar.farooq@email.com",
    phone: "+92-334-2233445",
    source: "referral",
    resumeUrl: "seed://resumes/omar-farooq.pdf",
    rawText:
      "Omar Farooq — Junior Frontend Developer, Peshawar. React + Tailwind.",
    parsedJson: {
      skills: ["HTML", "CSS", "JavaScript", "React", "Tailwind CSS"],
      experience: [
        {
          company: "CodeforPakistan",
          title: "Frontend Intern",
          duration: "2025–present",
          location: "Peshawar, Pakistan",
        },
      ],
      education: [
        {
          school: "UET Peshawar",
          degree: "BS Computer Science",
          year: "2025",
        },
      ],
      location: "Peshawar, Pakistan",
      yearsExperience: 0.5,
    },
    confidenceJson: { skills: 0.82, experience: 0.75, education: 0.9 },
  },
  {
    name: "Zainab Hussain",
    email: "zainab.hussain@email.com",
    phone: "+92-315-6677889",
    source: "inbound",
    resumeUrl: "seed://resumes/zainab-hussain.pdf",
    rawText:
      "Zainab Hussain — Data / ML Engineer, Karachi. Python, NLP, LLM apps.",
    parsedJson: {
      skills: ["Python", "PyTorch", "NLP", "LLMs", "FastAPI", "SQL"],
      experience: [
        {
          company: "Afiniti",
          title: "ML Engineer",
          duration: "2022–present",
          location: "Karachi, Pakistan",
        },
        {
          company: "Data Science Dojo",
          title: "Data Analyst",
          duration: "2020–2022",
          location: "Islamabad, Pakistan",
        },
      ],
      education: [
        {
          school: "NUST",
          degree: "MS Data Science",
          year: "2020",
        },
      ],
      location: "Karachi, Pakistan",
      yearsExperience: 5,
    },
    confidenceJson: { skills: 0.93, experience: 0.9, education: 0.95 },
  },
  {
    name: "Maria Iqbal",
    email: "maria.iqbal@email.com",
    phone: "+92-302-3344556",
    source: "linkedin",
    resumeUrl: "seed://resumes/maria-iqbal.pdf",
    rawText:
      "Maria Iqbal — Growth Marketing Manager, Lahore. B2B SaaS demand gen.",
    parsedJson: {
      skills: [
        "SEO",
        "Google Ads",
        "HubSpot",
        "Content Strategy",
        "Analytics",
        "A/B Testing",
      ],
      experience: [
        {
          company: "Retailo",
          title: "Growth Marketing Manager",
          duration: "2022–present",
          location: "Lahore, Pakistan",
        },
        {
          company: "Foodpanda",
          title: "Digital Marketing Specialist",
          duration: "2019–2022",
          location: "Karachi, Pakistan",
        },
      ],
      education: [
        {
          school: "LUMS",
          degree: "BSc Accounting & Finance",
          year: "2019",
        },
      ],
      location: "Lahore, Pakistan",
      yearsExperience: 6,
    },
    confidenceJson: { skills: 0.9, experience: 0.89, education: 0.94 },
  },
  {
    name: "Ali Raza Mir",
    email: "ali.mir@email.com",
    phone: "+92-323-8899001",
    source: "job_board",
    resumeUrl: "seed://resumes/ali-mir.pdf",
    rawText:
      "Ali Raza Mir — Brand Marketing Lead, Islamabad. Campaigns + creative ops.",
    parsedJson: {
      skills: [
        "Brand Strategy",
        "Campaign Management",
        "Social Media",
        "Copywriting",
        "Canva",
        "Meta Ads",
      ],
      experience: [
        {
          company: "Daraz",
          title: "Brand Marketing Lead",
          duration: "2021–present",
          location: "Islamabad, Pakistan",
        },
        {
          company: "Jazz",
          title: "Marketing Executive",
          duration: "2018–2021",
          location: "Islamabad, Pakistan",
        },
      ],
      education: [
        {
          school: "NUST Business School",
          degree: "BBA Marketing",
          year: "2018",
        },
      ],
      location: "Islamabad, Pakistan",
      yearsExperience: 7,
    },
    confidenceJson: { skills: 0.88, experience: 0.9, education: 0.93 },
  },
  {
    name: "Hira Nadeem",
    email: "hira.nadeem@email.com",
    phone: "+92-311-4455667",
    source: "referral",
    resumeUrl: "seed://resumes/hira-nadeem.pdf",
    rawText:
      "Hira Nadeem — Junior Marketing Associate, Multan. Content + community.",
    parsedJson: {
      skills: [
        "Content Writing",
        "Instagram",
        "Email Marketing",
        "Canva",
        "Google Analytics",
      ],
      experience: [
        {
          company: "Local startup (ShopLocal)",
          title: "Marketing Associate",
          duration: "2024–present",
          location: "Multan, Pakistan",
        },
        {
          company: "Freelance",
          title: "Social Media Intern",
          duration: "2023–2024",
          location: "Multan, Pakistan",
        },
      ],
      education: [
        {
          school: "Bahauddin Zakariya University",
          degree: "BS Mass Communication",
          year: "2023",
        },
      ],
      location: "Multan, Pakistan",
      yearsExperience: 2,
    },
    confidenceJson: { skills: 0.84, experience: 0.82, education: 0.9 },
  },
  {
    name: "Kamran Shah",
    email: "kamran.shah@email.com",
    phone: "+92-300-7788990",
    source: "inbound",
    resumeUrl: "seed://resumes/kamran-shah.pdf",
    rawText:
      "Kamran Shah — Operations Manager, Karachi. Logistics + vendor ops.",
    parsedJson: {
      skills: [
        "Operations Management",
        "Vendor Management",
        "Process Design",
        "Excel",
        "SQL",
        "OKRs",
      ],
      experience: [
        {
          company: "Airlift (alumni)",
          title: "Operations Manager",
          duration: "2020–2022",
          location: "Karachi, Pakistan",
        },
        {
          company: "Trax Logistics",
          title: "Ops Lead",
          duration: "2022–present",
          location: "Karachi, Pakistan",
        },
      ],
      education: [
        {
          school: "IBA Karachi",
          degree: "MBA Operations",
          year: "2020",
        },
      ],
      location: "Karachi, Pakistan",
      yearsExperience: 6,
    },
    confidenceJson: { skills: 0.87, experience: 0.91, education: 0.94 },
  },
  {
    name: "Nida Asghar",
    email: "nida.asghar@email.com",
    phone: "+92-333-5566778",
    source: "linkedin",
    resumeUrl: "seed://resumes/nida-asghar.pdf",
    rawText:
      "Nida Asghar — People Ops / Talent Coordinator, Lahore. ATS + campus hiring.",
    parsedJson: {
      skills: [
        "ATS",
        "Recruiting Ops",
        "Campus Hiring",
        "Onboarding",
        "Notion",
        "Excel",
      ],
      experience: [
        {
          company: "Bazaar Technologies",
          title: "Talent Coordinator",
          duration: "2022–present",
          location: "Lahore, Pakistan",
        },
        {
          company: "Educative",
          title: "HR Operations Associate",
          duration: "2020–2022",
          location: "Lahore, Pakistan",
        },
      ],
      education: [
        {
          school: "University of the Punjab",
          degree: "MSc Human Resource Management",
          year: "2020",
        },
      ],
      location: "Lahore, Pakistan",
      yearsExperience: 5,
    },
    confidenceJson: { skills: 0.86, experience: 0.88, education: 0.92 },
  },
  {
    name: "Taha Mehmood",
    email: "taha.mehmood@email.com",
    source: "job_board",
    resumeUrl: "seed://resumes/taha-mehmood.pdf",
    rawText:
      "Taha Mehmood — Product Marketing Manager, Islamabad. PLG + launch narratives.",
    parsedJson: {
      skills: [
        "Product Marketing",
        "Positioning",
        "Go-to-Market",
        "Customer Research",
        "Figma",
        "SQL",
      ],
      experience: [
        {
          company: "Tkxel",
          title: "Product Marketing Manager",
          duration: "2021–present",
          location: "Islamabad, Pakistan",
        },
        {
          company: "Folio3",
          title: "Product Marketing Associate",
          duration: "2018–2021",
          location: "Karachi, Pakistan",
        },
      ],
      education: [
        {
          school: "FAST-NUCES",
          degree: "BS Computer Science",
          year: "2018",
        },
      ],
      location: "Islamabad, Pakistan",
      yearsExperience: 7,
    },
    confidenceJson: { skills: 0.89, experience: 0.9, education: 0.93 },
  },
  {
    name: "Rabia Anwar",
    email: "rabia.anwar@email.com",
    phone: "+92-321-9900112",
    source: "referral",
    resumeUrl: "seed://resumes/rabia-anwar.pdf",
    rawText:
      "Rabia Anwar — Business Operations Analyst, Gujranwala. RevOps + reporting.",
    parsedJson: {
      skills: [
        "RevOps",
        "Salesforce",
        "Looker",
        "Process Automation",
        "Excel",
        "Stakeholder Management",
      ],
      experience: [
        {
          company: "KeepTruckin / Motive",
          title: "Business Operations Analyst",
          duration: "2021–present",
          location: "Islamabad (remote from Gujranwala)",
        },
        {
          company: "Packages Limited",
          title: "Operations Analyst",
          duration: "2019–2021",
          location: "Lahore, Pakistan",
        },
      ],
      education: [
        {
          school: "LUMS",
          degree: "BSc Economics",
          year: "2019",
        },
      ],
      location: "Gujranwala, Pakistan",
      yearsExperience: 6,
    },
    confidenceJson: { skills: 0.88, experience: 0.89, education: 0.95 },
  },
];

async function main() {
  console.log(`Seeding ${candidates.length} candidates with profiles...`);

  // Idempotent-ish for local dev: clear scores/profiles/candidates (keep Jobs untouched)
  await prisma.score.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.candidate.deleteMany();

  for (const c of candidates) {
    await prisma.candidate.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        source: c.source,
        profiles: {
          create: {
            resumeUrl: c.resumeUrl,
            rawText: c.rawText,
            parsedJson: c.parsedJson,
            confidenceJson: c.confidenceJson,
          },
        },
      },
    });
  }

  const count = await prisma.candidate.count();
  const profileCount = await prisma.profile.count();
  console.log(`Done. Candidates: ${count}, Profiles: ${profileCount}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
