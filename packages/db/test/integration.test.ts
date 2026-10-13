import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { eq, and } from "drizzle-orm";
import {
  getTransactionDb,
  closeDb,
  users,
  organizations,
  memberships,
  projects,
  apiKeys,
  events,
  errorGroups,
} from "../src/index.js";

const testDbUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const shouldRunIntegration = Boolean(
  testDbUrl && (testDbUrl.startsWith("postgresql://") || testDbUrl.startsWith("postgres://")),
);

describe.skipIf(!shouldRunIntegration)(
  "Database Integration Tests (requires isolated PostgreSQL/Neon instance)",
  () => {
    let db: ReturnType<typeof getTransactionDb>;

    beforeAll(() => {
      if (!testDbUrl) {
        return;
      }
      // Safety guard: ensure we never run destructive tests against a suspected production database
      if (
        process.env.NODE_ENV === "production" ||
        testDbUrl.includes("production") ||
        testDbUrl.includes("prod")
      ) {
        throw new Error(
          "Safety check failed: Refusing to run integration tests against a production database!",
        );
      }

      db = getTransactionDb(testDbUrl);
    });

    afterAll(async () => {
      await closeDb();
    });

    it("enforces unique organization slugs", async () => {
      const slug = `org-slug-${Date.now()}`;
      await db.insert(organizations).values({ name: "Org 1", slug });

      // Inserting identical slug must fail with unique constraint violation
      await expect(db.insert(organizations).values({ name: "Org 2", slug })).rejects.toThrow();

      // Clean up
      await db.delete(organizations).where(eq(organizations.slug, slug));
    });

    it("verifies organization and project relationships and cascades", async () => {
      const slug = `org-rel-${Date.now()}`;
      const [org] = await db
        .insert(organizations)
        .values({ name: "Cascade Org", slug })
        .returning();

      expect(org).toBeDefined();

      const [proj] = await db
        .insert(projects)
        .values({ organizationId: org!.id, name: "Proj 1", slug: "proj-1" })
        .returning();

      expect(proj?.organizationId).toBe(org?.id);

      // Deleting organization must cascade delete the project
      await db.delete(organizations).where(eq(organizations.id, org!.id));

      const foundProjects = await db
        .select()
        .where(eq(projects.organizationId, org!.id))
        .from(projects);

      expect(foundProjects).toHaveLength(0);
    });

    it("enforces project slug uniqueness within each organization while allowing across orgs", async () => {
      const slug1 = `org-a-${Date.now()}`;
      const slug2 = `org-b-${Date.now()}`;

      const [orgA] = await db
        .insert(organizations)
        .values({ name: "Org A", slug: slug1 })
        .returning();
      const [orgB] = await db
        .insert(organizations)
        .values({ name: "Org B", slug: slug2 })
        .returning();

      // Same project slug in Org A and Org B must succeed
      await db.insert(projects).values({ organizationId: orgA!.id, name: "API", slug: "api" });
      await expect(
        db.insert(projects).values({ organizationId: orgB!.id, name: "API", slug: "api" }),
      ).resolves.toBeDefined();

      // Duplicate project slug in the SAME Org A must fail
      await expect(
        db
          .insert(projects)
          .values({ organizationId: orgA!.id, name: "Duplicate API", slug: "api" }),
      ).rejects.toThrow();

      // Clean up
      await db.delete(organizations).where(eq(organizations.id, orgA!.id));
      await db.delete(organizations).where(eq(organizations.id, orgB!.id));
    });

    it("enforces membership uniqueness per user and organization", async () => {
      const orgSlug = `org-mem-${Date.now()}`;
      const userEmail = `user-${Date.now()}@example.com`;

      const [org] = await db
        .insert(organizations)
        .values({ name: "Mem Org", slug: orgSlug })
        .returning();
      const [user] = await db
        .insert(users)
        .values({ name: "User 1", email: userEmail })
        .returning();

      // First membership insert succeeds
      await db.insert(memberships).values({
        organizationId: org!.id,
        userId: user!.id,
        role: "owner",
      });

      // Second membership insert for the same user in same organization must fail
      await expect(
        db.insert(memberships).values({
          organizationId: org!.id,
          userId: user!.id,
          role: "member",
        }),
      ).rejects.toThrow();

      // Clean up
      await db.delete(organizations).where(eq(organizations.id, org!.id));
      await db.delete(users).where(eq(users.id, user!.id));
    });

    it("stores API key hashes securely and enforces hash uniqueness", async () => {
      const orgSlug = `org-key-${Date.now()}`;
      const [org] = await db
        .insert(organizations)
        .values({ name: "Key Org", slug: orgSlug })
        .returning();
      const [proj] = await db
        .insert(projects)
        .values({ organizationId: org!.id, name: "P", slug: "p" })
        .returning();

      const keyHash = `hash-${Date.now()}`;
      await db.insert(apiKeys).values({
        projectId: proj!.id,
        name: "Test Key",
        keyPrefix: "obs_live",
        keyHash,
      });

      // Inserting duplicate key hash must fail
      await expect(
        db.insert(apiKeys).values({
          projectId: proj!.id,
          name: "Another Key",
          keyPrefix: "obs_live",
          keyHash,
        }),
      ).rejects.toThrow();

      // Clean up
      await db.delete(organizations).where(eq(organizations.id, org!.id));
    });

    it("enforces composite event uniqueness constraint on (projectId, eventId)", async () => {
      const orgSlug = `org-evt-${Date.now()}`;
      const [org] = await db
        .insert(organizations)
        .values({ name: "Evt Org", slug: orgSlug })
        .returning();
      const [proj] = await db
        .insert(projects)
        .values({ organizationId: org!.id, name: "P", slug: "p" })
        .returning();

      const eventId = "550e8400-e29b-41d4-a716-446655440000";
      await db.insert(events).values({
        projectId: proj!.id,
        eventId,
        type: "log",
        message: "Test message",
        environment: "test",
        timestamp: new Date(),
      });

      // Duplicate (projectId, eventId) must fail
      await expect(
        db.insert(events).values({
          projectId: proj!.id,
          eventId,
          type: "error",
          message: "Another message",
          environment: "test",
          timestamp: new Date(),
        }),
      ).rejects.toThrow();

      // Clean up
      await db.delete(organizations).where(eq(organizations.id, org!.id));
    });

    it("enforces error fingerprint uniqueness per project", async () => {
      const orgSlug = `org-err-${Date.now()}`;
      const [org] = await db
        .insert(organizations)
        .values({ name: "Err Org", slug: orgSlug })
        .returning();
      const [proj] = await db
        .insert(projects)
        .values({ organizationId: org!.id, name: "P", slug: "p" })
        .returning();

      const fingerprint = "TypeError_cannot_read_properties_of_undefined";
      await db.insert(errorGroups).values({
        projectId: proj!.id,
        fingerprint,
        title: "TypeError: null",
      });

      // Duplicate fingerprint on same project must fail
      await expect(
        db.insert(errorGroups).values({
          projectId: proj!.id,
          fingerprint,
          title: "Another title",
        }),
      ).rejects.toThrow();

      // Clean up
      await db.delete(organizations).where(eq(organizations.id, org!.id));
    });

    it("enforces foreign-key constraints on non-existent parent records", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";

      // Inserting project with non-existent organization must fail
      await expect(
        db.insert(projects).values({
          organizationId: nonExistentId,
          name: "Orphan",
          slug: "orphan",
        }),
      ).rejects.toThrow();
    });
  },
);
