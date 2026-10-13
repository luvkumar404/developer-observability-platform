import { pgTable, pgEnum, uuid, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { alertRules } from "./alert-rules.js";
import { projects } from "./projects.js";

export const alertStatusEnum = pgEnum("alert_status", ["triggered", "resolved", "acknowledged"]);

export const alertHistory = pgTable(
  "alert_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    alertRuleId: uuid("alert_rule_id")
      .notNull()
      .references(() => alertRules.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    status: alertStatusEnum("status").notNull(),
    triggeredAt: timestamp("triggered_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    details: jsonb("details").default({}).notNull(),
  },
  (table) => [
    index("alert_history_alert_rule_id_idx").on(table.alertRuleId),
    index("alert_history_project_id_idx").on(table.projectId),
    index("alert_history_project_triggered_at_idx").on(table.projectId, table.triggeredAt),
  ],
);
