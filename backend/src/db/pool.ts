import { Pool } from "pg";
import { DATABASE_URL, DB_POOL_MAX } from "../config/env.js";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: DB_POOL_MAX,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,

  statement_timeout: 2000,

  query_timeout: 3000,
});

pool.on("error", () => {
  console.error("Unexpected PostgreSQL idle client error");
});

export async function checkDatabase(): Promise<void> {
  await pool.query("SELECT 1");
}
