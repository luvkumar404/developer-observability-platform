import { pgEnum, pgTable, uuid, timestamp, primaryKey, uniqueIndex } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";
import { users } from "./users.js";

export const membershipRoleEnum = pgEnum("membership_role", ["owner", "admin", "member"]);

export const memberships = pgTable(
  "memberships",
  {
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: membershipRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.organizationId, table.userId] }),
    uniqueIndex("memberships_org_user_idx").on(table.organizationId, table.userId),
  ],
);
