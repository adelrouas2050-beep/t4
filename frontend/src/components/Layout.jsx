import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAdmin } from '../context/AdminContext';
import { Bell, Search, Globe, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const Layout = () => {
  const { admin, sidebarCollapsed, toggleLanguage, language } = useAdmin();

  return (
    <div className="min-h-screen bg-[#09090b] gradient-bg">
      <Sidebar />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'mr-20' : 'mr-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-40 h-16 glass flex items-center justify-between px-6" data-testid="admin-header">
          {/* Search */}
          <div className="relative w-80">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="بحث..."
              className="pr-10 bg-white/5 border-white/10 focus:border-indigo-500/50 text-sm"
              data-testid="header-search"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="text-zinc-400 hover:text-white hover:bg-white/5"
              data-testid="language-toggle"
            >
              <Globe className="w-5 h-5" strokeWidth={1.5} />
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white hover:bg-white/5 relative"
              data-testid="notifications-btn"
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-white/5"
                  data-testid="profile-dropdown"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium">{admin?.name || 'المدير'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 bg-[#18181b] border-white/10">
                <DropdownMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white cursor-pointer">
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white cursor-pointer">
                  الإعدادات
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
