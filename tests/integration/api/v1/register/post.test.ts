import { expect, beforeAll, test } from "vitest";
import { compare } from "bcrypt";
import database from "infra/database";
import orchestrator from "tests/orchestrator";

import { config } from "dotenv";
config({ path: ".env.development" });

beforeAll(async () => {
  await orchestrator.waitForAllServices();

  await fetch("http://localhost:3000/api/v1/migrations", {
    method: "POST",
  });

  await database.query("DELETE FROM users");
});

test("should register a user successfully and block duplicates", async () => {
  const mockRequest = {
    json: async () => ({
      username: "testuser",
      email: "test@test.com",
      password: "password123",
    }),
  };

  let response = await fetch("http://localhost:3000/api/v1/register", {
    method: "POST",
    body: JSON.stringify(await mockRequest.json()),
  });

  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({
    message: "User registered successfully",
  });

  // Verify that the user was inserted into the database
  const result = await database.query({
    text: "SELECT * FROM users WHERE username = $1",
    values: ["testuser"],
  });
  expect(result.rows.length).toBe(1);
  expect(result.rows[0].username).toBe("testuser");
  expect(result.rows[0].email).toBe("test@test.com");

  // Verify that the password was hashed correctly
  const storedPassword = result.rows[0].password;
  const isPasswordValid = await compare("password123", storedPassword);
  expect(isPasswordValid).toBe(true);

  response = await fetch("http://localhost:3000/api/v1/register", {
    method: "POST",
    body: JSON.stringify(await mockRequest.json()),
  });

  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({
    message: "Registration failed",
  });
});
