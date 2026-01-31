import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
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
  Loader2,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ShoppingBag,
  UserPlus
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

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

// Initial form state
const initialFormState = {
  name: '',
  email: '',
  phone: '',
  status: 'active'
};

export default function Users() {
  const { users, fetchUsers, updateUserStatus } = useAdmin();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const getToken = () => localStorage.getItem('token');

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

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast({
          title: 'تم حذف المستخدم',
          description: `تم حذف ${selectedUser.name} بنجاح`,
        });
        await fetchUsers();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: 'فشل الحذف',
        description: 'حدث خطأ أثناء حذف المستخدم',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  // Block/Unblock user
  const handleBlockUser = async (block = true) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const newStatus = block ? 'blocked' : 'active';
      await updateUserStatus(selectedUser.id, newStatus);
      toast({
        title: block ? 'تم حظر المستخدم' : 'تم إلغاء الحظر',
        description: block 
          ? `تم حظر ${selectedUser.name}` 
          : `تم تفعيل حساب ${selectedUser.name}`,
      });
      await fetchUsers();
    } catch (error) {
      toast({
        title: 'فشلت العملية',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
      setShowBlockDialog(false);
      setSelectedUser(null);
    }
  };

  // Quick status change
  const handleQuickStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      toast({
        title: 'تم التحديث',
        description: `تم تغيير حالة المستخدم إلى ${statusLabels[newStatus]}`,
      });
      await fetchUsers();
    } catch (error) {
      toast({
        title: 'فشل التحديث',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.includes(search) || user.email?.includes(search) || user.phone?.includes(search);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 md:space-y-6" data-testid="users-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">المستخدمين</h1>
          <p className="text-zinc-500 text-sm mt-1">إدارة حسابات المستخدمين</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300"
            data-testid="refresh-users-btn"
          >
            <RefreshCw className={`w-4 h-4 ml-1 md:ml-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </Button>
          <Button className="bg-indigo-500 hover:bg-indigo-600 text-white btn-glow" data-testid="add-user-btn">
            <Plus className="w-4 h-4 ml-1 md:ml-2" />
            <span className="hidden sm:inline">إضافة مستخدم</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#18181b] border-white/10">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="بحث..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-white/5 border-white/10 focus:border-indigo-500/50"
                data-testid="users-search"
              />
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10 flex-1 sm:flex-none" data-testid="status-filter">
                    <Filter className="w-4 h-4 ml-1" />
                    <span className="truncate">{statusFilter === 'all' ? 'الكل' : statusLabels[statusFilter]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#18181b] border-white/10">
                  <DropdownMenuItem onClick={() => setStatusFilter('all')} className="text-zinc-300 focus:bg-white/5 cursor-pointer">
                    جميع الحالات
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')} className="text-emerald-400 focus:bg-white/5 cursor-pointer">
                    <CheckCircle className="w-4 h-4 ml-2" />
                    نشط
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('inactive')} className="text-zinc-400 focus:bg-white/5 cursor-pointer">
                    غير نشط
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('blocked')} className="text-red-400 focus:bg-white/5 cursor-pointer">
                    <Ban className="w-4 h-4 ml-2" />
                    محظور
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="sm" className="border-white/10 bg-white/5 hover:bg-white/10" data-testid="export-users">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-3 text-center">
            <p className="text-xl md:text-2xl font-bold text-white">{users.length}</p>
            <p className="text-[10px] md:text-xs text-zinc-500">إجمالي</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-3 text-center">
            <p className="text-xl md:text-2xl font-bold text-emerald-400">{users.filter(u => u.status === 'active').length}</p>
            <p className="text-[10px] md:text-xs text-zinc-500">نشط</p>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-3 text-center">
            <p className="text-xl md:text-2xl font-bold text-red-400">{users.filter(u => u.status === 'blocked').length}</p>
            <p className="text-[10px] md:text-xs text-zinc-500">محظور</p>
          </CardContent>
        </Card>
      </div>

      {/* Users List - Mobile Cards / Desktop Table */}
      <Card className="bg-[#18181b] border-white/10" data-testid="users-table-card">
        <CardHeader className="pb-3 px-4">
          <CardTitle className="text-base md:text-lg font-semibold text-white">
            قائمة المستخدمين ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 px-4">
              <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا يوجد مستخدمين</p>
              <p className="text-xs mt-1">اضغط "بيانات تجريبية" في لوحة التحكم</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="md:hidden space-y-3 p-4">
                {filteredUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10"
                    data-testid={`user-card-${user.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.avatar || 'https://via.placeholder.com/40'} 
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                          <Badge className={`${statusColors[user.status]} border mt-1 text-[10px]`}>
                            {statusLabels[user.status]}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-zinc-400 h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#18181b] border-white/10 w-48">
                          <DropdownMenuItem 
                            onClick={() => { setSelectedUser(user); setShowUserDetails(true); }}
                            className="text-zinc-300 focus:bg-white/5 cursor-pointer"
                          >
                            <Eye className="w-4 h-4 ml-2" />
                            عرض التفاصيل
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          {user.status !== 'active' && (
                            <DropdownMenuItem 
                              onClick={() => handleQuickStatusChange(user.id, 'active')}
                              className="text-emerald-400 focus:bg-emerald-500/10 cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4 ml-2" />
                              تفعيل الحساب
                            </DropdownMenuItem>
                          )}
                          {user.status !== 'blocked' ? (
                            <DropdownMenuItem 
                              onClick={() => { setSelectedUser(user); setShowBlockDialog(true); }}
                              className="text-amber-400 focus:bg-amber-500/10 cursor-pointer"
                            >
                              <Ban className="w-4 h-4 ml-2" />
                              حظر المستخدم
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleQuickStatusChange(user.id, 'active')}
                              className="text-emerald-400 focus:bg-emerald-500/10 cursor-pointer"
                            >
                              <CheckCircle className="w-4 h-4 ml-2" />
                              إلغاء الحظر
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem 
                            onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }}
                            className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف المستخدم
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
                      <div>
                        <p className="text-white font-medium">{user.rides}</p>
                        <p className="text-[10px] text-zinc-500">رحلة</p>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.orders}</p>
                        <p className="text-[10px] text-zinc-500">طلب</p>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-xs">{user.joined}</p>
                        <p className="text-[10px] text-zinc-500">انضمام</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
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
                            <DropdownMenuContent align="start" className="bg-[#18181b] border-white/10 w-48">
                              <DropdownMenuItem 
                                onClick={() => { setSelectedUser(user); setShowUserDetails(true); }}
                                className="text-zinc-300 focus:bg-white/5 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 ml-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              {user.status !== 'active' && (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(user.id, 'active')}
                                  className="text-emerald-400 focus:bg-emerald-500/10 cursor-pointer"
                                >
                                  <UserCheck className="w-4 h-4 ml-2" />
                                  تفعيل الحساب
                                </DropdownMenuItem>
                              )}
                              {user.status !== 'blocked' ? (
                                <DropdownMenuItem 
                                  onClick={() => { setSelectedUser(user); setShowBlockDialog(true); }}
                                  className="text-amber-400 focus:bg-amber-500/10 cursor-pointer"
                                >
                                  <Ban className="w-4 h-4 ml-2" />
                                  حظر المستخدم
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleQuickStatusChange(user.id, 'active')}
                                  className="text-emerald-400 focus:bg-emerald-500/10 cursor-pointer"
                                >
                                  <CheckCircle className="w-4 h-4 ml-2" />
                                  إلغاء الحظر
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem 
                                onClick={() => { setSelectedUser(user); setShowDeleteDialog(true); }}
                                className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 ml-2" />
                                حذف المستخدم
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="bg-[#18181b] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedUser && (
                <>
                  <img 
                    src={selectedUser.avatar || 'https://via.placeholder.com/40'} 
                    alt={selectedUser.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                  />
                  <div>
                    <p>{selectedUser.name}</p>
                    <Badge className={`${statusColors[selectedUser.status]} border text-xs`}>
                      {statusLabels[selectedUser.status]}
                    </Badge>
                  </div>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm truncate">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-mono">{selectedUser.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-zinc-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">انضم في: {selectedUser.joined}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <MapPin className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{selectedUser.rides}</p>
                  <p className="text-xs text-zinc-500">رحلة</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <ShoppingBag className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{selectedUser.orders}</p>
                  <p className="text-xs text-zinc-500">طلب</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 mt-4">
            {selectedUser?.status !== 'blocked' ? (
              <Button 
                variant="outline" 
                onClick={() => { setShowUserDetails(false); setShowBlockDialog(true); }}
                className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400"
              >
                <Ban className="w-4 h-4 ml-2" />
                حظر
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => { handleQuickStatusChange(selectedUser.id, 'active'); setShowUserDetails(false); }}
                className="border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                إلغاء الحظر
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => { setShowUserDetails(false); setShowDeleteDialog(true); }}
              className="border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-[#18181b] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              تأكيد حذف المستخدم
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              هل أنت متأكد من حذف <span className="text-white font-medium">{selectedUser?.name}</span>؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 ml-2" />
              )}
              حذف نهائي
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent className="bg-[#18181b] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Ban className="w-5 h-5 text-amber-400" />
              تأكيد حظر المستخدم
            </AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              هل أنت متأكد من حظر <span className="text-white font-medium">{selectedUser?.name}</span>؟
              <br />
              لن يتمكن المستخدم من استخدام التطبيق.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBlockUser(true)}
              disabled={actionLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              ) : (
                <Ban className="w-4 h-4 ml-2" />
              )}
              حظر المستخدم
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
