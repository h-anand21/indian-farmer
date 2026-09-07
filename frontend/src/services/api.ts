import axios from "axios";
import { API_URL } from "@/lib/constants";
import { auth } from "@/lib/firebase";

/**
 * Axios instance pre-configured with:
 * - Base URL pointing to backend API
 * - Automatic Firebase token injection via interceptor
 * - Response error handling
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ── Request Interceptor: Attach Firebase ID Token ──
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Handle errors ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — could trigger re-auth flow
      console.warn("🔒 Unauthorized — token may be expired");
    }
    return Promise.reject(error);
  }
);

export default api;
