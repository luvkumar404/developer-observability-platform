import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const eventTypeEnum = pgEnum("event_type", ["log", "error", "metric"]);
export const eventLevelEnum = pgEnum("event_level", ["debug", "info", "warn", "error", "fatal"]);

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    eventId: uuid("event_id").notNull(),
    type: eventTypeEnum("type").notNull(),
    level: eventLevelEnum("level"),
    message: text("message").notNull(),
    environment: varchar("environment", { length: 50 }).notNull(),
    timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
    attributes: jsonb("attributes").default({}).notNull(),
    receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("events_project_event_id_idx").on(table.projectId, table.eventId),
    index("events_project_timestamp_idx").on(table.projectId, table.timestamp),
  ],
);
