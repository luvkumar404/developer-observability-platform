import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../src/app.js";

describe("health endpoints", () => {
  it("GET /health returns HTTP 200 with status, service, and timestamp", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual({
      status: "ok",
      service: "observability-api",
      timestamp: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(response.body.timestamp as string))).toBe(false);
  });

  it("GET /api/v1/health returns HTTP 200 with status, service, and timestamp", async () => {
    const response = await request(app).get("/api/v1/health");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual({
      status: "ok",
      service: "observability-api",
      timestamp: expect.any(String),
    });
    expect(Number.isNaN(Date.parse(response.body.timestamp as string))).toBe(false);
  });
});

describe("error handling", () => {
  it("returns HTTP 404 JSON for unknown routes", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "The requested resource was not found",
      },
    });
  });

  it("returns HTTP 400 JSON for malformed JSON request bodies", async () => {
    const response = await request(app)
      .post("/health")
      .set("Content-Type", "application/json")
      .send('{"invalid":');

    expect(response.status).toBe(400);
    expect(response.headers["content-type"]).toMatch(/json/);
    expect(response.body).toEqual({
      error: {
        code: "BAD_REQUEST",
        message: "Malformed JSON request body",
      },
    });
  });
});
