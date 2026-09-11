/**
 * Formatting Utilities for KisanQueue Mobile App
 */

/**
 * Format a number as Indian Rupees (₹ 45,000)
 */
export function formatCurrency(amount: number): string {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }
}

/**
 * Format a phone number as +91 XXXXX XXXXX
 */
export function formatPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Generate initials from a user's full name
 */
export function getInitials(name: string): string {
  if (!name) return 'KQ';
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
