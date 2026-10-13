import { pgTable, uuid, varchar, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const apiKeys = pgTable(
  "api_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 100 }).notNull(),
    keyPrefix: varchar("key_prefix", { length: 16 }).notNull(),
    keyHash: varchar("key_hash", { length: 255 }).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("api_keys_key_hash_idx").on(table.keyHash),
    index("api_keys_project_id_idx").on(table.projectId),
  ],
);
