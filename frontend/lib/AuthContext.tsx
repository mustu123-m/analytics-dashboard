'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getMe, logout as apiLogout } from './api';

interface User { id: string; name: string; email: string; role: string; }
interface AuthCtx {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null, loading: true, setUser: () => {}, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only try if a token exists in localStorage
    const token = localStorage.getItem('dp_token');
    if (!token) { setLoading(false); return; }

    getMe()
      .then(({ user }) => setUser(user))
      .catch(() => {
        localStorage.removeItem('dp_token'); // token expired/invalid
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);