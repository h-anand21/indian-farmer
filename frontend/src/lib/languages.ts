// ─────────────────────────────────────────────────────────
// Indian Regional Languages Master Directory & Google Translate Controller
// Supports all 28 States & 8 Union Territories
// ─────────────────────────────────────────────────────────

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  states: string;
  shortTag: string;
  badgeBg: string;
  textColor: string;
  isPopular?: boolean;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    states: "All India / Official Default",
    shortTag: "EN",
    badgeBg: "bg-slate-800",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    states: "UP, MP, Bihar, Rajasthan, Haryana, Delhi, HP, UK",
    shortTag: "हि",
    badgeBg: "bg-amber-600",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    states: "Punjab, Chandigarh, Haryana",
    shortTag: "ਪੰ",
    badgeBg: "bg-orange-600",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    states: "Maharashtra, Goa",
    shortTag: "म",
    badgeBg: "bg-rose-600",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    states: "Gujarat, Dadra & Nagar Haveli, Daman & Diu",
    shortTag: "ગુ",
    badgeBg: "bg-cyan-700",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    states: "West Bengal, Tripura, Assam",
    shortTag: "বা",
    badgeBg: "bg-emerald-700",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    states: "Andhra Pradesh, Telangana",
    shortTag: "తె",
    badgeBg: "bg-indigo-600",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    states: "Tamil Nadu, Puducherry",
    shortTag: "த",
    badgeBg: "bg-red-700",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    states: "Karnataka",
    shortTag: "ಕ",
    badgeBg: "bg-yellow-700",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    states: "Kerala, Lakshadweep",
    shortTag: "മ",
    badgeBg: "bg-teal-700",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    states: "Odisha",
    shortTag: "ଓ",
    badgeBg: "bg-purple-700",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "as",
    name: "Assamese",
    nativeName: "অসমীয়া",
    states: "Assam",
    shortTag: "অ",
    badgeBg: "bg-lime-700",
    textColor: "text-white",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    states: "Jammu & Kashmir, Telangana, UP, Bihar, Delhi",
    shortTag: "اردو",
    badgeBg: "bg-emerald-800",
    textColor: "text-white",
    isPopular: true,
  },
  {
    code: "bho",
    name: "Bhojpuri",
    nativeName: "भोजपुरी",
    states: "Bihar, Eastern UP, Jharkhand",
    shortTag: "भोज",
    badgeBg: "bg-orange-700",
    textColor: "text-white",
  },
  {
    code: "mai",
    name: "Maithili",
    nativeName: "मैथिली",
    states: "Bihar, Mithila, Jharkhand",
    shortTag: "मै",
    badgeBg: "bg-pink-700",
    textColor: "text-white",
  },
  {
    code: "sa",
    name: "Sanskrit",
    nativeName: "संस्कृतम्",
    states: "Classical / Pan-India",
    shortTag: "सं",
    badgeBg: "bg-amber-700",
    textColor: "text-white",
  },
  {
    code: "kok",
    name: "Konkani",
    nativeName: "कोंकणी",
    states: "Goa, Coastal Maharashtra, Karnataka",
    shortTag: "कों",
    badgeBg: "bg-blue-700",
    textColor: "text-white",
  },
  {
    code: "sd",
    name: "Sindhi",
    nativeName: "سنڌي",
    states: "Gujarat, Rajasthan, Maharashtra",
    shortTag: "سن",
    badgeBg: "bg-stone-700",
    textColor: "text-white",
  },
  {
    code: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
    states: "Sikkim, West Bengal (Darjeeling)",
    shortTag: "ने",
    badgeBg: "bg-sky-700",
    textColor: "text-white",
  },
  {
    code: "doi",
    name: "Dogri",
    nativeName: "डोगरी",
    states: "Jammu & Kashmir, Himachal Pradesh",
    shortTag: "डो",
    badgeBg: "bg-violet-700",
    textColor: "text-white",
  },
  {
    code: "ks",
    name: "Kashmiri",
    nativeName: "کٲشُر",
    states: "Jammu & Kashmir Valley",
    shortTag: "کٲ",
    badgeBg: "bg-indigo-800",
    textColor: "text-white",
  },
  {
    code: "mni-Mtei",
    name: "Manipuri (Meitei)",
    nativeName: "মৈতৈলোন্",
    states: "Manipur",
    shortTag: "মৈ",
    badgeBg: "bg-fuchsia-800",
    textColor: "text-white",
  },
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
    // Hard refresh to restore original English layout
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
    // If the widget hasn't mounted yet, reload so the cookie takes effect
    window.location.reload();
  }
}
