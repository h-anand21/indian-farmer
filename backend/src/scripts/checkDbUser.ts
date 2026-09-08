import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

async function checkUser() {
  const directUrl = "postgresql://neondb_owner:npg_vLKP7oyxVp0g@ep-polished-math-azysm5pd.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
  const poolerUrl = "postgresql://neondb_owner:npg_vLKP7oyxVp0g@ep-polished-math-azysm5pd-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

  console.log("🔍 Testing Neon Connection with Pooler URL...");
  for (const [name, url] of [["Direct URL", directUrl], ["Pooler URL", poolerUrl]]) {
    try {
      console.log(`\nAttempting connection to ${name}...`);
      const pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
      });

      const res = await pool.query("SELECT id, email, name, role, firebase_uid FROM users WHERE email ILIKE '%himanand%' OR email ILIKE '%2020%';");
      console.log(`✅ Success with ${name}! Matches found:`, res.rows);

      const allUsers = await pool.query("SELECT id, email, name, role FROM users LIMIT 10;");
      console.log(`Total first 10 users in DB:`, allUsers.rows);

      await pool.end();
      return;
    } catch (err: any) {
      console.error(`❌ Failed with ${name}:`, err.message);
    }
  }
}

checkUser();
