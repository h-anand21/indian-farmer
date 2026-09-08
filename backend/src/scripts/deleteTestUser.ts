import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

async function deleteUser() {
  const url = process.env.DATABASE_URL!;
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
  });

  console.log("🔍 Looking for test users to delete...");

  const usersRes = await pool.query(
    "SELECT id, email, name, role FROM users WHERE email ILIKE '%himanand2020%' OR email ILIKE '%himanshu%';"
  );
  console.log("Users found:", usersRes.rows);

  for (const user of usersRes.rows) {
    console.log(`\nDeleting data for: ${user.email} (ID: ${user.id})...`);
    
    // Find farmer id
    const farmerRes = await pool.query("SELECT id FROM farmers WHERE user_id = $1;", [user.id]);
    if (farmerRes.rows.length > 0) {
      const farmerId = farmerRes.rows[0].id;
      
      // Delete child records in order
      await pool.query("DELETE FROM procurement_records WHERE booking_id IN (SELECT id FROM bookings WHERE farmer_id = $1);", [farmerId]);
      await pool.query("DELETE FROM queue_entries WHERE booking_id IN (SELECT id FROM bookings WHERE farmer_id = $1);", [farmerId]);
      await pool.query("DELETE FROM payments WHERE farmer_id = $1;", [farmerId]);
      await pool.query("DELETE FROM bookings WHERE farmer_id = $1;", [farmerId]);
      await pool.query("DELETE FROM crops WHERE farmer_id = $1;", [farmerId]);
      await pool.query("DELETE FROM notifications WHERE farmer_id = $1;", [farmerId]);
      await pool.query("DELETE FROM gov_content_bookmarks WHERE farmer_id = $1;", [farmerId]);
      await pool.query("DELETE FROM farmers WHERE id = $1;", [farmerId]);
    }

    // Delete user
    await pool.query("DELETE FROM audit_logs WHERE user_id = $1;", [user.id]);
    await pool.query("DELETE FROM users WHERE id = $1;", [user.id]);
    console.log(`✅ Successfully deleted user: ${user.email}`);
  }

  const remaining = await pool.query("SELECT id, email, name, role FROM users;");
  console.log("\nRemaining users in Database:", remaining.rows);

  await pool.end();
  console.log("\n🎉 Database cleanup complete! Now himanand2020@gmail.com is completely fresh and unregistered.");
}

deleteUser().catch(console.error);
