import { createContext } from 'react';

interface User {
  email: string;
  name: string;
  picture: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface AuthContextValue extends AuthState {
  login: () => void;
  logout: () => void;
  isGapiReady: boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
