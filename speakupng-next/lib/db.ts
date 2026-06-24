import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

function findLocalD1Db(): string | null {
  const searchPaths = [
    path.join(process.cwd(), '.wrangler', 'state', 'v3', 'd1'),
    path.join(process.cwd(), '.wrangler', 'state', 'd1'),
  ];
  for (const base of searchPaths) {
    if (!fs.existsSync(base)) continue;
    const entries = fs.readdirSync(base, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dbPath = path.join(base, entry.name, 'db.sqlite');
        if (fs.existsSync(dbPath)) return dbPath;
      }
    }
  }
  return null;
}

export function getDb(): Database.Database {
  if (db) return db;
  const dbPath = findLocalD1Db() || path.join(process.cwd(), 'local-d1.sqlite');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}

export function queryAll<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const stmt = getDb().prepare(sql);
  return stmt.all(...params) as T[];
}

export function queryFirst<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  const stmt = getDb().prepare(sql);
  return stmt.get(...params) as T | undefined;
}

export function queryRun(sql: string, params: unknown[] = []) {
  const stmt = getDb().prepare(sql);
  return stmt.run(...params);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
