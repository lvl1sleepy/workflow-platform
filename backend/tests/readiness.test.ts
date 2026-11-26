import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

describe("GET /ready", () => {
  it("should return 200 when the database is available", async () => {
    const checkDatabase = vi.fn(async () => {});

    const app = createApp({
      checkDatabase,
    });

    const response = await request(app).get("/ready");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ready",
    });

    expect(response.headers["content-type"]).toMatch(/application\/json/);

    expect(checkDatabase).toHaveBeenCalledTimes(1);
  });

  it("should return 503 when the database is unavailable", async () => {
    const checkDatabase = vi.fn(async () => {
      throw new Error("Database unavailable");
    });

    const app = createApp({
      checkDatabase,
    });

    const response = await request(app).get("/ready");

    expect(response.status).toBe(503);

    expect(response.body).toEqual({
      status: "not_ready",
    });

    expect(response.headers["content-type"]).toMatch(/application\/json/);

    expect(checkDatabase).toHaveBeenCalledTimes(1);
  });

  it("should become ready again after the database recovers", async () => {
    const checkDatabase = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error("Database unavailable"))
      .mockResolvedValueOnce(undefined);

    const app = createApp({
      checkDatabase,
    });

    const failedResponse = await request(app).get("/ready");

    expect(failedResponse.status).toBe(503);
    expect(failedResponse.body).toEqual({
      status: "not_ready",
    });

    const recoveredResponse = await request(app).get("/ready");

    expect(recoveredResponse.status).toBe(200);
    expect(recoveredResponse.body).toEqual({
      status: "ready",
    });

    expect(checkDatabase).toHaveBeenCalledTimes(2);
  });
});
