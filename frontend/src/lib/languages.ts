// ─────────────────────────────────────────────────────────
// Indian Regional Languages Master Directory & Google Translate Controller
// Exact 22-Language Dataset for Pan-India Mandi Architecture
// ─────────────────────────────────────────────────────────

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  states: string;
  shortTag: string;
  avatarColor: string;
  iconClass: string;
  pinColor: string;
  region: "national" | "north" | "south" | "east" | "west";
  isPopular?: boolean;
  landmark: string;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    states: "All India (Official Default)",
    shortTag: "EN",
    avatarColor: "bg-[#1E293B]",
    iconClass: "icon-dark",
    pinColor: "text-emerald-700",
    region: "national",
    isPopular: true,
    landmark: "india-gate",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    states: "UP, MP, Bihar, Rajasthan, Haryana",
    shortTag: "हि",
    avatarColor: "bg-[#EA580C]",
    iconClass: "icon-orange",
    pinColor: "text-amber-700",
    region: "north",
    isPopular: true,
    landmark: "temple",
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    states: "Punjab, Chandigarh, Haryana",
    shortTag: "ਪੰ",
    avatarColor: "bg-[#EA580C]",
    iconClass: "icon-orange",
    pinColor: "text-red-700",
    region: "north",
    isPopular: true,
    landmark: "golden-temple",
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    states: "Maharashtra, Goa",
    shortTag: "म",
    avatarColor: "bg-[#E11D48]",
    iconClass: "icon-pink",
    pinColor: "text-rose-700",
    region: "west",
    isPopular: true,
    landmark: "gateway",
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    states: "Gujarat, Dadra & Nagar Haveli",
    shortTag: "ગુ",
    avatarColor: "bg-[#0284C7]",
    iconClass: "icon-teal",
    pinColor: "text-sky-700",
    region: "west",
    isPopular: true,
    landmark: "somnath",
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    states: "Andhra Pradesh, Telangana",
    shortTag: "తె",
    avatarColor: "bg-[#6366F1]",
    iconClass: "icon-purple",
    pinColor: "text-indigo-700",
    region: "south",
    isPopular: true,
    landmark: "charminar",
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    states: "West Bengal, Tripura, Assam",
    shortTag: "বা",
    avatarColor: "bg-[#059669]",
    iconClass: "icon-green",
    pinColor: "text-emerald-700",
    region: "east",
    isPopular: true,
    landmark: "howrah",
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    states: "Tamil Nadu, Puducherry",
    shortTag: "த",
    avatarColor: "bg-[#B91C1C]",
    iconClass: "icon-red",
    pinColor: "text-red-700",
    region: "south",
    isPopular: true,
    landmark: "gopuram",
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    states: "Karnataka",
    shortTag: "ಕ",
    avatarColor: "bg-[#B45309]",
    iconClass: "icon-brown",
    pinColor: "text-amber-800",
    region: "south",
    isPopular: true,
    landmark: "palace",
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    states: "Kerala, Lakshadweep",
    shortTag: "മ",
    avatarColor: "bg-[#0D9488]",
    iconClass: "icon-teal",
    pinColor: "text-teal-700",
    region: "south",
    isPopular: true,
    landmark: "palms",
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    states: "Odisha",
    shortTag: "ଓ",
    avatarColor: "bg-[#7C3AED]",
    iconClass: "icon-purple",
    pinColor: "text-purple-700",
    region: "east",
    isPopular: true,
    landmark: "konark",
  },
  {
    code: "as",
    name: "Assamese",
    nativeName: "অসমীয়া",
    states: "Assam",
    shortTag: "অ",
    avatarColor: "bg-[#65A30D]",
    iconClass: "icon-green",
    pinColor: "text-lime-700",
    region: "east",
    landmark: "rhino",
  },
  {
    code: "ur",
    name: "Urdu",
    nativeName: "اردو",
    states: "Jammu & Kashmir, Telangana (minority)",
    shortTag: "اردو",
    avatarColor: "bg-[#065F46]",
    iconClass: "icon-green",
    pinColor: "text-emerald-800",
    region: "national",
    isPopular: true,
    landmark: "minaret",
  },
  {
    code: "bho",
    name: "Bhojpuri",
    nativeName: "भोजपुरी",
    states: "Bihar, Eastern UP, Jharkhand",
    shortTag: "भोज",
    avatarColor: "bg-[#C2410C]",
    iconClass: "icon-orange",
    pinColor: "text-orange-700",
    region: "north",
    landmark: "bridge",
  },
  {
    code: "mai",
    name: "Maithili",
    nativeName: "मैथिली",
    states: "Bihar, Mithila, Jharkhand",
    shortTag: "मै",
    avatarColor: "bg-[#BE185D]",
    iconClass: "icon-pink",
    pinColor: "text-pink-700",
    region: "north",
    landmark: "mandir",
  },
  {
    code: "sa",
    name: "Sanskrit",
    nativeName: "संस्कृतम्",
    states: "Classical / Pan-India",
    shortTag: "सं",
    avatarColor: "bg-[#D97706]",
    iconClass: "icon-brown",
    pinColor: "text-amber-800",
    region: "national",
    landmark: "lotus",
  },
  {
    code: "kok",
    name: "Konkani",
    nativeName: "कोंकणी",
    states: "Goa, Coastal Maharashtra, Karnataka",
    shortTag: "कों",
    avatarColor: "bg-[#2563EB]",
    iconClass: "icon-blue",
    pinColor: "text-blue-700",
    region: "west",
    landmark: "beach-palms",
  },
  {
    code: "sd",
    name: "Sindhi",
    nativeName: "سنڌي",
    states: "Gujarat, Rajasthan, Maharashtra (minority)",
    shortTag: "سن",
    avatarColor: "bg-[#3F3F46]",
    iconClass: "icon-dark",
    pinColor: "text-stone-700",
    region: "west",
    landmark: "fort",
  },
  {
    code: "ne",
    name: "Nepali",
    nativeName: "नेपाली",
    states: "Sikkim, West Bengal (Darjeeling)",
    shortTag: "ने",
    avatarColor: "bg-[#0284C7]",
    iconClass: "icon-teal",
    pinColor: "text-sky-700",
    region: "east",
    landmark: "himalaya",
  },
  {
    code: "doi",
    name: "Dogri",
    nativeName: "डोगरी",
    states: "Jammu & Kashmir, Himachal Pradesh",
    shortTag: "डो",
    avatarColor: "bg-[#6D28D9]",
    iconClass: "icon-purple",
    pinColor: "text-purple-700",
    region: "north",
    landmark: "mountain-temple",
  },
  {
    code: "ks",
    name: "Kashmiri",
    nativeName: "کٲشُر",
    states: "Jammu & Kashmir Valley",
    shortTag: "کٲ",
    avatarColor: "bg-[#3730A3]",
    iconClass: "icon-blue",
    pinColor: "text-indigo-700",
    region: "north",
    landmark: "chinar",
  },
  {
    code: "mni-Mtei",
    name: "Manipuri (Meitei)",
    nativeName: "মৈতৈলোন্",
    states: "Manipur",
    shortTag: "মৈ",
    avatarColor: "bg-[#831843]",
    iconClass: "icon-pink",
    pinColor: "text-pink-800",
    region: "east",
    landmark: "palace-gate",
  },
];

/**
 * Gets currently active language code from cookies or localStorage
 */
export function getCurrentLanguage(): string {
  if (typeof window === "undefined") return "en";

  const match = document.cookie.match(/(?:^|;\s*)googtrans=\/en\/([a-zA-Z-]+)/);
  if (match && match[1]) {
    return match[1];
  }

  const saved = localStorage.getItem("kisan_lang");
  return saved || "en";
}

/**
 * Switches the entire website language instantly using Google Website Translator.
 */
export function changeLanguage(langCode: string) {
  if (typeof window === "undefined") return;

  if (langCode === "en") {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    localStorage.removeItem("kisan_lang");

    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      select.value = "en";
      select.dispatchEvent(new Event("change"));
    }
    window.location.reload();
    return;
  }

  const cookieVal = `/en/${langCode}`;
  document.cookie = `googtrans=${cookieVal}; path=/;`;
  document.cookie = `googtrans=${cookieVal}; path=/; domain=${window.location.hostname};`;
  localStorage.setItem("kisan_lang", langCode);

  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
  } else {
    window.location.reload();
  }
}
