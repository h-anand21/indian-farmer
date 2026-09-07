import prisma from "../config/database";
import { UserRole } from "../types/enums";

/**
 * Auth Service — User lookup and creation logic
 * Firebase handles actual authentication (phone OTP).
 * This service manages the application-level user records in Neon DB.
 */

interface CreateUserInput {
  firebaseUid: string;
  phone: string;
  name: string;
  role: UserRole;
}

interface CreateFarmerProfileInput {
  userId: string;
  farmerId?: string;
  dateOfBirth?: Date;
  state?: string;
  district?: string;
  tehsil?: string;
  village?: string;
  pincode?: string;
  landArea?: number;
  ownershipType?: string;
}

/**
 * Find user by Firebase UID
 */
export async function findUserByFirebaseUid(firebaseUid: string) {
  return prisma.user.findUnique({
    where: { firebaseUid },
    include: {
      farmer: true,
      operator: {
        include: { centre: true },
      },
    },
  });
}

/**
 * Find user by phone number
 */
export async function findUserByPhone(phone: string) {
  return prisma.user.findUnique({
    where: { phone },
    include: {
      farmer: true,
      operator: {
        include: { centre: true },
      },
    },
  });
}

/**
 * Create a new user + farmer profile in a single transaction
 */
export async function createFarmerUser(
  input: CreateUserInput,
  farmerProfile?: Partial<CreateFarmerProfileInput>
) {
  return prisma.$transaction(async (tx) => {
    // Create user record
    const user = await tx.user.create({
      data: {
        firebaseUid: input.firebaseUid,
        phone: input.phone,
        name: input.name,
        role: input.role,
      },
    });

    // Create farmer profile if role is FARMER
    if (input.role === UserRole.FARMER) {
      await tx.farmer.create({
        data: {
          userId: user.id,
          farmerId: farmerProfile?.farmerId,
          dateOfBirth: farmerProfile?.dateOfBirth,
          state: farmerProfile?.state,
          district: farmerProfile?.district,
          tehsil: farmerProfile?.tehsil,
          village: farmerProfile?.village,
          pincode: farmerProfile?.pincode,
          landArea: farmerProfile?.landArea,
          ownershipType: farmerProfile?.ownershipType,
        },
      });
    }

    // Return complete user with relations
    return tx.user.findUnique({
      where: { id: user.id },
      include: {
        farmer: true,
        operator: {
          include: { centre: true },
        },
      },
    });
  });
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  data: { name?: string; avatarUrl?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    include: {
      farmer: true,
      operator: {
        include: { centre: true },
      },
    },
  });
}

/**
 * Update farmer profile details
 */
export async function updateFarmerProfile(
  farmerId: string,
  data: Partial<CreateFarmerProfileInput>
) {
  return prisma.farmer.update({
    where: { id: farmerId },
    data: {
      farmerId: data.farmerId,
      state: data.state,
      district: data.district,
      tehsil: data.tehsil,
      village: data.village,
      pincode: data.pincode,
      landArea: data.landArea,
      ownershipType: data.ownershipType,
    },
  });
}

/**
 * Set custom claims on Firebase user (role)
 * This is used to set the role in the Firebase token
 */
export async function setFirebaseCustomClaims(
  firebaseUid: string,
  role: string
) {
  // Import here to avoid circular dependency
  const { firebaseAuth } = await import("../config/firebase-admin");
  await firebaseAuth.setCustomUserClaims(firebaseUid, { role });
}
