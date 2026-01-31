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
  Clock,
  CheckCircle,
  XCircle,
  Navigation,
  RefreshCw,
  Loader2
} from 'lucide-react';

const statusColors = {
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  in_progress: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  completed: 'مكتملة',
  in_progress: 'جارية',
  pending: 'معلقة',
  cancelled: 'ملغاة',
};

const statusIcons = {
  completed: CheckCircle,
  in_progress: Navigation,
  pending: Clock,
  cancelled: XCircle,
};

export default function Rides() {
  const { rides, fetchRides } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchRides();
      setLoading(false);
    };
    loadData();
  }, [fetchRides]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchRides();
    setLoading(false);
  };

  const filteredRides = rides.filter(ride => {
    const matchesSearch = 
      ride.id?.includes(search) || 
      ride.user?.includes(search) || 
      ride.driver?.includes(search) ||
      ride.from?.includes(search) ||
      ride.to?.includes(search);
    const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: rides.length,
    completed: rides.filter(r => r.status === 'completed').length,
    inProgress: rides.filter(r => r.status === 'in_progress').length,
    cancelled: rides.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6" data-testid="rides-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">الرحلات</h1>
          <p className="text-zinc-500 mt-1">متابعة وإدارة جميع الرحلات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-white/10 bg-white/5 hover:bg-white/10"
            data-testid="refresh-rides-btn"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="export-rides">
            <Download className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">إجمالي الرحلات</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">مكتملة</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">جارية</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">ملغاة</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{stats.cancelled}</p>
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
                placeholder="بحث برقم الرحلة، المستخدم، السائق، أو الموقع..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-white/5 border-white/10 focus:border-indigo-500/50"
                data-testid="rides-search"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="rides-status-filter">
                  <Filter className="w-4 h-4 ml-2" />
                  {statusFilter === 'all' ? 'جميع الحالات' : statusLabels[statusFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#18181b] border-white/10">
                <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  جميع الحالات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('completed')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  مكتملة
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('in_progress')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  جارية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('pending')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  معلقة
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('cancelled')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  ملغاة
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {/* Rides Table */}
      <Card className="bg-[#18181b] border-white/10" data-testid="rides-table-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            قائمة الرحلات ({filteredRides.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : filteredRides.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              لا يوجد رحلات. اضغط على "تحميل بيانات تجريبية" في لوحة التحكم.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="table-header text-right">رقم الرحلة</TableHead>
                  <TableHead className="table-header text-right">المستخدم</TableHead>
                  <TableHead className="table-header text-right">السائق</TableHead>
                  <TableHead className="table-header text-right">المسار</TableHead>
                  <TableHead className="table-header text-right">التاريخ</TableHead>
                  <TableHead className="table-header text-right">المدة</TableHead>
                  <TableHead className="table-header text-right">السعر</TableHead>
                  <TableHead className="table-header text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRides.map((ride) => {
                  const StatusIcon = statusIcons[ride.status] || Clock;
                  return (
                    <TableRow 
                      key={ride.id} 
                      className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                      data-testid={`ride-row-${ride.id}`}
                    >
                      <TableCell className="font-mono text-indigo-400 font-medium">{ride.id}</TableCell>
                      <TableCell className="text-white">{ride.user}</TableCell>
                      <TableCell className="text-zinc-300">{ride.driver}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 max-w-xs">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span className="text-zinc-400 truncate">{ride.from}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-2 h-2 rounded-full bg-red-400"></div>
                            <span className="text-zinc-400 truncate">{ride.to}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-zinc-500 text-sm">{ride.date}</TableCell>
                      <TableCell className="text-zinc-300">{ride.duration}</TableCell>
                      <TableCell className="text-emerald-400 font-medium">
                        {ride.fare > 0 ? `${ride.fare} ر.س` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[ride.status]} border flex items-center gap-1 w-fit`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusLabels[ride.status]}
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
