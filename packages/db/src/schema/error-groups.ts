import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const errorGroups = pgTable(
  "error_groups",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    fingerprint: varchar("fingerprint", { length: 255 }).notNull(),
    title: text("title").notNull(),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).defaultNow().notNull(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
    occurrenceCount: integer("occurrence_count").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("error_groups_project_fingerprint_idx").on(table.projectId, table.fingerprint),
    index("error_groups_project_id_idx").on(table.projectId),
  ],
);
