-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "employment_type" TEXT NOT NULL,
    "work_mode" TEXT NOT NULL,
    "locations" TEXT[],
    "summary" TEXT NOT NULL,
    "document" JSONB NOT NULL,
    "schema_version" TEXT NOT NULL,
    "model" TEXT,
    "prompt_version" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "jobs_created_at_idx" ON "jobs"("created_at");
