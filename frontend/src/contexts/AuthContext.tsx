import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  role?: 'student' | 'teacher' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string) => Promise<boolean>;
  selectRole: (role: 'student' | 'teacher') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // Verify token and get user info
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // You would typically verify the token here
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/signin/', { username, password });
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Get user profile
      const profileResponse = await api.get('/users/profile/');
      setUser(profileResponse.data);
      
      toast.success('Login successful!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      await api.post('/auth/signup/', { username, email, password });
      toast.success('Account created successfully! Please login.');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Signup failed');
      return false;
    }
  };

  const selectRole = async (role: 'student' | 'teacher'): Promise<boolean> => {
    try {
      await api.post('/auth/role-selection/', { role });
      setUser(prev => prev ? { ...prev, role } : null);
      toast.success(`Role selected: ${role}`);
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Role selection failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    selectRole,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
