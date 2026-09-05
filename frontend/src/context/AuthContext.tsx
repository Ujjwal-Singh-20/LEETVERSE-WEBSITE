import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { AdminUser } from '../types';
import {
  loginAdminSession,
  fetchAdminMe,
  getAdminToken,
  removeAdminToken,
  setOnAuthFailure,
} from '../services/api';

interface AuthContextType {
  admin: AdminUser | null;
  loading: boolean;
  loginError: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setOnAuthFailure(() => {
      setAdmin(null);
      setLoginError('Your session has expired or you are not authorized as an active admin.');
    });

    const initAuth = async () => {
      const token = getAdminToken();
      if (token) {
        try {
          const res = await fetchAdminMe();
          const adminProfile = (res as any).admin || res.user;
          setAdmin(adminProfile);
        } catch {
          removeAdminToken();
          setAdmin(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    setLoginError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const res = await loginAdminSession(idToken);
      const adminProfile = (res as any).admin || res.user;
      setAdmin(adminProfile);
    } catch (err: any) {
      removeAdminToken();
      setAdmin(null);
      let msg = err.message || 'Google Sign-In failed.';
      if (err.code === 'FORBIDDEN' || err.status === 403) {
        msg = err.message && err.message.includes('not authorized')
          ? err.message
          : 'Access denied: This Google account is not on the admin whitelist.';
      } else if (err.code === 'ADMIN_INACTIVE') {
        msg = 'Your admin account has been deactivated.';
      }
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    removeAdminToken();
    setAdmin(null);
  };

  const clearError = () => setLoginError(null);

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        loginError,
        loginWithGoogle,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
