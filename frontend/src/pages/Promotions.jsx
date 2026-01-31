import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { 
  Plus,
  Ticket,
  MoreVertical,
  Percent,
  Calendar,
  Power,
  PowerOff,
  Trash2,
  Car,
  ShoppingBag,
  Layers,
  RefreshCw,
  Loader2
} from 'lucide-react';

const statusColors = {
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  expired: 'bg-red-500/20 text-red-400 border-red-500/30',
  paused: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

const statusLabels = {
  active: 'نشط',
  expired: 'منتهي',
  paused: 'متوقف',
};

const serviceLabels = {
  all: 'الكل',
  rides: 'الرحلات',
  delivery: 'التوصيل',
};

const serviceIcons = {
  all: Layers,
  rides: Car,
  delivery: ShoppingBag,
};

export default function Promotions() {
  const { promotions, fetchPromotions, addPromotion, updatePromotionStatus, deletePromotion } = useAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: '',
    discount: '',
    type: 'percentage',
    maxUses: '',
    expires: '',
    service: 'all',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchPromotions();
      setLoading(false);
    };
    loadData();
  }, [fetchPromotions]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchPromotions();
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addPromotion({
        ...newPromo,
        discount: Number(newPromo.discount),
        maxUses: Number(newPromo.maxUses),
      });
      setDialogOpen(false);
      setNewPromo({
        code: '',
        discount: '',
        type: 'percentage',
        maxUses: '',
        expires: '',
        service: 'all',
      });
    } catch (error) {
      console.error('Error creating promotion:', error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (promoId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      await deletePromotion(promoId);
    }
  };

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.status === 'active').length,
    totalUsed: promotions.reduce((acc, p) => acc + (p.used || 0), 0),
  };

  return (
    <div className="space-y-6" data-testid="promotions-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">العروض والكوبونات</h1>
          <p className="text-zinc-500 mt-1">إدارة أكواد الخصم والعروض الترويجية</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="border-white/10 bg-white/5 hover:bg-white/10"
            data-testid="refresh-promotions-btn"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-500 hover:bg-indigo-600 text-white btn-glow" data-testid="add-promo-btn">
                <Plus className="w-4 h-4 ml-2" />
                إضافة عرض جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#18181b] border-white/10 max-w-md" data-testid="add-promo-dialog">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-400" />
                  إضافة عرض جديد
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">كود الخصم</Label>
                  <Input
                    value={newPromo.code}
                    onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER50"
                    className="bg-white/5 border-white/10 text-white font-mono uppercase"
                    required
                    data-testid="promo-code-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">قيمة الخصم</Label>
                    <Input
                      type="number"
                      value={newPromo.discount}
                      onChange={(e) => setNewPromo({ ...newPromo, discount: e.target.value })}
                      placeholder="50"
                      className="bg-white/5 border-white/10 text-white"
                      required
                      data-testid="promo-discount-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">نوع الخصم</Label>
                    <Select value={newPromo.type} onValueChange={(v) => setNewPromo({ ...newPromo, type: v })}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="promo-type-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#18181b] border-white/10">
                        <SelectItem value="percentage" className="text-zinc-300 focus:bg-white/5">نسبة مئوية %</SelectItem>
                        <SelectItem value="fixed" className="text-zinc-300 focus:bg-white/5">مبلغ ثابت</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">الحد الأقصى للاستخدام</Label>
                    <Input
                      type="number"
                      value={newPromo.maxUses}
                      onChange={(e) => setNewPromo({ ...newPromo, maxUses: e.target.value })}
                      placeholder="1000"
                      className="bg-white/5 border-white/10 text-white"
                      required
                      data-testid="promo-maxuses-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-300">تاريخ الانتهاء</Label>
                    <Input
                      type="date"
                      value={newPromo.expires}
                      onChange={(e) => setNewPromo({ ...newPromo, expires: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                      required
                      data-testid="promo-expires-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-300">تطبيق على</Label>
                  <Select value={newPromo.service} onValueChange={(v) => setNewPromo({ ...newPromo, service: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="promo-service-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-white/10">
                      <SelectItem value="all" className="text-zinc-300 focus:bg-white/5">جميع الخدمات</SelectItem>
                      <SelectItem value="rides" className="text-zinc-300 focus:bg-white/5">الرحلات فقط</SelectItem>
                      <SelectItem value="delivery" className="text-zinc-300 focus:bg-white/5">التوصيل فقط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white mt-4" 
                  data-testid="promo-submit-btn"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإنشاء...
                    </>
                  ) : (
                    'إنشاء العرض'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">إجمالي العروض</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#18181b] border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">عروض نشطة</p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</p>
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
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">إجمالي الاستخدام</p>
                <p className="text-2xl font-bold text-amber-400 mt-1">{stats.totalUsed.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Percent className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotions Table */}
      <Card className="bg-[#18181b] border-white/10" data-testid="promotions-table-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-white">
            قائمة العروض ({promotions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              لا يوجد عروض. اضغط على "تحميل بيانات تجريبية" في لوحة التحكم أو أضف عرض جديد.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-transparent">
                  <TableHead className="table-header text-right">الكود</TableHead>
                  <TableHead className="table-header text-right">الخصم</TableHead>
                  <TableHead className="table-header text-right">الخدمة</TableHead>
                  <TableHead className="table-header text-right">الاستخدام</TableHead>
                  <TableHead className="table-header text-right">تاريخ الانتهاء</TableHead>
                  <TableHead className="table-header text-right">الحالة</TableHead>
                  <TableHead className="table-header text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => {
                  const ServiceIcon = serviceIcons[promo.service] || Layers;
                  const usagePercent = promo.maxUses > 0 ? ((promo.used || 0) / promo.maxUses) * 100 : 0;
                  return (
                    <TableRow 
                      key={promo.id} 
                      className="border-white/5 hover:bg-white/5 transition-colors"
                      data-testid={`promo-row-${promo.id}`}
                    >
                      <TableCell className="font-mono text-indigo-400 font-bold text-lg">{promo.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {promo.type === 'percentage' ? (
                            <>
                              <span className="text-white font-bold text-lg">{promo.discount}</span>
                              <Percent className="w-4 h-4 text-zinc-400" />
                            </>
                          ) : (
                            <>
                              <span className="text-white font-bold text-lg">{promo.discount}</span>
                              <span className="text-xs text-zinc-400">ر.س</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-white/10 text-zinc-300 flex items-center gap-1 w-fit">
                          <ServiceIcon className="w-3 h-3" />
                          {serviceLabels[promo.service]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-zinc-400">{promo.used || 0} / {promo.maxUses}</span>
                            <span className="text-zinc-500">{usagePercent.toFixed(0)}%</span>
                          </div>
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-zinc-400 text-sm">
                          <Calendar className="w-3 h-3" />
                          {promo.expires}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[promo.status]} border`}>
                          {statusLabels[promo.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5" data-testid={`promo-actions-${promo.id}`}>
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-[#18181b] border-white/10">
                            {promo.status === 'active' ? (
                              <DropdownMenuItem 
                                onClick={() => updatePromotionStatus(promo.id, 'paused')}
                                className="text-amber-400 focus:bg-amber-500/10 cursor-pointer"
                              >
                                <PowerOff className="w-4 h-4 ml-2" />
                                إيقاف مؤقت
                              </DropdownMenuItem>
                            ) : promo.status === 'paused' && (
                              <DropdownMenuItem 
                                onClick={() => updatePromotionStatus(promo.id, 'active')}
                                className="text-emerald-400 focus:bg-emerald-500/10 cursor-pointer"
                              >
                                <Power className="w-4 h-4 ml-2" />
                                تفعيل
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDelete(promo.id)}
                              className="text-red-400 focus:bg-red-500/10 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              حذف العرض
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
