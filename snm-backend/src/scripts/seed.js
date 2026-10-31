require('dotenv').config();
const { initDb, isFallback, getPool } = require('../config/db');

async function runSeed() {
  console.log('[Seed] Initializing RECURIX MySQL database seed process...');
  const connected = await initDb();
  if (connected) {
    console.log('[Seed] Database initialization and seed completed successfully on MySQL!');
  } else {
    console.log('[Seed] MySQL was unreachable. In-memory data store loaded with all mock entities.');
    console.log('[Seed] Please make sure MySQL service is running on ' + (process.env.DB_HOST || 'localhost') + ':' + (process.env.DB_PORT || '3306'));
  }
  process.exit(0);
}

runSeed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});

