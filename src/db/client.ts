import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
// Server-side integration foundation. The preview does not call this client.
export function getDatabase() {
  if (typeof window !== "undefined")
    throw new Error("Database access is server-only.");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required for database access.");
  return drizzle(neon(url), { schema });
}
