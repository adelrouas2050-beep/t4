import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Store, 
  MapPin, 
  ShoppingBag, 
  Ticket, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { path: '/admin/users', icon: Users, label: 'المستخدمين' },
  { path: '/admin/drivers', icon: Car, label: 'السائقين' },
  { path: '/admin/restaurants', icon: Store, label: 'المطاعم' },
  { path: '/admin/rides', icon: MapPin, label: 'الرحلات' },
  { path: '/admin/orders', icon: ShoppingBag, label: 'الطلبات' },
  { path: '/admin/promotions', icon: Ticket, label: 'العروض' },
  { path: '/admin/settings', icon: Settings, label: 'الإعدادات' },
];

export const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside 
      className={`fixed top-0 right-0 h-full bg-[#18181b] border-l border-white/10 z-50 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
      data-testid="admin-sidebar"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-white/10 px-4">
        {!sidebarCollapsed ? (
          <h1 className="text-xl font-bold bg-gradient-to-l from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
            ترانسفيرز
          </h1>
        ) : (
          <span className="text-2xl font-bold text-indigo-500">T</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`
                }
                data-testid={`nav-${item.path.split('/').pop() || 'dashboard'}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 relative z-[100]">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 relative z-[100] ${
            sidebarCollapsed ? 'justify-center px-2' : 'justify-start'
          }`}
          data-testid="logout-btn"
        >
          <LogOut className="w-5 h-5" strokeWidth={1.5} />
          {!sidebarCollapsed && <span className="mr-3">تسجيل الخروج</span>}
        </Button>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -left-3 transform -translate-y-1/2 w-6 h-6 bg-[#27272a] border border-white/10 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-indigo-500/50 transition-colors"
        data-testid="toggle-sidebar-btn"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </aside>
  );
};
