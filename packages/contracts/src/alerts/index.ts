import { z } from "zod";

/**
 * Alert rule condition — flexible JSONB.
 * Specific condition schema enforcement will be done at the application layer.
 */
export const alertConditionSchema = z
  .record(z.string(), z.unknown())
  .refine((cond) => Object.keys(cond).length > 0, { message: "Alert condition must not be empty" });

/**
 * Create alert rule request.
 */
export const createAlertRuleSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullish(),
  condition: alertConditionSchema,
  enabled: z.boolean().default(true),
});

export type CreateAlertRule = z.infer<typeof createAlertRuleSchema>;

/**
 * Alert rule response.
 */
export const alertRuleSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  condition: z.record(z.string(), z.unknown()),
  enabled: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type AlertRule = z.infer<typeof alertRuleSchema>;

/**
 * Alert history statuses.
 */
export const alertStatusSchema = z.enum(["triggered", "resolved", "acknowledged"]);
export type AlertStatus = z.infer<typeof alertStatusSchema>;
