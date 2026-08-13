import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('Error: DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  // Log a masked version of the connection target — never print credentials.
  try {
    const url = new URL(connectionString);
    console.log(`Attempting to connect to: ${url.protocol}//${url.username}:****@${url.host}${url.pathname}`);
  } catch {
    console.log('DATABASE_URL is set (unparseable as URL); attempting connection anyway.');
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Attempting to connect to the database...');
    await client.connect();
    console.log('Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    
    try {
      const usersCount = await client.query('SELECT count(*) FROM "users"');
      console.log('Users count:', usersCount.rows[0].count);
    } catch (e) {
      console.error('Error querying "users" table:', e instanceof Error ? e.message : String(e));
      console.log('Attempting to list tables...');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      console.log('Tables in public schema:', tables.rows.map(r => r.table_name).join(', '));
    }
    
    await client.end();
    console.log('Connection closed.');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }
}

testConnection();
