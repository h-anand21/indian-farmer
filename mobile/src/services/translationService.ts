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

  // 3. Fetch from Google Translate service
  const fetchPromise = (async () => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
        targetLang
      )}&dt=t&q=${encodeURIComponent(cleanText)}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Translation API error: ${res.status}`);
      }

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
