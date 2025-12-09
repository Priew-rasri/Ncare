import { useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';
import type { User, UserRole } from '../types';

/**
 * Hook for authentication state and operations
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribeToAuth((authUser) => {
      setUser(authUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    userData: {
      name: string;
      role: UserRole;
      username: string;
      branchId?: string;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await authService.signUp(email, password, userData);
      setUser(newUser);
      setLoading(false);
      return newUser;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await authService.signIn(email, password);
      setUser(authUser);
      setLoading(false);
      return authUser;
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
      setUser(null);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, []);

  const updateProfile = useCallback(async (userId: string, updates: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      await authService.updateUserProfile(userId, updates);
      if (user && user.id === userId) {
        setUser({ ...user, ...updates });
      }
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [user]);

  const hasRole = useCallback((requiredRoles: UserRole[]) => {
    return authService.hasRole(user, requiredRoles);
  }, [user]);

  return {
    user,
    loading,
    error,
    signUp,
    signIn,
    logout,
    resetPassword,
    updateProfile,
    hasRole,
    isAuthenticated: !!user
  };
}

export default useAuth;
