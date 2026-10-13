export * from "./users.js";
export * from "./organizations.js";
export * from "./memberships.js";
export * from "./projects.js";
export * from "./api-keys.js";
export * from "./events.js";
export * from "./error-groups.js";
export * from "./alert-rules.js";
export * from "./alert-history.js";

import type { users } from "./users.js";
import type { organizations } from "./organizations.js";
import type { memberships } from "./memberships.js";
import type { projects } from "./projects.js";
import type { apiKeys } from "./api-keys.js";
import type { events } from "./events.js";
import type { errorGroups } from "./error-groups.js";
import type { alertRules } from "./alert-rules.js";
import type { alertHistory } from "./alert-history.js";

// Inferred select models
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Membership = typeof memberships.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type Event = typeof events.$inferSelect;
export type ErrorGroup = typeof errorGroups.$inferSelect;
export type AlertRule = typeof alertRules.$inferSelect;
export type AlertHistory = typeof alertHistory.$inferSelect;

// Inferred insert models
export type NewUser = typeof users.$inferInsert;
export type NewOrganization = typeof organizations.$inferInsert;
export type NewMembership = typeof memberships.$inferInsert;
export type NewProject = typeof projects.$inferInsert;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type NewEvent = typeof events.$inferInsert;
export type NewErrorGroup = typeof errorGroups.$inferInsert;
export type NewAlertRule = typeof alertRules.$inferInsert;
export type NewAlertHistory = typeof alertHistory.$inferInsert;
