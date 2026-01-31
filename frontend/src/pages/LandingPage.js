import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import CountrySelector from '../components/CountrySelector';
import { Car, MapPin, CreditCard, Shield, Clock, Users, Star, Zap, Globe, Languages } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const { t, toggleLanguage, language } = useLanguage();
  const { currentCountry, isLoading } = useCurrency();

  const features = [
    {
      icon: MapPin,
      titleAr: 'حدد وجهتك بسهولة',
      titleEn: 'Easy Destination Selection',
      descAr: 'اختر موقعك ووجهتك بكل سهولة عبر الخريطة التفاعلية',
      descEn: 'Choose your location and destination easily via interactive map'
    },
    {
      icon: Car,
      titleAr: 'خيارات متنوعة',
      titleEn: 'Various Options',
      descAr: 'اختر نوع السيارة المناسب لك من الاقتصادي إلى الفاخر',
      descEn: 'Choose the right vehicle type from economy to premium'
    },
    {
      icon: CreditCard,
      titleAr: 'طرق دفع متعددة',
      titleEn: 'Multiple Payment Methods',
      descAr: 'ادفع نقداً أو بالنقاط أو عبر PayPal',
      descEn: 'Pay with cash, points, or PayPal'
    },
    {
      icon: Shield,
      titleAr: 'آمن وموثوق',
      titleEn: 'Safe & Reliable',
      descAr: 'سائقون معتمدون ومدربون لضمان سلامتك',
      descEn: 'Certified and trained drivers for your safety'
    },
    {
      icon: Clock,
      titleAr: 'خدمة على مدار الساعة',
      titleEn: '24/7 Service',
      descAr: 'متاح في أي وقت تحتاجه',
      descEn: 'Available whenever you need it'
    },
    {
      icon: Star,
      titleAr: 'تقييمات السائقين',
      titleEn: 'Driver Ratings',
      descAr: 'تقييم السائقين لضمان أفضل خدمة',
      descEn: 'Rate drivers to ensure the best service'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {t('ترانسفيرز', 'TransVerse')}
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="hidden sm:block">
                <CountrySelector />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="gap-1 px-2 sm:px-3 text-xs sm:text-sm"
              >
                <Languages className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{language === 'ar' ? 'English' : 'العربية'}</span>
                <span className="sm:hidden">{language === 'ar' ? 'EN' : 'ع'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="hover:bg-blue-50 text-xs sm:text-sm px-2 sm:px-4"
              >
                {t('دخول', 'Login')}
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md text-xs sm:text-sm px-2 sm:px-4"
              >
                {t('تسجيل', 'Sign Up')}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Zap className="w-4 h-4" />
                {t('انطلق الآن', 'Get Started Now')}
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                {t('رحلتك تبدأ من', 'Your Journey')}
                <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mt-2">
                  {t('هنا', 'Starts Here')}
                </span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                {t(
                  'احجز رحلتك بسهولة وأمان مع أفضل السائقين في المملكة. خدمة سريعة، موثوقة ومريحة.',
                  'Book your ride easily and safely with the best drivers in the Kingdom. Fast, reliable, and comfortable service.'
                )}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate('/register')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                >
                  {t('ابدأ الآن', 'Get Started')}
                  <Car className="w-5 h-5 mr-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/register?type=driver')}
                  className="border-2 hover:bg-slate-50"
                >
                  {t('سجل كسائق', 'Become a Driver')}
                </Button>
              </div>
              <div className="flex items-center gap-8 pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200" />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">4.8</span>
                    </div>
                    <p className="text-xs text-slate-600">{t('من 10k+ تقييم', 'from 10k+ reviews')}</p>
                  </div>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-bold text-slate-900">50k+</p>
                  <p className="text-sm text-slate-600">{t('رحلة مكتملة', 'Completed Rides')}</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&h=700&fit=crop"
                  alt="Ride"
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              {t('لماذا ترانسفيرز؟', 'Why TransVerse?')}
            </h2>
            <p className="text-xl text-slate-600">
              {t('نقدم لك أفضل تجربة في خدمات النقل', 'We offer you the best experience in transportation services')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-shadow border-slate-200">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t(feature.titleAr, feature.titleEn)}
                </h3>
                <p className="text-slate-600">
                  {t(feature.descAr, feature.descEn)}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-12 text-center shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              {t('جاهز للانطلاق؟', 'Ready to Go?')}
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              {t('انضم إلى آلاف المستخدمين واستمتع برحلاتك', 'Join thousands of users and enjoy your rides')}
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-blue-600 hover:bg-slate-50 shadow-lg"
            >
              {t('سجل الآن مجاناً', 'Sign Up Now for Free')}
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="w-6 h-6" />
            <span className="text-xl font-bold">{t('ترانسفيرز', 'TransVerse')}</span>
          </div>
          <p className="text-slate-400 mb-4">
            {t('© 2025 ترانسفيرز. جميع الحقوق محفوظة.', '© 2025 TransVerse. All rights reserved.')}
          </p>
          <p className="text-slate-500 text-sm">
            Made with <span className="text-blue-400 font-medium">émergent</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;