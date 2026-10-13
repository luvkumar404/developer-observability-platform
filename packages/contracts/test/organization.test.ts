import { describe, expect, it } from "vitest";
import { createOrganizationSchema, membershipRoleSchema } from "../src/index.js";

describe("createOrganizationSchema", () => {
  it("accepts a valid organization", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Acme Corp",
      slug: "acme-corp",
    });
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ name: "Acme Corp", slug: "acme-corp" });
  });

  it("trims whitespace from name", () => {
    const result = createOrganizationSchema.parse({
      name: "  Acme  ",
      slug: "acme",
    });
    expect(result.name).toBe("Acme");
  });

  it("rejects an empty name", () => {
    const result = createOrganizationSchema.safeParse({
      name: "",
      slug: "acme",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with uppercase letters", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Acme",
      slug: "Acme-Corp",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with leading hyphen", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Acme",
      slug: "-acme",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug with trailing hyphen", () => {
    const result = createOrganizationSchema.safeParse({
      name: "Acme",
      slug: "acme-",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slug shorter than 2 characters", () => {
    const result = createOrganizationSchema.safeParse({
      name: "A",
      slug: "a",
    });
    expect(result.success).toBe(false);
  });
});

describe("membershipRoleSchema", () => {
  it.each(["owner", "admin", "member"] as const)("accepts role '%s'", (role) => {
    const result = membershipRoleSchema.safeParse(role);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid role", () => {
    const result = membershipRoleSchema.safeParse("superadmin");
    expect(result.success).toBe(false);
  });
});
