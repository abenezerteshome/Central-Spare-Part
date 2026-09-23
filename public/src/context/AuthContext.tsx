import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../hooks/useToast';
import Loader from '../components/Loader';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem('user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);
  const toast = useToast();

  /** 🔹 Keep axios header in sync with token */
  useEffect(() => {
    if (token) {
      axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axiosClient.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token]);

  /** 🔹 Fetch user if token exists (for page refresh) */
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axiosClient.get('/admin/me');
        const nextUser = res.data.user || res.data.admin || res.data.data?.user || res.data.data?.admin || res.data.data;
        setUser(nextUser);
        if (nextUser) localStorage.setItem('user', JSON.stringify(nextUser));
      } catch (err) {
        console.error('Error fetching user:', err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  /** 🔹 Login */
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await axiosClient.post('/admin/login', { email, password });
      const payload = res.data.data || res.data;
      const nextToken = String(payload.token || '').replace(/^Bearer\s+/i, '');
      const nextUser = payload.user || payload.admin;
      setToken(nextToken);
      setUser(nextUser);
      localStorage.setItem('user', JSON.stringify(nextUser));
      toast.success('Logged in successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Logout */
  const logout = async () => {
    try {
      if (token) {
        await axiosClient.post('/admin/logout');
      }
      toast.info('Logged out');
    } catch (err) {
      console.error('Error logging out:', err);
      toast.error('Logout failed on the server. Your local session was cleared.');
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin: user?.role === 'admin' }}>
      {!loading && children}
      {loading && <div ><Loader /> </div>}
    </AuthContext.Provider>
  );
};

/** 🔹 Custom hook */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
