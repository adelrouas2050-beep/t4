import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  Car, 
  ShoppingBag, 
  Shield, 
  Clock, 
  Star,
  ArrowLeft,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

const features = [
  {
    icon: Car,
    title: 'خدمة الرحلات',
    description: 'رحلات آمنة ومريحة مع سائقين محترفين',
    color: 'bg-indigo-500/20 text-indigo-400'
  },
  {
    icon: ShoppingBag,
    title: 'توصيل الطعام',
    description: 'اطلب من مطاعمك المفضلة ونوصلك بسرعة',
    color: 'bg-amber-500/20 text-amber-400'
  },
  {
    icon: Shield,
    title: 'أمان تام',
    description: 'جميع السائقين موثقون ومرخصون',
    color: 'bg-emerald-500/20 text-emerald-400'
  },
  {
    icon: Clock,
    title: 'خدمة 24/7',
    description: 'نعمل على مدار الساعة لخدمتك',
    color: 'bg-pink-500/20 text-pink-400'
  }
];

const stats = [
  { value: '15,000+', label: 'مستخدم نشط' },
  { value: '890+', label: 'سائق موثق' },
  { value: '150+', label: 'مطعم شريك' },
  { value: '4.8', label: 'تقييم التطبيق', icon: Star }
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#09090b]" data-testid="home-page">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Car className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-l from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
              ترانسفيرز
            </h1>
          </div>
          <Button 
            onClick={() => navigate('/login')}
            className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
            data-testid="admin-login-btn"
          >
            لوحة التحكم
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm mb-8">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
            متوفر الآن في 12 دولة عربية
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            رحلاتك وطلباتك
            <br />
            <span className="bg-gradient-to-l from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              في تطبيق واحد
            </span>
          </h2>
          
          <p className="text-lg text-zinc-400 mb-10 max-w-xl mx-auto">
            ترانسفيرز يوفر لك خدمات النقل وتوصيل الطعام بأعلى معايير الجودة والأمان
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg"
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-6 text-lg shadow-xl shadow-indigo-500/25 btn-glow"
              data-testid="download-app-btn"
            >
              <Car className="w-5 h-5 ml-2" />
              احجز رحلة الآن
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-8 py-6 text-lg"
              data-testid="order-food-btn"
            >
              <ShoppingBag className="w-5 h-5 ml-2" />
              اطلب طعامك
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="bg-[#18181b]/80 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-3xl font-bold text-white">{stat.value}</span>
                  {stat.icon && <Star className="w-6 h-6 text-amber-400 fill-amber-400" />}
                </div>
                <p className="text-zinc-500 text-sm">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">لماذا ترانسفيرز؟</h3>
          <p className="text-zinc-500">نقدم لك أفضل تجربة نقل وتوصيل</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card 
              key={i} 
              className="bg-[#18181b]/80 border-white/10 backdrop-blur-sm card-hover group"
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{feature.title}</h4>
                <p className="text-zinc-500 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <Card className="bg-gradient-to-l from-indigo-500/20 to-purple-500/20 border-indigo-500/30 overflow-hidden">
          <CardContent className="p-8 sm:p-12 text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-transparent to-purple-500/10"></div>
            <div className="relative z-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                هل أنت صاحب مطعم أو سائق؟
              </h3>
              <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                انضم إلى شبكة ترانسفيرز وابدأ في زيادة أرباحك اليوم
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  onClick={() => navigate('/login')}
                  className="bg-white text-black hover:bg-zinc-200 px-6"
                  data-testid="join-driver-btn"
                >
                  انضم كسائق
                </Button>
                <Button 
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 px-6"
                  data-testid="join-restaurant-btn"
                >
                  سجل مطعمك
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Admin Access Card */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <Card className="bg-[#18181b] border-amber-500/30">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">لوحة تحكم المشرفين</h4>
                <p className="text-zinc-500 text-sm">إدارة كاملة للتطبيق والمستخدمين والسائقين</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/login')}
              className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
              data-testid="admin-panel-btn"
            >
              دخول لوحة التحكم
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <Car className="w-5 h-5 text-indigo-400" />
                </div>
                <span className="text-xl font-bold text-white">ترانسفيرز</span>
              </div>
              <p className="text-zinc-500 text-sm">
                منصة متكاملة للنقل وتوصيل الطعام في العالم العربي
              </p>
            </div>
            
            <div>
              <h5 className="font-semibold text-white mb-4">خدماتنا</h5>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">رحلات المدينة</li>
                <li className="hover:text-white cursor-pointer transition-colors">رحلات المطار</li>
                <li className="hover:text-white cursor-pointer transition-colors">توصيل الطعام</li>
                <li className="hover:text-white cursor-pointer transition-colors">توصيل الطرود</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-white mb-4">الشركة</h5>
              <ul className="space-y-2 text-zinc-500 text-sm">
                <li className="hover:text-white cursor-pointer transition-colors">من نحن</li>
                <li className="hover:text-white cursor-pointer transition-colors">وظائف</li>
                <li className="hover:text-white cursor-pointer transition-colors">الأخبار</li>
                <li className="hover:text-white cursor-pointer transition-colors">الشروط والأحكام</li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-white mb-4">تواصل معنا</h5>
              <ul className="space-y-3 text-zinc-500 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-400" />
                  <span>920001234</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" />
                  <span>support@transfers.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span>الرياض، المملكة العربية السعودية</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-zinc-500 text-sm">
            <p>© 2024 ترانسفيرز. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
