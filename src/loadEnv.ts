// Centralized env loading for the Node server + scripts.
// Vite reads `.env.local` natively for the client, but the standalone server
// (`tsx server.ts`) uses dotenv, which only reads `.env` by default. Load `.env.local`
// first (it wins) then `.env`, so both the client and server see the same values.
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config(); // .env — does not override already-set keys
