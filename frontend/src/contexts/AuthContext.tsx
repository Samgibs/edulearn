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
  selectRole: (role: 'student' | 'teacher', formData?: any) => Promise<boolean>;
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
    const initializeAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // Set the token in API headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user profile to get role information
          const profileResponse = await api.get('/users/profile/');
          const userData = profileResponse.data;
          
          // Try to determine role by checking for student/teacher profiles
          let role = null;
          try {
            const studentResponse = await api.get('/students/me/');
            role = 'student';
            userData.student = studentResponse.data;
          } catch (error) {
            try {
              const teacherResponse = await api.get('/teachers/me/');
              role = 'teacher';
              userData.teacher = teacherResponse.data;
            } catch (error) {
              // No role assigned yet
            }
          }
          
          setUser({ ...userData, role });
        } catch (error) {
          console.error('Error initializing auth:', error);
          // Clear invalid tokens
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    
    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/signin/', { username, password });
      const { access, refresh, role, dashboard_url } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      // Get user profile
      const profileResponse = await api.get('/users/profile/');
      const userData = { ...profileResponse.data, role };
      setUser(userData);
      
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

  const selectRole = async (role: 'student' | 'teacher', formData?: any): Promise<boolean> => {
    try {
      const payload = { role, ...formData };
      await api.post('/auth/role-selection/', payload);
      setUser(prev => prev ? { ...prev, role } : null);
      toast.success(`Role selected: ${role}`);
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Role selection failed';
      if (errorMessage.includes('already has')) {
        toast.error('You already have a profile. Please log out and log back in.');
      } else {
        toast.error(errorMessage);
      }
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
