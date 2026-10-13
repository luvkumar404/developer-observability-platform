import { describe, expect, it, beforeEach } from "vitest";
import {
  dbEnvSchema,
  createHttpClient,
  createTransactionClient,
  getDb,
  getTransactionDb,
  closeDb,
} from "../src/index.js";

describe("Database client configuration and initialization", () => {
  beforeEach(async () => {
    await closeDb();
    delete process.env.DATABASE_URL;
  });

  it("validates valid PostgreSQL connection strings", () => {
    const valid = "postgresql://user:pass@ep-test.us-east-2.aws.neon.tech/neondb?sslmode=require";
    const result = dbEnvSchema.safeParse({ DATABASE_URL: valid });
    expect(result.success).toBe(true);
  });

  it("validates postgres:// protocol alias", () => {
    const valid = "postgres://user:pass@localhost:5432/test";
    const result = dbEnvSchema.safeParse({ DATABASE_URL: valid });
    expect(result.success).toBe(true);
  });

  it("rejects non-postgres protocols", () => {
    const invalid = "mysql://user:pass@localhost:3306/db";
    const result = dbEnvSchema.safeParse({ DATABASE_URL: invalid });
    expect(result.success).toBe(false);
  });

  it("does not connect on module import", () => {
    // Importing client does not throw or initiate connections even if DATABASE_URL is missing
    expect(getDb).toBeDefined();
    expect(createHttpClient).toBeDefined();
  });

  it("throws descriptive error when getting client without DATABASE_URL", () => {
    expect(() => getDb()).toThrow(/Database connection string is required/);
    expect(() => getTransactionDb()).toThrow(/Database connection string is required/);
  });

  it("throws descriptive error when connection string is invalid format", () => {
    expect(() => getDb("invalid-url")).toThrow(/Invalid DATABASE_URL/);
  });

  it("initializes HTTP client when valid URL is supplied", () => {
    const client = createHttpClient("postgresql://user:pass@localhost:5432/db");
    expect(client).toBeDefined();
    expect(client.query).toBeDefined();
  });

  it("initializes transaction client when valid URL is supplied", () => {
    const { db, pool } = createTransactionClient("postgresql://user:pass@localhost:5432/db");
    expect(db).toBeDefined();
    expect(pool).toBeDefined();
    void pool.end();
  });

  it("reuses cached client singleton for identical URLs", () => {
    const url = "postgresql://user:pass@localhost:5432/db";
    const first = getDb(url);
    const second = getDb(url);
    expect(first).toBe(second);
  });

  it("closes and resets cached clients cleanly", async () => {
    const url = "postgresql://user:pass@localhost:5432/db";
    getDb(url);
    await expect(closeDb()).resolves.toBeUndefined();
  });
});
