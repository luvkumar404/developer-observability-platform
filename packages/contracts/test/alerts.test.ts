import { describe, expect, it } from "vitest";
import { createAlertRuleSchema, alertStatusSchema, alertConditionSchema } from "../src/index.js";

describe("alertConditionSchema", () => {
  it("accepts a non-empty condition object", () => {
    const result = alertConditionSchema.safeParse({
      metric: "error_rate",
      threshold: 0.05,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty condition object", () => {
    const result = alertConditionSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("createAlertRuleSchema", () => {
  const valid = {
    projectId: "550e8400-e29b-41d4-a716-446655440000",
    name: "High error rate",
    condition: { metric: "error_rate", threshold: 0.05 },
  };

  it("accepts a valid alert rule with defaults", () => {
    const result = createAlertRuleSchema.parse(valid);
    expect(result.enabled).toBe(true);
    expect(result.description).toBeUndefined();
  });

  it("accepts an explicit description and enabled flag", () => {
    const result = createAlertRuleSchema.parse({
      ...valid,
      description: "Fires when error rate exceeds 5%",
      enabled: false,
    });
    expect(result.description).toBe("Fires when error rate exceeds 5%");
    expect(result.enabled).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = createAlertRuleSchema.safeParse({
      ...valid,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a name exceeding 200 characters", () => {
    const result = createAlertRuleSchema.safeParse({
      ...valid,
      name: "x".repeat(201),
    });
    expect(result.success).toBe(false);
  });
});

describe("alertStatusSchema", () => {
  it.each(["triggered", "resolved", "acknowledged"] as const)("accepts status '%s'", (status) => {
    expect(alertStatusSchema.safeParse(status).success).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(alertStatusSchema.safeParse("pending").success).toBe(false);
  });
});
