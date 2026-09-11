import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * Unified Storage Wrapper for KisanQueue Mobile App
 * - SecureStore for sensitive credentials (auth tokens, user IDs)
 * - AsyncStorage for UI preferences, language choice, cached responses
 */
export const Storage = {
  // ── Secure Storage (JWT / Auth Tokens) ──
  async setSecureToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('auth_token', token);
    } catch (e) {
      console.error('Error saving secure token:', e);
    }
  },

  async getSecureToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('auth_token');
    } catch (e) {
      console.error('Error fetching secure token:', e);
      return null;
    }
  },

  async removeSecureToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('auth_token');
    } catch (e) {
      console.error('Error removing secure token:', e);
    }
  },

  // ── General Preferences (AsyncStorage) ──
  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (e) {
      console.error(`Error saving item [${key}]:`, e);
    }
  },

  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (e) {
      console.error(`Error reading item [${key}]:`, e);
      return null;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing item [${key}]:`, e);
    }
  },

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
      await SecureStore.deleteItemAsync('auth_token').catch(() => {});
    } catch (e) {
      console.error('Error clearing storage:', e);
    }
  },
};

export default Storage;
