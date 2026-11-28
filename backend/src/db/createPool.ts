import { Pool } from "pg";

export function createDatabasePool(
  connectionString: string,
  maxConnections: number,
): Pool {
  const pool = new Pool({
    connectionString,
    max: maxConnections,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,

    statement_timeout: 2000,

    query_timeout: 3000,
  });

  pool.on("error", () => {
    console.error("Unexpected PostgreSQL idle client error");
  });

  return pool;
}

export async function checkDatabaseConnection(pool: Pool): Promise<void> {
  await pool.query("SELECT 1");
}
