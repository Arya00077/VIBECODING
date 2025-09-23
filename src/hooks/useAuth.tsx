import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  provider?: 'email' | 'google';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Security: Input validation and sanitization
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

// Mock authentication for demo purposes
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('demo_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      localStorage.removeItem('demo_user');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async (email: string, password: string) => {
    // Security: Input validation
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sanitizedEmail = sanitizeInput(email);
      const mockUser = {
        id: '1',
        email: sanitizedEmail,
        full_name: 'Demo User',
        provider: 'email' as const
      };
      
      setUser(mockUser);
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      toast.success(`Welcome back, ${mockUser.full_name}!`);
    } catch (error) {
      throw new Error('Authentication failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    // Security: Input validation
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (fullName.length < 2 || fullName.length > 50) {
      throw new Error('Name must be between 2 and 50 characters');
    }
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sanitizedEmail = sanitizeInput(email);
      const sanitizedName = sanitizeInput(fullName);
      const mockUser = {
        id: '1',
        email: sanitizedEmail,
        full_name: sanitizedName,
        provider: 'email' as const
      };
      
      setUser(mockUser);
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      toast.success(`Welcome to Stock Dashboard, ${sanitizedName}!`);
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockUser = {
        id: '1',
        email: 'user@gmail.com',
        full_name: 'Google User',
        avatar_url: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        provider: 'google' as const
      };
      
      setUser(mockUser);
      localStorage.setItem('demo_user', JSON.stringify(mockUser));
      toast.success(`Welcome, ${mockUser.full_name}!`);
    } catch (error) {
      throw new Error('Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    const userName = user?.full_name || 'User';
    setUser(null);
    localStorage.removeItem('demo_user');
    toast.success(`Goodbye, ${userName}! Your session has been securely ended.`);
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  }), [user, loading, signIn, signUp, signInWithGoogle, signOut]);
    

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};