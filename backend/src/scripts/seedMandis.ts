import { prisma } from "../config/database";

const MANDIS_DATA = [
  // ── 3 Mandis in West Bengal ──
  {
    name: "Burdwan Central Rice & Grain Mandi",
    code: "WB-BWN-01",
    district: "Purba Bardhaman",
    state: "West Bengal",
    address: "Grand Trunk Road, Shaktigarh Grain Market Complex, Purba Bardhaman - 713149",
    latitude: 23.2324,
    longitude: 87.8615,
    totalCounters: 5,
    operatingHoursStart: "08:00",
    operatingHoursEnd: "18:00",
    isActive: true,
  },
  {
    name: "Siliguri Regulated APMC Market Yard",
    code: "WB-SLG-02",
    district: "Darjeeling",
    state: "West Bengal",
    address: "Near Champasari More, Regulated Market Yard, Siliguri - 734003",
    latitude: 26.7271,
    longitude: 88.423,
    totalCounters: 4,
    operatingHoursStart: "08:30",
    operatingHoursEnd: "17:30",
    isActive: true,
  },
  {
    name: "Malda Central Agricultural Market Complex",
    code: "WB-MLD-03",
    district: "Malda",
    state: "West Bengal",
    address: "English Bazar Grain Procurement Yard, NH-34, Malda - 732101",
    latitude: 25.0108,
    longitude: 88.1411,
    totalCounters: 4,
    operatingHoursStart: "08:00",
    operatingHoursEnd: "17:00",
    isActive: true,
  },

  // ── 2 Mandis in Bihar ──
  {
    name: "Mohania APMC Grain Procurement Yard",
    code: "BR-KMR-01",
    district: "Kaimur (Bhabua)",
    state: "Bihar",
    address: "Grand Trunk Road, Near Railway Station Yard, Mohania, Kaimur - 821109",
    latitude: 25.1706,
    longitude: 83.6198,
    totalCounters: 5,
    operatingHoursStart: "08:00",
    operatingHoursEnd: "18:00",
    isActive: true,
  },
  {
    name: "Sasaram APMC Central Mandi Yard",
    code: "BR-RHT-02",
    district: "Rohtas",
    state: "Bihar",
    address: "Old GT Road, Krishi Upaj Mandi Complex, Sasaram - 821115",
    latitude: 24.9519,
    longitude: 84.0315,
    totalCounters: 6,
    operatingHoursStart: "08:00",
    operatingHoursEnd: "18:30",
    isActive: true,
  },

  // ── 5 Mandis in Punjab ──
  {
    name: "Khanna Main Asian Grain Market (Yard #1)",
    code: "PB-KHN-01",
    district: "Ludhiana",
    state: "Punjab",
    address: "GT Road, Asia's Largest Grain Market Yard #1, Khanna - 141401",
    latitude: 30.7068,
    longitude: 76.2163,
    totalCounters: 8,
    operatingHoursStart: "07:30",
    operatingHoursEnd: "19:00",
    isActive: true,
  },
  {
    name: "Rajpura APMC Grain Procurement Complex",
    code: "PB-RJP-02",
    district: "Patiala",
    state: "Punjab",
    address: "Focal Point Road, New Grain Market, Rajpura, Patiala - 140401",
    latitude: 30.4842,
    longitude: 76.5938,
    totalCounters: 6,
    operatingHoursStart: "08:00",
    operatingHoursEnd: "18:00",
    isActive: true,
  },
  {
    name: "Sirhind Grain Market Yard",
    code: "PB-SRH-03",
    district: "Fatehgarh Sahib",
    state: "Punjab",
    address: "Bassi Pathana Road, Anaj Mandi Complex, Sirhind - 140406",
    latitude: 30.6425,
    longitude: 76.3887,
    totalCounters: 4,
    operatingHoursStart: "08:30",
    operatingHoursEnd: "17:30",
    isActive: true,
  },
  {
    name: "Jagraon Anaj Mandi Procurement Yard",
    code: "PB-JGR-04",
    district: "Ludhiana",
    state: "Punjab",
    address: "Ludhiana-Ferozepur Highway, Main Grain Market, Jagraon - 142026",
    latitude: 30.785,
    longitude: 75.4789,
    totalCounters: 5,
    operatingHoursStart: "08:00",
    operatingHoursEnd: "18:00",
    isActive: true,
  },
  {
    name: "Kapurthala APMC Grain Market Complex",
    code: "PB-KPT-05",
    district: "Kapurthala",
    state: "Punjab",
    address: "Sultanpur Lodhi Road, Anaj Mandi Yard, Kapurthala - 144601",
    latitude: 31.3802,
    longitude: 75.3815,
    totalCounters: 5,
    operatingHoursStart: "08:00",
    operatingHoursEnd: "17:30",
    isActive: true,
  },
];

const timeSlots = [
  { start: "08:00", end: "10:00" },
  { start: "10:00", end: "12:00" },
  { start: "12:30", end: "14:30" },
  { start: "14:30", end: "16:30" },
];

async function seedMandis() {
  console.log("🌾 Seeding 10 Real Mandis (3 WB, 2 Bihar, 5 Punjab)...");

  for (const mandi of MANDIS_DATA) {
    const centre = await prisma.procurementCentre.upsert({
      where: { code: mandi.code },
      update: {
        name: mandi.name,
        district: mandi.district,
        state: mandi.state,
        address: mandi.address,
        latitude: mandi.latitude,
        longitude: mandi.longitude,
        totalCounters: mandi.totalCounters,
        operatingHoursStart: mandi.operatingHoursStart,
        operatingHoursEnd: mandi.operatingHoursEnd,
        isActive: mandi.isActive,
      },
      create: {
        name: mandi.name,
        code: mandi.code,
        district: mandi.district,
        state: mandi.state,
        address: mandi.address,
        latitude: mandi.latitude,
        longitude: mandi.longitude,
        totalCounters: mandi.totalCounters,
        operatingHoursStart: mandi.operatingHoursStart,
        operatingHoursEnd: mandi.operatingHoursEnd,
        isActive: mandi.isActive,
      },
    });

    console.log(`✅ Mandi Ready: [${centre.code}] ${centre.name} (${centre.district}, ${centre.state})`);

    // Generate next 7 days operational slots
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const slotDate = new Date(today);
      slotDate.setDate(slotDate.getDate() + dayOffset);

      for (const slotTime of timeSlots) {
        const existing = await prisma.slot.findFirst({
          where: {
            centreId: centre.id,
            date: slotDate,
            startTime: slotTime.start,
          },
        });

        if (!existing) {
          await prisma.slot.create({
            data: {
              centreId: centre.id,
              date: slotDate,
              startTime: slotTime.start,
              endTime: slotTime.end,
              capacity: mandi.totalCounters * 8, // Realistic capacity based on counters
              booked: dayOffset === 0 ? Math.floor(Math.random() * 5) : 0,
              isActive: true,
            },
          });
        }
      }
    }
  }

  const total = await prisma.procurementCentre.count();
  const totalSlots = await prisma.slot.count();
  console.log(`\n🎉 Success! Total Mandis in DB: ${total}, Total Active Slots: ${totalSlots}`);
  process.exit(0);
}

seedMandis().catch((err) => {
  console.error("❌ Error seeding mandis:", err);
  process.exit(1);
});
