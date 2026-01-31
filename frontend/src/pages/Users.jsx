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
  UserCheck, 
  UserX, 
  Eye,
  Filter,
  Download,
  Plus,
  RefreshCw,
  Loader2
} from 'lucide-react';

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  inactive: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  blocked: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const statusLabels = {
  active: 'نشط',
  inactive: 'غير نشط',
  blocked: 'محظور',
};

export default function Users() {
  const { users, fetchUsers, updateUserStatus } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    loadData();
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.includes(search) || user.email?.includes(search) || user.phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" data-testid="users-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">المستخدمين</h1>
          <p className="text-zinc-500 mt-1">إدارة حسابات المستخدمين</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-white/10 bg-white/5 hover:bg-white/10"
            data-testid="refresh-users-btn"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button className="bg-indigo-500 hover:bg-indigo-600 text-white btn-glow" data-testid="add-user-btn">
            <Plus className="w-4 h-4 ml-2" />
            إضافة مستخدم
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#18181b] border-white/10">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="بحث بالاسم، البريد، أو الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-white/5 border-white/10 focus:border-indigo-500/50"
                data-testid="users-search"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="status-filter">
                  <Filter className="w-4 h-4 ml-2" />
                  {statusFilter === 'all' ? 'جميع الحالات' : statusLabels[statusFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#18181b] border-white/10">
                <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  جميع الحالات
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('active')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  نشط
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('inactive')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  غير نشط
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('blocked')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                  محظور
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="export-users">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-[#18181b] border-white/10" data-testid="users-table-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            قائمة المستخدمين ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              لا يوجد مستخدمين. اضغط على "تحميل بيانات تجريبية" في لوحة التحكم.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="table-header text-right">المستخدم</TableHead>
                  <TableHead className="table-header text-right">الهاتف</TableHead>
                  <TableHead className="table-header text-right">الرحلات</TableHead>
                  <TableHead className="table-header text-right">الطلبات</TableHead>
                  <TableHead className="table-header text-right">تاريخ الانضمام</TableHead>
                  <TableHead className="table-header text-right">الحالة</TableHead>
                  <TableHead className="table-header text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="border-white/5 hover:bg-white/5 transition-colors"
                    data-testid={`user-row-${user.id}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || 'https://via.placeholder.com/40'} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-300 font-mono text-sm">{user.phone}</TableCell>
                    <TableCell className="text-zinc-300">{user.rides}</TableCell>
                    <TableCell className="text-zinc-300">{user.orders}</TableCell>
                    <TableCell className="text-zinc-500 text-sm">{user.joined}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[user.status]} border`}>
                        {statusLabels[user.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5" data-testid={`user-actions-${user.id}`}>
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-[#18181b] border-white/10">
                          <DropdownMenuItem className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                            <Eye className="w-4 h-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          {user.status !== 'active' && (
                            <DropdownMenuItem 
                              onClick={() => updateUserStatus(user.id, 'active')}
                              className="text-emerald-400 focus:bg-emerald-500/10 cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4 ml-2" />
                              تفعيل الحساب
                            </DropdownMenuItem>
                          )}
                          {user.status !== 'blocked' && (
                            <DropdownMenuItem 
                              onClick={() => updateUserStatus(user.id, 'blocked')}
                              className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                            >
                              <UserX className="w-4 h-4 ml-2" />
                              حظر المستخدم
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
