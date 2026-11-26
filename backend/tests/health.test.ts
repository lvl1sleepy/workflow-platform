import { describe, it, expect, vi } from "vitest";
import request from "supertest";

import { createApp } from "../src/app.js";

describe("GET /health", () => {
  it("should return 200 and the correct response body", async () => {
    const checkDatabase = vi.fn(async () => {});

    const app = createApp({
      checkDatabase,
    });

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
    });

    expect(response.headers["content-type"]).toMatch(/application\/json/);

    expect(checkDatabase).not.toHaveBeenCalled();
  });

  it("should remain healthy when the database is unavailable", async () => {
    const checkDatabase = vi.fn(async () => {
      throw new Error("Database unavailable");
    });

    const app = createApp({
      checkDatabase,
    });

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
    });

    expect(checkDatabase).not.toHaveBeenCalled();
  });
});
