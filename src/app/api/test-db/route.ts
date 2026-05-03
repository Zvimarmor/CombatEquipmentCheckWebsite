import { NextResponse } from 'next/server';
import pg from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({ error: 'DATABASE_URL is not set' });
  }

  const pool = new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 1,
  });

  try {
    const result = await pool.query('SELECT NOW()');
    return NextResponse.json({ success: true, time: result.rows[0].now, url_host: new URL(connectionString).hostname, url_db: new URL(connectionString).pathname });
  } catch (err: any) {
    return NextResponse.json({ error: 'PG Connection failed', details: err.message, stack: err.stack, code: err.code });
  } finally {
    await pool.end();
  }
}
