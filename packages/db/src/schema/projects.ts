import { pgTable, uuid, varchar, timestamp, uniqueIndex, index } from "drizzle-orm/pg-core";
import { organizations } from "./organizations.js";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 60 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("projects_org_slug_idx").on(table.organizationId, table.slug),
    index("projects_org_id_idx").on(table.organizationId),
  ],
);
