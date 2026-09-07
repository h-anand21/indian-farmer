// ─────────────────────────────────────────────────────────
// Indian Regional Languages Master Directory & Google Translate Controller
// Supports all 28 States & 8 Union Territories
// ─────────────────────────────────────────────────────────

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  states: string;
  flagEmoji: string;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  { code: "en", name: "English", nativeName: "English", states: "All India / Official Default", flagEmoji: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", states: "UP, MP, Bihar, Rajasthan, Haryana, Delhi, HP, UK", flagEmoji: "🇮🇳" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", states: "Punjab, Chandigarh, Haryana", flagEmoji: "🌾" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", states: "Maharashtra, Goa", flagEmoji: "🚩" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", states: "Gujarat, Dadra & Nagar Haveli, Daman & Diu", flagEmoji: "🌊" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", states: "West Bengal, Tripura, Assam", flagEmoji: "🪷" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", states: "Andhra Pradesh, Telangana", flagEmoji: "🏛️" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", states: "Tamil Nadu, Puducherry", flagEmoji: "🌴" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", states: "Karnataka", flagEmoji: "🌿" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", states: "Kerala, Lakshadweep", flagEmoji: "🥥" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", states: "Odisha", flagEmoji: "🌅" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", states: "Assam", flagEmoji: "🍃" },
  { code: "ur", name: "Urdu", nativeName: "اردو", states: "Jammu & Kashmir, Telangana, UP, Bihar, Delhi", flagEmoji: "🌙" },
  { code: "bho", name: "Bhojpuri", nativeName: "भोजपुरी", states: "Bihar, Eastern UP, Jharkhand", flagEmoji: "🎭" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", states: "Bihar, Mithila, Jharkhand", flagEmoji: "🌾" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", states: "Classical / Pan-India", flagEmoji: "📜" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", states: "Goa, Coastal Maharashtra, Karnataka", flagEmoji: "⛵" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", states: "Gujarat, Rajasthan, Maharashtra", flagEmoji: "🛡️" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", states: "Sikkim, West Bengal (Darjeeling)", flagEmoji: "🏔️" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", states: "Jammu & Kashmir, Himachal Pradesh", flagEmoji: "⛰️" },
  { code: "ks", name: "Kashmiri", nativeName: "کٲشُر", states: "Jammu & Kashmir Valley", flagEmoji: "❄️" },
  { code: "mni-Mtei", name: "Manipuri (Meitei)", nativeName: "মৈতৈলোন্", states: "Manipur", flagEmoji: "🌸" },
];

/**
 * Gets currently active language code from cookies or localStorage
 */
export function getCurrentLanguage(): string {
  if (typeof window === "undefined") return "en";

  // Check googtrans cookie
  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z-]+)/);
  if (match && match[1]) {
    return match[1];
  }

  // Fallback to localStorage
  const saved = localStorage.getItem("kisan_lang");
  return saved || "en";
}

/**
 * Switches the entire website language instantly using Google Website Translator.
 * Default is English. Changing language updates cookies and dispatches events.
 */
export function changeLanguage(langCode: string) {
  if (typeof window === "undefined") return;

  if (langCode === "en") {
    // Clear cookies to restore pure English
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    localStorage.removeItem("kisan_lang");

    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      select.value = "en";
      select.dispatchEvent(new Event("change"));
    }
    // Hard refresh to ensure 100% original layout
    window.location.reload();
    return;
  }

  // Set the google translation cookie
  const cookieVal = `/en/${langCode}`;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;
  localStorage.setItem("kisan_lang", langCode);

  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
  } else {
    // If the widget hasn't mounted yet, reload so the cookie takes effect on initialization
    window.location.reload();
  }
}
