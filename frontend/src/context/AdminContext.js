import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const AdminContext = createContext(null);

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AdminProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [language, setLanguage] = useState('ar');
  const [currency, setCurrency] = useState('SAR');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [rides, setRides] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDrivers: 0,
    totalRestaurants: 0,
    totalRides: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    pendingOrders: 0,
    todayRides: 0,
    todayOrders: 0,
    monthlyGrowth: 0,
    averageRating: 0,
  });

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedAdmin = localStorage.getItem('admin');
    const isAdminUser = localStorage.getItem('isAdmin');
    
    if (token && savedAdmin) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(savedAdmin));
    } else if (isAdminUser === 'true') {
      // User logged in as admin from main app
      setIsAuthenticated(true);
      setAdmin({ name: 'مدير النظام', email: 'admin@transfers.com', role: 'super_admin' });
    }
    setLoading(false);
  }, []);

  // ============== AUTH ==============
  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, ...adminData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('admin', JSON.stringify(adminData));
      
      setIsAuthenticated(true);
      setAdmin(adminData);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    setIsAuthenticated(false);
    setAdmin(null);
  }, []);

  // ============== FETCH DATA ==============
  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    try {
      const response = await api.get('/drivers');
      setDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  }, []);

  const fetchRestaurants = useCallback(async () => {
    try {
      const response = await api.get('/restaurants');
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  }, []);

  const fetchRides = useCallback(async () => {
    try {
      const response = await api.get('/rides');
      setRides(response.data);
    } catch (error) {
      console.error('Error fetching rides:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, []);

  const fetchPromotions = useCallback(async () => {
    try {
      const response = await api.get('/promotions');
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  const fetchWeeklyStats = useCallback(async () => {
    try {
      const response = await api.get('/stats/weekly');
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      return [];
    }
  }, []);

  const fetchMonthlyStats = useCallback(async () => {
    try {
      const response = await api.get('/stats/monthly');
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      return [];
    }
  }, []);

  // ============== USER ACTIONS ==============
  const updateUserStatus = useCallback(async (userId, status) => {
    try {
      await api.put(`/users/${userId}`, { status });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }, []);

  const createUser = useCallback(async (userData) => {
    try {
      const response = await api.post('/users', userData);
      setUsers(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }, []);

  // ============== DRIVER ACTIONS ==============
  const updateDriverStatus = useCallback(async (driverId, status) => {
    try {
      await api.put(`/drivers/${driverId}`, { status });
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status } : d));
    } catch (error) {
      console.error('Error updating driver:', error);
    }
  }, []);

  const verifyDriver = useCallback(async (driverId) => {
    try {
      await api.put(`/drivers/${driverId}/verify`);
      setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, verified: true } : d));
    } catch (error) {
      console.error('Error verifying driver:', error);
    }
  }, []);

  const createDriver = useCallback(async (driverData) => {
    try {
      const response = await api.post('/drivers', driverData);
      setDrivers(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }, []);

  const deleteDriver = useCallback(async (driverId) => {
    try {
      await api.delete(`/drivers/${driverId}`);
      setDrivers(prev => prev.filter(d => d.id !== driverId));
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  }, []);

  // ============== RESTAURANT ACTIONS ==============
  const updateRestaurantStatus = useCallback(async (restaurantId, status) => {
    try {
      await api.put(`/restaurants/${restaurantId}`, { status });
      setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, status } : r));
    } catch (error) {
      console.error('Error updating restaurant:', error);
    }
  }, []);

  const createRestaurant = useCallback(async (restaurantData) => {
    try {
      const response = await api.post('/restaurants', restaurantData);
      setRestaurants(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating restaurant:', error);
      throw error;
    }
  }, []);

  const deleteRestaurant = useCallback(async (restaurantId) => {
    try {
      await api.delete(`/restaurants/${restaurantId}`);
      setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
    } catch (error) {
      console.error('Error deleting restaurant:', error);
    }
  }, []);

  // ============== PROMOTION ACTIONS ==============
  const addPromotion = useCallback(async (promotion) => {
    try {
      const response = await api.post('/promotions', promotion);
      setPromotions(prev => [...prev, response.data]);
      return response.data;
    } catch (error) {
      console.error('Error creating promotion:', error);
      throw error;
    }
  }, []);

  const updatePromotionStatus = useCallback(async (promoId, status) => {
    try {
      await api.put(`/promotions/${promoId}`, { status });
      setPromotions(prev => prev.map(p => p.id === promoId ? { ...p, status } : p));
    } catch (error) {
      console.error('Error updating promotion:', error);
    }
  }, []);

  const deletePromotion = useCallback(async (promoId) => {
    try {
      await api.delete(`/promotions/${promoId}`);
      setPromotions(prev => prev.filter(p => p.id !== promoId));
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  }, []);

  // ============== SEED DATA ==============
  const seedDatabase = useCallback(async () => {
    try {
      await api.post('/seed');
      // Refresh all data
      await Promise.all([
        fetchUsers(),
        fetchDrivers(),
        fetchRestaurants(),
        fetchRides(),
        fetchOrders(),
        fetchPromotions(),
        fetchStats(),
      ]);
      return true;
    } catch (error) {
      console.error('Error seeding database:', error);
      return false;
    }
  }, [fetchUsers, fetchDrivers, fetchRestaurants, fetchRides, fetchOrders, fetchPromotions, fetchStats]);

  // ============== UI ACTIONS ==============
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === 'ar' ? 'en' : 'ar');
    document.documentElement.dir = language === 'ar' ? 'ltr' : 'rtl';
  }, [language]);

  const value = {
    // Auth
    isAuthenticated,
    admin,
    loading,
    login,
    logout,
    
    // UI
    language,
    currency,
    sidebarCollapsed,
    toggleSidebar,
    toggleLanguage,
    setCurrency,
    
    // Data
    users,
    drivers,
    restaurants,
    rides,
    orders,
    promotions,
    stats,
    
    // Fetch functions
    fetchUsers,
    fetchDrivers,
    fetchRestaurants,
    fetchRides,
    fetchOrders,
    fetchPromotions,
    fetchStats,
    fetchWeeklyStats,
    fetchMonthlyStats,
    seedDatabase,
    
    // User actions
    updateUserStatus,
    createUser,
    deleteUser,
    
    // Driver actions
    updateDriverStatus,
    verifyDriver,
    createDriver,
    deleteDriver,
    
    // Restaurant actions
    updateRestaurantStatus,
    createRestaurant,
    deleteRestaurant,
    
    // Promotion actions
    addPromotion,
    updatePromotionStatus,
    deletePromotion,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};
