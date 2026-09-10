import prisma from "../src/config/database";

async function main() {
  console.log("🌱 Seeding KisanQueue Database...");

  // 1. Seed Procurement Centres (Mandis)
  const centresData = [
    {
      code: "PB-KHN-01",
      name: "Khanna Main Grain Market (Yard #1)",
      address: "GT Road, Near Railway Overbridge, Khanna",
      district: "Ludhiana",
      state: "Punjab",
      latitude: 30.7068,
      longitude: 76.2163,
      totalCounters: 6,
      operatingHoursStart: "08:00",
      operatingHoursEnd: "18:00",
      isActive: true,
    },
    {
      code: "PB-RJP-02",
      name: "Rajpura APMC Grain Procurement Complex",
      address: "National Highway 1, Near New Bus Stand, Rajpura",
      district: "Patiala",
      state: "Punjab",
      latitude: 30.484,
      longitude: 76.5937,
      totalCounters: 4,
      operatingHoursStart: "08:30",
      operatingHoursEnd: "17:30",
      isActive: true,
    },
    {
      code: "PB-SRH-03",
      name: "Sirhind Grain Market Yard",
      address: "Mandi Road, Near Grain Storage Silos, Sirhind",
      district: "Fatehgarh Sahib",
      state: "Punjab",
      latitude: 30.6425,
      longitude: 76.3846,
      totalCounters: 3,
      operatingHoursStart: "09:00",
      operatingHoursEnd: "17:00",
      isActive: true,
    },
    {
      code: "HR-KRN-04",
      name: "Karnal Anaj Mandi Complex Gate #2",
      address: "Old GT Road, Sector 3, Karnal",
      district: "Karnal",
      state: "Haryana",
      latitude: 29.6857,
      longitude: 76.9905,
      totalCounters: 5,
      operatingHoursStart: "08:00",
      operatingHoursEnd: "18:00",
      isActive: true,
    },
    {
      code: "HR-AMB-05",
      name: "Ambala City Grain Market Yard",
      address: "Hisar Road, Near Subzi Mandi, Ambala City",
      district: "Ambala",
      state: "Haryana",
      latitude: 30.3752,
      longitude: 76.7821,
      totalCounters: 4,
      operatingHoursStart: "08:30",
      operatingHoursEnd: "17:30",
      isActive: true,
    },
  ];

  const centres: any[] = [];
  for (const c of centresData) {
    const centre = await prisma.procurementCentre.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    centres.push(centre);
    console.log(`  ✓ Centre: ${centre.name} (${centre.code})`);
  }

  // 2. Seed Slots for the next 10 days for each Centre
  console.log("📅 Generating procurement time slots...");
  const slotWindows = [
    { startTime: "09:00", endTime: "11:00", capacity: 40, booked: 12 },
    { startTime: "11:30", endTime: "01:30", capacity: 40, booked: 28 },
    { startTime: "02:00", endTime: "04:00", capacity: 35, booked: 6 },
    { startTime: "04:30", endTime: "06:00", capacity: 25, booked: 2 },
  ];

  const today = new Date();
  for (const centre of centres) {
    for (let dayOffset = 0; dayOffset < 10; dayOffset++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + dayOffset);
      slotDate.setHours(0, 0, 0, 0);

      for (const window of slotWindows) {
        await prisma.slot.upsert({
          where: {
            centreId_date_startTime: {
              centreId: centre.id,
              date: slotDate,
              startTime: window.startTime,
            },
          },
          update: {
            endTime: window.endTime,
            capacity: window.capacity,
          },
          create: {
            centreId: centre.id,
            date: slotDate,
            startTime: window.startTime,
            endTime: window.endTime,
            capacity: window.capacity,
            booked: dayOffset === 0 ? window.booked : Math.floor(Math.random() * 8),
            isActive: true,
          },
        });
      }
    }
  }

  console.log(`  ✓ Generated 40 slots each across ${centres.length} Mandi centres.`);

  // 3. Seed Authorized Administrator Whitelist
  console.log("🛡️ Seeding Authorized Admin Whitelist...");
  const adminEmails = [
    "himanshuanand563@gmail.com",
    "dollysingh1369@gmail.com",
    "fardishmostofa@gmail.com",
    "joyetasahoo3@gmail.com",
    "sayandhar361@gmail.com",
  ];

  for (const email of adminEmails) {
    await prisma.adminWhitelist.upsert({
      where: { email },
      update: {},
      create: {
        email,
        addedBy: "system-seed",
      },
    });
    console.log(`  ✓ Whitelisted Admin: ${email}`);
  }

  console.log("✅ Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
