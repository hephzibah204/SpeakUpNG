import { createPool } from '@vercel/postgres';

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

export async function queryAll<T = Record<string, unknown>>(queryString: string, params: unknown[] = []): Promise<T[]> {
  let i = 1;
  const query = queryString.replace(/\?/g, () => `$${i++}`);
  const result = await sql.query(query, params as any[]);
  return result.rows as T[];
}

export async function queryFirst<T = Record<string, unknown>>(queryString: string, params: unknown[] = []): Promise<T | undefined> {
  let i = 1;
  const query = queryString.replace(/\?/g, () => `$${i++}`);
  const result = await sql.query(query, params as any[]);
  return (result.rows[0] as T) || undefined;
}

export async function queryRun(queryString: string, params: unknown[] = []): Promise<{ changes: number }> {
  let i = 1;
  const query = queryString.replace(/\?/g, () => `$${i++}`);
  const result = await sql.query(query, params as any[]);
  return { changes: result.rowCount || 0 };
}

export async function execute(queryString: string, params: unknown[] = []): Promise<void> {
  let i = 1;
  const query = queryString.replace(/\?/g, () => `$${i++}`);
  await sql.query(query, params as any[]);
}
