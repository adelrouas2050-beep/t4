import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { Car, Phone, Mail, ArrowRight, CheckCircle, Lock, KeyRound } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1); // 1: enter phone, 2: enter code, 3: new password
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sentCode, setSentCode] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!phone || phone.length < 10) {
      setError(t('الرجاء إدخال رقم هاتف صحيح', 'Please enter a valid phone number'));
      return;
    }

    setLoading(true);
    
    // Simulate sending verification code
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate random 6-digit code (in real app, this would be sent via SMS)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(code);
    
    toast({
      title: t('تم إرسال الرمز', 'Code Sent'),
      description: t(`تم إرسال رمز التحقق إلى ${phone}. الرمز التجريبي: ${code}`, `Verification code sent to ${phone}. Demo code: ${code}`)
    });
    
    setStep(2);
    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError(t('الرجاء إدخال رمز التحقق المكون من 6 أرقام', 'Please enter the 6-digit verification code'));
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if code matches (in real app, this would verify with backend)
    if (verificationCode === sentCode) {
      setStep(3);
      toast({
        title: t('تم التحقق', 'Verified'),
        description: t('يمكنك الآن إنشاء كلمة مرور جديدة', 'You can now create a new password')
      });
    } else {
      setError(t('رمز التحقق غير صحيح', 'Invalid verification code'));
    }
    
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword || newPassword.length < 6) {
      setError(t('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'Password must be at least 6 characters'));
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError(t('كلمتا المرور غير متطابقتين', 'Passwords do not match'));
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In real app, this would update the password in the backend
    toast({
      title: t('تم تغيير كلمة المرور', 'Password Changed'),
      description: t('يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة', 'You can now login with your new password')
    });
    
    setLoading(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('استعادة الحساب', 'Account Recovery')}
          </h1>
          <p className="text-slate-600 mt-2 text-center">
            {step === 1 && t('أدخل رقم الهاتف المرتبط بحسابك', 'Enter the phone number linked to your account')}
            {step === 2 && t('أدخل رمز التحقق المرسل إلى هاتفك', 'Enter the verification code sent to your phone')}
            {step === 3 && t('أنشئ كلمة مرور جديدة', 'Create a new password')}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
          </div>
          <div className={`w-12 h-1 ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            {step > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
          </div>
          <div className={`w-12 h-1 ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
            3
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2" data-testid="forgot-error">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Step 1: Enter Phone */}
        {step === 1 && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('رقم الهاتف', 'Phone Number')}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={t('+966 5XX XXX XXXX', '+966 5XX XXX XXXX')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="forgot-phone"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              disabled={loading}
              data-testid="forgot-send-code"
            >
              {loading ? t('جاري الإرسال...', 'Sending...') : t('إرسال رمز التحقق', 'Send Verification Code')}
            </Button>
          </form>
        )}

        {/* Step 2: Enter Verification Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">{t('رمز التحقق', 'Verification Code')}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="code"
                  type="text"
                  placeholder="XXXXXX"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="pl-10 text-center tracking-widest text-lg"
                  maxLength={6}
                  required
                  data-testid="forgot-code"
                />
              </div>
              <p className="text-xs text-slate-500 text-center">
                {t('أدخل الرمز المكون من 6 أرقام', 'Enter the 6-digit code')}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              disabled={loading}
              data-testid="forgot-verify"
            >
              {loading ? t('جاري التحقق...', 'Verifying...') : t('تحقق', 'Verify')}
            </Button>

            <button
              type="button"
              onClick={() => handleSendCode({ preventDefault: () => {} })}
              className="w-full text-sm text-blue-600 hover:text-blue-700"
            >
              {t('إعادة إرسال الرمز', 'Resend Code')}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('كلمة المرور الجديدة', 'New Password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder={t('أدخل كلمة المرور الجديدة', 'Enter new password')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="forgot-new-password"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('تأكيد كلمة المرور', 'Confirm Password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t('أعد إدخال كلمة المرور', 'Re-enter password')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                  data-testid="forgot-confirm-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md"
              disabled={loading}
              data-testid="forgot-reset"
            >
              {loading ? t('جاري التغيير...', 'Changing...') : t('تغيير كلمة المرور', 'Change Password')}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2 mx-auto"
          >
            <ArrowRight className="w-4 h-4" />
            {t('العودة لتسجيل الدخول', 'Back to Login')}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
