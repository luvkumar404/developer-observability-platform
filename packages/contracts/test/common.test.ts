import { describe, expect, it } from "vitest";
import {
  uuidSchema,
  paginationSchema,
  healthStatusSchema,
  apiErrorBodySchema,
} from "../src/index.js";

describe("uuidSchema", () => {
  it("accepts a valid UUID v4", () => {
    const result = uuidSchema.safeParse("550e8400-e29b-41d4-a716-446655440000");
    expect(result.success).toBe(true);
  });

  it("rejects an invalid UUID", () => {
    const result = uuidSchema.safeParse("not-a-uuid");
    expect(result.success).toBe(false);
  });

  it("rejects an empty string", () => {
    const result = uuidSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("paginationSchema", () => {
  it("applies defaults when no values are provided", () => {
    const result = paginationSchema.parse({});
    expect(result).toEqual({ page: 1, limit: 20 });
  });

  it("accepts valid page and limit", () => {
    const result = paginationSchema.parse({ page: "3", limit: "50" });
    expect(result).toEqual({ page: 3, limit: 50 });
  });

  it("rejects page < 1", () => {
    const result = paginationSchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = paginationSchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });
});

describe("healthStatusSchema", () => {
  it("accepts a valid health status", () => {
    const result = healthStatusSchema.safeParse({
      status: "ok",
      service: "observability-api",
      timestamp: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    const result = healthStatusSchema.safeParse({
      status: "down",
      service: "test",
      timestamp: "2024-01-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("apiErrorBodySchema", () => {
  it("accepts a valid error body", () => {
    const result = apiErrorBodySchema.safeParse({
      error: {
        code: "NOT_FOUND",
        message: "Resource not found",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing error code", () => {
    const result = apiErrorBodySchema.safeParse({
      error: { message: "oops" },
    });
    expect(result.success).toBe(false);
  });
});
