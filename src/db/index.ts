import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool | null;
  __arenaNextJsDb?: ReturnType<typeof drizzle> | null;
};

function createDb() {
  if (!databaseUrl) return null;
  try {
    const pool =
      globalForDb.__arenaNextJsPostgresqlPool ??
      new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 3000 });
    if (process.env.NODE_ENV !== "production") {
      globalForDb.__arenaNextJsPostgresqlPool = pool;
    }
    return drizzle(pool);
  } catch {
    return null;
  }
}

// db may be null when no DATABASE_URL is configured — all callers fall back to memory store
export const db = globalForDb.__arenaNextJsDb ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsDb = db;
}
