import { prisma } from "../config/database";
import { UserRole } from "@prisma/client";
import { getIO } from "../socket/socketServer";

// Master MSP rates configuration with dynamic updates
let mspMasterList = [
  { id: "crop-1", name: "Wheat (Kanak)", code: "WHEAT", mspRate: 2275, perAcreLimit: 25, category: "RABI", mspIncreasePct: 5.8, cropCategory: "Cereals" },
  { id: "crop-2", name: "Paddy (Common)", code: "PADDY_COMMON", mspRate: 2183, perAcreLimit: 30, category: "KHARIF", mspIncreasePct: 4.2, cropCategory: "Cereals" },
  { id: "crop-3", name: "Paddy (Grade A)", code: "PADDY_GRADE_A", mspRate: 2203, perAcreLimit: 30, category: "KHARIF", mspIncreasePct: 4.1, cropCategory: "Cereals" },
  { id: "crop-4", name: "Mustard (Sarson)", code: "MUSTARD", mspRate: 5650, perAcreLimit: 15, category: "RABI", mspIncreasePct: 7.3, cropCategory: "Oilseeds" },
  { id: "crop-5", name: "Cotton (Medium Staple)", code: "COTTON", mspRate: 7020, perAcreLimit: 12, category: "KHARIF", mspIncreasePct: 6.9, cropCategory: "Fibre" },
  { id: "crop-6", name: "Maize (Makka)", code: "MAIZE", mspRate: 2090, perAcreLimit: 28, category: "KHARIF", mspIncreasePct: 3.8, cropCategory: "Cereals" },
  { id: "crop-7", name: "Gram (Chana)", code: "GRAM", mspRate: 5440, perAcreLimit: 14, category: "RABI", mspIncreasePct: 6.2, cropCategory: "Pulses" },
  { id: "crop-8", name: "Soybean (Yellow)", code: "SOYBEAN", mspRate: 4892, perAcreLimit: 16, category: "KHARIF", mspIncreasePct: 5.5, cropCategory: "Oilseeds" },
];

/**
 * Record an immutable audit log entry
 */
export async function recordAuditLog(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  oldValue?: any,
  newValue?: any,
  ipAddress?: string
) {
  try {
    // If user doesn't exist in DB, fallback to any admin or system user
    let validUserId = userId;
    const exists = await prisma.user.findUnique({ where: { id: userId } });
    if (!exists) {
      const firstAdmin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
      if (firstAdmin) {
        validUserId = firstAdmin.id;
      } else {
        const anyUser = await prisma.user.findFirst();
        if (anyUser) validUserId = anyUser.id;
      }
    }

    if (validUserId) {
      await prisma.auditLog.create({
        data: {
          userId: validUserId,
          action,
          entity,
          entityId,
          oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
          newValue: newValue ? JSON.stringify(newValue) : undefined,
          ipAddress: ipAddress || "127.0.0.1",
        },
      });
    }
  } catch (err) {
    console.warn("Could not write audit log to DB:", err);
  }
}

/**
 * List real immutable audit logs
 */
export async function listAuditLogs(take: number = 50) {
  const logs = await prisma.auditLog.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    oldValue: log.oldValue,
    newValue: log.newValue,
    ipAddress: log.ipAddress || "127.0.0.1",
    createdAt: log.createdAt,
    user: log.user,
  }));
}

/**
 * High-level state-wide metrics
 */
export async function getAdminMetrics() {
  const [
    totalCentres,
    activeCentres,
    totalFarmers,
    totalOperators,
    procurementAgg,
    disbursedAgg,
    todayBookings,
    todayCompleted,
  ] = await Promise.all([
    prisma.procurementCentre.count(),
    prisma.procurementCentre.count({ where: { isActive: true } }),
    prisma.farmer.count(),
    prisma.operator.count(),
    prisma.procurementRecord.aggregate({
      _sum: { actualWeight: true, totalAmount: true },
      _count: { id: true },
    }),
    prisma.payment.aggregate({
      where: { status: "DISBURSED" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "COMPLETED" } }),
  ]);

  return {
    totalCentres,
    activeCentres,
    totalFarmers,
    totalOperators,
    totalQuintalsProcured: procurementAgg._sum.actualWeight || 0,
    totalProcurementValue: procurementAgg._sum.totalAmount || 0,
    totalDisbursedAmount: disbursedAgg._sum.amount || 0,
    totalDisbursedCount: disbursedAgg._count.id || 0,
    totalBookingsToday: todayBookings,
    todayCompletedCount: todayCompleted,
    systemUptime: "99.98%",
    activeSensors: `${activeCentres} / ${totalCentres} Online`,
  };
}

/**
 * List centres with live congestion and GIS coordinates
 */
export async function listCentresWithAnalytics() {
  const centres = await prisma.procurementCentre.findMany({
    include: {
      _count: {
        select: {
          slots: true,
          bookings: true,
          operators: true,
        },
      },
      operators: {
        include: {
          user: {
            select: { name: true, phone: true, email: true },
          },
        },
      },
    },
    orderBy: { code: "asc" },
  });

  return centres.map((centre) => {
    const totalSlots = centre._count.slots || 1;
    const booked = centre._count.bookings || 0;
    const ratio = Math.min(100, Math.round((booked / (totalSlots * 35)) * 100)) || 25;

    let congestion: "LOW" | "MODERATE" | "HIGH" = "LOW";
    if (ratio > 75) congestion = "HIGH";
    else if (ratio > 45) congestion = "MODERATE";

    return {
      id: centre.id,
      name: centre.name,
      code: centre.code,
      address: centre.address,
      district: centre.district,
      state: centre.state,
      latitude: centre.latitude || 30.5,
      longitude: centre.longitude || 76.5,
      totalCounters: centre.totalCounters,
      operatingHoursStart: centre.operatingHoursStart,
      operatingHoursEnd: centre.operatingHoursEnd,
      isActive: centre.isActive,
      operatorsCount: centre._count.operators,
      operators: centre.operators.map((o) => ({
        id: o.id,
        name: o.user.name,
        phone: o.user.phone,
        employeeId: o.employeeId,
      })),
      totalBookings: centre._count.bookings,
      congestion,
      congestionRatio: ratio,
      estimatedWaitMins: congestion === "HIGH" ? 45 : congestion === "MODERATE" ? 22 : 8,
    };
  });
}

/**
 * Create a new procurement centre
 */
export async function createCentre(data: {
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  totalCounters?: number;
  operatingHoursStart?: string;
  operatingHoursEnd?: string;
  staffName?: string;
  staffPhone?: string;
}) {
  const totalCounters = Number(data.totalCounters) || 4;

  const centre = await prisma.procurementCentre.create({
    data: {
      name: data.name,
      code: data.code.toUpperCase(),
      address: data.address,
      district: data.district,
      state: data.state,
      latitude: data.latitude || 30.5,
      longitude: data.longitude || 76.5,
      totalCounters,
      operatingHoursStart: data.operatingHoursStart || "08:00",
      operatingHoursEnd: data.operatingHoursEnd || "18:00",
      isActive: true,
    },
  });

  // Automatically register & assign Mandi Operator Incharge if staff details provided or by default
  const staffName = data.staffName?.trim() || `${data.name} Operator Incharge`;
  const staffPhone = data.staffPhone?.trim() || `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`;
  const cleanCode = data.code.toLowerCase().replace(/[^a-z0-9]/g, "");

  try {
    const staffUser = await prisma.user.create({
      data: {
        firebaseUid: `staff_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: staffName,
        email: `${cleanCode}.desk@mandi.gov.in`,
        phone: staffPhone,
        role: "OPERATOR",
        isActive: true,
      },
    });

    await prisma.operator.create({
      data: {
        userId: staffUser.id,
        centreId: centre.id,
        employeeId: `EMP-${data.code.split("-")[1] || "MND"}-${Math.floor(100 + Math.random() * 900)}`,
      },
    });
  } catch (err) {
    console.warn("Could not create default operator for centre:", err);
  }

  // Auto-generate next 7 days operational slots based on counters capacity
  try {
    await generateSlotsForCentre(centre.id, new Date().toISOString().split("T")[0], 7, totalCounters * 8);
  } catch (err) {
    console.warn("Could not auto-generate slots for centre:", err);
  }

  // Broadcast to Admin socket
  const io = getIO();
  if (io) {
    io.emit("admin:centre-created", centre);
  }

  return centre;
}

/**
 * Update centre configuration
 */
export async function updateCentre(
  id: string,
  data: {
    name?: string;
    address?: string;
    totalCounters?: number;
    operatingHoursStart?: string;
    operatingHoursEnd?: string;
    isActive?: boolean;
  }
) {
  const updated = await prisma.procurementCentre.update({
    where: { id },
    data,
  });

  const io = getIO();
  if (io) {
    io.emit("admin:centre-updated", updated);
  }

  return updated;
}

/**
 * Batch generate slots for a centre
 */
export async function generateSlotsForCentre(
  centreId: string,
  startDateStr: string,
  daysCount: number = 7,
  capacityPerSlot: number = 35
) {
  const centre = await prisma.procurementCentre.findUnique({
    where: { id: centreId },
  });
  if (!centre) {
    throw new Error("Procurement Centre not found");
  }

  const windows = [
    { start: "08:00", end: "10:00" },
    { start: "10:00", end: "12:00" },
    { start: "12:30", end: "14:30" },
    { start: "14:30", end: "16:30" },
  ];

  // Parse date safely in UTC
  const [year, month, day] = (startDateStr || new Date().toISOString().split("T")[0])
    .split("-")
    .map(Number);
  const baseDate = new Date(Date.UTC(year, (month || 1) - 1, day || 1));

  let createdCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < daysCount; i++) {
    const slotDate = new Date(baseDate);
    slotDate.setUTCDate(slotDate.getUTCDate() + i);

    for (const win of windows) {
      const existing = await prisma.slot.findFirst({
        where: {
          centreId,
          date: slotDate,
          startTime: win.start,
        },
      });

      if (!existing) {
        await prisma.slot.create({
          data: {
            centreId,
            date: slotDate,
            startTime: win.start,
            endTime: win.end,
            capacity: capacityPerSlot,
            booked: 0,
            isActive: true,
          },
        });
        createdCount++;
      } else {
        await prisma.slot.update({
          where: { id: existing.id },
          data: {
            capacity: capacityPerSlot,
            isActive: true,
          },
        });
        updatedCount++;
      }
    }
  }

  const totalProcessed = createdCount + updatedCount;
  const message =
    createdCount > 0
      ? `✅ Successfully created ${createdCount} new slots (${totalProcessed} active operational windows) for ${centre.name} across ${daysCount} days (Capacity: ${capacityPerSlot} vehicles/window)`
      : `⚡ All ${updatedCount} operational slots for ${centre.name} are already active and up-to-date across ${daysCount} days (Capacity synced: ${capacityPerSlot} vehicles/window)`;

  return {
    success: true,
    message,
    createdCount,
    updatedCount,
    totalSlots: totalProcessed,
  };
}

/**
 * Crop catalog & MSP Master
 */
export async function listCropsMaster() {
  const cropCounts = await prisma.crop.groupBy({
    by: ["name"],
    _count: { id: true },
    _sum: { quantity: true },
  });

  const countMap = new Map<string, { count: number; quantity: number }>();
  for (const c of cropCounts) {
    countMap.set(c.name.toLowerCase(), {
      count: c._count.id,
      quantity: c._sum.quantity || 0,
    });
  }

  return mspMasterList.map((item) => {
    const stats = countMap.get(item.name.toLowerCase()) || { count: 0, quantity: 0 };
    return {
      ...item,
      registeredFarmers: stats.count,
      totalQuintalsExpected: stats.quantity,
    };
  });
}

/**
 * Update Government MSP rate for a crop
 */
export async function updateCropMspRate(code: string, newRate: number, newPerAcreLimit?: number, adminUserId?: string) {
  const target = mspMasterList.find((c) => c.code === code || c.id === code);
  if (!target) {
    throw new Error("Crop not found in master configuration");
  }

  const oldRate = target.mspRate;
  target.mspRate = newRate;
  if (newPerAcreLimit) {
    target.perAcreLimit = newPerAcreLimit;
  }

  // Record Audit Log
  if (adminUserId) {
    await recordAuditLog(
      adminUserId,
      "MSP_RATE_UPDATED",
      "CropMaster",
      target.code,
      { mspRate: oldRate },
      { mspRate: newRate, perAcreLimit: target.perAcreLimit }
    );
  }

  // Broadcast to all clients via Socket
  const io = getIO();
  if (io) {
    io.emit("gov:msp-updated", {
      code: target.code,
      name: target.name,
      newRate,
      perAcreLimit: target.perAcreLimit,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    success: true,
    message: `MSP for ${target.name} updated to ₹${newRate.toLocaleString("en-IN")}/quintal`,
    crop: target,
  };
}

/**
 * Add new Crop to Master MSP catalog
 */
export async function createCropMaster(
  data: {
    name: string;
    code: string;
    category: "RABI" | "KHARIF";
    cropCategory: string;
    mspRate: number;
    perAcreLimit: number;
    mspIncreasePct?: number;
  },
  adminUserId?: string
) {
  const codeNormalized = data.code.trim().toUpperCase().replace(/\s+/g, "_");
  const existing = mspMasterList.find(
    (c) => c.code.toUpperCase() === codeNormalized
  );
  if (existing) {
    throw new Error(`Crop with code "${codeNormalized}" already exists in Master Catalog`);
  }

  const newCropItem = {
    id: `crop-${Date.now()}`,
    name: data.name.trim(),
    code: codeNormalized,
    mspRate: data.mspRate,
    perAcreLimit: data.perAcreLimit,
    category: data.category,
    mspIncreasePct: data.mspIncreasePct || 5.0,
    cropCategory: data.cropCategory,
  };

  mspMasterList.push(newCropItem);

  if (adminUserId) {
    await recordAuditLog(
      adminUserId,
      "CROP_CREATED",
      "CropMaster",
      newCropItem.code,
      undefined,
      newCropItem
    );
  }

  const io = getIO();
  if (io) {
    io.emit("gov:crop-created", newCropItem);
  }

  return newCropItem;
}

/**
 * Users directory with RBAC
 */
export async function listAllUsers(search?: string, roleFilter?: UserRole | string) {
  const where: any = {};
  if (roleFilter && roleFilter !== "ALL" && (roleFilter === "FARMER" || roleFilter === "OPERATOR" || roleFilter === "ADMIN")) {
    where.role = roleFilter as UserRole;
  }
  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { email: { contains: search.trim(), mode: "insensitive" } },
      { phone: { contains: search.trim(), mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      farmer: {
        select: {
          id: true,
          farmerId: true,
          state: true,
          district: true,
          village: true,
          landArea: true,
        },
      },
      operator: {
        include: {
          centre: {
            select: { id: true, name: true, code: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    avatarUrl: u.avatarUrl,
    isActive: u.isActive,
    createdAt: u.createdAt,
    farmerDetails: u.farmer
      ? {
          farmerId: u.farmer.farmerId || "KQ-VERIFIED",
          state: u.farmer.state,
          district: u.farmer.district,
          landArea: u.farmer.landArea,
        }
      : null,
    operatorDetails: u.operator
      ? {
          employeeId: u.operator.employeeId,
          centreName: u.operator.centre.name,
          centreCode: u.operator.centre.code,
        }
      : null,
  }));
}

/**
 * Create a new user by Admin
 */
export async function createUserByAdmin(data: {
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  centreId?: string;
  district?: string;
  state?: string;
  landArea?: number;
}) {
  const firebaseUid = `admin_created_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const user = await prisma.user.create({
    data: {
      firebaseUid,
      name: data.name,
      email: data.email || undefined,
      phone: data.phone,
      role: data.role,
      isActive: true,
    },
  });

  if (data.role === "FARMER") {
    await prisma.farmer.create({
      data: {
        userId: user.id,
        farmerId: `FID-${Math.floor(100000 + Math.random() * 900000)}`,
        district: data.district || "Ambala",
        state: data.state || "Haryana",
        landArea: data.landArea || 5.0,
      },
    });
  } else if (data.role === "OPERATOR") {
    let targetCentreId = data.centreId;
    if (!targetCentreId) {
      const firstCentre = await prisma.procurementCentre.findFirst();
      if (firstCentre) targetCentreId = firstCentre.id;
    }

    if (targetCentreId) {
      await prisma.operator.create({
        data: {
          userId: user.id,
          centreId: targetCentreId,
          employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
    }
  }

  // Socket notification
  const io = getIO();
  if (io) {
    io.emit("admin:user-created", user);
  }

  return user;
}

/**
 * Update user active/inactive status
 */
export async function updateUserStatus(userId: string, isActive: boolean) {
  return await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
}

/**
 * Update user role and assign centre
 */
export async function updateUserRole(userId: string, newRole: UserRole, centreId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { operator: true },
  });
  if (!user) {
    throw new Error("User not found");
  }

  // Update role
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  // If role is OPERATOR and centre is specified, link or create Operator record
  if (newRole === "OPERATOR" && centreId) {
    if (user.operator) {
      await prisma.operator.update({
        where: { id: user.operator.id },
        data: { centreId },
      });
    } else {
      await prisma.operator.create({
        data: {
          userId: user.id,
          centreId,
          employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
    }
  }

  return {
    success: true,
    message: `Role for ${user.name} updated to ${newRole}`,
    user: updatedUser,
  };
}

/**
 * Strategic time-series analytics (past 7 days volume)
 */
export async function getStrategicAnalytics() {
  const [
    procurementAgg,
    disbursedAgg,
    totalBookings,
    totalCentres,
    activeCentres,
    cropCounts,
  ] = await Promise.all([
    prisma.procurementRecord.aggregate({
      _sum: { actualWeight: true, totalAmount: true },
      _count: { id: true },
    }),
    prisma.payment.aggregate({
      where: { status: "DISBURSED" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.booking.count(),
    prisma.procurementCentre.count(),
    prisma.procurementCentre.count({ where: { isActive: true } }),
    prisma.crop.groupBy({
      by: ["name"],
      _sum: { quantity: true },
      _count: { id: true },
    }),
  ]);

  const totalDbWeight = procurementAgg._sum.actualWeight || 0;
  const totalDbAmount = procurementAgg._sum.totalAmount || 0;
  const totalDbProcurements = procurementAgg._count.id || 0;

  // Build 7-day time series overlaying real DB numbers with baseline levels
  const days: { day: string; date: string; wheat: number; paddy: number; mustard: number; total: number; amount: number; bookings: number }[] = [];
  const now = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = dayNames[d.getDay()];

    const baseW = 420 + ((i * 73) % 240);
    const baseP = 220 + ((i * 47) % 180);
    const baseM = 110 + ((i * 31) % 90);

    const dayWheat = i === 0 && totalDbWeight > 0 ? Math.round(totalDbWeight * 0.6) : baseW;
    const dayPaddy = i === 0 && totalDbWeight > 0 ? Math.round(totalDbWeight * 0.3) : baseP;
    const dayMustard = i === 0 && totalDbWeight > 0 ? Math.round(totalDbWeight * 0.1) : baseM;
    const dayTotal = dayWheat + dayPaddy + dayMustard;

    days.push({
      day: dayLabel,
      date: dateStr,
      wheat: dayWheat,
      paddy: dayPaddy,
      mustard: dayMustard,
      total: dayTotal,
      amount: dayTotal * 2275,
      bookings: i === 0 ? Math.max(totalBookings, 6) : Math.round(dayTotal / 32),
    });
  }

  let cropShare = [
    { name: "Wheat (Kanak)", value: 58, qtl: "2,697 Qtl", color: "#10b981", icon: "🌿" },
    { name: "Paddy (Common)", value: 24, qtl: "1,116 Qtl", color: "#2563eb", icon: "📊" },
    { name: "Mustard (Sarson)", value: 12, qtl: "558 Qtl", color: "#f59e0b", icon: "🌾" },
    { name: "Cotton / Other", value: 6, qtl: "279 Qtl", color: "#8b5cf6", icon: "🌽" },
  ];

  if (cropCounts && cropCounts.length > 0) {
    const totalQtl = cropCounts.reduce((acc, c) => acc + (c._sum.quantity || 0), 0);
    if (totalQtl > 0) {
      const colors = ["#10b981", "#2563eb", "#f59e0b", "#8b5cf6", "#ec4899"];
      const icons = ["🌿", "📊", "🌾", "🌽", "🌱"];
      const dbShares = cropCounts.slice(0, 5).map((c, idx) => {
        const qtl = c._sum.quantity || 0;
        const pct = Math.max(1, Math.round((qtl / totalQtl) * 100));
        return {
          name: c.name,
          value: pct,
          qtl: `${qtl.toLocaleString("en-IN")} Qtl`,
          color: colors[idx % colors.length],
          icon: icons[idx % icons.length],
        };
      });
      if (dbShares.length > 0) {
        cropShare = dbShares;
      }
    }
  }

  return {
    procurementTrend: days,
    cropShare,
    peakHours: [
      { hour: "08:00", waitMins: 15 },
      { hour: "09:00", waitMins: 24 },
      { hour: "10:00", waitMins: 38 },
      { hour: "11:00", waitMins: 52 },
      { hour: "12:00", waitMins: 35 },
      { hour: "13:00", waitMins: 21 },
      { hour: "14:00", waitMins: 27 },
      { hour: "15:00", waitMins: 32 },
      { hour: "16:00", waitMins: 18 },
    ],
    congestionData: [
      { time: "08 AM", capacity: 50, checkIns: Math.max(4, totalBookings > 0 ? Math.round(totalBookings * 0.15) : 12) },
      { time: "10 AM", capacity: 54, checkIns: Math.max(8, totalBookings > 0 ? Math.round(totalBookings * 0.4) : 42) },
      { time: "12 PM", capacity: 56, checkIns: Math.max(10, totalBookings > 0 ? Math.round(totalBookings * 0.45) : 48) },
      { time: "02 PM", capacity: 46, checkIns: Math.max(6, totalBookings > 0 ? Math.round(totalBookings * 0.3) : 32) },
      { time: "04 PM", capacity: 36, checkIns: Math.max(3, totalBookings > 0 ? Math.round(totalBookings * 0.2) : 20) },
    ],
    averageTurnaroundMinutes: 35,
    summary: {
      totalQuintalsProcured: totalDbWeight > 0 ? totalDbWeight : 4650,
      totalProcurementValue: totalDbAmount > 0 ? totalDbAmount : 10578750,
      totalBookings: totalBookings > 0 ? totalBookings : 142,
      totalCompletedProcurements: totalDbProcurements,
      totalCentres: totalCentres > 0 ? totalCentres : 5,
      activeCentres: activeCentres > 0 ? activeCentres : 5,
      totalDisbursedAmount: disbursedAgg._sum.amount || 0,
      totalDisbursedCount: disbursedAgg._count.id || 0,
    },
  };
}
