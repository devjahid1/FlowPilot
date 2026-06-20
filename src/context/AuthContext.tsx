import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/services/firebase";
import { readStorage, writeStorage } from "@/utils/storage";

export type AppUser = {
  uid: string;
  email: string;
  displayName: string;
  provider: "firebase" | "demo";
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USER_KEY = "flowpilot:demo-user";
const DEMO_USERS_KEY = "flowpilot:demo-users";

function mapFirebaseUser(firebaseUser: FirebaseUser): AppUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? "user@flowpilot.dev",
    displayName: firebaseUser.displayName ?? firebaseUser.email?.split("@")[0] ?? "FlowPilot User",
    provider: "firebase",
  };
}

function getDemoUsers() {
  return readStorage<Record<string, { uid: string; email: string; password: string; displayName: string }>>(
    DEMO_USERS_KEY,
    {},
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth && isFirebaseConfigured) {
      return onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
        setLoading(false);
      });
    }

    setUser(readStorage<AppUser | null>(DEMO_USER_KEY, null));
    setLoading(false);
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    if (auth && isFirebaseConfigured) {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(mapFirebaseUser(credential.user));
      return;
    }

    const users = getDemoUsers();
    if (users[email]) throw new Error("An account already exists for this email.");
    const demoUser = {
      uid: `demo_${crypto.randomUUID()}`,
      email,
      password,
      displayName: email.split("@")[0],
    };
    writeStorage(DEMO_USERS_KEY, { ...users, [email]: demoUser });
    const appUser: AppUser = { ...demoUser, provider: "demo" };
    writeStorage(DEMO_USER_KEY, appUser);
    setUser(appUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    if (auth && isFirebaseConfigured) {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      setUser(mapFirebaseUser(credential.user));
      return;
    }

    const existing = getDemoUsers()[email];
    if (!existing || existing.password !== password) {
      throw new Error("Invalid email or password.");
    }
    const appUser: AppUser = { ...existing, provider: "demo" };
    writeStorage(DEMO_USER_KEY, appUser);
    setUser(appUser);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (auth && isFirebaseConfigured) {
      const credential = await signInWithPopup(auth, googleProvider);
      setUser(mapFirebaseUser(credential.user));
      return;
    }

    const appUser: AppUser = {
      uid: "demo_google_user",
      email: "google.user@flowpilot.dev",
      displayName: "Google Demo User",
      provider: "demo",
    };
    writeStorage(DEMO_USER_KEY, appUser);
    setUser(appUser);
  }, []);

  const logout = useCallback(async () => {
    if (auth && isFirebaseConfigured) await signOut(auth);
    window.localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, loginWithGoogle, logout }),
    [loading, login, loginWithGoogle, logout, signup, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
