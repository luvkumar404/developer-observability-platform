import { describe, expect, it } from "vitest";
import { getTableColumns, getTableName } from "drizzle-orm";
import {
  users,
  organizations,
  memberships,
  projects,
  apiKeys,
  events,
  errorGroups,
  alertRules,
  alertHistory,
  membershipRoleEnum,
  eventTypeEnum,
  eventLevelEnum,
  alertStatusEnum,
} from "../src/index.js";

describe("Database schema definitions", () => {
  it("defines correct table names", () => {
    expect(getTableName(users)).toBe("users");
    expect(getTableName(organizations)).toBe("organizations");
    expect(getTableName(memberships)).toBe("memberships");
    expect(getTableName(projects)).toBe("projects");
    expect(getTableName(apiKeys)).toBe("api_keys");
    expect(getTableName(events)).toBe("events");
    expect(getTableName(errorGroups)).toBe("error_groups");
    expect(getTableName(alertRules)).toBe("alert_rules");
    expect(getTableName(alertHistory)).toBe("alert_history");
  });

  it("defines required columns on users table", () => {
    const cols = getTableColumns(users);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("email");
    expect(cols).toHaveProperty("name");
    expect(cols).toHaveProperty("createdAt");
    expect(cols).toHaveProperty("updatedAt");
  });

  it("defines required columns on organizations table", () => {
    const cols = getTableColumns(organizations);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("name");
    expect(cols).toHaveProperty("slug");
    expect(cols).toHaveProperty("createdAt");
    expect(cols).toHaveProperty("updatedAt");
  });

  it("defines required columns on memberships table", () => {
    const cols = getTableColumns(memberships);
    expect(cols).toHaveProperty("organizationId");
    expect(cols).toHaveProperty("userId");
    expect(cols).toHaveProperty("role");
    expect(cols).toHaveProperty("createdAt");
  });

  it("defines required columns on projects table", () => {
    const cols = getTableColumns(projects);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("organizationId");
    expect(cols).toHaveProperty("name");
    expect(cols).toHaveProperty("slug");
    expect(cols).toHaveProperty("createdAt");
    expect(cols).toHaveProperty("updatedAt");
  });

  it("defines required columns on api_keys table", () => {
    const cols = getTableColumns(apiKeys);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("projectId");
    expect(cols).toHaveProperty("name");
    expect(cols).toHaveProperty("keyPrefix");
    expect(cols).toHaveProperty("keyHash");
    expect(cols).toHaveProperty("lastUsedAt");
    expect(cols).toHaveProperty("expiresAt");
    expect(cols).toHaveProperty("revokedAt");
    expect(cols).toHaveProperty("createdAt");
  });

  it("defines required columns on events table", () => {
    const cols = getTableColumns(events);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("projectId");
    expect(cols).toHaveProperty("eventId");
    expect(cols).toHaveProperty("type");
    expect(cols).toHaveProperty("level");
    expect(cols).toHaveProperty("message");
    expect(cols).toHaveProperty("environment");
    expect(cols).toHaveProperty("timestamp");
    expect(cols).toHaveProperty("attributes");
    expect(cols).toHaveProperty("receivedAt");
  });

  it("defines required columns on error_groups table", () => {
    const cols = getTableColumns(errorGroups);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("projectId");
    expect(cols).toHaveProperty("fingerprint");
    expect(cols).toHaveProperty("title");
    expect(cols).toHaveProperty("firstSeenAt");
    expect(cols).toHaveProperty("lastSeenAt");
    expect(cols).toHaveProperty("occurrenceCount");
    expect(cols).toHaveProperty("createdAt");
    expect(cols).toHaveProperty("updatedAt");
  });

  it("defines required columns on alert_rules table", () => {
    const cols = getTableColumns(alertRules);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("projectId");
    expect(cols).toHaveProperty("name");
    expect(cols).toHaveProperty("description");
    expect(cols).toHaveProperty("condition");
    expect(cols).toHaveProperty("enabled");
    expect(cols).toHaveProperty("createdAt");
    expect(cols).toHaveProperty("updatedAt");
  });

  it("defines required columns on alert_history table", () => {
    const cols = getTableColumns(alertHistory);
    expect(cols).toHaveProperty("id");
    expect(cols).toHaveProperty("alertRuleId");
    expect(cols).toHaveProperty("projectId");
    expect(cols).toHaveProperty("status");
    expect(cols).toHaveProperty("triggeredAt");
    expect(cols).toHaveProperty("resolvedAt");
    expect(cols).toHaveProperty("details");
  });

  it("defines enum values correctly", () => {
    expect(membershipRoleEnum.enumValues).toEqual(["owner", "admin", "member"]);
    expect(eventTypeEnum.enumValues).toEqual(["log", "error", "metric"]);
    expect(eventLevelEnum.enumValues).toEqual(["debug", "info", "warn", "error", "fatal"]);
    expect(alertStatusEnum.enumValues).toEqual(["triggered", "resolved", "acknowledged"]);
  });
});
