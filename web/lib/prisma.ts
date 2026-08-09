/**
 * Prisma client singleton.
 *
 * Next.js hot-reloads modules in dev, which would otherwise open a new pool on
 * every edit until Postgres refuses connections. Stash the instance on
 * globalThis so reloads reuse it.
 */
import { PrismaClient } from "@/app/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
