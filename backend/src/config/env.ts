import "dotenv/config";

type NodeEnv = "development" | "test" | "production";

function parseInteger(
  name: string,
  value: string | undefined,
  defaultValue: number,
  min: number,
  max: number = Number.MAX_SAFE_INTEGER,
): number {
  const parsed = value === undefined ? defaultValue : Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${name} must be an integer between ${min} and ${max}`);
  }

  return parsed;
}

function parseNodeEnv(value: string): NodeEnv {
  if (value !== "development" && value !== "test" && value !== "production") {
    throw new Error("NODE_ENV must be one of: development, test, production");
  }

  return value;
}

function parseDatabaseUrl(value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error("DATABASE_URL is required");
  }

  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error("DATABASE_URL must be a valid URL");
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    throw new Error("DATABASE_URL must use a PostgreSQL protocol");
  }

  if (!parsed.hostname || parsed.pathname.length <= 1) {
    throw new Error("DATABASE_URL must contain a hostname and database name");
  }

  return value;
}

export const NODE_ENV = parseNodeEnv(process.env.NODE_ENV ?? "development");

export const PORT = parseInteger("PORT", process.env.PORT, 3000, 1, 65535);

export const DATABASE_URL = parseDatabaseUrl(process.env.DATABASE_URL);

export const DB_POOL_MAX = parseInteger(
  "DB_POOL_MAX",
  process.env.DB_POOL_MAX,
  10,
  1,
);
