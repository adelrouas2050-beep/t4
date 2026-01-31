import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar } from '../components/ui/avatar';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useDelivery } from '../context/DeliveryContext';
import { mockRestaurants, mockMenuItems } from '../mock/deliveryData';
import { 
  ArrowLeft, Star, Clock, Bike, MapPin, Plus, Minus,
  ShoppingBag, Check
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const RestaurantDetailPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { addToCart, cart, getCartItemsCount } = useDelivery();
  const { toast } = useToast();

  const restaurant = mockRestaurants.find(r => r.id === restaurantId);
  const menuItems = mockMenuItems[restaurantId] || [];

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t('المطعم غير موجود', 'Restaurant not found')}</p>
      </div>
    );
  }

  const handleAddToCart = (item) => {
    addToCart(item, restaurant);
    toast({
      title: t('تمت الإضافة إلى السلة', 'Added to Cart'),
      description: language === 'ar' ? item.nameAr : item.nameEn
    });
  };

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cart.find(i => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const cartCount = getCartItemsCount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Image */}
      <div className="relative h-64">
        <img 
          src={restaurant.image} 
          alt={language === 'ar' ? restaurant.nameAr : restaurant.nameEn}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/delivery')}
          className="absolute top-4 left-4 bg-white hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        {cartCount > 0 && (
          <Button
            onClick={() => navigate('/cart')}
            className="absolute top-4 right-4 bg-orange-500 hover:bg-orange-600 gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="bg-white text-orange-600 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {cartCount}
            </span>
          </Button>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Restaurant Info */}
        <Card className="p-6 -mt-20 relative z-10 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {language === 'ar' ? restaurant.nameAr : restaurant.nameEn}
              </h1>
              <p className="text-slate-600 mb-3">
                {language === 'ar' ? restaurant.cuisineAr : restaurant.cuisineEn}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">{restaurant.rating}</span>
                  <span className="text-slate-500 text-sm">({restaurant.reviewCount} {t('تقييم', 'reviews')})</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="w-5 h-5" />
                  <span>{restaurant.deliveryTime} {t('دقيقة', 'min')}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Bike className="w-5 h-5" />
                  <span>
                    {restaurant.deliveryFee === 0 
                      ? t('توصيل مجاني', 'Free Delivery') 
                      : formatPrice(restaurant.deliveryFee, language)
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-4 border-t">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">
              {t('الحد الأدنى للطلب:', 'Minimum Order:')} {formatPrice(restaurant.minOrder, language)}
            </span>
          </div>
        </Card>

        {/* Menu */}
        <div className="pb-8">
          <h2 className="text-2xl font-bold mb-6">{t('القائمة', 'Menu')}</h2>
          <div className="space-y-4">
            {menuItems.map((item) => {
              const quantityInCart = getItemQuantityInCart(item.id);
              return (
                <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={language === 'ar' ? item.nameAr : item.nameEn}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">
                            {language === 'ar' ? item.nameAr : item.nameEn}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">
                            {language === 'ar' ? item.descriptionAr : item.descriptionEn}
                          </p>
                          <p className="text-lg font-bold text-orange-600">
                            {formatPrice(item.price, language)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-3">
                        {quantityInCart > 0 ? (
                          <div className="flex items-center gap-3 bg-orange-100 rounded-lg px-2 py-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-orange-200"
                              onClick={() => {
                                const cartItem = cart.find(i => i.id === item.id);
                                if (cartItem && cartItem.quantity > 1) {
                                  // Will be handled by removeFromCart in cart page
                                }
                              }}
                            >
                              <Minus className="w-4 h-4 text-orange-600" />
                            </Button>
                            <span className="font-bold text-orange-600 min-w-[20px] text-center">
                              {quantityInCart}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 hover:bg-orange-200"
                              onClick={() => handleAddToCart(item)}
                            >
                              <Plus className="w-4 h-4 text-orange-600" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => handleAddToCart(item)}
                            className="bg-orange-500 hover:bg-orange-600 gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            {t('إضافة', 'Add')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.popular && (
                    <Badge className="mt-2 bg-orange-100 text-orange-700 hover:bg-orange-100">
                      {t('الأكثر طلباً', 'Popular')}
                    </Badge>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <Button
            size="lg"
            onClick={() => navigate('/cart')}
            className="bg-orange-500 hover:bg-orange-600 shadow-2xl gap-3 px-8"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{t('عرض السلة', 'View Cart')}</span>
            <Badge className="bg-white text-orange-600 hover:bg-white">
              {cartCount}
            </Badge>
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;
