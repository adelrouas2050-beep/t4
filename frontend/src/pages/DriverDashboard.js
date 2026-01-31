import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import CountrySelector from '../components/CountrySelector';
import { mockRides, mockDrivers } from '../mock/data';
import { 
  Car, MapPin, Navigation, DollarSign, Star, History, 
  User, LogOut, Languages, Clock, CheckCircle, XCircle,
  Phone, MessageSquare, TrendingUp
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  
  const [isOnline, setIsOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeRide, setActiveRide] = useState(null);
  const [pendingRides, setPendingRides] = useState([
    {
      id: 'pending1',
      pickup: { address: 'شارع الملك فهد، الرياض', addressEn: 'King Fahd Road, Riyadh' },
      dropoff: { address: 'العليا، الرياض', addressEn: 'Al Olaya, Riyadh' },
      distance: 12.5,
      estimatedPrice: 45,
      estimatedTime: 18,
      rider: {
        name: 'محمد أحمد',
        nameEn: 'Mohammed Ahmed',
        rating: 4.7,
        photo: 'https://randomuser.me/api/portraits/men/10.jpg'
      }
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    toast({
      title: !isOnline ? t('أنت الآن متصل', 'You are now Online') : t('أنت الآن غير متصل', 'You are now Offline'),
      description: !isOnline 
        ? t('ستبدأ في استقبال طلبات الرحلات', 'You will start receiving ride requests')
        : t('لن تستقبل طلبات رحلات', 'You will not receive ride requests')
    });
  };

  const handleAcceptRide = (ride) => {
    setActiveRide(ride);
    setPendingRides(pendingRides.filter(r => r.id !== ride.id));
    toast({
      title: t('تم قبول الرحلة', 'Ride Accepted'),
      description: t('توجه إلى موقع الراكب', 'Head to the rider location')
    });
  };

  const handleRejectRide = (rideId) => {
    setPendingRides(pendingRides.filter(r => r.id !== rideId));
    toast({
      title: t('تم رفض الرحلة', 'Ride Rejected'),
      description: t('سنبحث عن رحلات أخرى لك', 'We will find other rides for you')
    });
  };

  const handleCompleteRide = () => {
    toast({
      title: t('تم إكمال الرحلة', 'Ride Completed'),
      description: t('تم إضافة المبلغ إلى رصيدك', 'Amount has been added to your balance')
    });
    setActiveRide(null);
  };

  const todayEarnings = 450;
  const todayRides = 12;
  const weekEarnings = 2800;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {t('ترانسفيرز', 'TransVerse')}
                </h1>
                <p className="text-xs text-slate-500">{t('لوحة السائق', 'Driver Dashboard')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg">
                <span className="text-xs text-slate-600">{isOnline ? t('متصل', 'Online') : t('غير متصل', 'Offline')}</span>
                <Switch checked={isOnline} onCheckedChange={handleToggleOnline} />
              </div>
              <CountrySelector />
              <Button variant="ghost" size="sm" onClick={toggleLanguage}>
                <Languages className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="home" className="gap-2">
              <Car className="w-4 h-4" />
              {t('الرئيسية', 'Home')}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              {t('السجل', 'History')}
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              {t('الملف الشخصي', 'Profile')}
            </TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Earnings Summary */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{t('أرباح اليوم', 'Today\'s Earnings')}</p>
                    <p className="text-3xl font-bold text-green-700">{formatPrice(todayEarnings, language)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-600" />
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{t('رحلات اليوم', 'Today\'s Rides')}</p>
                    <p className="text-3xl font-bold text-blue-700">{todayRides}</p>
                  </div>
                  <Car className="w-10 h-10 text-blue-600" />
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{t('أرباح الأسبوع', 'Week\'s Earnings')}</p>
                    <p className="text-3xl font-bold text-purple-700">{formatPrice(weekEarnings, language)}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-purple-600" />
                </div>
              </Card>
            </div>

            {/* Active Ride */}
            {activeRide && (
              <Card className="p-6 border-2 border-blue-500 bg-blue-50">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse" />
                  <h3 className="text-xl font-bold">{t('رحلة نشطة', 'Active Ride')}</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={activeRide.rider.photo} />
                      <AvatarFallback>{activeRide.rider.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{language === 'ar' ? activeRide.rider.name : activeRide.rider.nameEn}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{activeRide.rider.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-700">{formatPrice(activeRide.estimatedPrice, language)}</p>
                      <p className="text-sm text-slate-600">{activeRide.distance} {t('كم', 'km')}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-sm">{language === 'ar' ? activeRide.pickup.address : activeRide.pickup.addressEn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Navigation className="w-5 h-5 text-green-600" />
                      <span className="text-sm">{language === 'ar' ? activeRide.dropoff.address : activeRide.dropoff.addressEn}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2">
                      <Phone className="w-4 h-4" />
                      {t('اتصال', 'Call')}
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <MessageSquare className="w-4 h-4" />
                      {t('رسالة', 'Message')}
                    </Button>
                    <Button 
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      onClick={handleCompleteRide}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {t('إنهاء', 'Complete')}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Pending Rides */}
            {isOnline && !activeRide && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4">{t('طلبات الرحلات', 'Ride Requests')}</h3>
                {pendingRides.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRides.map((ride) => (
                      <Card key={ride.id} className="p-4 border-2 border-slate-200">
                        <div className="flex items-start gap-4">
                          <Avatar className="w-14 h-14">
                            <AvatarImage src={ride.rider.photo} />
                            <AvatarFallback>{ride.rider.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-bold">{language === 'ar' ? ride.rider.name : ride.rider.nameEn}</h4>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{ride.rider.rating}</span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-blue-600" />
                                <span>{language === 'ar' ? ride.pickup.address : ride.pickup.addressEn}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-green-600" />
                                <span>{language === 'ar' ? ride.dropoff.address : ride.dropoff.addressEn}</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
                                <span>{ride.distance} {t('كم', 'km')}</span>
                                <span>{ride.estimatedTime} {t('دقيقة', 'min')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-green-700 mb-3">{formatPrice(ride.estimatedPrice, language)}</p>
                            <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 gap-1"
                                onClick={() => handleAcceptRide(ride)}
                              >
                                <CheckCircle className="w-4 h-4" />
                                {t('قبول', 'Accept')}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-1"
                                onClick={() => handleRejectRide(ride.id)}
                              >
                                <XCircle className="w-4 h-4" />
                                {t('رفض', 'Reject')}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Car className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">{t('لا توجد طلبات حالياً', 'No requests at the moment')}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Offline Message */}
            {!isOnline && (
              <Card className="p-12 text-center bg-slate-50">
                <Car className="w-20 h-20 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{t('أنت غير متصل', 'You are Offline')}</h3>
                <p className="text-slate-600 mb-6">
                  {t('قم بتفعيل الحالة المتصلة لبدء استقبال طلبات الرحلات', 'Turn online to start receiving ride requests')}
                </p>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700"
                  onClick={handleToggleOnline}
                >
                  {t('تفعيل الحالة المتصلة', 'Go Online')}
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-6">{t('سجل الرحلات', 'Ride History')}</h2>
              <div className="space-y-4">
                {mockRides.map((ride) => (
                  <Card key={ride.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{language === 'ar' ? ride.pickup.address : ride.pickup.addressEn}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Navigation className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{language === 'ar' ? ride.dropoff.address : ride.dropoff.addressEn}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-600">
                          <span>{new Date(ride.date).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                          <span>{ride.distance} {t('كم', 'km')}</span>
                          <span>{ride.duration} {t('دقيقة', 'min')}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-700">+{formatPrice(ride.price, language)}</p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{ride.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6">
              <div className="flex flex-col items-center text-center mb-8">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={mockDrivers[0].photo} />
                  <AvatarFallback>{mockDrivers[0].name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{language === 'ar' ? mockDrivers[0].name : mockDrivers[0].nameEn}</h2>
                <p className="text-slate-600">{mockDrivers[0].phone}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-lg font-semibold">{mockDrivers[0].rating}</span>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <Card className="p-4 bg-slate-50">
                  <p className="text-sm text-slate-600 mb-1">{t('السيارة', 'Vehicle')}</p>
                  <p className="font-semibold">{language === 'ar' ? mockDrivers[0].vehicle : mockDrivers[0].vehicleEn}</p>
                  <p className="text-sm text-slate-600">{mockDrivers[0].plate}</p>
                </Card>
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-blue-50">
                    <p className="text-sm text-slate-600 mb-1">{t('إجمالي الرحلات', 'Total Rides')}</p>
                    <p className="text-2xl font-bold text-blue-600">450</p>
                  </Card>
                  <Card className="p-4 bg-green-50">
                    <p className="text-sm text-slate-600 mb-1">{t('إجمالي الأرباح', 'Total Earnings')}</p>
                    <p className="text-2xl font-bold text-green-600">18,500</p>
                  </Card>
                </div>
              </div>
              <Button variant="destructive" className="w-full" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                {t('تسجيل الخروج', 'Logout')}
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DriverDashboard;