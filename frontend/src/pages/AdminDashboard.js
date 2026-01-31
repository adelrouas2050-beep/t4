import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useAdmin } from '../context/AdminContext';
import CountrySelector from '../components/CountrySelector';
import {
  LayoutDashboard, Users, Car, Store, TrendingUp, DollarSign,
  ShoppingBag, Settings, Bell, LogOut, Languages, Activity,
  UserCheck, Clock, CheckCircle, AlertCircle,
  BarChart3, Download, Shield
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { stats, activities, drivers, restaurants } = useAdmin();
  const [activeTab, setActiveTab] = useState('overview');

  const statsCards = [
    {
      title: t('إجمالي المستخدمين', 'Total Users'),
      value: stats.totalUsers?.toLocaleString(),
      change: '+12%',
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      title: t('السائقين النشطين', 'Active Drivers'),
      value: stats.totalDrivers?.toLocaleString(),
      change: '+5%',
      icon: Car,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      title: t('المطاعم', 'Restaurants'),
      value: stats.totalRestaurants?.toLocaleString(),
      change: '+8%',
      icon: Store,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      title: t('الإيرادات الشهرية', 'Monthly Revenue'),
      value: formatPrice(stats.monthlyRevenue, language),
      change: '+15%',
      icon: DollarSign,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ];

  const recentActivities = activities?.slice(0, 5) || [];
  const pendingDrivers = drivers?.filter(d => d.status === 'pending') || [];
  const pendingRestaurants = restaurants?.filter(r => r.status === 'pending') || [];

  const getActivityText = (action) => {
    const texts = {
      'approved_driver': t('وافق على السائق', 'approved driver'),
      'rejected_driver': t('رفض السائق', 'rejected driver'),
      'suspended_user': t('علّق المستخدم', 'suspended user'),
      'approved_restaurant': t('وافق على المطعم', 'approved restaurant'),
      'created_promotion': t('أنشأ عرض', 'created promotion'),
      'updated_settings': t('حدّث الإعدادات', 'updated settings'),
      'sent_notification': t('أرسل إشعار', 'sent notification')
    };
    return texts[action] || action;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {t('لوحة التحكم', 'Admin Dashboard')}
                </h1>
                <p className="text-xs text-slate-500">{t('ترانسفيرز', 'TransVerse')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t('تصدير', 'Export')}</span>
              </Button>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <CountrySelector />
              <Button variant="ghost" size="sm">
                <Languages className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen p-4">
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t('نظرة عامة', 'Overview')}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <Users className="w-4 h-4" />
              {t('المستخدمين', 'Users')}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <Car className="w-4 h-4" />
              {t('السائقين', 'Drivers')}
              {stats.pendingDrivers > 0 && (
                <Badge className="ml-auto bg-red-500">{stats.pendingDrivers}</Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <Store className="w-4 h-4" />
              {t('المطاعم', 'Restaurants')}
              {stats.pendingRestaurants > 0 && (
                <Badge className="ml-auto bg-red-500">{stats.pendingRestaurants}</Badge>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {t('الرحلات', 'Rides')}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              {t('الطلبات', 'Orders')}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <DollarSign className="w-4 h-4" />
              {t('العروض', 'Promotions')}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <Settings className="w-4 h-4" />
              {t('الإعدادات', 'Settings')}
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {statsCards.map((stat, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                {t('إحصائيات سريعة', 'Quick Stats')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm">{t('رحلات مكتملة اليوم', 'Completed Rides Today')}</span>
                  </div>
                  <span className="font-bold">{stats.todayRides}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">{t('رحلات جارية', 'Active Rides')}</span>
                  </div>
                  <span className="font-bold">{stats.activeRides}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm">{t('إيرادات اليوم', 'Today Revenue')}</span>
                  </div>
                  <span className="font-bold">{formatPrice(stats.todayRevenue, language)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    <span className="text-sm">{t('مستخدمين نشطين', 'Active Users')}</span>
                  </div>
                  <span className="font-bold">{stats.activeUsers?.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* Pending Approvals */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                {t('بانتظار الموافقة', 'Pending Approvals')}
              </h3>
              <div className="space-y-3">
                {pendingDrivers.slice(0, 3).map(driver => (
                  <div key={driver.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-semibold">{language === 'ar' ? driver.name : driver.nameEn}</p>
                        <p className="text-xs text-slate-600">{t('سائق جديد', 'New Driver')}</p>
                      </div>
                    </div>
                    <Button size="sm">
                      {t('مراجعة', 'Review')}
                    </Button>
                  </div>
                ))}
                {pendingRestaurants.slice(0, 2).map(restaurant => (
                  <div key={restaurant.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-semibold">{language === 'ar' ? restaurant.name : restaurant.nameEn}</p>
                        <p className="text-xs text-slate-600">{t('مطعم جديد', 'New Restaurant')}</p>
                      </div>
                    </div>
                    <Button size="sm">
                      {t('مراجعة', 'Review')}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              {t('النشاطات الأخيرة', 'Recent Activity')}
            </h3>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.admin}</span>{' '}
                      {getActivityText(activity.action)}{' '}
                      <span className="font-semibold">{activity.targetName}</span>
                    </p>
                    <p className="text-xs text-slate-500">{new Date(activity.timestamp).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
