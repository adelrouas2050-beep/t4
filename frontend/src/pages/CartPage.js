import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { useDelivery } from '../context/DeliveryContext';
import { paymentMethods } from '../mock/data';
import { 
  ArrowLeft, Plus, Minus, Trash2, ShoppingBag, 
  MapPin, CreditCard, CheckCircle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const CartPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { formatPrice } = useCurrency();
  const { 
    cart, 
    selectedRestaurant, 
    addToCart, 
    removeFromCart, 
    clearCart,
    getCartTotal,
    placeOrder
  } = useDelivery();
  const { toast } = useToast();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const subtotal = getCartTotal();
  const deliveryFee = selectedRestaurant?.deliveryFee || 0;
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = () => {
    if (!deliveryAddress) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('الرجاء إدخال عنوان التوصيل', 'Please enter delivery address'),
        variant: 'destructive'
      });
      return;
    }

    if (subtotal < (selectedRestaurant?.minOrder || 0)) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('الحد الأدنى للطلب', 'Minimum order') + ': ' + formatPrice(selectedRestaurant?.minOrder || 0, language),
        variant: 'destructive'
      });
      return;
    }

    setIsPlacingOrder(true);

    const address = {
      addressAr: deliveryAddress,
      addressEn: deliveryAddress,
      lat: 24.7136,
      lng: 46.6753
    };

    setTimeout(() => {
      placeOrder(address, selectedPayment);
      toast({
        title: t('تم تقديم الطلب بنجاح!', 'Order Placed Successfully!'),
        description: t('سيتم تحضير طلبك الآن', 'Your order is being prepared')
      });
      navigate('/delivery/orders');
    }, 1500);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/delivery')}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('العودة', 'Back')}
          </Button>
          <Card className="p-12 text-center">
            <ShoppingBag className="w-20 h-20 text-slate-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">{t('السلة فارغة', 'Cart is Empty')}</h2>
            <p className="text-slate-600 mb-6">
              {t('لم تضف أي عناصر إلى السلة بعد', 'You haven\'t added any items to your cart yet')}
            </p>
            <Button
              onClick={() => navigate('/delivery')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {t('تصفح المطاعم', 'Browse Restaurants')}
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/delivery')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('العودة', 'Back')}
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t('سلة التسوق', 'Shopping Cart')}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('إفراغ السلة', 'Clear Cart')}
                </Button>
              </div>

              {selectedRestaurant && (
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-bold text-lg">
                    {language === 'ar' ? selectedRestaurant.nameAr : selectedRestaurant.nameEn}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {language === 'ar' ? selectedRestaurant.cuisineAr : selectedRestaurant.cuisineEn}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                    <img 
                      src={item.image} 
                      alt={language === 'ar' ? item.nameAr : item.nameEn}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">
                        {language === 'ar' ? item.nameAr : item.nameEn}
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        {formatPrice(item.price, language)} × {item.quantity}
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-semibold min-w-[30px] text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => addToCart(item, selectedRestaurant)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {formatPrice(item.price * item.quantity, language)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Delivery Address */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h3 className="text-xl font-bold">{t('عنوان التوصيل', 'Delivery Address')}</h3>
              </div>
              <Input
                placeholder={t('أدخل عنوان التوصيل', 'Enter delivery address')}
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="h-12"
              />
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-orange-600" />
                <h3 className="text-xl font-bold">{t('طريقة الدفع', 'Payment Method')}</h3>
              </div>
              <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            {method.icon === 'Banknote' && <span>💵</span>}
                            {method.icon === 'Star' && <span>⭐</span>}
                            {method.icon === 'CreditCard' && <span>💳</span>}
                          </div>
                          <div>
                            <p className="font-semibold">{t(method.name, method.nameEn)}</p>
                            <p className="text-sm text-slate-600">{t(method.description, method.descriptionEn)}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-6">{t('ملخص الطلب', 'Order Summary')}</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('المجموع الفرعي', 'Subtotal')}</span>
                  <span className="font-semibold">{formatPrice(subtotal, language)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">{t('رسوم التوصيل', 'Delivery Fee')}</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? t('مجاني', 'Free') : formatPrice(deliveryFee, language)}
                  </span>
                </div>
                <div className="pt-3 border-t flex items-center justify-between">
                  <span className="font-bold text-lg">{t('الإجمالي', 'Total')}</span>
                  <span className="font-bold text-2xl text-orange-600">
                    {formatPrice(total, language)}
                  </span>
                </div>
              </div>

              {selectedRestaurant && subtotal < selectedRestaurant.minOrder && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    {t('الحد الأدنى للطلب:', 'Minimum order:')} {formatPrice(selectedRestaurant.minOrder, language)}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {t('أضف', 'Add')} {formatPrice(selectedRestaurant.minOrder - subtotal, language)} {t('أكثر', 'more')}
                  </p>
                </div>
              )}

              <Button
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 gap-2"
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !deliveryAddress}
              >
                {isPlacingOrder ? (
                  <>
                    <span>{t('جاري التقديم...', 'Placing Order...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    {t('تأكيد الطلب', 'Confirm Order')}
                  </>
                )}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
