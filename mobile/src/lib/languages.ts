import Storage from "./storage";

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  states: string;
  shortTag: string;
  avatarColor: string;
  region: "national" | "north" | "south" | "east" | "west";
  isPopular?: boolean;
}

export const INDIAN_LANGUAGES: IndianLanguage[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    states: "All India (Official Default)",
    shortTag: "EN",
    avatarColor: "#1E293B",
    region: "national",
    isPopular: true,
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    states: "UP, MP, Bihar, Rajasthan, Haryana",
    shortTag: "हि",
    avatarColor: "#EA580C",
    region: "north",
    isPopular: true,
  },
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
    states: "Punjab, Chandigarh, Haryana",
    shortTag: "ਪੰ",
    avatarColor: "#EA580C",
    region: "north",
    isPopular: true,
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    states: "Maharashtra, Goa",
    shortTag: "म",
    avatarColor: "#E11D48",
    region: "west",
    isPopular: true,
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    states: "Gujarat, Dadra & Nagar Haveli",
    shortTag: "ગુ",
    avatarColor: "#0284C7",
    region: "west",
    isPopular: true,
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    states: "Andhra Pradesh, Telangana",
    shortTag: "తె",
    avatarColor: "#6366F1",
    region: "south",
    isPopular: true,
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    states: "West Bengal, Tripura, Assam",
    shortTag: "বা",
    avatarColor: "#059669",
    region: "east",
    isPopular: true,
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    states: "Tamil Nadu, Puducherry",
    shortTag: "த",
    avatarColor: "#B91C1C",
    region: "south",
    isPopular: true,
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    states: "Karnataka",
    shortTag: "ಕ",
    avatarColor: "#B45309",
    region: "south",
    isPopular: true,
  },
  {
    code: "ml",
    name: "Malayalam",
    nativeName: "മലയാളം",
    states: "Kerala, Lakshadweep",
    shortTag: "മ",
    avatarColor: "#0D9488",
    region: "south",
    isPopular: true,
  },
  {
    code: "or",
    name: "Odia",
    nativeName: "ଓଡ଼ିଆ",
    states: "Odisha",
    shortTag: "ଓ",
    avatarColor: "#7C3AED",
    region: "east",
    isPopular: true,
  },
];

export async function getCurrentLanguage(): Promise<string> {
  const saved = await Storage.getItem<string>("kisan_lang");
  return saved || "en";
}

export async function setLanguage(langCode: string): Promise<void> {
  await Storage.setItem("kisan_lang", langCode);
}
