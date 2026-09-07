// ══════════════════════════════════════════════
// KisanQueue — Backend TypeScript Enums
// Mirrors Prisma schema enums for type safety
// ══════════════════════════════════════════════

export enum UserRole {
  FARMER = "FARMER",
  OPERATOR = "OPERATOR",
  ADMIN = "ADMIN",
}

export enum BookingStatus {
  BOOKED = "BOOKED",
  CHECKED_IN = "CHECKED_IN",
  WAITING = "WAITING",
  CALLED = "CALLED",
  IN_PROCUREMENT = "IN_PROCUREMENT",
  WEIGHED = "WEIGHED",
  COMPLETED = "COMPLETED",
  PAYMENT_PENDING = "PAYMENT_PENDING",
  PAID = "PAID",
  REJECTED = "REJECTED",
  NO_SHOW = "NO_SHOW",
  CANCELLED = "CANCELLED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  DISBURSED = "DISBURSED",
  FAILED = "FAILED",
}

export enum QualityGrade {
  GRADE_A = "GRADE_A",
  GRADE_B = "GRADE_B",
  GRADE_C = "GRADE_C",
  FAQ_STANDARD = "FAQ_STANDARD",
}

export enum CongestionLevel {
  LOW = "LOW",
  MODERATE = "MODERATE",
  HIGH = "HIGH",
}

export enum NotificationType {
  QUEUE_ALERT = "QUEUE_ALERT",
  BOOKING_CONFIRMATION = "BOOKING_CONFIRMATION",
  TURN_CALLED = "TURN_CALLED",
  PAYMENT_UPDATE = "PAYMENT_UPDATE",
  SYSTEM = "SYSTEM",
  PROXIMITY_ALERT = "PROXIMITY_ALERT",
}
