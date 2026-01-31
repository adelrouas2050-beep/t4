import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Car, Mail, Lock, Languages } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const userType = new URLSearchParams(location.search).get('type') || 'rider';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password, userType);
      if (result.success) {
        if (result.isAdmin) {
          // Admin login - go to rider dashboard (they can access admin panel from there)
          toast({
            title: t('تم تسجيل الدخول كمدير', 'Admin Login Successful'),
            description: t('مرحباً بك يا مدير النظام', 'Welcome, System Admin')
          });
          navigate('/rider');
        } else {
          toast({
            title: t('تم تسجيل الدخول بنجاح', 'Login Successful'),
            description: t('مرحباً بك في ترانسفيرز', 'Welcome to TransVerse')
          });
          if (userType === 'driver') {
            navigate('/driver');
          } else {
            navigate('/rider');
          }
        }
      } else {
        // Show error message
        setError(t(result.error, result.errorEn));
        toast({
          title: t('خطأ', 'Error'),
          description: t(result.error, result.errorEn),
          variant: 'destructive'
        });
      }
    } catch (error) {
      setError(t('فشل تسجيل الدخول', 'Login failed'));
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل تسجيل الدخول', 'Login failed'),
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
            {userType === 'driver' 
              ? t('تسجيل دخول السائق', 'Driver Login')
              : t('تسجيل دخول الراكب', 'Rider Login')
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2" data-testid="login-error">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{t('البريد الإلكتروني', 'Email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="email"
                type="email"
                placeholder={t('أدخل بريدك الإلكتروني', 'Enter your email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('كلمة المرور', 'Password')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                id="password"
                type="password"
                placeholder={t('أدخل كلمة المرور', 'Enter your password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {t('نسيت كلمة المرور؟', 'Forgot Password?')}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
            disabled={loading}
          >
            {loading ? t('جاري التحميل...', 'Loading...') : t('تسجيل الدخول', 'Login')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            {t('ليس لديك حساب؟', "Don't have an account?")}{' '}
            <button
              onClick={() => navigate('/register?type=' + userType)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {t('سجل الآن', 'Sign Up')}
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

export default LoginPage;
