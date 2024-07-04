import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

// Assume migrationRunner returns an array of executed migrations or an empty array if none
async function runMigrations(shouldDryRun: boolean) {
  if (typeof process.env.DATABASE_URL !== "string") {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const dbClient = await database.getNewClient();

  const migrationsResult = await migrationRunner({
    dbClient: dbClient,
    direction: "up",
    dir: join("infra", "migrations"),
    dryRun: shouldDryRun,
    verbose: true,
    migrationsTable: "pgmigrations",
  });

  dbClient.end();

  // Assuming migrationsResult contains information to determine if migrations were run
  const migrationsRan = migrationsResult.length > 0;

  return { migrationsResult, migrationsRan };
}

export async function GET() {
  const { migrationsResult, migrationsRan } = await runMigrations(true);
  // Return 201 if migrations ran, otherwise 200
  return new Response(JSON.stringify(migrationsResult), {
    status: migrationsRan ? 201 : 200,
  });
}

export async function POST() {
  const { migrationsResult, migrationsRan } = await runMigrations(false);
  // Return 201 if migrations ran, otherwise 200
  return new Response(JSON.stringify(migrationsResult), {
    status: migrationsRan ? 201 : 200,
  });
}
