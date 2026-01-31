import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useRide } from '../context/RideContext';
import { useChat } from '../context/ChatContext';
import CountrySelector from '../components/CountrySelector';
import { vehicleTypes, paymentMethods, mockRides } from '../mock/data';
import { 
  Car, MapPin, Navigation, CreditCard, Star, History, 
  User, LogOut, Languages, Clock, DollarSign, Menu,
  Phone, MessageSquare, X, ShoppingBag, Shield, Settings
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const RiderDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const { getTotalUnreadCount } = useChat();
  const { 
    currentRide, 
    selectedVehicle, 
    setSelectedVehicle,
    selectedPayment,
    setSelectedPayment,
    requestRide,
    cancelRide
  } = useRide();

  const [activeTab, setActiveTab] = useState('book');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoToAdmin = async () => {
    try {
      // Login to admin panel using API
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@transfers.com', password: 'admin123' })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('admin', JSON.stringify({ 
          id: data.id,
          name: data.name, 
          email: data.email, 
          role: data.role 
        }));
        // Use window.location to force full reload so AdminContext picks up the new token
        window.location.href = '/admin';
      }
    } catch (error) {
      console.error('Error logging into admin:', error);
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل الدخول للوحة التحكم', 'Failed to access admin panel'),
        variant: 'destructive'
      });
    }
  };

  const unreadMessagesCount = getTotalUnreadCount();

  const handleBookRide = () => {
    if (!pickupAddress || !dropoffAddress) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('الرجاء إدخال موقع الانطلاق والوجهة', 'Please enter pickup and dropoff locations'),
        variant: 'destructive'
      });
      return;
    }

    const pickup = { address: pickupAddress, lat: 24.7136, lng: 46.6753 };
    const dropoff = { address: dropoffAddress, lat: 24.7736, lng: 46.7353 };
    
    requestRide(pickup, dropoff, selectedVehicle, selectedPayment);
    setShowMap(true);
    
    toast({
      title: t('جاري البحث عن سائق', 'Searching for Driver'),
      description: t('سنجد لك أقرب سائق متاح', 'We will find you the nearest available driver')
    });
  };

  const handleCancelRide = () => {
    cancelRide();
    setShowMap(false);
    toast({
      title: t('تم إلغاء الرحلة', 'Ride Cancelled'),
      description: t('تم إلغاء الرحلة بنجاح', 'Your ride has been cancelled')
    });
  };

  const calculateEstimate = () => {
    const distance = Math.random() * 15 + 5;
    const price = selectedVehicle.basePrice + (selectedVehicle.pricePerKm * distance);
    setEstimatedPrice(Math.round(price));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Car className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-slate-900">
                  {t('ترانسفيرز', 'TransVerse')}
                </h1>
                <p className="text-[10px] sm:text-xs text-slate-500">{t('مرحباً', 'Welcome')}, {user?.name?.split(' ')[0] || user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-3">
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold">{user?.points || 0}</span>
                <span className="text-xs text-slate-600">{t('نقطة', 'points')}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/chat')}
                className="gap-1 relative px-2 sm:px-3"
              >
                <MessageSquare className="w-4 h-4" />
                {unreadMessagesCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-500 h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-[10px] sm:text-xs">
                    {unreadMessagesCount}
                  </Badge>
                )}
                <span className="hidden md:inline">{t('الدردشة', 'Chat')}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/delivery')}
                className="gap-1 px-2 sm:px-3"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden md:inline">{t('التوصيل', 'Delivery')}</span>
              </Button>
              <div className="hidden sm:block">
                <CountrySelector />
              </div>
              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="px-2">
                <Languages className="w-4 h-4" />
              </Button>
              
              {/* Admin Menu or Regular Logout */}
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1 border-amber-500 text-amber-600 hover:bg-amber-50 px-2 sm:px-3">
                      <Shield className="w-4 h-4" />
                      <span className="hidden sm:inline">{t('المدير', 'Admin')}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={handleGoToAdmin} className="gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      {t('لوحة التحكم', 'Admin Panel')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-red-600">
                      <LogOut className="w-4 h-4" />
                      {t('تسجيل الخروج', 'Logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="book" className="gap-2">
              <Car className="w-4 h-4" />
              {t('حجز رحلة', 'Book Ride')}
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

          {/* Book Ride Tab */}
          <TabsContent value="book" className="space-y-6">
            {!currentRide ? (
              <>
                {/* Location Selection */}
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-6">
                    {t('إلى أين تريد الذهاب؟', 'Where do you want to go?')}
                  </h2>
                  <div className="space-y-4">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-600" />
                      <Input
                        placeholder={t('موقع الانطلاق', 'Pickup Location')}
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                    <div className="relative">
                      <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
                      <Input
                        placeholder={t('الوجهة', 'Destination')}
                        value={dropoffAddress}
                        onChange={(e) => {
                          setDropoffAddress(e.target.value);
                          if (e.target.value && pickupAddress) {
                            calculateEstimate();
                          }
                        }}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                </Card>

                {/* Vehicle Selection */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">{t('اختر نوع السيارة', 'Choose Vehicle Type')}</h3>
                  <div className="grid gap-3">
                    {vehicleTypes.map((vehicle) => (
                      <Card
                        key={vehicle.id}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedVehicle.id === vehicle.id
                            ? 'border-2 border-blue-600 bg-blue-50'
                            : 'hover:border-slate-300'
                        }`}
                        onClick={() => {
                          setSelectedVehicle(vehicle);
                          if (pickupAddress && dropoffAddress) {
                            calculateEstimate();
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Car className="w-6 h-6 text-slate-700" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{t(vehicle.name, vehicle.nameEn)}</h4>
                              <p className="text-sm text-slate-600">{t(vehicle.description, vehicle.descriptionEn)}</p>
                              <p className="text-xs text-slate-500">{vehicle.estimatedTime}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">
                              {formatPrice(vehicle.basePrice, language)}
                            </p>
                            <p className="text-xs text-slate-500">+ {formatPrice(vehicle.pricePerKm, language)}/{t('كم', 'km')}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>

                {/* Payment Method */}
                <Card className="p-6">
                  <h3 className="text-xl font-bold mb-4">{t('طريقة الدفع', 'Payment Method')}</h3>
                  <div className="grid gap-3">
                    {paymentMethods.map((method) => {
                      const Icon = method.icon === 'Banknote' ? DollarSign : 
                                   method.icon === 'Star' ? Star : CreditCard;
                      return (
                        <Card
                          key={method.id}
                          className={`p-4 cursor-pointer transition-all ${
                            selectedPayment === method.id
                              ? 'border-2 border-blue-600 bg-blue-50'
                              : 'hover:border-slate-300'
                          }`}
                          onClick={() => setSelectedPayment(method.id)}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-slate-700" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{t(method.name, method.nameEn)}</h4>
                              <p className="text-sm text-slate-600">{t(method.description, method.descriptionEn)}</p>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </Card>

                {/* Estimated Price */}
                {estimatedPrice > 0 && (
                  <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">{t('السعر المتوقع', 'Estimated Price')}</p>
                        <p className="text-3xl font-bold text-blue-700">{formatPrice(estimatedPrice, language)}</p>
                      </div>
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>
                )}

                {/* Book Button */}
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-14 text-lg shadow-lg"
                  onClick={handleBookRide}
                  disabled={!pickupAddress || !dropoffAddress}
                >
                  {t('احجز الآن', 'Book Now')}
                </Button>
              </>
            ) : (
              /* Active Ride */
              <Card className="p-6">
                <div className="text-center space-y-6">
                  {currentRide.status === 'searching' && (
                    <>
                      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Car className="w-10 h-10 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{t('جاري البحث عن سائق...', 'Searching for Driver...')}</h3>
                        <p className="text-slate-600">{t('سنجد لك أقرب سائق متاح', 'Finding the nearest available driver')}</p>
                      </div>
                    </>
                  )}
                  {currentRide.status === 'accepted' && (
                    <>
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Car className="w-10 h-10 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{t('تم العثور على سائق!', 'Driver Found!')}</h3>
                        <p className="text-slate-600">{t('السائق في الطريق إليك', 'Driver is on the way')}</p>
                      </div>
                      <Card className="p-4 bg-slate-50">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" />
                            <AvatarFallback>D</AvatarFallback>
                          </Avatar>
                          <div className="text-left flex-1">
                            <h4 className="font-bold text-lg">{t('أحمد محمد', 'Ahmed Mohammed')}</h4>
                            <p className="text-sm text-slate-600">{t('تويوتا كامري 2022', 'Toyota Camry 2022')}</p>
                            <p className="text-sm text-slate-600">ABC 1234</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-semibold">4.8</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button className="flex-1 gap-2">
                            <Phone className="w-4 h-4" />
                            {t('اتصال', 'Call')}
                          </Button>
                          <Button variant="outline" className="flex-1 gap-2">
                            <MessageSquare className="w-4 h-4" />
                            {t('رسالة', 'Message')}
                          </Button>
                        </div>
                      </Card>
                    </>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleCancelRide}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t('إلغاء الرحلة', 'Cancel Ride')}
                  </Button>
                </div>
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
                        <p className="text-lg font-bold text-slate-900">{formatPrice(ride.price, language)}</p>
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
                  <AvatarImage src={user?.photo} />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-slate-600">{user?.email}</p>
                <p className="text-slate-600">{user?.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 bg-blue-50">
                  <p className="text-sm text-slate-600 mb-1">{t('النقاط', 'Points')}</p>
                  <p className="text-2xl font-bold text-blue-600">{user?.points || 0}</p>
                </Card>
                <Card className="p-4 bg-green-50">
                  <p className="text-sm text-slate-600 mb-1">{t('الرحلات', 'Rides')}</p>
                  <p className="text-2xl font-bold text-green-600">{user?.totalRides || 0}</p>
                </Card>
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

export default RiderDashboard;
