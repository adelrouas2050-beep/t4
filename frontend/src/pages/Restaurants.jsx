import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { 
  Search, 
  MoreVertical, 
  Store,
  Eye,
  Filter,
  Plus,
  Star,
  ShoppingBag,
  Power,
  PowerOff,
  RefreshCw,
  Loader2
} from 'lucide-react';

const statusColors = {
  open: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  closed: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  open: 'مفتوح',
  closed: 'مغلق',
};

export default function Restaurants() {
  const { restaurants, fetchRestaurants, updateRestaurantStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRestaurants();
      setLoading(false);
    };
    loadData();
  }, [fetchRestaurants]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchRestaurants();
    setLoading(false);
  };

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name?.includes(search) || restaurant.category?.includes(search);
    const matchesStatus = statusFilter === 'all' || restaurant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openCount = restaurants.filter(r => r.status === 'open').length;
  const totalOrders = restaurants.reduce((acc, r) => acc + (r.orders || 0), 0);

  return (
    <div className="space-y-6" data-testid="restaurants-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">المطاعم</h1>
          <p className="text-zinc-500 mt-1">إدارة المطاعم والقوائم</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-white/10 bg-white/5 hover:bg-white/10"
            data-testid="refresh-restaurants-btn"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button className="bg-indigo-500 hover:bg-indigo-600 text-white btn-glow" data-testid="add-restaurant-btn">
            <Plus className="w-4 h-4 ml-2" />
            إضافة مطعم
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">إجمالي المطاعم</p>
                <p className="text-2xl font-bold text-white mt-1">{restaurants.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Store className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">مفتوح الآن</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{openCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Power className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{totalOrders.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-[#18181b] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="بحث بالاسم أو التصنيف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-white/5 border-white/10 focus:border-indigo-500/50"
                data-testid="restaurants-search"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="restaurants-status-filter">
                  <Filter className="w-4 h-4 ml-2" />
                  {statusFilter === 'all' ? 'جميع الحالات' : statusLabels[statusFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#18181b] border-white/10">
                <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  جميع الحالات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('open')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  مفتوح
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('closed')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  مغلق
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="py-12 text-center text-zinc-500">
            لا يوجد مطاعم. اضغط على "تحميل بيانات تجريبية" في لوحة التحكم.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="restaurants-grid">
          {filteredRestaurants.map((restaurant) => (
            <Card 
              key={restaurant.id} 
              className="bg-[#18181b] border-white/10 card-hover overflow-hidden"
              data-testid={`restaurant-card-${restaurant.id}`}
            >
              <div className="relative h-36 overflow-hidden">
                <img 
                  src={restaurant.image || 'https://via.placeholder.com/300x150'} 
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent"></div>
                <Badge className={`absolute top-3 left-3 ${statusColors[restaurant.status]} border`}>
                  {statusLabels[restaurant.status]}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-lg">{restaurant.name}</h3>
                    <p className="text-zinc-500 text-sm">{restaurant.category}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5 -mt-1 -ml-2" data-testid={`restaurant-actions-${restaurant.id}`}>
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="bg-[#18181b] border-white/10">
                      <DropdownMenuItem className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                        <Eye className="w-4 h-4 ml-2" />
                        عرض القائمة
                      </DropdownMenuItem>
                      {restaurant.status === 'closed' ? (
                        <DropdownMenuItem 
                          onClick={() => updateRestaurantStatus(restaurant.id, 'open')}
                          className="text-emerald-400 focus:bg-emerald-500/10 cursor-pointer"
                        >
                          <Power className="w-4 h-4 ml-2" />
                          فتح المطعم
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem 
                          onClick={() => updateRestaurantStatus(restaurant.id, 'closed')}
                          className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                        >
                          <PowerOff className="w-4 h-4 ml-2" />
                          إغلاق المطعم
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-white font-medium">{restaurant.rating}</span>
                  </div>
                  <div className="text-zinc-400">
                    <span className="text-white font-medium">{restaurant.orders?.toLocaleString()}</span> طلب
                  </div>
                  <div className="text-zinc-400">
                    عمولة <span className="text-indigo-400 font-medium">{restaurant.commission}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
