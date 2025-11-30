"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
};

const TOKEN_STORAGE_KEY = "bernjos-dashboard.auth-token";
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (stored) {
      setToken(stored);
    }
    setHydrated(true);
  }, []);

  const saveToken = (value: string) => {
    setToken(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_STORAGE_KEY, value);
    }
  };

  const clearToken = () => {
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      hydrated,
      setToken: saveToken,
      clearToken
    }),
    [token, hydrated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
