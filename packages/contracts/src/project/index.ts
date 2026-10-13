import { z } from "zod";

/**
 * Create project request.
 */
export const createProjectSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().trim().min(1).max(100),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must be lowercase alphanumeric with hyphens, no leading/trailing hyphens",
    }),
});

export type CreateProject = z.infer<typeof createProjectSchema>;

/**
 * Project response.
 */
export const projectSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Project = z.infer<typeof projectSchema>;
