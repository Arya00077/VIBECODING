import { createContext, useContext, useState } from 'react';
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

// Mock authentication for demo purposes
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('demo_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = {
      id: '1',
      email,
      full_name: 'Demo User',
      provider: 'email' as const
    };
    
    setUser(mockUser);
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    toast.success(`Welcome back, ${mockUser.full_name}!`);
    setLoading(false);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser = {
      id: '1',
      email,
      full_name: fullName,
      provider: 'email' as const
    };
    
    setUser(mockUser);
    localStorage.setItem('demo_user', JSON.stringify(mockUser));
    toast.success(`Welcome to Stock Dashboard, ${fullName}!`);
    setLoading(false);
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
    setLoading(false);
  };

  const signOut = async () => {
    const userName = user?.full_name || 'User';
    setUser(null);
    localStorage.removeItem('demo_user');
    toast.success(`Goodbye, ${userName}! Your session has been securely ended.`);
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};