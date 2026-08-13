import dotenv from 'dotenv';
dotenv.config();

// Report presence of required env vars WITHOUT printing their values (credentials must
// never be echoed to stdout / logs).
const required = ['DATABASE_URL', 'JWT_SECRET', 'INTERNAL_API_KEY', 'BANK_TOKEN_ENCRYPTION_KEY'];
for (const name of required) {
  const val = process.env[name];
  console.log(`${name}: ${val ? 'set ✓' : 'MISSING ✗'}`);
}
