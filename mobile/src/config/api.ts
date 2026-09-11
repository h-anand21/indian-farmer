import axios from "axios";
import { API_URL } from "./constants";
import { auth } from "./firebase";
import { getItemAsync } from "expo-secure-store";

/**
 * Axios instance pre-configured for KisanQueue Mobile App:
 * - Base URL pointing to backend API (https://indian-farmer.onrender.com/api)
 * - Automatic Firebase ID token injection via request interceptor
 * - Fallback to SecureStore cached token
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// ── Request Interceptor: Attach Bearer Token ──
api.interceptors.request.use(
  async (config) => {
    let token: string | null = null;
    const user = auth.currentUser;

    if (user) {
      token = await user.getIdToken();
    } else {
      // Fallback: check SecureStore for saved auth token
      token = await getItemAsync("auth_token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Error handling ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("🔒 Mobile API Unauthorized — token may be expired");
    }
    return Promise.reject(error);
  }
);

export default api;
