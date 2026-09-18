const db = require("./config/db");

async function testUser() {
  try {
    const [result] = await db.execute(
      "INSERT INTO users (email) VALUES (?)",
      ["cynthia-test@example.com"]
    );

    console.log("Inserted user ID:", result.insertId);

    const [rows] = await db.execute(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );

    console.log(rows);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

testUser();