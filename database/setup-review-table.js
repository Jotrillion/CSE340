const pool = require("./index")
const fs = require("fs")
const path = require("path")

async function setupReviewTable() {
  try {
    console.log("Creating review table...")
    
    // Read the SQL file
    const sql = fs.readFileSync(
      path.join(__dirname, "review-table.sql"),
      "utf8"
    )
    
    // Execute the SQL
    await pool.query(sql)
    
    console.log("✓ Review table created successfully!")
    console.log("✓ Indexes created successfully!")
    console.log("\nYou can now restart your server to use the review features.")
    
    process.exit(0)
  } catch (error) {
    console.error("Error creating review table:", error.message)
    process.exit(1)
  }
}

setupReviewTable()
