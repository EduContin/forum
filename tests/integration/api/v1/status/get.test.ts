import { beforeAll, expect, test } from "vitest";
import orchestrator from "tests/orchestrator";

const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch(apiUrl + "/api/v1/status");

  expect(response.status).toBe(200);

  const responseBody = await response.json();

  // Check if the response body has the expected properties
  expect(responseBody.update_at).toBeDefined();

  // Check if the updatedAt property is a valid date
  const parsedUpdatedAt = new Date(responseBody.update_at).toISOString();
  expect(responseBody.update_at).toEqual(parsedUpdatedAt);

  expect(responseBody.dependencies.database.version).toEqual("16.3");
  expect(responseBody.dependencies.database.max_connections).toEqual(100);
  expect(responseBody.dependencies.database.opened_connections).toEqual(1);
});
