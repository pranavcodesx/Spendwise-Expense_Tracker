import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/authService';
import { setCurrency } from '../utils/format';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we ask the server "who am I?"

  const applyUser = useCallback((u) => {
    setCurrency(u?.currency); // set the currency BEFORE the screens re-render
    setUser(u);
  }, []);

  useEffect(() => {
    authService.getMe().then((d) => applyUser(d.user)).catch(() => applyUser(null)).finally(() => setLoading(false));
    const onExpired = () => applyUser(null);
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [applyUser]);

  const value = useMemo(() => ({
    user, loading, updateUser: applyUser,
    login: async (payload) => { const d = await authService.login(payload); applyUser(d.user); },
    register: async (payload) => { const d = await authService.register(payload); applyUser(d.user); },
    logout: async () => { try { await authService.logout(); } finally { applyUser(null); } },
  }), [user, loading, applyUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
