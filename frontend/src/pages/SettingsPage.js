import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/use-toast';
import {
  ArrowLeft, Bell, Lock, Palette, Database, HelpCircle,
  Globe, Moon, Sun, Volume2, VolumeX, Eye, EyeOff,
  Smartphone, MessageSquare, Image, Video, Download,
  Trash2, Shield, Key, UserX, Clock, CheckCircle,
  ChevronLeft, Languages, LogOut, Settings as SettingsIcon
} from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { toast } = useToast();

  // Theme state - load from localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Settings state
  const [settings, setSettings] = useState({
    // Notifications
    notifications: true,
    messagePreview: true,
    sound: true,
    vibration: true,
    
    // Privacy
    lastSeen: 'everyone', // everyone, contacts, nobody
    profilePhoto: 'everyone',
    onlineStatus: true,
    readReceipts: true,
    
    // Appearance
    fontSize: 'medium', // small, medium, large
    chatBackground: 'default',
    
    // Data & Storage
    autoDownloadPhotos: true,
    autoDownloadVideos: false,
    autoDownloadFiles: false,
    saveToGallery: false,
    
    // Security
    twoFactorAuth: false,
    passcode: false,
    faceId: false
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', !isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = (value) => {
    setIsDarkMode(value);
    toast({
      title: value ? t('الوضع الداكن', 'Dark Mode') : t('الوضع الفاتح', 'Light Mode'),
      description: t('تم تغيير المظهر', 'Theme changed')
    });
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: t('تم الحفظ', 'Saved'),
      description: t('تم تحديث الإعدادات', 'Settings updated')
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: t('تم تسجيل الخروج', 'Logged Out'),
      description: t('إلى اللقاء!', 'Goodbye!')
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: t('تم إرسال الطلب', 'Request Sent'),
      description: t('سيتم حذف حسابك خلال 7 أيام', 'Your account will be deleted within 7 days'),
      variant: 'destructive'
    });
    setShowDeleteDialog(false);
    logout();
    navigate('/login');
  };

  // Settings Sections
  const sections = [
    {
      id: 'notifications',
      icon: Bell,
      title: t('الإشعارات والأصوات', 'Notifications and Sounds'),
      color: 'text-red-400'
    },
    {
      id: 'privacy',
      icon: Lock,
      title: t('الخصوصية والأمان', 'Privacy and Security'),
      color: 'text-blue-400'
    },
    {
      id: 'appearance',
      icon: Palette,
      title: t('المظهر', 'Appearance'),
      color: 'text-purple-400'
    },
    {
      id: 'data',
      icon: Database,
      title: t('البيانات والتخزين', 'Data and Storage'),
      color: 'text-green-400'
    },
    {
      id: 'language',
      icon: Globe,
      title: t('اللغة', 'Language'),
      color: 'text-cyan-400'
    },
    {
      id: 'help',
      icon: HelpCircle,
      title: t('المساعدة', 'Help'),
      color: 'text-yellow-400'
    }
  ];

  // Admin section (only if user is admin)
  const adminSection = isAdmin ? {
    id: 'admin',
    icon: SettingsIcon,
    title: t('لوحة التحكم', 'Admin Panel'),
    color: 'text-indigo-400'
  } : null;

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('الإشعارات', 'Notifications')}</span>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(v) => updateSetting('notifications', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('معاينة الرسائل', 'Message Preview')}</span>
              </div>
              <Switch
                checked={settings.messagePreview}
                onCheckedChange={(v) => updateSetting('messagePreview', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('الصوت', 'Sound')}</span>
              </div>
              <Switch
                checked={settings.sound}
                onCheckedChange={(v) => updateSetting('sound', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('الاهتزاز', 'Vibration')}</span>
              </div>
              <Switch
                checked={settings.vibration}
                onCheckedChange={(v) => updateSetting('vibration', v)}
              />
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('آخر ظهور', 'Last Seen')}</span>
              </div>
              <div className="flex gap-2">
                {['everyone', 'contacts', 'nobody'].map(opt => (
                  <Button
                    key={opt}
                    size="sm"
                    variant={settings.lastSeen === opt ? 'default' : 'outline'}
                    onClick={() => updateSetting('lastSeen', opt)}
                    className={settings.lastSeen === opt ? 'bg-[#5288c1]' : 'border-[#232e3c] text-[#8b9eb0]'}
                  >
                    {opt === 'everyone' ? t('الجميع', 'Everyone') : 
                     opt === 'contacts' ? t('جهات الاتصال', 'Contacts') : 
                     t('لا أحد', 'Nobody')}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('حالة الاتصال', 'Online Status')}</span>
              </div>
              <Switch
                checked={settings.onlineStatus}
                onCheckedChange={(v) => updateSetting('onlineStatus', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('تأكيد القراءة', 'Read Receipts')}</span>
              </div>
              <Switch
                checked={settings.readReceipts}
                onCheckedChange={(v) => updateSetting('readReceipts', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('التحقق بخطوتين', 'Two-Factor Auth')}</span>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(v) => updateSetting('twoFactorAuth', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('رمز القفل', 'Passcode Lock')}</span>
              </div>
              <Switch
                checked={settings.passcode}
                onCheckedChange={(v) => updateSetting('passcode', v)}
              />
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4">
            {/* Dark/Light Mode Toggle */}
            <div className="p-4 bg-[#17212b] dark:bg-[#17212b] light-theme:bg-white rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                {isDarkMode ? (
                  <Moon className="w-5 h-5 text-[#5288c1]" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-400" />
                )}
                <span className="text-white light-theme:text-gray-900 font-medium">
                  {t('المظهر', 'Theme')}
                </span>
              </div>
              
              {/* Theme Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => toggleDarkMode(false)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    !isDarkMode 
                      ? 'border-[#5288c1] bg-[#5288c1]/10' 
                      : 'border-[#232e3c] hover:border-[#3d4d5c]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                      <Sun className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className={`text-sm font-medium ${!isDarkMode ? 'text-[#5288c1]' : 'text-[#8b9eb0]'}`}>
                      {t('فاتح', 'Light')}
                    </span>
                  </div>
                  {!isDarkMode && (
                    <CheckCircle className="w-5 h-5 text-[#5288c1] mx-auto mt-2" />
                  )}
                </button>
                
                <button
                  onClick={() => toggleDarkMode(true)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isDarkMode 
                      ? 'border-[#5288c1] bg-[#5288c1]/10' 
                      : 'border-[#232e3c] hover:border-[#3d4d5c]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                      <Moon className="w-6 h-6 text-slate-300" />
                    </div>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-[#5288c1]' : 'text-[#8b9eb0]'}`}>
                      {t('داكن', 'Dark')}
                    </span>
                  </div>
                  {isDarkMode && (
                    <CheckCircle className="w-5 h-5 text-[#5288c1] mx-auto mt-2" />
                  )}
                </button>
              </div>
            </div>
            
            {/* Font Size */}
            <div className="p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-white">{t('حجم الخط', 'Font Size')}</span>
              </div>
              <div className="flex gap-2">
                {['small', 'medium', 'large'].map(size => (
                  <Button
                    key={size}
                    size="sm"
                    variant={settings.fontSize === size ? 'default' : 'outline'}
                    onClick={() => updateSetting('fontSize', size)}
                    className={settings.fontSize === size ? 'bg-[#5288c1]' : 'border-[#232e3c] text-[#8b9eb0]'}
                  >
                    {size === 'small' ? t('صغير', 'Small') : 
                     size === 'medium' ? t('متوسط', 'Medium') : 
                     t('كبير', 'Large')}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Image className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('تحميل الصور تلقائياً', 'Auto-download Photos')}</span>
              </div>
              <Switch
                checked={settings.autoDownloadPhotos}
                onCheckedChange={(v) => updateSetting('autoDownloadPhotos', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('تحميل الفيديو تلقائياً', 'Auto-download Videos')}</span>
              </div>
              <Switch
                checked={settings.autoDownloadVideos}
                onCheckedChange={(v) => updateSetting('autoDownloadVideos', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-[#5288c1]" />
                <span className="text-white">{t('حفظ في المعرض', 'Save to Gallery')}</span>
              </div>
              <Switch
                checked={settings.saveToGallery}
                onCheckedChange={(v) => updateSetting('saveToGallery', v)}
              />
            </div>
            <Button
              variant="outline"
              className="w-full border-[#232e3c] text-[#8b9eb0] hover:text-white hover:bg-[#232e3c]"
              onClick={() => toast({ title: t('تم مسح الذاكرة المؤقتة', 'Cache Cleared') })}
            >
              <Trash2 className="w-4 h-4 ml-2" />
              {t('مسح الذاكرة المؤقتة', 'Clear Cache')}
            </Button>
          </div>
        );

      case 'language':
        return (
          <div className="space-y-4">
            <button
              onClick={() => { if (language !== 'ar') toggleLanguage(); }}
              className={`w-full flex items-center justify-between p-4 bg-[#17212b] rounded-lg ${language === 'ar' ? 'border border-[#5288c1]' : ''}`}
            >
              <span className="text-white">العربية</span>
              {language === 'ar' && <CheckCircle className="w-5 h-5 text-[#5288c1]" />}
            </button>
            <button
              onClick={() => { if (language !== 'en') toggleLanguage(); }}
              className={`w-full flex items-center justify-between p-4 bg-[#17212b] rounded-lg ${language === 'en' ? 'border border-[#5288c1]' : ''}`}
            >
              <span className="text-white">English</span>
              {language === 'en' && <CheckCircle className="w-5 h-5 text-[#5288c1]" />}
            </button>
          </div>
        );

      case 'help':
        return (
          <div className="space-y-4">
            <button className="w-full flex items-center gap-3 p-4 bg-[#17212b] rounded-lg text-right hover:bg-[#232e3c]">
              <HelpCircle className="w-5 h-5 text-[#5288c1]" />
              <span className="text-white">{t('الأسئلة الشائعة', 'FAQ')}</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 bg-[#17212b] rounded-lg text-right hover:bg-[#232e3c]">
              <MessageSquare className="w-5 h-5 text-[#5288c1]" />
              <span className="text-white">{t('تواصل معنا', 'Contact Us')}</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 bg-[#17212b] rounded-lg text-right hover:bg-[#232e3c]">
              <Shield className="w-5 h-5 text-[#5288c1]" />
              <span className="text-white">{t('سياسة الخصوصية', 'Privacy Policy')}</span>
            </button>
            <div className="text-center p-4 text-[#6c7883] text-sm">
              {t('الإصدار', 'Version')} 1.0.0
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0e1621]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-[#17212b] border-b border-[#232e3c] sticky top-0 z-50">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => activeSection ? setActiveSection(null) : navigate(-1)}
            className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white mr-4">
            {activeSection 
              ? sections.find(s => s.id === activeSection)?.title 
              : t('الإعدادات', 'Settings')}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeSection ? (
          renderSectionContent()
        ) : (
          <div className="space-y-2">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="w-full flex items-center gap-4 p-4 bg-[#17212b] rounded-lg hover:bg-[#232e3c] transition-colors"
              >
                <div className={`w-10 h-10 bg-[#232e3c] rounded-full flex items-center justify-center ${section.color}`}>
                  <section.icon className="w-5 h-5" />
                </div>
                <span className="text-white flex-1 text-right">{section.title}</span>
                <ChevronLeft className="w-5 h-5 text-[#6c7883]" />
              </button>
            ))}

            {/* Delete Account */}
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full flex items-center gap-4 p-4 bg-[#17212b] rounded-lg hover:bg-red-500/10 transition-colors mt-8"
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                <UserX className="w-5 h-5 text-red-400" />
              </div>
              <span className="text-red-400 flex-1 text-right">{t('حذف الحساب', 'Delete Account')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-[#17212b] border-[#232e3c] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('حذف الحساب', 'Delete Account')}
            </DialogTitle>
          </DialogHeader>
          <p className="text-[#8b9eb0]">
            {t('هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.', 
               'Are you sure you want to delete your account? This action cannot be undone.')}
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
              className="flex-1 border-[#232e3c] text-[#8b9eb0]"
            >
              {t('إلغاء', 'Cancel')}
            </Button>
            <Button
              onClick={handleDeleteAccount}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              {t('حذف', 'Delete')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
