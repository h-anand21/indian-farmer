/**
 * KisanQueue Mobile — Constants & Enums
 */
import Constants from 'expo-constants';
import Colors from '../theme/colors';

// ── User Roles ──
export const UserRole = {
  FARMER: "FARMER",
  OPERATOR: "OPERATOR",
  ADMIN: "ADMIN",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

// ── Booking Status ──
export const BookingStatus = {
  BOOKED: "BOOKED",
  CHECKED_IN: "CHECKED_IN",
  WAITING: "WAITING",
  CALLED: "CALLED",
  IN_PROCUREMENT: "IN_PROCUREMENT",
  WEIGHED: "WEIGHED",
  COMPLETED: "COMPLETED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  PAID: "PAID",
  REJECTED: "REJECTED",
  NO_SHOW: "NO_SHOW",
  CANCELLED: "CANCELLED",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

// ── Payment Status ──
export const PaymentStatus = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  DISBURSED: "DISBURSED",
  FAILED: "FAILED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

// ── Quality Grades ──
export const QualityGrade = {
  GRADE_A: "GRADE_A",
  GRADE_B: "GRADE_B",
  GRADE_C: "GRADE_C",
  FAQ_STANDARD: "FAQ_STANDARD",
} as const;

// ── Status Visual Config (maps to theme Colors) ──
export const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  BOOKED: {
    label: "Booked",
    icon: "📋",
    bgColor: Colors.light.statusBookedBg,
    textColor: Colors.light.statusBooked,
    borderColor: "#E6A21940",
  },
  CHECKED_IN: {
    label: "Checked In",
    icon: "✅",
    bgColor: Colors.light.statusCheckedInBg,
    textColor: Colors.light.statusCheckedIn,
    borderColor: "#2B70C940",
  },
  WAITING: {
    label: "Waiting",
    icon: "⏳",
    bgColor: Colors.light.statusBookedBg,
    textColor: Colors.light.statusBooked,
    borderColor: "#E6A21940",
  },
  CALLED: {
    label: "Called",
    icon: "🔔",
    bgColor: Colors.light.statusWeighingBg,
    textColor: Colors.light.statusWeighing,
    borderColor: "#E6691940",
  },
  IN_PROCUREMENT: {
    label: "In Procurement",
    icon: "⚖",
    bgColor: Colors.light.statusWeighingBg,
    textColor: Colors.light.statusWeighing,
    borderColor: "#E6691940",
  },
  WEIGHED: {
    label: "Weighed",
    icon: "⚖",
    bgColor: Colors.light.statusWeighingBg,
    textColor: Colors.light.statusWeighing,
    borderColor: "#E6691940",
  },
  COMPLETED: {
    label: "Completed",
    icon: "✓",
    bgColor: Colors.light.statusCompletedBg,
    textColor: Colors.light.statusCompleted,
    borderColor: "#2D8A3940",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    icon: "💰",
    bgColor: Colors.light.statusBookedBg,
    textColor: Colors.light.statusBooked,
    borderColor: "#E6A21940",
  },
  PAID: {
    label: "Paid",
    icon: "✅",
    bgColor: Colors.light.statusCompletedBg,
    textColor: Colors.light.statusCompleted,
    borderColor: "#2D8A3940",
  },
  REJECTED: {
    label: "Rejected",
    icon: "✗",
    bgColor: Colors.light.statusCancelledBg,
    textColor: Colors.light.statusCancelled,
    borderColor: "#D9383840",
  },
  NO_SHOW: {
    label: "No Show",
    icon: "○",
    bgColor: "#F0F0F0",
    textColor: "#707070",
    borderColor: "#D0D0D0",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "○",
    bgColor: Colors.light.statusCancelledBg,
    textColor: Colors.light.statusCancelled,
    borderColor: "#D9383840",
  },
};

// ── Crop Types ──
export const CROP_TYPES = [
  { value: "wheat", label: "Wheat (गेहूं)", emoji: "🌾" },
  { value: "paddy", label: "Paddy / Rice (धान)", emoji: "🌾" },
  { value: "maize", label: "Maize (मक्का)", emoji: "🌽" },
  { value: "mustard", label: "Mustard (सरसों)", emoji: "🌻" },
  { value: "pulses", label: "Pulses (दालें)", emoji: "🫘" },
  { value: "cotton", label: "Cotton (कपास)", emoji: "☁️" },
  { value: "sugarcane", label: "Sugarcane (गन्ना)", emoji: "🎋" },
  { value: "soybean", label: "Soybean (सोयाबीन)", emoji: "🫛" },
] as const;

// ── Queue Stage Timeline ──
export const QUEUE_STAGES = [
  { key: "checked_in", label: "Checked In", icon: "✓" },
  { key: "in_queue", label: "In Queue", icon: "●" },
  { key: "procurement", label: "Procurement", icon: "○" },
  { key: "completed", label: "Completed", icon: "○" },
] as const;

// ── API & Socket URL ──
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://indian-farmer.onrender.com/api";
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || "https://indian-farmer.onrender.com";

// ── App Info ──
export const APP_NAME = "KisanQueue";
export const APP_TAGLINE = "Smart Farming | Fair Prices | Better Tomorrow";
export const APP_DESCRIPTION = "Book mandi slots, track live queue position, and get fair MSP payments directly to your bank account.";
