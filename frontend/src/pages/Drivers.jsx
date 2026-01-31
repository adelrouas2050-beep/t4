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
  MoreVertical, 
  CheckCircle, 
  XCircle,
  Eye,
  Filter,
  Download,
  Star,
  Car,
  Phone,
  RefreshCw,
  Loader2
} from 'lucide-react';

const statusColors = {
  online: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  offline: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  busy: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const statusLabels = {
  online: 'متصل',
  offline: 'غير متصل',
  busy: 'مشغول',
};

export default function Drivers() {
  const { drivers, fetchDrivers, updateDriverStatus, verifyDriver } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchDrivers();
      setLoading(false);
    };
    loadData();
  }, [fetchDrivers]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchDrivers();
    setLoading(false);
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name?.includes(search) || driver.phone?.includes(search) || driver.vehicle?.includes(search);
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = drivers.filter(d => d.status === 'online').length;
  const verifiedCount = drivers.filter(d => d.verified).length;
  const pendingCount = drivers.filter(d => !d.verified).length;
  const avgRating = drivers.length > 0 ? (drivers.reduce((acc, d) => acc + (d.rating || 0), 0) / drivers.length).toFixed(1) : 0;

  return (
    <div className="space-y-6" data-testid="drivers-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">السائقين</h1>
          <p className="text-zinc-500 mt-1">إدارة حسابات السائقين والتحقق منهم</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-white/10 bg-white/5 hover:bg-white/10"
            data-testid="refresh-drivers-btn"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-emerald-400">{onlineCount} متصل</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">إجمالي السائقين</p>
                <p className="text-2xl font-bold text-white mt-1">{drivers.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Car className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">موثقين</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{verifiedCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">بانتظار التوثيق</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">متوسط التقييم</p>
                <p className="text-2xl font-bold text-white mt-1 flex items-center gap-1">
                  {avgRating}
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400" />
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
                placeholder="بحث بالاسم، الهاتف، أو المركبة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-white/5 border-white/10 focus:border-indigo-500/50"
                data-testid="drivers-search"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="drivers-status-filter">
                  <Filter className="w-4 h-4 ml-2" />
                  {statusFilter === 'all' ? 'جميع الحالات' : statusLabels[statusFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#18181b] border-white/10">
                <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  جميع الحالات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('online')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  متصل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('offline')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  غير متصل
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('busy')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  مشغول
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="export-drivers">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card className="bg-[#18181b] border-white/10" data-testid="drivers-table-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            قائمة السائقين ({filteredDrivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              لا يوجد سائقين. اضغط على "تحميل بيانات تجريبية" في لوحة التحكم.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="table-header text-right">السائق</TableHead>
                  <TableHead className="table-header text-right">المركبة</TableHead>
                  <TableHead className="table-header text-right">التقييم</TableHead>
                  <TableHead className="table-header text-right">الرحلات</TableHead>
                  <TableHead className="table-header text-right">الأرباح (ر.س)</TableHead>
                  <TableHead className="table-header text-right">الحالة</TableHead>
                  <TableHead className="table-header text-right">التوثيق</TableHead>
                  <TableHead className="table-header text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow 
                    key={driver.id} 
                    className="border-white/5 hover:bg-white/5 transition-colors"
                    data-testid={`driver-row-${driver.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={driver.avatar || 'https://via.placeholder.com/40'} 
                          alt={driver.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <p className="font-medium text-white">{driver.name}</p>
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {driver.phone}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-zinc-300 text-sm">{driver.vehicle}</p>
                        <p className="text-xs text-zinc-500 font-mono">{driver.plate}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-white font-medium">{driver.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300">{driver.rides}</TableCell>
                    <TableCell className="text-emerald-400 font-medium">{driver.earnings?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[driver.status]} border`}>
                        {statusLabels[driver.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {driver.verified ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 ml-1" />
                          موثق
                        </Badge>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => verifyDriver(driver.id)}
                          className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 h-7 text-xs"
                          data-testid={`verify-driver-${driver.id}`}
                        >
                          توثيق
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5" data-testid={`driver-actions-${driver.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-[#18181b] border-white/10">
                          <DropdownMenuItem className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                            <Eye className="w-4 h-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          {driver.status !== 'online' && (
                            <DropdownMenuItem 
                              onClick={() => updateDriverStatus(driver.id, 'online')}
                              className="text-emerald-400 focus:bg-emerald-500/10 cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4 ml-2" />
                              تفعيل
                            </DropdownMenuItem>
                          )}
                          {driver.status !== 'offline' && (
                            <DropdownMenuItem 
                              onClick={() => updateDriverStatus(driver.id, 'offline')}
                              className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4 ml-2" />
                              إيقاف
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
