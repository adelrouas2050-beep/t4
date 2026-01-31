import React, { createContext, useContext, useState } from 'react';
import { mockDeliveryOrders } from '../mock/deliveryData';

const DeliveryContext = createContext();

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};

export const DeliveryProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState(mockDeliveryOrders);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);

  const addToCart = (item, restaurant) => {
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1, restaurantId: restaurant.id }]);
      if (!selectedRestaurant) {
        setSelectedRestaurant(restaurant);
      }
    }
  };

  const removeFromCart = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    if (item && item.quantity > 1) {
      setCart(cart.map(i => 
        i.id === itemId 
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ));
    } else {
      setCart(cart.filter(i => i.id !== itemId));
    }
  };

  const clearCart = () => {
    setCart([]);
    setSelectedRestaurant(null);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = (address, paymentMethod) => {
    const newOrder = {
      id: 'order_' + Date.now(),
      restaurantId: selectedRestaurant.id,
      restaurant: selectedRestaurant,
      customerId: 'user1',
      items: cart,
      status: 'preparing',
      totalPrice: getCartTotal(),
      deliveryFee: selectedRestaurant.deliveryFee,
      deliveryAddress: address,
      restaurantAddress: {
        addressAr: 'حي العليا، الرياض',
        addressEn: 'Al Olaya District, Riyadh',
        lat: 24.7236,
        lng: 46.6853
      },
      orderTime: new Date().toISOString(),
      estimatedDelivery: selectedRestaurant.deliveryTime,
      paymentMethod
    };

    setOrders([newOrder, ...orders]);
    clearCart();
    return newOrder;
  };

  return (
    <DeliveryContext.Provider value={{
      cart,
      orders,
      selectedRestaurant,
      deliveryAddress,
      addToCart,
      removeFromCart,
      clearCart,
      getCartTotal,
      getCartItemsCount,
      setDeliveryAddress,
      placeOrder
    }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export default DeliveryContext;