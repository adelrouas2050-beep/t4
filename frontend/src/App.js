import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RideProvider } from './context/RideContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { ChatProvider } from './context/ChatContext';
import { AdvancedChatProvider } from './context/AdvancedChatContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Toaster } from './components/ui/sonner';

// Old Project Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import RiderDashboard from './pages/RiderDashboard';
import DriverDashboard from './pages/DriverDashboard';
import DeliveryPage from './pages/DeliveryPage';
import RestaurantDetailPage from './pages/RestaurantDetailPage';
import CartPage from './pages/CartPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import CreateChannelPage from './pages/CreateChannelPage';
import CreateGroupPage from './pages/CreateGroupPage';

// New Admin Panel Pages
import { Layout } from './components/Layout';
import AdminLogin from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Drivers from './pages/Drivers';
import Restaurants from './pages/Restaurants';
import Rides from './pages/Rides';
import Orders from './pages/Orders';
import Promotions from './pages/Promotions';
import Settings from './pages/Settings';

// Protected Route for User App
const ProtectedRoute = ({ children, requiredType }) => {
  const { isAuthenticated, userType, isAdmin, isLoading } = useAuth();
  
  // Wait for auth to initialize
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#17212b]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5288c1]"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // Allow admin to access any route
  if (isAdmin) {
    return children;
  }
  
  if (requiredType && userType !== requiredType) {
    return <Navigate to={userType === 'driver' ? '/driver' : '/rider'} replace />;
  }
  
  return children;
};

// Protected Route for Admin Panel
const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAdmin();
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};

// Admin Public Route
const AdminPublicRoute = ({ children }) => {
  const { isAuthenticated } = useAdmin();
  
  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* ============ Main App Routes (Old Project) ============ */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/rider" 
        element={
          <ProtectedRoute requiredType="rider">
            <RiderDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driver" 
        element={
          <ProtectedRoute requiredType="driver">
            <DriverDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/delivery" 
        element={
          <ProtectedRoute>
            <DeliveryPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/restaurant/:restaurantId" 
        element={
          <ProtectedRoute>
            <RestaurantDetailPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/cart" 
        element={
          <ProtectedRoute>
            <CartPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/chat" 
        element={
          <ProtectedRoute>
            <ChatPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-channel" 
        element={
          <ProtectedRoute>
            <CreateChannelPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create-group" 
        element={
          <ProtectedRoute>
            <CreateGroupPage />
          </ProtectedRoute>
        } 
      />

      {/* ============ Admin Panel Routes (New) ============ */}
      <Route path="/admin/login" element={
        <AdminPublicRoute>
          <AdminLogin />
        </AdminPublicRoute>
      } />
      
      <Route path="/admin" element={
        <AdminProtectedRoute>
          <Layout />
        </AdminProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="restaurants" element={<Restaurants />} />
        <Route path="rides" element={<Rides />} />
        <Route path="orders" element={<Orders />} />
        <Route path="promotions" element={<Promotions />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* 404 - Redirect to Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <AuthProvider>
          <AdminProvider>
            <RideProvider>
              <DeliveryProvider>
                <ChatProvider>
                  <AdvancedChatProvider>
                    <BrowserRouter>
                      <div className="App">
                        <AppRoutes />
                        <Toaster position="top-center" />
                      </div>
                    </BrowserRouter>
                  </AdvancedChatProvider>
                </ChatProvider>
              </DeliveryProvider>
            </RideProvider>
          </AdminProvider>
        </AuthProvider>
      </CurrencyProvider>
    </LanguageProvider>
  );
}

export default App;
