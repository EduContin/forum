import { config } from "dotenv";
config({ path: ".env.development" }); // This loads the .env.development file

import { beforeAll, expect, test } from "vitest";

import database from "infra/database";

beforeAll(async () => {
  await cleanDatabase();
});

async function cleanDatabase() {
  await database.query("DROP SCHEMA public cascade; CREATE SCHEMA public;");
}

test("GET to /api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");
  expect(response.status).toBe(201);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
});
