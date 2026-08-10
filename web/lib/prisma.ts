/**
 * Prisma client singleton.
 *
 * Prisma 7 connects through a driver adapter rather than a connection string
 * on the client — `datasourceUrl` no longer exists.
 *
 * Next.js hot-reloads modules in dev, which would otherwise open a new pool on
 * every edit until Postgres refuses connections. Stash the instance on
 * globalThis so reloads reuse it.
 */
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Copy .env.example to .env.");
  }

  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
