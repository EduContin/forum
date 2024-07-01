import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

// Shared function to run migrations
async function runMigrations(shouldDryRun: boolean) {
  if (typeof process.env.DATABASE_URL !== "string") {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  return await migrationRunner({
    databaseUrl: process.env.DATABASE_URL,
    direction: "up",
    dir: join("infra", "migrations"),
    dryRun: shouldDryRun,
    verbose: true,
    migrationsTable: "pgmigrations",
  });
}

export async function GET() {
  const migrations = await runMigrations(true);
  return Response.json(migrations);
}

export async function POST() {
  const migrations = await runMigrations(false);
  return Response.json(migrations);
}
