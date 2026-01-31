import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { 
  Settings as SettingsIcon,
  Globe,
  DollarSign,
  Bell,
  Shield,
  Palette,
  Save,
  RefreshCw,
  Database,
  Download,
  Upload,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  HardDrive,
  Calendar
} from 'lucide-react';
import { currencies } from '../mock/data';
import { useToast } from '../hooks/use-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function Settings() {
  const { language, currency, setCurrency } = useAdmin();
  const { toast } = useToast();
  
  // Backup state
  const [backups, setBackups] = useState([]);
  const [backupSettings, setBackupSettings] = useState({
    auto_backup_enabled: true,
    interval_hours: 6,
    last_backup: null,
    next_backup: null
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [loadingBackups, setLoadingBackups] = useState(true);

  const getToken = () => localStorage.getItem('token');

  // Fetch backups
  const fetchBackups = async () => {
    try {
      const response = await fetch(`${API_URL}/api/backup/list`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      }
    } catch (error) {
      console.error('Failed to fetch backups:', error);
    } finally {
      setLoadingBackups(false);
    }
  };

  // Fetch backup settings
  const fetchBackupSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/backup/settings`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBackupSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch backup settings:', error);
    }
  };

  useEffect(() => {
    fetchBackups();
    fetchBackupSettings();
  }, []);

  // Create manual backup
  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await fetch(`${API_URL}/api/backup/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'تم إنشاء النسخة الاحتياطية',
          description: `تم حفظ النسخة: ${data.filename}`,
        });
        fetchBackups();
        fetchBackupSettings();
      } else {
        throw new Error('Backup failed');
      }
    } catch (error) {
      toast({
        title: 'فشل إنشاء النسخة الاحتياطية',
        description: 'حدث خطأ أثناء إنشاء النسخة الاحتياطية',
        variant: 'destructive'
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  // Delete backup
  const handleDeleteBackup = async (backupId) => {
    try {
      const response = await fetch(`${API_URL}/api/backup/${backupId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast({
          title: 'تم حذف النسخة الاحتياطية',
        });
        fetchBackups();
      }
    } catch (error) {
      toast({
        title: 'فشل حذف النسخة الاحتياطية',
        variant: 'destructive'
      });
    }
  };

  // Restore backup
  const handleRestoreBackup = async () => {
    if (!selectedBackup) return;
    setIsRestoring(true);
    try {
      const response = await fetch(`${API_URL}/api/backup/restore/${selectedBackup.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast({
          title: 'تم استعادة قاعدة البيانات',
          description: 'تمت استعادة البيانات بنجاح',
        });
        setRestoreDialogOpen(false);
      } else {
        throw new Error('Restore failed');
      }
    } catch (error) {
      toast({
        title: 'فشل استعادة النسخة الاحتياطية',
        variant: 'destructive'
      });
    } finally {
      setIsRestoring(false);
    }
  };

  // Update backup settings
  const handleUpdateBackupSettings = async (enabled, hours) => {
    try {
      const response = await fetch(`${API_URL}/api/backup/settings?auto_backup_enabled=${enabled}&interval_hours=${hours}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        setBackupSettings(prev => ({
          ...prev,
          auto_backup_enabled: enabled,
          interval_hours: hours
        }));
        toast({
          title: 'تم تحديث الإعدادات',
        });
      }
    } catch (error) {
      toast({
        title: 'فشل تحديث الإعدادات',
        variant: 'destructive'
      });
    }
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

export default function Settings() {
  const { language, currency, setCurrency } = useAdmin();

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">الإعدادات</h1>
        <p className="text-zinc-500 mt-1">إدارة إعدادات النظام والتفضيلات</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <Card className="bg-[#18181b] border-white/10" data-testid="general-settings-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-indigo-400" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription className="text-zinc-500">
                إعدادات التطبيق الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">اسم التطبيق</Label>
                  <Input 
                    defaultValue="ترانسفيرز"
                    className="bg-white/5 border-white/10 text-white"
                    data-testid="app-name-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">البريد الإلكتروني للدعم</Label>
                  <Input 
                    type="email"
                    defaultValue="support@transfers.com"
                    className="bg-white/5 border-white/10 text-white"
                    data-testid="support-email-input"
                  />
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    اللغة الافتراضية
                  </Label>
                  <Select defaultValue={language}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="language-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-white/10">
                      <SelectItem value="ar" className="text-zinc-300 focus:bg-white/5">العربية</SelectItem>
                      <SelectItem value="en" className="text-zinc-300 focus:bg-white/5">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    العملة الافتراضية
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="currency-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#18181b] border-white/10 max-h-60">
                      {currencies.map((c) => (
                        <SelectItem key={c.code} value={c.code} className="text-zinc-300 focus:bg-white/5">
                          {c.symbol} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card className="bg-[#18181b] border-white/10" data-testid="notifications-settings-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                إعدادات الإشعارات
              </CardTitle>
              <CardDescription className="text-zinc-500">
                تحكم في الإشعارات التي تصلك
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">رحلة جديدة</p>
                  <p className="text-xs text-zinc-500">إشعار عند طلب رحلة جديدة</p>
                </div>
                <Switch defaultChecked data-testid="notification-rides" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">طلب جديد</p>
                  <p className="text-xs text-zinc-500">إشعار عند طلب توصيل جديد</p>
                </div>
                <Switch defaultChecked data-testid="notification-orders" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">سائق جديد</p>
                  <p className="text-xs text-zinc-500">إشعار عند تسجيل سائق جديد</p>
                </div>
                <Switch defaultChecked data-testid="notification-drivers" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">تقارير يومية</p>
                  <p className="text-xs text-zinc-500">ملخص يومي عبر البريد الإلكتروني</p>
                </div>
                <Switch data-testid="notification-reports" />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="bg-[#18181b] border-white/10" data-testid="security-settings-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                إعدادات الأمان
              </CardTitle>
              <CardDescription className="text-zinc-500">
                إعدادات الحماية والأمان
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">المصادقة الثنائية</p>
                  <p className="text-xs text-zinc-500">طبقة حماية إضافية لحسابك</p>
                </div>
                <Switch data-testid="2fa-switch" />
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white font-medium">تسجيل الخروج التلقائي</p>
                  <p className="text-xs text-zinc-500">بعد 30 دقيقة من عدم النشاط</p>
                </div>
                <Switch defaultChecked data-testid="auto-logout-switch" />
              </div>
              <div className="space-y-2 pt-2">
                <Label className="text-zinc-300">تغيير كلمة المرور</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    type="password"
                    placeholder="كلمة المرور الحالية"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
                    data-testid="current-password"
                  />
                  <Input 
                    type="password"
                    placeholder="كلمة المرور الجديدة"
                    className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600"
                    data-testid="new-password"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Backup Settings */}
          <Card className="bg-[#18181b] border-white/10" data-testid="backup-settings-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" />
                النسخ الاحتياطي لقاعدة البيانات
              </CardTitle>
              <CardDescription className="text-zinc-500">
                حفظ واستعادة بيانات النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Backup Settings */}
              <div className="p-4 bg-white/5 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">النسخ الاحتياطي التلقائي</p>
                      <p className="text-xs text-zinc-500">يتم حفظ نسخة تلقائياً كل {backupSettings.interval_hours} ساعات</p>
                    </div>
                  </div>
                  <Switch 
                    checked={backupSettings.auto_backup_enabled}
                    onCheckedChange={(checked) => handleUpdateBackupSettings(checked, backupSettings.interval_hours)}
                    data-testid="auto-backup-switch"
                  />
                </div>
                
                {backupSettings.auto_backup_enabled && (
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">الفترة الزمنية</Label>
                      <Select 
                        value={String(backupSettings.interval_hours)} 
                        onValueChange={(val) => handleUpdateBackupSettings(backupSettings.auto_backup_enabled, parseInt(val))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white" data-testid="backup-interval-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#18181b] border-white/10">
                          <SelectItem value="1" className="text-zinc-300">كل ساعة</SelectItem>
                          <SelectItem value="3" className="text-zinc-300">كل 3 ساعات</SelectItem>
                          <SelectItem value="6" className="text-zinc-300">كل 6 ساعات</SelectItem>
                          <SelectItem value="12" className="text-zinc-300">كل 12 ساعة</SelectItem>
                          <SelectItem value="24" className="text-zinc-300">يومياً</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">آخر نسخة</Label>
                      <p className="text-white text-sm py-2">
                        {backupSettings.last_backup ? formatDate(backupSettings.last_backup) : 'لم يتم بعد'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Manual Backup Button */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateBackup}
                  disabled={isBackingUp}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white"
                  data-testid="manual-backup-btn"
                >
                  {isBackingUp ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 ml-2" />
                      نسخ احتياطي الآن
                    </>
                  )}
                </Button>
              </div>

              {/* Backups List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    النسخ المحفوظة
                  </h4>
                  <Badge variant="outline" className="border-white/20 text-zinc-400">
                    {backups.length} نسخة
                  </Badge>
                </div>
                
                {loadingBackups ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                  </div>
                ) : backups.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500">
                    <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>لا توجد نسخ احتياطية</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {backups.map((backup) => (
                      <div 
                        key={backup.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            backup.type === 'auto' ? 'bg-cyan-500/20' : 'bg-indigo-500/20'
                          }`}>
                            {backup.type === 'auto' ? (
                              <Clock className="w-5 h-5 text-cyan-400" />
                            ) : (
                              <Download className="w-5 h-5 text-indigo-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{backup.filename}</p>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                              <span>{formatDate(backup.created_at)}</span>
                              <span>•</span>
                              <span>{formatSize(backup.size)}</span>
                              <Badge variant="outline" className={`text-[10px] py-0 ${
                                backup.type === 'auto' ? 'border-cyan-500/50 text-cyan-400' : 'border-indigo-500/50 text-indigo-400'
                              }`}>
                                {backup.type === 'auto' ? 'تلقائي' : 'يدوي'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedBackup(backup);
                              setRestoreDialogOpen(true);
                            }}
                            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            data-testid={`restore-backup-${backup.id}`}
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            data-testid={`delete-backup-${backup.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Theme Settings */}
          <Card className="bg-[#18181b] border-white/10" data-testid="theme-settings-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-400" />
                المظهر
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button className="p-4 bg-[#09090b] rounded-lg border-2 border-indigo-500 flex flex-col items-center gap-2" data-testid="theme-dark">
                  <div className="w-8 h-8 bg-[#18181b] rounded-full border border-white/20"></div>
                  <span className="text-xs text-white font-medium">داكن</span>
                </button>
                <button className="p-4 bg-white/5 rounded-lg border border-white/10 flex flex-col items-center gap-2 opacity-50" data-testid="theme-light">
                  <div className="w-8 h-8 bg-white rounded-full border border-zinc-200"></div>
                  <span className="text-xs text-zinc-400 font-medium">فاتح</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-[#18181b] border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-sm">معلومات النظام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">الإصدار</span>
                <span className="text-white font-mono">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">آخر تحديث</span>
                <span className="text-white">2024-12-15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">حالة الخادم</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  متصل
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white btn-glow" data-testid="save-settings-btn">
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </Button>
            <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300" data-testid="reset-settings-btn">
              <RefreshCw className="w-4 h-4 ml-2" />
              إعادة تعيين
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
