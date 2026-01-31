import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useDelivery } from '../context/DeliveryContext';
import CountrySelector from '../components/CountrySelector';
import { mockRestaurants, restaurantCategories } from '../mock/deliveryData';
import { 
  Car, Search, Star, Clock, Bike, Store, 
  ShoppingBag, LogOut, Languages, MapPin, Flame
} from 'lucide-react';

const DeliveryPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { getCartItemsCount } = useDelivery();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    const matchesCategory = selectedCategory === 'all' || restaurant.category === selectedCategory;
    const matchesSearch = restaurant.nameAr.includes(searchQuery) || 
                         restaurant.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartCount = getCartItemsCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  {t('ترانسفيرز - التوصيل', 'TransVerse Delivery')}
                </h1>
                <p className="text-xs text-slate-500">{t('اطلب الآن', 'Order Now')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/rider')}
                className="gap-2"
              >
                <Car className="w-4 h-4" />
                {t('الرحلات', 'Rides')}
              </Button>
              {cartCount > 0 && (
                <Button 
                  onClick={() => navigate('/cart')}
                  className="relative bg-orange-500 hover:bg-orange-600 gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                  {t('السلة', 'Cart')}
                </Button>
              )}
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
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-slate-600">
              {t('التوصيل إلى:', 'Delivering to:')} <span className="font-semibold text-slate-900">{t('شارع الملك فهد، الرياض', 'King Fahd Road, Riyadh')}</span>
            </span>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder={t('ابحث عن مطعم أو طعام...', 'Search for restaurant or food...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {restaurantCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className={`whitespace-nowrap ${
                  selectedCategory === category.id 
                    ? 'bg-orange-500 hover:bg-orange-600' 
                    : 'hover:bg-orange-50'
                }`}
              >
                {t(category.nameAr, category.nameEn)}
              </Button>
            ))}
          </div>
        </div>

        {/* Popular Restaurants Banner */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-orange-500" />
            <h2 className="text-2xl font-bold">{t('الأكثر شعبية', 'Popular')}</h2>
          </div>
        </div>

        {/* Restaurants Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRestaurants.map((restaurant) => (
            <Card 
              key={restaurant.id}
              className="overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
              onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            >
              <div className="relative">
                <img 
                  src={restaurant.image} 
                  alt={language === 'ar' ? restaurant.nameAr : restaurant.nameEn}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                />
                {restaurant.popular && (
                  <Badge className="absolute top-3 left-3 bg-orange-500">
                    <Flame className="w-3 h-3 mr-1" />
                    {t('شائع', 'Popular')}
                  </Badge>
                )}
                {restaurant.deliveryFee === 0 && (
                  <Badge className="absolute top-3 right-3 bg-green-500">
                    {t('توصيل مجاني', 'Free Delivery')}
                  </Badge>
                )}
                {!restaurant.isOpen && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{t('مغلق', 'Closed')}</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">
                  {language === 'ar' ? restaurant.nameAr : restaurant.nameEn}
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  {language === 'ar' ? restaurant.cuisineAr : restaurant.cuisineEn}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{restaurant.rating}</span>
                      <span className="text-slate-500">({restaurant.reviewCount})</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">{restaurant.deliveryTime} {t('دقيقة', 'min')}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Bike className="w-4 h-4" />
                    <span className="text-xs">
                      {restaurant.deliveryFee === 0 
                        ? t('مجاني', 'Free') 
                        : formatPrice(restaurant.deliveryFee, language)
                      }
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {t('الحد الأدنى', 'Min')}: {formatPrice(restaurant.minOrder, language)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredRestaurants.length === 0 && (
          <div className="text-center py-20">
            <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              {t('لا توجد نتائج', 'No Results')}
            </h3>
            <p className="text-slate-500">
              {t('جرب البحث بكلمات أخرى', 'Try searching with different keywords')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPage;
