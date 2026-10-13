import { describe, expect, it } from "vitest";
import {
  telemetryEventSchema,
  telemetryBatchSchema,
  eventTypeSchema,
  eventLevelSchema,
} from "../src/index.js";

describe("eventTypeSchema", () => {
  it.each(["log", "error", "metric"] as const)("accepts type '%s'", (type) => {
    expect(eventTypeSchema.safeParse(type).success).toBe(true);
  });

  it("rejects an unknown type", () => {
    expect(eventTypeSchema.safeParse("trace").success).toBe(false);
  });
});

describe("eventLevelSchema", () => {
  it.each(["debug", "info", "warn", "error", "fatal"] as const)("accepts level '%s'", (level) => {
    expect(eventLevelSchema.safeParse(level).success).toBe(true);
  });
});

describe("telemetryEventSchema", () => {
  const validEvent = {
    eventId: "550e8400-e29b-41d4-a716-446655440000",
    type: "log",
    level: "info",
    message: "User logged in",
    environment: "production",
    timestamp: "2024-06-01T12:00:00.000Z",
    attributes: { userId: "abc123" },
  };

  it("accepts a valid event", () => {
    const result = telemetryEventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
  });

  it("allows null level", () => {
    const result = telemetryEventSchema.safeParse({ ...validEvent, level: null });
    expect(result.success).toBe(true);
  });

  it("allows omitted level", () => {
    const { level: _, ...noLevel } = validEvent;
    const result = telemetryEventSchema.safeParse(noLevel);
    expect(result.success).toBe(true);
  });

  it("defaults attributes to empty object", () => {
    const { attributes: _, ...noAttrs } = validEvent;
    const result = telemetryEventSchema.parse(noAttrs);
    expect(result.attributes).toEqual({});
  });

  it("rejects a message exceeding 4096 characters", () => {
    const result = telemetryEventSchema.safeParse({
      ...validEvent,
      message: "x".repeat(4097),
    });
    expect(result.success).toBe(false);
  });

  it("rejects attributes with more than 64 keys", () => {
    const tooManyAttrs: Record<string, string> = {};
    for (let i = 0; i < 65; i++) {
      tooManyAttrs[`key${i}`] = `value${i}`;
    }
    const result = telemetryEventSchema.safeParse({
      ...validEvent,
      attributes: tooManyAttrs,
    });
    expect(result.success).toBe(false);
  });
});

describe("telemetryBatchSchema", () => {
  const validEvent = {
    eventId: "550e8400-e29b-41d4-a716-446655440000",
    type: "error" as const,
    message: "Something broke",
    environment: "staging",
    timestamp: "2024-06-01T12:00:00.000Z",
  };

  it("accepts a valid batch", () => {
    const result = telemetryBatchSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      events: [validEvent],
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty events array", () => {
    const result = telemetryBatchSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      events: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a batch exceeding 100 events", () => {
    const events = Array.from({ length: 101 }, (_, i) => ({
      ...validEvent,
      eventId: `550e8400-e29b-41d4-a716-4466554400${String(i).padStart(2, "0")}`,
    }));
    const result = telemetryBatchSchema.safeParse({
      projectId: "550e8400-e29b-41d4-a716-446655440000",
      events,
    });
    expect(result.success).toBe(false);
  });
});
