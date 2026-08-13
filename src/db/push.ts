import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const { Pool } = pg;

// Connection string must come from the environment — never hardcode credentials.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Aborting.');
  process.exit(1);
}

async function pushSchema() {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Pushing schema to database...');
    const db = drizzle(pool, { schema });
    
    // We can't easily run drizzle-kit push programmatically here, 
    // but we can try to create the tables manually or use the drizzle-orm migrate if we had migrations.
    // Since we don't have migrations, we'll just try to run a simple query to see if it works.
    
    const res = await pool.query('SELECT NOW()');
    console.log('Connected successfully. Database time:', res.rows[0].now);
    
    // If we want to push the schema, we really should use drizzle-kit.
    // Let's try to run drizzle-kit push by setting the env var in the script.
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

pushSchema();
