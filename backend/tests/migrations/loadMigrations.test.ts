import { describe, it, expect, beforeEach, afterEach } from "vitest";

import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";

import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

import { loadMigrations } from "../../src/db/migrations/loadMigrations.js";

describe("loadMigrations", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "workflow-migrations-"));
  });

  afterEach(async () => {
    if (directory) {
      await rm(directory, {
        recursive: true,
        force: true,
      });
    }
  });

  it("should load a valid migration file", async () => {
    const filename = "001_create_workflows.sql";
    const sql = "CREATE TABLE workflows (id INT PRIMARY KEY);";

    await writeFile(join(directory, filename), sql);

    const migrations = await loadMigrations(directory);

    expect(migrations).toHaveLength(1);

    expect(migrations[0]).toEqual({
      version: 1,
      filename,
      sql,
      checksum: createHash("sha256").update(sql, "utf8").digest("hex"),
    });
  });

  it("should sort migrations by numeric version", async () => {
    await writeFile(join(directory, "003_create_events.sql"), "SELECT 3;");

    await writeFile(join(directory, "001_create_workflows.sql"), "SELECT 1;");

    await writeFile(join(directory, "002_create_runs.sql"), "SELECT 2;");

    const migrations = await loadMigrations(directory);

    expect(migrations.map((migration) => migration.version)).toEqual([1, 2, 3]);
  });

  it("should reject duplicate migration versions", async () => {
    await writeFile(join(directory, "001_create_workflows.sql"), "SELECT 1;");

    await writeFile(join(directory, "001_create_steps.sql"), "SELECT 2;");

    await expect(loadMigrations(directory)).rejects.toThrow(
      "Duplicate migration version",
    );
  });

  it.each([
    "create_workflows.sql",
    "01_create_workflows.sql",
    "0001_create_workflows.sql",
    "001_Create_Workflows.sql",
    "001_.sql",
    "abc_create_workflows.sql",
  ])("should reject invalid filename: %s", async (filename) => {
    await writeFile(join(directory, filename), "SELECT 1;");

    await expect(loadMigrations(directory)).rejects.toThrow(
      "Invalid migration filename",
    );
  });

  it("should reject migration version 000", async () => {
    await writeFile(join(directory, "000_initial.sql"), "SELECT 1;");

    await expect(loadMigrations(directory)).rejects.toThrow(
      "Invalid migration version",
    );
  });

  it.each(["", "   ", "\n\n", "\t\n  "])(
    "should reject empty or whitespace-only SQL: %j",
    async (sql) => {
      await writeFile(join(directory, "001_create_workflows.sql"), sql);

      await expect(loadMigrations(directory)).rejects.toThrow(
        "Empty migration file",
      );
    },
  );

  it("should reject an empty migration directory", async () => {
    await expect(loadMigrations(directory)).rejects.toThrow(
      "No migration files found",
    );
  });

  it("should ignore non-SQL files", async () => {
    await writeFile(join(directory, "README.md"), "# Database migrations");

    await writeFile(join(directory, "notes.txt"), "Some migration notes");

    await writeFile(join(directory, "001_create_workflows.sql"), "SELECT 1;");

    const migrations = await loadMigrations(directory);

    expect(migrations).toHaveLength(1);

    expect(migrations[0]?.filename).toBe("001_create_workflows.sql");
  });

  it("should generate identical checksums for unchanged files", async () => {
    await writeFile(join(directory, "001_create_workflows.sql"), "SELECT 1;");

    const first = await loadMigrations(directory);
    const second = await loadMigrations(directory);

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
    expect(first).toEqual(second);
  });

  it("should generate a different checksum when SQL changes", async () => {
    const filePath = join(directory, "001_create_workflows.sql");

    await writeFile(filePath, "SELECT 1;");

    const before = await loadMigrations(directory);

    await writeFile(filePath, "SELECT 2;");

    const after = await loadMigrations(directory);

    expect(before).toHaveLength(1);
    expect(after).toHaveLength(1);

    expect(before[0]?.checksum).not.toBe(after[0]?.checksum);

    expect(before[0]?.version).toBe(after[0]?.version);

    expect(before[0]?.filename).toBe(after[0]?.filename);
  });

  it("should reject if no SQL files found", async () => {
    await writeFile(join(directory, "README.md"), "# Database migrations");

    await writeFile(join(directory, "notes.txt"), "Some migration notes");

    await expect(loadMigrations(directory)).rejects.toThrow(
      "No migration files found",
    );
  });

  it("should reject if the migration directory does not exist", async () => {
    const invalidPath = join(directory, "nonexistent");

    await expect(loadMigrations(invalidPath)).rejects.toMatchObject({
      code: "ENOENT",
    });
  });

  it("should reject if a migration is not a regular file", async () => {
    const migrationPath = join(directory, "001_init.sql");

    await mkdir(migrationPath);

    await expect(loadMigrations(directory)).rejects.toThrow(
      "Migration must be a regular file",
    );
  });
});
