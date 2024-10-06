import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database";

async function runMigrations(shouldDryRun: boolean) {
  if (typeof process.env.DATABASE_URL !== "string") {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const migrationsResult = await migrationRunner({
      dbClient: dbClient,
      direction: "up",
      dir: join("infra", "migrations"),
      dryRun: shouldDryRun,
      verbose: true,
      migrationsTable: "pgmigrations",
      singleTransaction: false,
    });

    const migrationsRan = migrationsResult.length > 0;

    return { migrationsResult, migrationsRan };
  } catch (error) {
    console.error(error);
    throw new Error("Error running migrations: " + error);
  } finally {
    if (dbClient) {
      await dbClient.end();
    }
  }
}

export async function GET() {
  const { migrationsResult } = await runMigrations(true);
  console.log(migrationsResult);
  return new Response(JSON.stringify(migrationsResult), {
    status: 200,
  });
}

export async function POST() {
  const { migrationsResult, migrationsRan } = await runMigrations(false);
  return new Response(JSON.stringify(migrationsResult), {
    status: migrationsRan ? 201 : 200,
  });
}
