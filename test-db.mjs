import { Pool } from 'pg';

const connectionString = 'postgresql://postgres:xUnju9-huxqeh-viqvyv@db.umkmjfvvqogcglbfzrnd.supabase.co:6543/postgres?pgbouncer=true';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Connection failed:', err);
  } else {
    console.log('Connection successful:', res.rows);
  }
  pool.end();
});
