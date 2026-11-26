import { Admin, Credentials } from './api';

export type AuthState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; admin: Admin };

export type AuthContextValue = {
  state: AuthState;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
};
