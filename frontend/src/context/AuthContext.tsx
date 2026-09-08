import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { verifyToken, type UserData } from "@/services/authService";

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
  loginAsDemo: (demoRole: "FARMER" | "OPERATOR" | "ADMIN") => void;
  logout: () => Promise<void>;
  setUser: (user: UserData) => void;
  refreshUser: () => Promise<void>;
  switchRole: (newRole: "FARMER" | "OPERATOR" | "ADMIN") => void;
}

// ── Context ──

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──

const LOCAL_STORAGE_USER_KEY = "kisanqueue_user_session";
const LOCAL_STORAGE_ROLE_KEY = "kisanqueue_user_role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const getInitialState = (): AuthState => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      const cachedRole = localStorage.getItem(LOCAL_STORAGE_ROLE_KEY);
      if (cached) {
        const user = JSON.parse(cached);
        return {
          firebaseUser: null,
          user,
          isLoading: false,
          isAuthenticated: true,
          isRegistered: true,
          role: cachedRole || user.role || "FARMER",
        };
      }
    } catch (e) {
      console.warn("Failed to parse cached user session:", e);
    }
    return {
      firebaseUser: null,
      user: null,
      isLoading: true,
      isAuthenticated: false,
      isRegistered: false,
      role: null,
    };
  };

  const [state, setState] = useState<AuthState>(getInitialState);

  /**
   * After Firebase auth, verify token with backend
   * to check if user is registered and authorized in our DB
   */
  const checkRegistration = useCallback(async (fbUser: FirebaseUser, requestedRole?: string) => {
    try {
      const result = await verifyToken(requestedRole);

      if (result.data) {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(result.data));
        localStorage.setItem(LOCAL_STORAGE_ROLE_KEY, result.data.role || "FARMER");
      }

      setState({
        firebaseUser: fbUser,
        user: result.data,
        isLoading: false,
        isAuthenticated: true,
        isRegistered: Boolean(result.isRegistered && result.data),
        role: result.data?.role || "FARMER",
      });
    } catch (error: any) {
      console.warn("Token verification note:", error);

      // If backend explicitly rejected due to RBAC (403 Forbidden)
      const errorMsg = error?.response?.data?.message || error?.message;
      if (error?.response?.status === 403 || error?.response?.data?.error?.startsWith("ACCESS_DENIED")) {
        await signOut(auth);
        localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
        localStorage.removeItem(LOCAL_STORAGE_ROLE_KEY);
        setState({
          firebaseUser: null,
          user: null,
          isLoading: false,
          isAuthenticated: false,
          isRegistered: false,
          role: null,
        });
        throw new Error(errorMsg || "Access Denied: You are not authorized for this role.");
      }

      // Check if we have an active session in localStorage
      const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (cached) {
        try {
          const user = JSON.parse(cached);
          const cachedRole = localStorage.getItem(LOCAL_STORAGE_ROLE_KEY);
          setState({
            firebaseUser: fbUser,
            user,
            isLoading: false,
            isAuthenticated: true,
            isRegistered: true,
            role: cachedRole || user.role || "FARMER",
          });
          return;
        } catch {
          // ignore
        }
      }

      // For new Google account without backend profile yet (Farmer onboarding)
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
        // If we have a cached demo/local session, do not clear it on Firebase null
        const cached = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (cached) {
          try {
            const user = JSON.parse(cached);
            const cachedRole = localStorage.getItem(LOCAL_STORAGE_ROLE_KEY);
            setState({
              firebaseUser: null,
              user,
              isLoading: false,
              isAuthenticated: true,
              isRegistered: true,
              role: cachedRole || user.role || "FARMER",
            });
            return;
          } catch (e) {
            // ignore
          }
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

  /**
   * Manual login trigger (after Google sign in with role)
   */
  const login = useCallback(
    async (fbUser: FirebaseUser, requestedRole?: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      await checkRegistration(fbUser, requestedRole);
    },
    [checkRegistration]
  );

  /**
   * Quick 1-Click Instant Demo Login
   */
  const loginAsDemo = useCallback((demoRole: "FARMER" | "OPERATOR" | "ADMIN") => {
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

    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
    localStorage.setItem(LOCAL_STORAGE_ROLE_KEY, demoRole);

    setState({
      firebaseUser: null,
      user: demoUser,
      isLoading: false,
      isAuthenticated: true,
      isRegistered: true,
      role: demoRole,
    });
  }, []);

  /**
   * Logout — sign out of Firebase + clear state & storage
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    localStorage.removeItem(LOCAL_STORAGE_ROLE_KEY);

    setState({
      firebaseUser: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,
      isRegistered: false,
      role: null,
    });
  }, []);

  /**
   * Update user data in context (after registration / profile update)
   */
  const setUser = useCallback((user: UserData) => {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_ROLE_KEY, user.role);

    setState((prev) => ({
      ...prev,
      user,
      isRegistered: true,
      role: user.role,
    }));
  }, []);

  /**
   * Refresh user data from backend
   */
  const refreshUser = useCallback(async () => {
    if (state.firebaseUser) {
      await checkRegistration(state.firebaseUser);
    }
  }, [state.firebaseUser, checkRegistration]);

  /**
   * Switch Active Role (Only authorized Administrators can toggle views)
   */
  const switchRole = useCallback((newRole: "FARMER" | "OPERATOR" | "ADMIN") => {
    setState((prev) => {
      // Prevent unauthorized role escalation for non-admin accounts
      if (newRole === "ADMIN" && prev.user?.role !== "ADMIN" && prev.user?.email !== "himanshuanand563@gmail.com") {
        console.warn("Unauthorized role switch attempt blocked.");
        return prev;
      }
      localStorage.setItem(LOCAL_STORAGE_ROLE_KEY, newRole);
      return {
        ...prev,
        role: newRole,
        user: prev.user ? { ...prev.user, role: newRole } : null,
      };
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, loginAsDemo, logout, setUser, refreshUser, switchRole }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
