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
  logout: () => Promise<void>;
  setUser: (user: UserData) => void;
  refreshUser: () => Promise<void>;
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
        role: result.data?.role || null,
      });
    } catch (error) {
      console.error("❌ Token verification failed:", error);
      setState({
        firebaseUser: fbUser,
        user: null,
        isLoading: false,
        isAuthenticated: true,
        isRegistered: false,
        role: null,
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
   * Manual login trigger (after OTP verification)
   */
  const login = useCallback(
    async (fbUser: FirebaseUser) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      await checkRegistration(fbUser);
    },
    [checkRegistration]
  );

  /**
   * Logout — sign out of Firebase + clear state
   */
  const logout = useCallback(async () => {
    await signOut(auth);
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

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, setUser, refreshUser }}
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
