import React, { createContext, useContext, useState } from 'react';
import { mockRides, vehicleTypes } from '../mock/data';

const RideContext = createContext();

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error('useRide must be used within a RideProvider');
  }
  return context;
};

export const RideProvider = ({ children }) => {
  const [currentRide, setCurrentRide] = useState(null);
  const [rideHistory, setRideHistory] = useState(mockRides);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleTypes[0]);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  const calculatePrice = (distance) => {
    const base = selectedVehicle.basePrice;
    const perKm = selectedVehicle.pricePerKm * distance;
    return Math.round(base + perKm);
  };

  const requestRide = (pickup, dropoff, vehicle, payment) => {
    const distance = Math.random() * 20 + 5; // Mock distance
    const price = calculatePrice(distance);
    
    const newRide = {
      id: 'ride_' + Date.now(),
      riderId: 'user1',
      pickup,
      dropoff,
      vehicleType: vehicle,
      paymentMethod: payment,
      status: 'searching',
      price,
      distance,
      requestedAt: new Date().toISOString()
    };

    setCurrentRide(newRide);
    
    // Simulate finding a driver
    setTimeout(() => {
      setCurrentRide(prev => ({ ...prev, status: 'accepted' }));
    }, 3000);

    return newRide;
  };

  const cancelRide = () => {
    setCurrentRide(null);
  };

  const completeRide = (rating) => {
    if (currentRide) {
      const completedRide = {
        ...currentRide,
        status: 'completed',
        completedAt: new Date().toISOString(),
        rating
      };
      setRideHistory(prev => [completedRide, ...prev]);
      setCurrentRide(null);
    }
  };

  return (
    <RideContext.Provider value={{
      currentRide,
      rideHistory,
      pickupLocation,
      dropoffLocation,
      selectedVehicle,
      selectedPayment,
      estimatedPrice,
      promoCode,
      setPickupLocation,
      setDropoffLocation,
      setSelectedVehicle,
      setSelectedPayment,
      setEstimatedPrice,
      setPromoCode,
      calculatePrice,
      requestRide,
      cancelRide,
      completeRide
    }}>
      {children}
    </RideContext.Provider>
  );
};