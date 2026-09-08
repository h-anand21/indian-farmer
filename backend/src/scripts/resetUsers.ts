import prisma from "../config/database";

async function main() {
  console.log("🔍 Checking existing users in database...");
  const users = await prisma.user.findMany({
    include: {
      farmer: true,
      operator: true,
    },
  });

  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    console.log(`- ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Phone: ${u.phone}, Role: ${u.role}, UID: ${u.firebaseUid}`);
  }

  // Delete all FARMER accounts so any test Gmail or phone gets a completely fresh registration
  const deleteResult = await prisma.user.deleteMany({
    where: {
      role: "FARMER",
    },
  });

  console.log(`\n✅ Deleted ${deleteResult.count} test Farmer accounts.`);
  console.log("Now, whenever you log in with your Gmail, it will open the fresh 3-step registration form!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error resetting users:", err);
  process.exit(1);
});
