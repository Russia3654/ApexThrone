import { createContext, ReactNode, useEffect, useState } from 'react';
import { getCurrentAdmin, login, logout } from '../api/adminApi';
import { Credentials } from '../types/api';
import { AuthContextValue, AuthState } from '../types/auth';

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    getCurrentAdmin()
      .then((admin) => {
        if (!active) return;
        setState(admin ? { status: 'authenticated', admin } : { status: 'anonymous' });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => {
      active = false;
    };
  }, []);

  const signIn = async (credentials: Credentials) => {
    const admin = await login(credentials);
    setState({ status: 'authenticated', admin });
  };

  const signOut = async () => {
    await logout();
    setState({ status: 'anonymous' });
  };

  return <AuthContext.Provider value={{ state, signIn, signOut }}>{children}</AuthContext.Provider>;
}
