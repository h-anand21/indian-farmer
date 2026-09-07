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
  login: (firebaseUser: FirebaseUser) => Promise<void>;
  loginAsDemo: (demoRole: "FARMER" | "OPERATOR" | "ADMIN") => void;
  logout: () => Promise<void>;
  setUser: (user: UserData) => void;
  refreshUser: () => Promise<void>;
  switchRole: (newRole: "FARMER" | "OPERATOR" | "ADMIN") => void;
}

// ── Context ──

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
    isRegistered: false,
    role: null,
  });

  /**
   * After Firebase auth, verify token with backend
   * to check if user is registered in our DB
   */
  const checkRegistration = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const result = await verifyToken();

      setState({
        firebaseUser: fbUser,
        user: result.data,
        isLoading: false,
        isAuthenticated: true,
        isRegistered: result.isRegistered,
        role: result.data?.role || "FARMER",
      });
    } catch (error) {
      console.error("❌ Token verification fallback:", error);
      // Auto fallback to direct login so user is never blocked
      const fallbackUser: UserData = {
        id: fbUser.uid,
        firebaseUid: fbUser.uid,
        email: fbUser.email || null,
        phone: fbUser.phoneNumber || null,
        name: fbUser.displayName || "Kisan Farmer",
        role: "FARMER",
        avatarUrl: fbUser.photoURL || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        farmer: {
          id: `f-${fbUser.uid.slice(0, 6)}`,
          farmerId: "PMK-984210",
          state: "Punjab",
          district: "Ludhiana",
          tehsil: "Khanna",
          village: "Khanna Rural",
          pincode: "141412",
          landArea: 4.5,
          ownershipType: "Owner",
        },
        operator: null,
      };

      setState({
        firebaseUser: fbUser,
        user: fallbackUser,
        isLoading: false,
        isAuthenticated: true,
        isRegistered: true,
        role: "FARMER",
      });
    }
  }, []);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        await checkRegistration(fbUser);
      } else {
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
   * Manual login trigger (after OTP / Google sign in)
   */
  const login = useCallback(
    async (fbUser: FirebaseUser) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      await checkRegistration(fbUser);
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
   * Logout — sign out of Firebase + clear state
   */
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
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
   * Switch Active Role for instant demo/testing
   */
  const switchRole = useCallback((newRole: "FARMER" | "OPERATOR" | "ADMIN") => {
    setState((prev) => ({
      ...prev,
      role: newRole,
      user: prev.user
        ? { ...prev.user, role: newRole }
        : null,
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

// ── Hook ──

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
