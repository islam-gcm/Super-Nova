import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { endpoints } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await endpoints.auth.me();
      setUser(response.data.user);
      return response.data.user;
    } catch {
      setUser(null);
      return null;
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (credentials) => {
    await endpoints.auth.login(credentials);
    const session = await endpoints.auth.me();
    setUser(session.data.user);
    return session.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await endpoints.auth.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const hasRole = useCallback((...roles) => roles.some((role) => user?.roles?.includes(role)), [user]);
  const value = useMemo(
    () => ({ user, checking, login, logout, refresh, hasRole }),
    [user, checking, login, logout, refresh, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
