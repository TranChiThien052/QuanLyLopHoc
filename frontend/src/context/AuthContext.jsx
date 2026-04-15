import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    authService.logout();
    setToken(null);
    setUser(null);
    window.location.href = '/';
  }, []);

  // Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    const storedUser = authService.getCurrentUser();
    const storedToken = authService.getToken();

    if (storedToken && !isTokenExpired(storedToken)) {
      setToken(storedToken);
      setUser(storedUser);
    } else if (storedToken) {
      // Token exists but is expired
      logout();
    }
    setLoading(false);
  }, [logout]);

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      }
      return { success: false, message: 'Đăng nhập thất bại: Không nhận được token' };
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      return { success: false, message };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token && !isTokenExpired(token)
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
