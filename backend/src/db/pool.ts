import { DATABASE_URL, DB_POOL_MAX } from "../config/env.js";
import { checkDatabaseConnection, createDatabasePool } from "./createPool.js";

export const pool = createDatabasePool(DATABASE_URL, DB_POOL_MAX);

export async function checkDatabase(): Promise<void> {
  await checkDatabaseConnection(pool);
}
