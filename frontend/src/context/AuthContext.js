import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../mock/data';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Admin credentials
const ADMIN_EMAIL = 'admin@transfers.com';
const ADMIN_PASSWORD = 'admin123';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('rider'); // 'rider', 'driver', or 'admin'
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedUser = localStorage.getItem('user');
    const savedUserType = localStorage.getItem('userType');
    const savedIsAdmin = localStorage.getItem('isAdmin');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setUserType(savedUserType || 'rider');
      setIsAdmin(savedIsAdmin === 'true');
    }
  }, []);

  const login = (email, password, type = 'rider') => {
    // Check if admin login
    if (email === ADMIN_EMAIL) {
      if (password === ADMIN_PASSWORD) {
        const adminUser = {
          id: 'admin_1',
          name: 'مدير النظام',
          nameEn: 'System Admin',
          email: ADMIN_EMAIL,
          phone: '+966500000000',
          role: 'admin'
        };
        setUser(adminUser);
        setIsAuthenticated(true);
        setUserType('admin');
        setIsAdmin(true);
        localStorage.setItem('user', JSON.stringify(adminUser));
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('isAdmin', 'true');
        return { success: true, isAdmin: true };
      } else {
        // Wrong password for admin
        return { success: false, error: 'كلمة المرور غير صحيحة', errorEn: 'Incorrect password' };
      }
    }

    // Regular user login - for demo, accept any email/password
    // In real app, this would validate against backend
    if (!email || !password) {
      return { success: false, error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور', errorEn: 'Please enter email and password' };
    }

    setUser(mockUser);
    setIsAuthenticated(true);
    setUserType(type);
    setIsAdmin(false);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('userType', type);
    localStorage.setItem('isAdmin', 'false');
    return { success: true, isAdmin: false };
  };

  const register = (userData, type = 'rider') => {
    // Mock register - in real app, this would call backend API
    const newUser = {
      ...mockUser,
      ...userData,
      id: 'user_' + Date.now()
    };
    setUser(newUser);
    setIsAuthenticated(true);
    setUserType(type);
    setIsAdmin(false);
    localStorage.setItem('user', JSON.stringify(newUser));
    localStorage.setItem('userType', type);
    localStorage.setItem('isAdmin', 'false');
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setUserType('rider');
    setIsAdmin(false);
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('isAdmin');
    // Also clear admin token if exists
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      userType,
      isAdmin,
      login,
      register,
      logout,
      updateUser,
      setUserType
    }}>
      {children}
    </AuthContext.Provider>
  );
};
