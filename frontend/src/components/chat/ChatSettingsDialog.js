import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useLanguage } from '../../context/LanguageContext';
import { useAdvancedChat } from '../../context/AdvancedChatContext';
import { chatThemes } from '../../mock/advancedChatData';
import { 
  Settings, Bell, Lock, Palette, Shield, Eye, EyeOff,
  Moon, Sun, Smartphone, Globe, Download, Trash2, LogOut,
  Key, Fingerprint, Clock, Archive, Folder
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const ChatSettingsDialog = () => {
  const { t, language } = useLanguage();
  const { theme, setTheme, appLocked, setAppLocked } = useAdvancedChat();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    messagePreview: true,
    soundEnabled: true,
    vibrationEnabled: true,
    autoDownloadPhotos: true,
    autoDownloadVideos: false,
    autoDownloadFiles: false,
    twoStepVerification: false,
    showLastSeen: true,
    showProfilePhoto: true,
    showReadReceipts: true,
    groupsPermission: 'everyone',
    selfDestructTimer: 0
  });

  const handleToggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: t('تم التحديث', 'Updated'),
      description: t('تم تحديث الإعدادات بنجاح', 'Settings updated successfully')
    });
  };

  const handleClearCache = () => {
    toast({
      title: t('تم التنظيف', 'Cleaned'),
      description: t('تم مسح ذاكرة التخزين المؤقت', 'Cache cleared successfully')
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant=\"ghost\" size=\"sm\" className=\"gap-2\">
          <Settings className=\"w-4 h-4\" />
          <span className=\"hidden sm:inline\">{t('الإعدادات', 'Settings')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className=\"max-w-3xl max-h-[85vh] overflow-y-auto\">
        <DialogHeader>
          <DialogTitle className=\"text-2xl\">{t('الإعدادات', 'Settings')}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue=\"general\" className=\"mt-4\">
          <TabsList className=\"grid w-full grid-cols-4\">
            <TabsTrigger value=\"general\" className=\"gap-2\">
              <Settings className=\"w-4 h-4\" />
              <span className=\"hidden sm:inline\">{t('عام', 'General')}</span>
            </TabsTrigger>
            <TabsTrigger value=\"privacy\" className=\"gap-2\">
              <Lock className=\"w-4 h-4\" />
              <span className=\"hidden sm:inline\">{t('الخصوصية', 'Privacy')}</span>
            </TabsTrigger>
            <TabsTrigger value=\"appearance\" className=\"gap-2\">
              <Palette className=\"w-4 h-4\" />
              <span className=\"hidden sm:inline\">{t('المظهر', 'Appearance')}</span>
            </TabsTrigger>
            <TabsTrigger value=\"data\" className=\"gap-2\">
              <Download className=\"w-4 h-4\" />
              <span className=\"hidden sm:inline\">{t('البيانات', 'Data')}</span>
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value=\"general\" className=\"space-y-4 mt-4\">
            <Card className=\"p-4 space-y-4\">
              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <Bell className=\"w-5 h-5 text-blue-600\" />
                  <div>
                    <p className=\"font-semibold\">{t('الإشعارات', 'Notifications')}</p>
                    <p className=\"text-xs text-slate-600\">{t('تلقي إشعارات الرسائل الجديدة', 'Receive new message notifications')}</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.notifications} 
                  onCheckedChange={() => handleToggleSetting('notifications')}
                />
              </div>

              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <Eye className=\"w-5 h-5 text-blue-600\" />
                  <div>
                    <p className=\"font-semibold\">{t('معاينة الرسالة', 'Message Preview')}</p>
                    <p className=\"text-xs text-slate-600\">{t('عرض محتوى الرسالة في الإشعار', 'Show message content in notification')}</p>
                  </div>
                </div>
                <Switch 
                  checked={settings.messagePreview} 
                  onCheckedChange={() => handleToggleSetting('messagePreview')}
                />
              </div>

              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <Globe className=\"w-5 h-5 text-blue-600\" />
                  <div>
                    <p className=\"font-semibold\">{t('اللغة', 'Language')}</p>
                    <p className=\"text-xs text-slate-600\">{t('لغة واجهة التطبيق', 'App interface language')}</p>
                  </div>
                </div>
                <Select defaultValue={language}>
                  <SelectTrigger className=\"w-32\">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"ar\">{t('العربية', 'Arabic')}</SelectItem>
                    <SelectItem value=\"en\">{t('الإنجليزية', 'English')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value=\"privacy\" className=\"space-y-4 mt-4\">
            <Card className=\"p-4 space-y-4\">
              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <Lock className=\"w-5 h-5 text-blue-600\" />
                  <div>
                    <p className=\"font-semibold\">{t('قفل التطبيق', 'App Lock')}</p>
                    <p className=\"text-xs text-slate-600\">{t('قفل التطبيق برمز أو بصمة', 'Lock app with PIN or fingerprint')}</p>
                  </div>
                </div>
                <Switch 
                  checked={appLocked} 
                  onCheckedChange={setAppLocked}
                />
              </div>

              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <Key className=\"w-5 h-5 text-blue-600\" />
                  <div>
                    <p className=\"font-semibold\">{t('التحقق بخطوتين', 'Two-Step Verification')}</p>
                    <p className=\"text-xs text-slate-600\">{t('حماية إضافية للحساب', 'Additional account protection')}</p>
                  </div>
                </div>
                <Button variant=\"outline\" size=\"sm\">{t('تفعيل', 'Enable')}</Button>
              </div>

              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <Clock className=\"w-5 h-5 text-blue-600\" />
                  <div>
                    <p className=\"font-semibold\">{t('آخر ظهور', 'Last Seen')}</p>
                    <p className=\"text-xs text-slate-600\">{t('من يمكنه رؤية آخر ظهورك', 'Who can see your last seen')}</p>
                  </div>
                </div>
                <Select defaultValue=\"everyone\">
                  <SelectTrigger className=\"w-32\">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=\"everyone\">{t('الجميع', 'Everyone')}</SelectItem>
                    <SelectItem value=\"contacts\">{t('جهات الاتصال', 'Contacts')}</SelectItem>
                    <SelectItem value=\"nobody\">{t('لا أحد', 'Nobody')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className=\"flex items-center justify-between\">
                <div className=\"flex items-center gap-3\">
                  <Shield className=\"w-5 h-5 text-blue-600\" />
                  <div>
                    <p className=\"font-semibold\">{t('الدردشة السرية', 'Secret Chat')}</p>
                    <p className=\"text-xs text-slate-600\">{t('محادثات مشفرة من طرف إلى طرف', 'End-to-end encrypted chats')}</p>
                  </div>
                </div>
                <Button variant=\"outline\" size=\"sm\">{t('إنشاء', 'Create')}</Button>
              </div>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value=\"appearance\" className=\"space-y-4 mt-4\">
            <Card className=\"p-4\">
              <h3 className=\"font-semibold mb-4 flex items-center gap-2\">
                <Palette className=\"w-5 h-5 text-blue-600\" />
                {t('اختر الثيم', 'Choose Theme')}
              </h3>
              <div className=\"grid grid-cols-2 md:grid-cols-3 gap-3\">
                {chatThemes.map(themeOption => (\n                  <div\n                    key={themeOption.id}\n                    onClick={() => {\n                      setTheme(themeOption.id);\n                      toast({\n                        title: t('تم التطبيق', 'Applied'),\n                        description: language === 'ar' ? themeOption.name : themeOption.nameEn\n                      });\n                    }}\n                    className={`p-4 rounded-lg cursor-pointer border-2 transition-all ${\n                      theme === themeOption.id \n                        ? 'border-blue-600 bg-blue-50' \n                        : 'border-slate-200 hover:border-slate-300'\n                    }`}\n                  >\n                    <div className=\"flex items-center gap-2 mb-2\">\n                      <div \n                        className=\"w-8 h-8 rounded-full\" \n                        style={{ backgroundColor: themeOption.colors.primary }}\n                      />\n                      <div \n                        className=\"w-8 h-8 rounded-full\" \n                        style={{ backgroundColor: themeOption.colors.background }}\n                      />\n                    </div>\n                    <p className=\"font-semibold text-sm\">\n                      {language === 'ar' ? themeOption.name : themeOption.nameEn}\n                    </p>\n                  </div>\n                ))}\n              </div>\n            </Card>\n          </TabsContent>

          {/* Data Settings */}\n          <TabsContent value=\"data\" className=\"space-y-4 mt-4\">
            <Card className=\"p-4 space-y-4\">
              <h3 className=\"font-semibold mb-2\">{t('التنزيل التلقائي', 'Auto-Download')}</h3>\n              \n              <div className=\"flex items-center justify-between\">
                <div>\n                  <p className=\"font-medium\">{t('الصور', 'Photos')}</p>\n                  <p className=\"text-xs text-slate-600\">{t('تنزيل الصور تلقائياً', 'Download photos automatically')}</p>\n                </div>\n                <Switch \n                  checked={settings.autoDownloadPhotos} \n                  onCheckedChange={() => handleToggleSetting('autoDownloadPhotos')}\n                />\n              </div>\n\n              <div className=\"flex items-center justify-between\">\n                <div>\n                  <p className=\"font-medium\">{t('الفيديوهات', 'Videos')}</p>\n                  <p className=\"text-xs text-slate-600\">{t('تنزيل الفيديوهات تلقائياً', 'Download videos automatically')}</p>\n                </div>\n                <Switch \n                  checked={settings.autoDownloadVideos} \n                  onCheckedChange={() => handleToggleSetting('autoDownloadVideos')}\n                />\n              </div>\n\n              <div className=\"flex items-center justify-between\">\n                <div>\n                  <p className=\"font-medium\">{t('الملفات', 'Files')}</p>\n                  <p className=\"text-xs text-slate-600\">{t('تنزيل الملفات تلقائياً', 'Download files automatically')}</p>\n                </div>\n                <Switch \n                  checked={settings.autoDownloadFiles} \n                  onCheckedChange={() => handleToggleSetting('autoDownloadFiles')}\n                />\n              </div>\n\n              <div className=\"pt-4 border-t space-y-3\">\n                <Button \n                  variant=\"outline\" \n                  className=\"w-full justify-between\"\n                  onClick={handleClearCache}\n                >\n                  <span className=\"flex items-center gap-2\">\n                    <Trash2 className=\"w-4 h-4\" />\n                    {t('مسح ذاكرة التخزين المؤقت', 'Clear Cache')}\n                  </span>\n                  <span className=\"text-xs text-slate-600\">2.5 GB</span>\n                </Button>\n\n                <Button variant=\"outline\" className=\"w-full justify-between\">\n                  <span className=\"flex items-center gap-2\">\n                    <Download className=\"w-4 h-4\" />\n                    {t('تصدير البيانات', 'Export Data')}\n                  </span>\n                </Button>\n              </div>\n            </Card>\n          </TabsContent>\n        </Tabs>\n      </DialogContent>\n    </Dialog>\n  );\n};\n\nexport default ChatSettingsDialog;
