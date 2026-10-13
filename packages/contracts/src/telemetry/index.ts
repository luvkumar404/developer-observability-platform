import { z } from "zod";

/**
 * Telemetry event types.
 */
export const eventTypeSchema = z.enum(["log", "error", "metric"]);
export type EventType = z.infer<typeof eventTypeSchema>;

/**
 * Telemetry event severity levels.
 */
export const eventLevelSchema = z.enum(["debug", "info", "warn", "error", "fatal"]);
export type EventLevel = z.infer<typeof eventLevelSchema>;

/**
 * Maximum sizes for telemetry payloads.
 */
const MAX_MESSAGE_LENGTH = 4096;
const MAX_ATTRIBUTES_KEYS = 64;

/**
 * Flexible JSONB attributes with size guard.
 */
export const attributesSchema = z
  .record(z.string(), z.unknown())
  .refine((attrs) => Object.keys(attrs).length <= MAX_ATTRIBUTES_KEYS, {
    message: `Attributes must have at most ${MAX_ATTRIBUTES_KEYS} keys`,
  });

/**
 * Single telemetry event payload.
 */
export const telemetryEventSchema = z.object({
  eventId: z.string().uuid(),
  type: eventTypeSchema,
  level: eventLevelSchema.nullish(),
  message: z.string().max(MAX_MESSAGE_LENGTH),
  environment: z.string().trim().min(1).max(50),
  timestamp: z.string().datetime(),
  attributes: attributesSchema.default({}),
});

export type TelemetryEvent = z.infer<typeof telemetryEventSchema>;

/**
 * Batched telemetry event submission.
 */
const MAX_BATCH_SIZE = 100;

export const telemetryBatchSchema = z.object({
  projectId: z.string().uuid(),
  events: z.array(telemetryEventSchema).min(1).max(MAX_BATCH_SIZE),
});

export type TelemetryBatch = z.infer<typeof telemetryBatchSchema>;
