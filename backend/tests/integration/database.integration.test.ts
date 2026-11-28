import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { Pool } from "pg";
import request from "supertest";
import {
  createDatabasePool,
  checkDatabaseConnection,
} from "../../src/db/createPool.js";
import { createApp } from "../../src/app.js";

function getTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL;

  if (!url) {
    throw new Error("TEST_DATABASE_URL is required");
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid TEST_DATABASE_URL");
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error("Invalid PostgreSQL protocol");
  }

  if (parsed.pathname !== "/workflow_test") {
    throw new Error("Integration tests must use workflow_test");
  }

  return url;
}

describe("PostgreSQL integration", () => {
  let testPool: Pool;

  beforeAll(async () => {
    const testDatabaseUrl = getTestDatabaseUrl();

    testPool = createDatabasePool(testDatabaseUrl, 5);

    const result = await testPool.query<{
      database_name: string;
    }>("SELECT current_database() AS database_name");

    if (result.rows[0]?.database_name !== "workflow_test") {
      throw new Error("Connected to an unexpected database");
    }
  }, 15_000);

  afterAll(async () => {
    await testPool?.end();
  }, 15_000);

  it("should successfully connect to PostgreSQL", async () => {
    const result = await testPool.query<{
      result: number;
    }>("SELECT 1 AS result");

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.result).toBe(1);
  }, 10_000);

  it("should connect to the dedicated test database", async () => {
    const result = await testPool.query<{
      database_name: string;
    }>("SELECT current_database() AS database_name");

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.database_name).toBe("workflow_test");
  }, 10_000);

  it("should return 200 when the database is available", async () => {
    const app = createApp({
      checkDatabase: () => checkDatabaseConnection(testPool),
    });

    const response = await request(app).get("/ready");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ready",
    });

    expect(response.headers["content-type"]).toMatch(/application\/json/);
  }, 10_000);
});
