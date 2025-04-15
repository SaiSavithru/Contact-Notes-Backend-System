const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initSql = fs.readFileSync(path.join(__dirname, '../config/init.sql')).toString();

(async () => {
  try {
    await pool.query(initSql);
    console.log('Success! Database initialized.');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
})();
