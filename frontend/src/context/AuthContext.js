import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUser } from '../mock/data';

const API_URL = process.env.REACT_APP_BACKEND_URL;

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

// Registered users database (mock)
const REGISTERED_USERS = [
  {
    id: 'user_1',
    email: 'rider@transfers.com',
    password: 'rider123',
    name: 'محمد أحمد',
    nameEn: 'Mohammed Ahmed',
    phone: '+966501234567',
    type: 'rider'
  },
  {
    id: 'user_2',
    email: 'driver@transfers.com',
    password: 'driver123',
    name: 'أحمد السائق',
    nameEn: 'Ahmed Driver',
    phone: '+966502345678',
    type: 'driver'
  },
  {
    id: 'user_3',
    email: 'test@test.com',
    password: 'test123',
    name: 'مستخدم تجريبي',
    nameEn: 'Test User',
    phone: '+966503456789',
    type: 'rider'
  },
  {
    id: 'user_4',
    email: 'newuser@example.com',
    password: 'new123',
    name: 'مستخدم جديد',
    nameEn: 'New User',
    phone: '+966504567890',
    type: 'rider'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState('rider'); // 'rider', 'driver', or 'admin'
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, []);

  const login = (email, password, type = 'rider') => {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: 'الرجاء إدخال البريد الإلكتروني وكلمة المرور', errorEn: 'Please enter email and password' };
    }

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

    // Check if user exists in registered users
    const foundUser = REGISTERED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!foundUser) {
      // User not found
      return { success: false, error: 'البريد الإلكتروني غير مسجل', errorEn: 'Email not registered' };
    }

    if (foundUser.password !== password) {
      // Wrong password
      return { success: false, error: 'كلمة المرور غير صحيحة', errorEn: 'Incorrect password' };
    }

    // Successful login
    const loggedInUser = {
      id: foundUser.id,
      name: foundUser.name,
      nameEn: foundUser.nameEn,
      email: foundUser.email,
      phone: foundUser.phone
    };

    setUser(loggedInUser);
    setIsAuthenticated(true);
    setUserType(foundUser.type || type);
    setIsAdmin(false);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    localStorage.setItem('userType', foundUser.type || type);
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
      isLoading,
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
