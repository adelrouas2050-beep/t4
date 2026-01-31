import React from 'react';
import { useAdmin } from '../context/AdminContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { 
  Settings as SettingsIcon,
  Globe,
  DollarSign,
  Bell,
  Shield,
  Palette,
  Save,
  RefreshCw
} from 'lucide-react';
import { currencies } from '../mock/data';

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
