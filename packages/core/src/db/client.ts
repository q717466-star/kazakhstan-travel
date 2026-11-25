import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';
import { SQLITE_SCHEMA_SQL } from './schema-sql.js';

const require = createRequire(import.meta.url);

function loadSqliteModule(): typeof import('node:sqlite') {
  return require('node:sqlite') as typeof import('node:sqlite');
}

function findMonorepoRoot(startDir: string): string {
  let current = path.resolve(startDir);
  for (let i = 0; i < 6; i++) {
    const pkgPath = path.join(current, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as { workspaces?: unknown };
        if (pkg.workspaces) return current;
      } catch {
        // ignore parse errors
      }
    }
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  return startDir;
}

export function resolveDbPath(): string {
  const configured = process.env.KT_DB_PATH?.trim();
  if (configured === ':memory:') return ':memory:';
  const root = findMonorepoRoot(process.cwd());
  if (configured) {
    return path.isAbsolute(configured) ? configured : path.resolve(root, configured);
  }
  if (process.env.VERCEL || process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    return '/tmp/kazakhstan-travel.db';
  }
  return path.join(root, 'data', 'kazakhstan-travel.db');
}

let singletonDb: DatabaseSyncType | null = null;
let singletonPath: string | null = null;
let simulatedDbFailure = false;

export function setSimulateDbFailureForTests(enabled: boolean): void {
  simulatedDbFailure = enabled;
}

export function isDbFailureSimulated(): boolean {
  if (simulatedDbFailure || process.env.KT_SIMULATE_DB_FAILURE === '1') {
    return true;
  }
  try {
    const db = getDb();
    const row = db
      .prepare(`SELECT data_json FROM page_blocks WHERE key = '_sim_db_failure'`)
      .get() as { data_json?: string } | undefined;
    if (row?.data_json) {
      const parsed = JSON.parse(row.data_json) as { enabled?: boolean };
      return Boolean(parsed.enabled);
    }
  } catch {
    // ignore
  }
  return false;
}

export function setPersistedSimDbFailure(enabled: boolean): void {
  simulatedDbFailure = enabled;
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO page_blocks (key, data_json, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`
  ).run('_sim_db_failure', JSON.stringify({ enabled }), now);
}

export function getDb(): DatabaseSyncType {
  const targetPath = resolveDbPath();
  if (singletonDb && singletonPath === targetPath) {
    return singletonDb;
  }

  if (singletonDb) {
    try {
      singletonDb.close();
    } catch {
      // ignore close errors
    }
    singletonDb = null;
  }

  if (targetPath !== ':memory:') {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  }

  const { DatabaseSync } = loadSqliteModule();
  const db = new DatabaseSync(targetPath);
  db.exec(SQLITE_SCHEMA_SQL);

  singletonDb = db;
  singletonPath = targetPath;
  return db;
}

export function resetDbForTests(): void {
  if (singletonDb) {
    try {
      singletonDb.close();
    } catch {
      // ignore
    }
  }
  singletonDb = null;
  singletonPath = null;
  simulatedDbFailure = false;
}

export function runInTransaction<T>(fn: (db: DatabaseSyncType) => T): T {
  const db = getDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn(db);
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // ignore rollback failure
    }
    throw err;
  }
}
