import { config as loadDotenv } from "dotenv";
import { defineConfig } from "drizzle-kit";

loadDotenv();

export default defineConfig({
  schema: "./src/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Prefer direct migration connection string when using Neon pooled connections
    url: process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL ?? "",
  },
});
