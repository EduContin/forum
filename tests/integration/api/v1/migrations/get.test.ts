config({ path: ".env.development" }); // This loads the .env.development file
import { config } from "dotenv";
import database from "infra/database";

import { beforeAll, expect, test } from "vitest";

import orchestrator from "tests/orchestrator";

const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("DROP SCHEMA public cascade; CREATE SCHEMA public;");
});

test("GET to /api/v1/migrations should return 200", async () => {
  const response = await fetch(`${apiUrl}/api/v1/migrations`);
  console.log(response);
  expect(response.status).toBe(200);

  const responseBody = await response.json();

  expect(Array.isArray(responseBody)).toBe(true);
  expect(responseBody.length).toBeGreaterThan(0);
});
