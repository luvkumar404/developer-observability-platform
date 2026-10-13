import { z } from "zod";

/**
 * Membership roles.
 */
export const membershipRoleSchema = z.enum(["owner", "admin", "member"]);
export type MembershipRole = z.infer<typeof membershipRoleSchema>;

/**
 * Create organization request.
 */
export const createOrganizationSchema = z.object({
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

export type CreateOrganization = z.infer<typeof createOrganizationSchema>;

/**
 * Organization response.
 */
export const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Organization = z.infer<typeof organizationSchema>;
