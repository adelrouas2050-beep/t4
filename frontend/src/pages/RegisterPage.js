import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Car, Mail, Lock, User, Phone, Languages } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const defaultType = new URLSearchParams(location.search).get('type') || 'rider';
  const [userType, setUserType] = useState(defaultType);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userId: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('كلمات المرور غير متطابقة', 'Passwords do not match'),
        variant: 'destructive'
      });
      return;
    }

    if (!formData.userId || formData.userId.length < 5) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('الرجاء إدخال ID صالح (5 أحرف على الأقل)', 'Please enter valid ID (at least 5 characters)'),
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const result = register(formData, userType);
      if (result.success) {
        toast({
          title: t('تم التسجيل بنجاح', 'Registration Successful'),
          description: t('مرحباً بك في ترانسفيرز', 'Welcome to TransVerse')
        });
        if (userType === 'driver') {
          navigate('/driver');
        } else {
          navigate('/rider');
        }
      }
    } catch (error) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل التسجيل', 'Registration failed'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className="absolute top-4 right-4 gap-2"
      >
        <Languages className="w-4 h-4" />
        {language === 'ar' ? 'English' : 'العربية'}
      </Button>

      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {t('ترانسفيرز', 'TransVerse')}
          </h1>
          <p className="text-slate-600 mt-2">
            {t('إنشاء حساب جديد', 'Create New Account')}
          </p>
        </div>

        <Tabs value={userType} onValueChange={setUserType} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rider">{t('راكب', 'Rider')}</TabsTrigger>
            <TabsTrigger value="driver">{t('سائق', 'Driver')}</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t('الاسم الكامل', 'Full Name')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="name"
                name="name"
                placeholder={t('أدخل اسمك الكامل', 'Enter your full name')}
                value={formData.name}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('البريد الإلكتروني', 'Email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('أدخل بريدك الإلكتروني', 'Enter your email')}
                value={formData.email}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">
              {t('الآيدي (ID)', 'User ID')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="userId"
                name="userId"
                placeholder={t('أدخل الآيدي (مثال: TV12345)', 'Enter User ID (e.g., TV12345)')}
                value={formData.userId}
                onChange={handleChange}
                className="pl-10"
                required
                minLength={5}
              />
            </div>
            <p className="text-xs text-slate-500">
              {t('سيستخدم هذا الآيدي للبحث عنك في الدردشة', 'This ID will be used to find you in chat')}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              {t('رقم الجوال', 'Phone Number')} <span className="text-slate-400 text-xs">({t('اختياري', 'Optional')})</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+966 5xx xxx xxx"
                value={formData.phone}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('كلمة المرور', 'Password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder={t('أدخل كلمة المرور', 'Enter password')}
                value={formData.password}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('تأكيد كلمة المرور', 'Confirm Password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t('أعد إدخال كلمة المرور', 'Re-enter password')}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
            disabled={loading}
          >
            {loading ? t('جاري التحميل...', 'Loading...') : t('إنشاء حساب', 'Create Account')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
            <button
              onClick={() => navigate('/login?type=' + userType)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('تسجيل الدخول', 'Login')}
            </button>
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-slate-500 hover:text-slate-700 mt-4"
          >
            {t('العودة للرئيسية', 'Back to Home')}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;