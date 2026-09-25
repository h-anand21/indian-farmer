import Storage from '../lib/storage';

/**
 * In-memory translation cache to guarantee instant synchronous lookups:
 * memoryCache[targetLang][sourceText] = translatedText
 */
const memoryCache: Record<string, Record<string, string>> = {};

// Track pending network translation requests to prevent duplicate calls
const inFlightRequests: Record<string, Promise<string>> = {};

// Queue for saving cache to persistent storage (debounced)
let saveTimeout: any = null;
const STORAGE_PREFIX = 'kq_dyn_trans_';

/**
 * Initialize cache from AsyncStorage for a given language
 */
export async function initLanguageCache(langCode: string): Promise<void> {
  if (langCode === 'en') return;
  if (!memoryCache[langCode]) {
    memoryCache[langCode] = {};
  }
  try {
    const persisted = await Storage.getItem<Record<string, string>>(`${STORAGE_PREFIX}${langCode}`);
    if (persisted && typeof persisted === 'object') {
      memoryCache[langCode] = { ...memoryCache[langCode], ...persisted };
    }
  } catch (err) {
    console.warn(`[Translator] Failed to load cache for ${langCode}:`, err);
  }
}

/**
 * Schedule saving memory cache for a language to persistent AsyncStorage
 */
function schedulePersist(langCode: string) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(async () => {
    try {
      if (memoryCache[langCode]) {
        await Storage.setItem(`${STORAGE_PREFIX}${langCode}`, memoryCache[langCode]);
      }
    } catch (e) {
      console.warn('[Translator] Failed to persist cache:', e);
    }
  }, 1000);
}

const GOOGLE_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY ||
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY;

/**
 * Translate any arbitrary text string dynamically via Google Translate API
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || text.trim() === '' || targetLang === 'en') {
    return text;
  }

  const cleanText = text.trim();

  // 1. Check memory cache
  if (memoryCache[targetLang]?.[cleanText]) {
    return memoryCache[targetLang][cleanText];
  }

  // 2. Prevent duplicate in-flight requests
  const requestKey = `${targetLang}:${cleanText}`;
  const existingRequest = inFlightRequests[requestKey];
  if (existingRequest !== undefined) {
    return existingRequest;
  }

  // 3. Fetch from Translation service (Google Cloud API if enabled -> MyMemory -> GTx fallback)
  const fetchPromise = (async () => {
    // Provider 0: Official Google Cloud Translation API (if enabled with API key)
    if (GOOGLE_API_KEY) {
      try {
        const cloudUrl = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;
        const cloudRes = await fetch(cloudUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: cleanText, target: targetLang, format: 'text' }),
        });
        if (cloudRes.ok) {
          const cloudData = await cloudRes.json();
          const translated = cloudData?.data?.translations?.[0]?.translatedText;
          if (translated && translated.trim() !== '') {
            console.log(`[Google Cloud API ✅] Key (${GOOGLE_API_KEY.slice(0, 8)}...${GOOGLE_API_KEY.slice(-4)}) translated: "${cleanText}" -> "${translated}" [${targetLang}]`);
            if (!memoryCache[targetLang]) memoryCache[targetLang] = {};
            memoryCache[targetLang][cleanText] = translated;
            schedulePersist(targetLang);
            return translated;
          }
        } else {
          console.warn(`[Google Cloud API] Status ${cloudRes.status}:`, await cloudRes.text());
        }
      } catch (cloudErr) {
        console.warn('[Google Cloud API Error]:', cloudErr);
      }
    }

    try {
      // Provider 1: MyMemory Translated API (unmetered, fast, no bot blocking)
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        cleanText
      )}&langpair=en|${encodeURIComponent(targetLang)}`;

      const res1 = await fetch(myMemoryUrl);
      if (res1.ok) {
        const data1 = await res1.json();
        const translated1 = data1?.responseData?.translatedText;
        if (
          translated1 &&
          typeof translated1 === 'string' &&
          translated1.trim() !== '' &&
          !translated1.includes('MYMEMORY WARNING') &&
          translated1 !== cleanText
        ) {
          if (!memoryCache[targetLang]) {
            memoryCache[targetLang] = {};
          }
          memoryCache[targetLang][cleanText] = translated1;
          schedulePersist(targetLang);
          return translated1;
        }
      }
    } catch {}

    try {
      // Provider 2: Google Translate GTx fallback
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
        targetLang
      )}&dt=t&q=${encodeURIComponent(cleanText)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0]
            .map((chunk: any) => (chunk && chunk[0] ? chunk[0] : ''))
            .join('');

          if (translated && translated.trim().length > 0) {
            if (!memoryCache[targetLang]) {
              memoryCache[targetLang] = {};
            }
            memoryCache[targetLang][cleanText] = translated;
            schedulePersist(targetLang);
            return translated;
          }
        }
      }
    } catch (err) {
      console.warn(`[Translator] Error translating "${cleanText}" to ${targetLang}:`, err);
    } finally {
      delete inFlightRequests[requestKey];
    }

    return cleanText;
  })();

  inFlightRequests[requestKey] = fetchPromise;
  return fetchPromise;
}

/**
 * Synchronous cache lookup helper
 */
export function getCachedTranslation(text: string, targetLang: string): string | null {
  if (targetLang === 'en' || !text) return text;
  return memoryCache[targetLang]?.[text.trim()] || null;
}

/**
 * Preload batch translations
 */
export async function preloadTranslations(texts: string[], targetLang: string): Promise<void> {
  if (targetLang === 'en') return;
  await Promise.all(texts.map((txt) => translateText(txt, targetLang)));
}
