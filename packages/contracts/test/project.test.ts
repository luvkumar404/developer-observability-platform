import { describe, expect, it } from "vitest";
import { createProjectSchema } from "../src/index.js";

describe("createProjectSchema", () => {
  it("accepts a valid project", () => {
    const result = createProjectSchema.safeParse({
      organizationId: "550e8400-e29b-41d4-a716-446655440000",
      name: "My API",
      slug: "my-api",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-UUID organizationId", () => {
    const result = createProjectSchema.safeParse({
      organizationId: "not-uuid",
      name: "My API",
      slug: "my-api",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with consecutive hyphens", () => {
    const result = createProjectSchema.safeParse({
      organizationId: "550e8400-e29b-41d4-a716-446655440000",
      name: "My API",
      slug: "my--api",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = createProjectSchema.safeParse({
      organizationId: "550e8400-e29b-41d4-a716-446655440000",
      name: "",
      slug: "my-api",
    });
    expect(result.success).toBe(false);
  });
});
