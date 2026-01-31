import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/use-toast';
import {
  ArrowLeft, Camera, Edit2, User, Phone, AtSign,
  FileText, Check, X, Copy, Share2, QrCode,
  Settings, Bell, Lock, Palette, HelpCircle, LogOut
} from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || 'مستخدم جديد',
    nameEn: user?.nameEn || 'New User',
    uniqueId: user?.uniqueId || generateUniqueId(),
    phone: user?.phone || '',
    bio: user?.bio || '',
    photo: user?.photo || ''
  });

  // Edit states
  const [editingName, setEditingName] = useState(false);
  const [editingId, setEditingId] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  
  // Temp values for editing
  const [tempName, setTempName] = useState(profile.name);
  const [tempId, setTempId] = useState(profile.uniqueId);
  const [tempPhone, setTempPhone] = useState(profile.phone);
  const [tempBio, setTempBio] = useState(profile.bio);

  // ID availability
  const [idAvailable, setIdAvailable] = useState(true);
  const [checkingId, setCheckingId] = useState(false);

  // Load profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Generate unique ID
  function generateUniqueId() {
    return 'TV' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // Check ID availability
  const checkIdAvailability = async (id) => {
    if (id.length < 3) {
      setIdAvailable(false);
      return;
    }
    
    setCheckingId(true);
    // Simulate API check
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock: IDs starting with 'admin' or 'test' are taken
    const taken = ['admin', 'test', 'user', 'support'].some(
      reserved => id.toLowerCase().startsWith(reserved)
    );
    
    setIdAvailable(!taken);
    setCheckingId(false);
  };

  // Handle ID change
  const handleIdChange = (value) => {
    // Only allow alphanumeric and underscore
    const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '');
    setTempId(sanitized);
    if (sanitized.length >= 3) {
      checkIdAvailability(sanitized);
    }
  };

  // Save profile changes
  const saveProfile = (field, value) => {
    const newProfile = { ...profile, [field]: value };
    setProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
    
    toast({
      title: t('تم الحفظ', 'Saved'),
      description: t('تم حفظ التغييرات بنجاح', 'Changes saved successfully')
    });
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        saveProfile('photo', reader.result);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: t('تم تغيير الصورة', 'Photo Changed'),
        description: t('تم تحديث صورة الملف الشخصي', 'Profile photo updated')
      });
    }
  };

  // Copy ID to clipboard
  const copyId = () => {
    navigator.clipboard.writeText(profile.uniqueId);
    toast({
      title: t('تم النسخ', 'Copied'),
      description: t('تم نسخ المعرف للحافظة', 'ID copied to clipboard')
    });
  };

  // Share profile
  const shareProfile = () => {
    if (navigator.share) {
      navigator.share({
        title: profile.name,
        text: t(`تواصل معي على ترانسفيرز: ${profile.uniqueId}`, `Connect with me on TransVerse: ${profile.uniqueId}`),
        url: window.location.origin + '/profile/' + profile.uniqueId
      });
    } else {
      copyId();
    }
  };

  return (
    <div className="min-h-screen bg-[#17212b]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-[#17212b] border-b border-[#232e3c] sticky top-0 z-50">
        <div className="flex items-center h-14 px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-white mr-4">
            {t('الملف الشخصي', 'Profile')}
          </h1>
        </div>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-[#0e1621] py-8">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-[#5288c1]">
              <AvatarImage src={profile.photo} />
              <AvatarFallback className="bg-gradient-to-br from-[#5288c1] to-[#7a5fca] text-white text-4xl">
                {profile.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#5288c1] hover:bg-[#4a7ab0] p-0"
            >
              <Camera className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Name */}
          <div className="mt-4 text-center">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="h-10 bg-[#242f3d] border-0 text-white text-center w-48"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => {
                    saveProfile('name', tempName);
                    setEditingName(false);
                  }}
                  className="bg-[#4dcd5e] hover:bg-[#45b855] h-8 w-8 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setTempName(profile.name);
                    setEditingName(false);
                  }}
                  className="text-[#8b9eb0] hover:text-white h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 justify-center">
                <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTempName(profile.name);
                    setEditingName(true);
                  }}
                  className="text-[#5288c1] hover:text-white h-8 w-8 p-0"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* User ID */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[#5288c1]">@{profile.uniqueId}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyId}
              className="text-[#8b9eb0] hover:text-white h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>

          {/* Share Button */}
          <Button
            variant="outline"
            onClick={shareProfile}
            className="mt-4 border-[#5288c1] text-[#5288c1] hover:bg-[#5288c1] hover:text-white"
          >
            <Share2 className="w-4 h-4 ml-2" />
            {t('مشاركة', 'Share')}
          </Button>
        </div>
      </div>

      {/* Profile Info Cards */}
      <div className="p-4 space-y-3">
        {/* Unique ID */}
        <Card className="bg-[#17212b] border-[#232e3c] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#232e3c] rounded-full flex items-center justify-center">
                <AtSign className="w-5 h-5 text-[#5288c1]" />
              </div>
              <div className="flex-1">
                <Label className="text-[#8b9eb0] text-sm">
                  {t('المعرف', 'Username')}
                </Label>
                {editingId ? (
                  <div className="mt-1">
                    <div className="flex items-center gap-2">
                      <Input
                        value={tempId}
                        onChange={(e) => handleIdChange(e.target.value)}
                        className="h-9 bg-[#242f3d] border-0 text-white w-40"
                        placeholder="username"
                        autoFocus
                      />
                      {checkingId && (
                        <div className="w-4 h-4 border-2 border-[#5288c1] border-t-transparent rounded-full animate-spin" />
                      )}
                      {!checkingId && tempId.length >= 3 && (
                        idAvailable ? (
                          <Check className="w-4 h-4 text-[#4dcd5e]" />
                        ) : (
                          <X className="w-4 h-4 text-red-500" />
                        )
                      )}
                    </div>
                    {!idAvailable && tempId.length >= 3 && (
                      <p className="text-red-400 text-xs mt-1">
                        {t('هذا المعرف غير متاح', 'This username is not available')}
                      </p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          if (idAvailable && tempId.length >= 3) {
                            saveProfile('uniqueId', tempId);
                            setEditingId(false);
                          }
                        }}
                        disabled={!idAvailable || tempId.length < 3}
                        className="bg-[#5288c1] hover:bg-[#4a7ab0] h-8"
                      >
                        {t('حفظ', 'Save')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTempId(profile.uniqueId);
                          setEditingId(false);
                        }}
                        className="text-[#8b9eb0] h-8"
                      >
                        {t('إلغاء', 'Cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">@{profile.uniqueId}</p>
                  </div>
                )}
              </div>
            </div>
            {!editingId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempId(profile.uniqueId);
                  setEditingId(true);
                }}
                className="text-[#5288c1] hover:text-white h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-[#6c7883] text-xs mt-2 mr-13">
            {t('يمكن للآخرين البحث عنك بهذا المعرف', 'Others can find you by this username')}
          </p>
        </Card>

        {/* Phone Number */}
        <Card className="bg-[#17212b] border-[#232e3c] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#232e3c] rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-[#5288c1]" />
              </div>
              <div className="flex-1">
                <Label className="text-[#8b9eb0] text-sm">
                  {t('رقم الهاتف', 'Phone Number')}
                  <span className="text-[#6c7883] text-xs mr-2">
                    ({t('اختياري', 'Optional')})
                  </span>
                </Label>
                {editingPhone ? (
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={tempPhone}
                      onChange={(e) => setTempPhone(e.target.value)}
                      className="h-9 bg-[#242f3d] border-0 text-white w-48"
                      placeholder="+966 5XX XXX XXXX"
                      type="tel"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        saveProfile('phone', tempPhone);
                        setEditingPhone(false);
                      }}
                      className="bg-[#4dcd5e] hover:bg-[#45b855] h-8 w-8 p-0"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTempPhone(profile.phone);
                        setEditingPhone(false);
                      }}
                      className="text-[#8b9eb0] hover:text-white h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-white font-medium">
                    {profile.phone || t('لم يتم الإضافة', 'Not added')}
                  </p>
                )}
              </div>
            </div>
            {!editingPhone && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempPhone(profile.phone);
                  setEditingPhone(true);
                }}
                className="text-[#5288c1] hover:text-white h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Bio */}
        <Card className="bg-[#17212b] border-[#232e3c] p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#232e3c] rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#5288c1]" />
              </div>
              <div className="flex-1">
                <Label className="text-[#8b9eb0] text-sm">
                  {t('نبذة عني', 'Bio')}
                </Label>
                {editingBio ? (
                  <div className="mt-1">
                    <Textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value.slice(0, 150))}
                      className="bg-[#242f3d] border-0 text-white resize-none min-h-[80px]"
                      placeholder={t('اكتب شيئاً عن نفسك...', 'Write something about yourself...')}
                      autoFocus
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[#6c7883] text-xs">{tempBio.length}/150</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            saveProfile('bio', tempBio);
                            setEditingBio(false);
                          }}
                          className="bg-[#5288c1] hover:bg-[#4a7ab0] h-8"
                        >
                          {t('حفظ', 'Save')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setTempBio(profile.bio);
                            setEditingBio(false);
                          }}
                          className="text-[#8b9eb0] h-8"
                        >
                          {t('إلغاء', 'Cancel')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-white font-medium whitespace-pre-wrap">
                    {profile.bio || t('لا يوجد وصف', 'No bio yet')}
                  </p>
                )}
              </div>
            </div>
            {!editingBio && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setTempBio(profile.bio);
                  setEditingBio(true);
                }}
                className="text-[#5288c1] hover:text-white h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Settings Section */}
        <div className="pt-4">
          <h3 className="text-[#8b9eb0] text-sm font-medium mb-3 px-1">
            {t('الإعدادات', 'Settings')}
          </h3>
          
          <Card className="bg-[#17212b] border-[#232e3c] divide-y divide-[#232e3c]">
            <button
              onClick={() => navigate('/settings/notifications')}
              className="w-full flex items-center gap-3 p-4 text-right hover:bg-[#232e3c] transition-colors"
            >
              <div className="w-10 h-10 bg-[#232e3c] rounded-full flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#5288c1]" />
              </div>
              <span className="text-white">{t('الإشعارات', 'Notifications')}</span>
            </button>
            
            <button
              onClick={() => navigate('/settings/privacy')}
              className="w-full flex items-center gap-3 p-4 text-right hover:bg-[#232e3c] transition-colors"
            >
              <div className="w-10 h-10 bg-[#232e3c] rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#5288c1]" />
              </div>
              <span className="text-white">{t('الخصوصية والأمان', 'Privacy and Security')}</span>
            </button>
            
            <button
              onClick={() => navigate('/settings/appearance')}
              className="w-full flex items-center gap-3 p-4 text-right hover:bg-[#232e3c] transition-colors"
            >
              <div className="w-10 h-10 bg-[#232e3c] rounded-full flex items-center justify-center">
                <Palette className="w-5 h-5 text-[#5288c1]" />
              </div>
              <span className="text-white">{t('المظهر', 'Appearance')}</span>
            </button>
            
            <button
              onClick={() => navigate('/help')}
              className="w-full flex items-center gap-3 p-4 text-right hover:bg-[#232e3c] transition-colors"
            >
              <div className="w-10 h-10 bg-[#232e3c] rounded-full flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-[#5288c1]" />
              </div>
              <span className="text-white">{t('المساعدة', 'Help')}</span>
            </button>
          </Card>
        </div>

        {/* Logout Button */}
        <Button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          variant="outline"
          className="w-full mt-4 border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 ml-2" />
          {t('تسجيل الخروج', 'Log Out')}
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
