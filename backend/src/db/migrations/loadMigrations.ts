import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHash } from "node:crypto";

import type { Migration } from "./types.js";

const MIGRATION_PATTERN = /^(\d{3})_([a-z0-9_]+)\.sql$/;

export async function loadMigrations(directory: string): Promise<Migration[]> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  const migrations: Migration[] = [];
  const seenVersions = new Set<number>();

  for (const entry of entries) {
    const filename = entry.name;

    if (!filename.toLowerCase().endsWith(".sql")) {
      continue;
    }

    if (!entry.isFile()) {
      throw new Error(`Migration must be a regular file: ${filename}`);
    }

    const match = filename.match(MIGRATION_PATTERN);

    if (!match || match[1] === undefined) {
      throw new Error(`Invalid migration filename: ${filename}`);
    }

    const version = Number(match[1]);

    if (version < 1) {
      throw new Error(`Invalid migration version: ${filename}`);
    }

    if (seenVersions.has(version)) {
      throw new Error(`Duplicate migration version: ${version}`);
    }

    seenVersions.add(version);

    const filePath = join(directory, filename);
    const contents = await readFile(filePath);
    const sql = contents.toString("utf8");

    if (!sql.trim()) {
      throw new Error(`Empty migration file: ${filename}`);
    }

    const checksum = createHash("sha256").update(contents).digest("hex");

    migrations.push({
      version,
      filename,
      sql,
      checksum,
    });
  }

  if (migrations.length === 0) {
    throw new Error("No migration files found");
  }

  migrations.sort((a, b) => a.version - b.version);

  return migrations;
}
