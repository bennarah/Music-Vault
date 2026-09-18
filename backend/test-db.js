const db = require("./config/db");

async function testConnection() {
  try {
    const connection = await db.getConnection();
    console.log("Connected to MySQL successfully.");
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("MySQL connection failed:");
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();