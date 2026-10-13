import { z } from "zod";

/**
 * Reusable UUID v4 schema.
 */
export const uuidSchema = z.string().uuid();

/**
 * Pagination parameters for list endpoints.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Standard paginated response wrapper.
 */
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int(),
      limit: z.number().int(),
      total: z.number().int(),
      totalPages: z.number().int(),
    }),
  });

/**
 * Health check response — preserves Phase 1 contract.
 */
export const healthStatusSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  timestamp: z.string().datetime(),
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;

/**
 * Standard API error body — preserves Phase 1 contract.
 */
export const apiErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;

/**
 * Standard API success wrapper.
 */
export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
  });
