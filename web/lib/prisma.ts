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

function getClient(): PrismaClient {
  globalForPrisma.prisma ??= createClient();
  return globalForPrisma.prisma;
}

/**
 * Lazily instantiated: importing this module must never read DATABASE_URL, so
 * the production build can collect route metadata without a database. The real
 * client is created on first property access (i.e. at request time).
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
