import "dotenv/config";

const allowedEnvs = ["development", "test", "production"];

const environment = process.env.NODE_ENV ?? "development";
const port = Number(process.env.PORT ?? 3000);
const url = process.env.DATABASE_URL;
const dbMax = Number(process.env.DB_POOL_MAX ?? 10);

if (!url) {
  throw new Error("DATABASE_URL environment variable is required");
}

if (!environment || !allowedEnvs.includes(environment)) {
  throw new Error("ENV must be one of: development, test, production");
}

if (port < 1 || port > 65535) {
  throw new Error("PORT should be between 1 and 65535");
}

if (dbMax < 1) {
  throw new Error("DB_POOL_MAX should be a positive integer");
}

export const NODE_ENV = environment;

export const PORT = port;

export const DATABASE_URL = url;

export const DB_POOL_MAX = dbMax;
