const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'college_lms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection function
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to the MySQL database:', process.env.DB_NAME || 'college_lms');
    connection.release();
  } catch (error) {
    console.error('❌ Failed to connect to the database:', error.message);
    console.log('Please ensure MySQL server is running and the database exists.');
  }
}

testConnection();

module.exports = pool;
