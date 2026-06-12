import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as authService from "@/services/authService";
import type {
  AuthUser,
  ProfileUpdate,
  SignUpInput,
  UserRole,
} from "@/types/auth";

type AuthContextValue = {  user: AuthUser | null;  isLoading: boolean;  
      signIn: (    loginId: string,    password: string,    role: UserRole,    rememberMe: boolean,  ) => Promise<AuthUser>;
  signUp: (input: SignUpInput) => Promise<AuthUser>;
  updateProfile: (updates: ProfileUpdate) => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const restored = await authService.restoreSession();
        if (mounted) setUser(restored);
      } catch {
        try {
          await authService.signOut();
        } catch {
        }
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(
    async (
      loginId: string,
      password: string,
      role: UserRole,
      rememberMe: boolean,
    ) => {
      const authUser = await authService.signIn(
        loginId,
        password,
        role,
        rememberMe,
      );
      setUser(authUser);
      return authUser;
    },
    [],
  );

  const signUp = useCallback(async (input: SignUpInput) => {
    const authUser = await authService.signUp(input);
    return authUser;
  }, []);

  const updateProfile = useCallback(
    async (updates: ProfileUpdate) => {
      if (!user) {
        throw new Error("Unable to update profile when no user is signed in.");
      }
      const authUser = await authService.updateProfile(user.id, updates);
      setUser(authUser);
      return authUser;
    },
    [user],
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, signIn, signUp, updateProfile, signOut }),
    [user, isLoading, signIn, signUp, updateProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
