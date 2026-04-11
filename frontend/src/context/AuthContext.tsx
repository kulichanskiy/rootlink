"use client";

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
  loginRequest,
  registerRequest,
  type ApiUser,
} from "../lib/api";

const TOKEN_KEY = "rootlink_token";
const USER_KEY = "rootlink_user";

type AuthContextValue = {
  user: ApiUser | null;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: {
    email: string;
    password: string;
    preferences?: string;
    location?: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStored(): { token: string | null; user: ApiUser | null } {
  if (typeof window === "undefined") {
    return { token: null, user: null };
  }
  const token = localStorage.getItem(TOKEN_KEY);
  const raw = localStorage.getItem(USER_KEY);
  if (!token || !raw) return { token: null, user: null };
  try {
    const user = JSON.parse(raw) as ApiUser;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

function persist(token: string, user: ApiUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const { token: t, user: u } = readStored();
    setToken(t);
    setUser(u);
    setIsReady(true);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: u } = await loginRequest(email, password);
    persist(newToken, u);
    setToken(newToken);
    setUser(u);
  }, []);

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      preferences?: string;
      location?: string;
    }) => {
      await registerRequest(input);
    },
    [],
  );

  const logout = useCallback(() => {
    clearStorage();
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      login,
      register,
      logout,
    }),
    [user, token, isReady, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
