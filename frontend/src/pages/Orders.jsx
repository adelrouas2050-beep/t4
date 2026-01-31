import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { 
  Search, 
  Filter,
  Download,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Truck,
  ChefHat,
  RefreshCw,
  Loader2
} from 'lucide-react';

const statusColors = {
  delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  on_way: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  preparing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  delivered: 'تم التوصيل',
  on_way: 'في الطريق',
  preparing: 'قيد التحضير',
  cancelled: 'ملغي',
};

const statusIcons = {
  delivered: CheckCircle,
  on_way: Truck,
  preparing: ChefHat,
  cancelled: XCircle,
};

export default function Orders() {
  const { orders, fetchOrders } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchOrders();
      setLoading(false);
    };
    loadData();
  }, [fetchOrders]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchOrders();
    setLoading(false);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.includes(search) || 
      order.user?.includes(search) || 
      order.restaurant?.includes(search);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    onWay: orders.filter(o => o.status === 'on_way').length,
    totalRevenue: orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + (o.total || 0), 0),
  };

  return (
    <div className="space-y-6" data-testid="orders-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">الطلبات</h1>
          <p className="text-zinc-500 mt-1">متابعة وإدارة طلبات التوصيل</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-white/10 bg-white/5 hover:bg-white/10"
            data-testid="refresh-orders-btn"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="export-orders">
            <Download className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">الإجمالي</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">تم التوصيل</p>
                <p className="text-xl font-bold text-emerald-400">{stats.delivered}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">قيد التحضير</p>
                <p className="text-xl font-bold text-amber-400">{stats.preparing}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Truck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">في الطريق</p>
                <p className="text-xl font-bold text-indigo-400">{stats.onWay}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <span className="text-pink-400 font-bold text-sm">ر.س</span>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold">الإيرادات</p>
                <p className="text-xl font-bold text-pink-400">{stats.totalRevenue}</p>
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
                placeholder="بحث برقم الطلب، المستخدم، أو المطعم..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-white/5 border-white/10 focus:border-indigo-500/50"
                data-testid="orders-search"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="orders-status-filter">
                  <Filter className="w-4 h-4 ml-2" />
                  {statusFilter === 'all' ? 'جميع الحالات' : statusLabels[statusFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#18181b] border-white/10">
                <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  جميع الحالات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('delivered')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  تم التوصيل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('on_way')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  في الطريق
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('preparing')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  قيد التحضير
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('cancelled')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  ملغي
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="bg-[#18181b] border-white/10" data-testid="orders-table-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            قائمة الطلبات ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              لا يوجد طلبات. اضغط على "تحميل بيانات تجريبية" في لوحة التحكم.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="table-header text-right">رقم الطلب</TableHead>
                  <TableHead className="table-header text-right">المستخدم</TableHead>
                  <TableHead className="table-header text-right">المطعم</TableHead>
                  <TableHead className="table-header text-right">العناصر</TableHead>
                  <TableHead className="table-header text-right">التاريخ</TableHead>
                  <TableHead className="table-header text-right">السائق</TableHead>
                  <TableHead className="table-header text-right">المبلغ</TableHead>
                  <TableHead className="table-header text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || ChefHat;
                  return (
                    <TableRow 
                      key={order.id} 
                      className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      data-testid={`order-row-${order.id}`}
                    >
                      <TableCell className="font-mono text-amber-400 font-medium">{order.id}</TableCell>
                      <TableCell className="text-white">{order.user}</TableCell>
                      <TableCell className="text-zinc-300">{order.restaurant}</TableCell>
                      <TableCell className="text-zinc-400">{order.items} عناصر</TableCell>
                      <TableCell className="text-zinc-500 text-sm">{order.date}</TableCell>
                      <TableCell className="text-zinc-300">{order.driver}</TableCell>
                      <TableCell className="text-emerald-400 font-medium">{order.total} ر.س</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[order.status]} border flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusLabels[order.status]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
