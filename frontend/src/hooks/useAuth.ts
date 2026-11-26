import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AuthContextValue } from '../types/auth';

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
