import Database from 'better-sqlite3';
import { join } from 'path';

interface D1Database {
  prepare(sql: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...params: any[]): D1PreparedStatement;
  all(): { results: any[] };
  first(): any;
  run(): { success: boolean; meta: any };
}

let dbInstance: D1Database | null = null;

export function getDB(): D1Database {
  if (dbInstance) return dbInstance;

  const dbPath = join(process.cwd(), '.wrangler', 'state', 'v3', 'd1', 'miniflare-D1DatabaseObject');
  
  let sqlitePath = '';
  try {
    const dirs = require('fs').readdirSync(dbPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    
    if (dirs.length > 0) {
      const latestDir = dirs.sort().reverse()[0];
      const files = require('fs').readdirSync(join(dbPath, latestDir))
        .filter(f => f.endsWith('.sqlite') && !f.endsWith('.sqlite-shm') && !f.endsWith('.sqlite-wal'));
      if (files.length > 0) {
        sqlitePath = join(dbPath, latestDir, files[0]);
      }
    }
  } catch (e) {
    console.warn('Could not find local D1 database:', e);
  }

  if (sqlitePath) {
    const sqlite = new Database(sqlitePath);
    
    dbInstance = {
      prepare(sql: string) {
        const stmt = sqlite.prepare(sql);
        return {
          bind(...params: any[]) {
            return {
              all() {
                return { results: stmt.all(...params) };
              },
              first() {
                return stmt.get(...params);
              },
              run() {
                const result = stmt.run(...params);
                return { success: true, meta: result };
              }
            };
          }
        };
      }
    };
  } else {
    // Fallback mock for when no local DB is found
    dbInstance = {
      prepare(sql: string) {
        return {
          bind(...params: any[]) {
            return {
              all() { return { results: [] }; },
              first() { return null; },
              run() { return { success: true, meta: {} }; }
            };
          }
        };
      }
    };
  }

  return dbInstance;
}

export async function runMigration(sql: string): Promise<void> {
  const db = getDB();
  const statements = sql.split(';').filter(s => s.trim());
  for (const stmt of statements) {
    if (stmt.trim()) {
      db.prepare(stmt.trim()).run();
    }
  }
}