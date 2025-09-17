import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/services/authService';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  session: any | null; // Kept for compatibility
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userData = await authService.me();
          // Add compatibility fields
          const compatibleUser = {
            ...userData,
            user_metadata: {
              display_name: userData.name
            }
          };
          setUser(compatibleUser);
          setSession({ user: compatibleUser }); // Create session-like object for compatibility
        } catch (error) {
          // Token is invalid, clear it
          authService.logout();
          setUser(null);
          setSession(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setLoading(true);
      
      await authService.register({
        name: displayName || '',
        email,
        password
      });

      toast({
        title: "¡Registro exitoso!",
        description: "Tu cuenta ha sido creada exitosamente",
        variant: "default"
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error al registrarse",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      await authService.login(email, password);
      
      // Get user data after login
      const userData = await authService.me();
      // Add compatibility fields
      const compatibleUser = {
        ...userData,
        user_metadata: {
          display_name: userData.name
        }
      };
      setUser(compatibleUser);
      setSession({ user: compatibleUser });

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión exitosamente",
        variant: "default"
      });

      return { error: null };
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message;
      toast({
        title: "Error al iniciar sesión",
        description: errorMessage,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      authService.logout();
      setUser(null);
      setSession(null);
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
        variant: "default"
      });
    } catch (error: any) {
      toast({
        title: "Error al cerrar sesión",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}