import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../config/firebase";
import { verifyToken, type UserData } from "../services/authService";
import Storage from "../lib/storage";

// ── Types ──

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isRegistered: boolean;
  role: string | null;
}

interface AuthContextType extends AuthState {
  login: (firebaseUser: FirebaseUser, requestedRole?: string) => Promise<void>;
  loginAsDemo: (demoRole: "FARMER" | "OPERATOR" | "ADMIN") => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserData) => Promise<void>;
  refreshUser: () => Promise<void>;
  switchRole: (newRole: "FARMER" | "OPERATOR" | "ADMIN") => Promise<void>;
}

// ── Context ──

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──

const STORAGE_USER_KEY = "kisanqueue_user_session";
const STORAGE_ROLE_KEY = "kisanqueue_user_role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isRegistered: false,
    role: null,
  });

  // ── Load Cached Session on Startup ──
  useEffect(() => {
    async function loadCachedSession() {
      try {
        const cachedUser = await Storage.getItem<UserData>(STORAGE_USER_KEY);
        const cachedRole = await Storage.getItem<string>(STORAGE_ROLE_KEY);
        const cachedToken = await Storage.getSecureToken();

        if (cachedUser && cachedToken) {
          setState({
            firebaseUser: null,
            user: cachedUser,
            isLoading: false,
            isAuthenticated: true,
            isRegistered: true,
            role: cachedRole || cachedUser.role || "FARMER",
          });
          return;
        }
      } catch (e) {
        console.warn("Failed to load cached user session:", e);
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    }

    loadCachedSession();
  }, []);

  /**
   * After Firebase auth, verify token with backend
   */
  const checkRegistration = useCallback(async (fbUser: FirebaseUser, requestedRole?: string) => {
    try {
      const idToken = await fbUser.getIdToken();
      await Storage.setSecureToken(idToken);

      const result = await verifyToken(requestedRole);

      if (result.isRegistered && result.data) {
        await Storage.setItem(STORAGE_USER_KEY, result.data);
        await Storage.setItem(STORAGE_ROLE_KEY, result.data.role || "FARMER");
      } else {
        await Storage.removeItem(STORAGE_USER_KEY);
        await Storage.removeItem(STORAGE_ROLE_KEY);
      }

      setState({
        firebaseUser: fbUser,
        user: (result.isRegistered && result.data) ? result.data : null,
        isLoading: false,
        isAuthenticated: true,
        isRegistered: Boolean(result.isRegistered && result.data),
        role: result.data?.role || "FARMER",
      });
    } catch (error: any) {
      console.warn("Token verification error:", error);

      if (error?.response?.status === 403 || error?.response?.data?.error?.startsWith("ACCESS_DENIED")) {
        await signOut(auth);
        await Storage.removeSecureToken();
        await Storage.removeItem(STORAGE_USER_KEY);
        await Storage.removeItem(STORAGE_ROLE_KEY);
        setState({
          firebaseUser: null,
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isRegistered: false,
          role: null,
        });
        throw new Error(error?.response?.data?.message || "Access Denied: You are not authorized for this role.");
      }

      // Check cached session
      const cached = await Storage.getItem<UserData>(STORAGE_USER_KEY);
      if (cached && (cached.firebaseUid === fbUser.uid || (fbUser.email && cached.email === fbUser.email))) {
        const cachedRole = await Storage.getItem<string>(STORAGE_ROLE_KEY);
        setState({
          firebaseUser: fbUser,
          user: cached,
          isLoading: false,
          isAuthenticated: true,
          isRegistered: true,
          role: cachedRole || cached.role || "FARMER",
        });
        return;
      }

      // New user registration flow
      setState({
        firebaseUser: fbUser,
        user: null,
        isLoading: false,
        isAuthenticated: true,
        isRegistered: false,
        role: "FARMER",
      });
    }
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          await checkRegistration(fbUser);
        } catch {
          // Handled in checkRegistration
        }
      } else {
        const cached = await Storage.getItem<UserData>(STORAGE_USER_KEY);
        if (cached) {
          const cachedRole = await Storage.getItem<string>(STORAGE_ROLE_KEY);
          setState({
            firebaseUser: null,
            user: cached,
            isLoading: false,
            isAuthenticated: true,
            isRegistered: true,
            role: cachedRole || cached.role || "FARMER",
          });
          return;
        }

        setState({
          firebaseUser: null,
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isRegistered: false,
          role: null,
        });
      }
    });

    return () => unsubscribe();
  }, [checkRegistration]);

  const login = useCallback(
    async (fbUser: FirebaseUser, requestedRole?: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      await checkRegistration(fbUser, requestedRole);
    },
    [checkRegistration]
  );

  const loginAsDemo = useCallback(async (demoRole: "FARMER" | "OPERATOR" | "ADMIN") => {
    const demoUser: UserData = {
      id: `demo-${demoRole.toLowerCase()}-01`,
      firebaseUid: `demo-${demoRole.toLowerCase()}-uid`,
      email: `${demoRole.toLowerCase()}@kisanqueue.gov.in`,
      phone: "+91 98140 12345",
      name:
        demoRole === "OPERATOR"
          ? "Khanna Mandi Operator Desk"
          : demoRole === "ADMIN"
          ? "Punjab State Agriculture Admin"
          : "Sardar Gurdeep Singh",
      role: demoRole,
      avatarUrl: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      farmer: {
        id: "farmer-punjab-01",
        farmerId: "PMK-984210",
        state: "Punjab",
        district: "Ludhiana",
        tehsil: "Khanna",
        village: "Bija",
        pincode: "141412",
        landArea: 4.5,
        ownershipType: "Owner",
      },
      operator:
        demoRole === "OPERATOR"
          ? {
              id: "op-101",
              centreId: "centre-punjab-01",
              employeeId: "EMP-KHN-01",
              centre: { id: "centre-punjab-01", name: "Khanna Grain Market", code: "RN-KHN" },
            }
          : null,
    };

    await Storage.setItem(STORAGE_USER_KEY, demoUser);
    await Storage.setItem(STORAGE_ROLE_KEY, demoRole);
    await Storage.setSecureToken(`demo-token-${demoRole.toLowerCase()}`);

    setState({
      firebaseUser: null,
      user: demoUser,
      isLoading: false,
      isAuthenticated: true,
      isRegistered: true,
      role: demoRole,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    await Storage.removeSecureToken();
    await Storage.removeItem(STORAGE_USER_KEY);
    await Storage.removeItem(STORAGE_ROLE_KEY);

    setState({
      firebaseUser: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isRegistered: false,
      role: null,
    });
  }, []);

  const setUser = useCallback(async (user: UserData) => {
    await Storage.setItem(STORAGE_USER_KEY, user);
    await Storage.setItem(STORAGE_ROLE_KEY, user.role);

    setState((prev) => ({
      ...prev,
      user,
      isRegistered: true,
      role: user.role,
    }));
  }, []);

  const refreshUser = useCallback(async () => {
    if (state.firebaseUser) {
      await checkRegistration(state.firebaseUser);
    }
  }, [state.firebaseUser, checkRegistration]);

  const switchRole = useCallback(async (newRole: "FARMER" | "OPERATOR" | "ADMIN") => {
    await Storage.setItem(STORAGE_ROLE_KEY, newRole);
    setState((prev) => ({
      ...prev,
      role: newRole,
      user: prev.user ? { ...prev.user, role: newRole } : null,
    }));
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, loginAsDemo, logout, setUser, refreshUser, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
