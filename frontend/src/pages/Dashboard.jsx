import React, { useEffect, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Users, 
  Car, 
  Store, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Database
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, change, changeType, color, loading }) => (
  <Card className="bg-[#18181b] border-white/10 card-hover" data-testid={`stat-${title.replace(/\s/g, '-').toLowerCase()}`}>
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>
          ) : (
            <p className="text-2xl font-bold text-white">{value}</p>
          )}
          {change && !loading && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              changeType === 'up' ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {changeType === 'up' ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{change}%</span>
              <span className="text-zinc-500">من الشهر الماضي</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const MiniChart = ({ data, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, i) => (
        <div
          key={i}
          className={`w-3 rounded-t transition-all duration-300 hover:opacity-80 ${color}`}
          style={{ height: `${(value / max) * 100}%` }}
        />
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { stats, fetchStats, fetchWeeklyStats, fetchMonthlyStats, seedDatabase } = useAdmin();
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchStats();
      const weekly = await fetchWeeklyStats();
      const monthly = await fetchMonthlyStats();
      setWeeklyData(weekly || []);
      setMonthlyData(monthly || []);
      setLoading(false);
    };
    loadData();
  }, [fetchStats, fetchWeeklyStats, fetchMonthlyStats]);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    await seedDatabase();
    setSeeding(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchStats();
    const weekly = await fetchWeeklyStats();
    const monthly = await fetchMonthlyStats();
    setWeeklyData(weekly || []);
    setMonthlyData(monthly || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">لوحة التحكم</h1>
          <p className="text-zinc-500 mt-1">نظرة عامة على أداء التطبيق</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
            data-testid="refresh-stats-btn"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDatabase}
            disabled={seeding}
            className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
            data-testid="seed-database-btn"
          >
            <Database className={`w-4 h-4 ml-2 ${seeding ? 'animate-spin' : ''}`} />
            {seeding ? 'جاري التحميل...' : 'تحميل بيانات تجريبية'}
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">النظام يعمل</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المستخدمين"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          change={12.5}
          changeType="up"
          color="bg-indigo-500/20 text-indigo-400"
          loading={loading}
        />
        <StatCard
          title="السائقين النشطين"
          value={stats.activeDrivers}
          icon={Car}
          change={8.2}
          changeType="up"
          color="bg-emerald-500/20 text-emerald-400"
          loading={loading}
        />
        <StatCard
          title="إجمالي المطاعم"
          value={stats.totalRestaurants}
          icon={Store}
          change={5.1}
          changeType="up"
          color="bg-amber-500/20 text-amber-400"
          loading={loading}
        />
        <StatCard
          title="الإيرادات (ر.س)"
          value={stats.totalRevenue.toLocaleString()}
          icon={DollarSign}
          change={15.3}
          changeType="up"
          color="bg-pink-500/20 text-pink-400"
          loading={loading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <Card className="bg-[#18181b] border-white/10" data-testid="weekly-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
              <span>النشاط الأسبوعي</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <span className="text-zinc-400">الرحلات</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span className="text-zinc-400">الطلبات</span>
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3,4,5,6,7].map(i => (
                  <div key={i} className="h-6 bg-white/5 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {weeklyData.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-16 text-xs text-zinc-500">{item.day}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                          style={{ width: `${(item.rides / 1000) * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-xs text-indigo-400 text-left">{item.rides}</span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${(item.orders / 1000) * 100}%` }}
                        />
                      </div>
                      <span className="w-10 text-xs text-amber-400 text-left">{item.orders}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-[#18181b] border-white/10" data-testid="revenue-chart">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-white flex items-center justify-between">
              <span>الإيرادات الشهرية</span>
              <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                +{stats.monthlyGrowth}%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-end justify-between h-48 pt-4">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="flex-1 px-1">
                    <div className="h-20 bg-white/5 rounded-t animate-pulse"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-end justify-between h-48 pt-4">
                {monthlyData.map((item, i) => {
                  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
                  const height = (item.revenue / maxRevenue) * 100;
                  return (
                    <div key={i} className="flex flex-col items-center gap-2 flex-1">
                      <div className="w-full px-1">
                        <div 
                          className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-md transition-all duration-500 hover:from-indigo-500 hover:to-indigo-300 cursor-pointer"
                          style={{ height: `${height * 1.5}px` }}
                        />
                      </div>
                      <span className="text-xs text-zinc-500">{item.month}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#18181b] border-white/10" data-testid="today-rides">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">رحلات اليوم</p>
                {loading ? (
                  <div className="h-9 w-16 bg-white/5 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">{stats.todayRides}</p>
                )}
              </div>
              <MiniChart 
                data={weeklyData.map(d => d.rides || 0)} 
                color="bg-indigo-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-white/10" data-testid="today-orders">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">طلبات اليوم</p>
                {loading ? (
                  <div className="h-9 w-16 bg-white/5 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-white">{stats.todayOrders}</p>
                )}
              </div>
              <MiniChart 
                data={weeklyData.map(d => d.orders || 0)} 
                color="bg-amber-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#18181b] border-white/10" data-testid="pending-orders">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">طلبات معلقة</p>
                {loading ? (
                  <div className="h-9 w-16 bg-white/5 rounded animate-pulse"></div>
                ) : (
                  <p className="text-3xl font-bold text-amber-400">{stats.pendingOrders}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-amber-400" strokeWidth={1.5} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
