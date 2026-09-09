/**
 * KisanQueue — Constants & Enums
 * Centralized configuration for status, colors, and app-wide constants
 */

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

// ── Status Visual Config (maps to design-tokens.css) ──
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
    bgColor: "var(--status-booked-bg)",
    textColor: "var(--status-booked-text)",
    borderColor: "var(--status-booked-border)",
  },
  CHECKED_IN: {
    label: "Checked In",
    icon: "✅",
    bgColor: "var(--status-checked-in-bg)",
    textColor: "var(--status-checked-in-text)",
    borderColor: "var(--status-checked-in-border)",
  },
  WAITING: {
    label: "Waiting",
    icon: "⏳",
    bgColor: "var(--status-waiting-bg)",
    textColor: "var(--status-waiting-text)",
    borderColor: "var(--status-waiting-border)",
  },
  CALLED: {
    label: "Called",
    icon: "🔔",
    bgColor: "var(--status-called-bg)",
    textColor: "var(--status-called-text)",
    borderColor: "var(--status-called-border)",
  },
  IN_PROCUREMENT: {
    label: "In Procurement",
    icon: "⚖",
    bgColor: "var(--status-checked-in-bg)",
    textColor: "var(--status-checked-in-text)",
    borderColor: "var(--status-checked-in-border)",
  },
  WEIGHED: {
    label: "Weighed",
    icon: "⚖",
    bgColor: "var(--status-checked-in-bg)",
    textColor: "var(--status-checked-in-text)",
    borderColor: "var(--status-checked-in-border)",
  },
  COMPLETED: {
    label: "Completed",
    icon: "✓",
    bgColor: "var(--status-completed-bg)",
    textColor: "var(--status-completed-text)",
    borderColor: "var(--status-completed-border)",
  },
  PAYMENT_PENDING: {
    label: "Payment Pending",
    icon: "💰",
    bgColor: "var(--status-waiting-bg)",
    textColor: "var(--status-waiting-text)",
    borderColor: "var(--status-waiting-border)",
  },
  PAID: {
    label: "Paid",
    icon: "✅",
    bgColor: "var(--status-completed-bg)",
    textColor: "var(--status-completed-text)",
    borderColor: "var(--status-completed-border)",
  },
  REJECTED: {
    label: "Rejected",
    icon: "✗",
    bgColor: "var(--status-rejected-bg)",
    textColor: "var(--status-rejected-text)",
    borderColor: "var(--status-rejected-border)",
  },
  NO_SHOW: {
    label: "No Show",
    icon: "○",
    bgColor: "var(--status-muted-bg)",
    textColor: "var(--status-muted-text)",
    borderColor: "var(--status-muted-border)",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: "○",
    bgColor: "var(--status-muted-bg)",
    textColor: "var(--status-muted-text)",
    borderColor: "var(--status-muted-border)",
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

// ── API Base URL ──
export const API_URL = import.meta.env.VITE_API_URL || "https://indian-farmer.onrender.com/api";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://indian-farmer.onrender.com";

// ── App Constants ──
export const APP_NAME = "KisanQueue";
export const APP_TAGLINE = "Your Crop. Your Slot. Your Turn.";
export const APP_DESCRIPTION = "Book your procurement slot, track your live queue, and know exactly when it's your turn.";
