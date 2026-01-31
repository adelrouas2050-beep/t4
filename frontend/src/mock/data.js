// Mock data for TransVerse app

export const mockDrivers = [
  {
    id: '1',
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohammed',
    rating: 4.8,
    vehicle: 'تويوتا كامري 2022',
    vehicleEn: 'Toyota Camry 2022',
    plate: 'ABC 1234',
    phone: '+966501234567',
    photo: 'https://randomuser.me/api/portraits/men/1.jpg',
    location: { lat: 24.7136, lng: 46.6753 },
    available: true
  },
  {
    id: '2',
    name: 'خالد العتيبي',
    nameEn: 'Khaled Al-Otaibi',
    rating: 4.9,
    vehicle: 'هيونداي النترا 2023',
    vehicleEn: 'Hyundai Elantra 2023',
    plate: 'XYZ 5678',
    phone: '+966507654321',
    photo: 'https://randomuser.me/api/portraits/men/2.jpg',
    location: { lat: 24.7236, lng: 46.6853 },
    available: true
  }
];

export const mockRides = [
  {
    id: 'ride1',
    riderId: 'user1',
    driverId: '1',
    driver: mockDrivers[0],
    pickup: { lat: 24.7136, lng: 46.6753, address: 'شارع الملك فهد، الرياض', addressEn: 'King Fahd Road, Riyadh' },
    dropoff: { lat: 24.7736, lng: 46.7353, address: 'العليا، الرياض', addressEn: 'Al Olaya, Riyadh' },
    status: 'completed',
    price: 45,
    paymentMethod: 'cash',
    distance: 12.5,
    duration: 18,
    date: '2025-01-15T10:30:00',
    rating: 5
  },
  {
    id: 'ride2',
    riderId: 'user1',
    driverId: '2',
    driver: mockDrivers[1],
    pickup: { lat: 24.7736, lng: 46.7353, address: 'العليا، الرياض', addressEn: 'Al Olaya, Riyadh' },
    dropoff: { lat: 24.6136, lng: 46.6153, address: 'مطار الملك خالد الدولي', addressEn: 'King Khalid International Airport' },
    status: 'completed',
    price: 85,
    paymentMethod: 'points',
    distance: 35.2,
    duration: 32,
    date: '2025-01-10T14:15:00',
    rating: 4
  },
  {
    id: 'ride3',
    riderId: 'user1',
    driverId: '1',
    driver: mockDrivers[0],
    pickup: { lat: 24.7136, lng: 46.6753, address: 'حي السفارات، الرياض', addressEn: 'Diplomatic Quarter, Riyadh' },
    dropoff: { lat: 24.7436, lng: 46.7053, address: 'برج المملكة', addressEn: 'Kingdom Tower' },
    status: 'completed',
    price: 35,
    paymentMethod: 'paypal',
    distance: 8.3,
    duration: 12,
    date: '2025-01-08T09:00:00',
    rating: 5
  }
];

export const vehicleTypes = [
  {
    id: 'economy',
    name: 'اقتصادي',
    nameEn: 'Economy',
    description: 'خيار مناسب وموفر',
    descriptionEn: 'Affordable and reliable',
    pricePerKm: 2.5,
    basePrice: 10,
    capacity: 4,
    icon: 'Car',
    estimatedTime: '2-5 دقائق'
  },
  {
    id: 'comfort',
    name: 'مريح',
    nameEn: 'Comfort',
    description: 'سيارات أحدث وأكثر راحة',
    descriptionEn: 'Newer, more comfortable cars',
    pricePerKm: 3.5,
    basePrice: 15,
    capacity: 4,
    icon: 'Car',
    estimatedTime: '3-7 دقائق'
  },
  {
    id: 'premium',
    name: 'فاخر',
    nameEn: 'Premium',
    description: 'سيارات فاخرة للتجربة المميزة',
    descriptionEn: 'Luxury vehicles for premium experience',
    pricePerKm: 5,
    basePrice: 25,
    capacity: 4,
    icon: 'Car',
    estimatedTime: '5-10 دقائق'
  },
  {
    id: 'xl',
    name: 'كبير',
    nameEn: 'XL',
    description: 'سيارات واسعة تتسع لـ 6 ركاب',
    descriptionEn: 'Spacious vehicles for up to 6 passengers',
    pricePerKm: 4,
    basePrice: 20,
    capacity: 6,
    icon: 'Bus',
    estimatedTime: '4-8 دقائق'
  }
];

export const mockUser = {
  id: 'user1',
  name: 'محمد أحمد',
  nameEn: 'Mohammed Ahmed',
  email: 'mohammed@example.com',
  phone: '+966501234567',
  photo: 'https://randomuser.me/api/portraits/men/10.jpg',
  points: 250,
  totalRides: 45,
  memberSince: '2024-01-01',
  rating: 4.7
};

export const paymentMethods = [
  {
    id: 'cash',
    name: 'نقداً',
    nameEn: 'Cash',
    icon: 'Banknote',
    description: 'الدفع نقداً للسائق',
    descriptionEn: 'Pay cash to driver'
  },
  {
    id: 'points',
    name: 'نقاط',
    nameEn: 'Points',
    icon: 'Star',
    description: 'استخدم نقاطك المكتسبة',
    descriptionEn: 'Use your earned points'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    nameEn: 'PayPal',
    icon: 'CreditCard',
    description: 'الدفع عبر PayPal',
    descriptionEn: 'Pay with PayPal'
  }
];

export const promoOffers = [
  {
    id: 'promo1',
    code: 'WELCOME50',
    discount: 50,
    type: 'percentage',
    description: 'خصم 50% على أول رحلة',
    descriptionEn: '50% off your first ride',
    validUntil: '2025-12-31'
  },
  {
    id: 'promo2',
    code: 'SAVE20',
    discount: 20,
    type: 'fixed',
    description: 'خصم 20 ريال',
    descriptionEn: 'SAR 20 off',
    validUntil: '2025-06-30'
  }
];
export const currencies = [
  { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س' },
  { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ' },
  { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م' },
  { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك' },
  { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق' },
  { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب' },
  { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع' },
  { code: 'JOD', name: 'دينار أردني', symbol: 'د.أ' },
  { code: 'LBP', name: 'ليرة لبنانية', symbol: 'ل.ل' },
  { code: 'MAD', name: 'درهم مغربي', symbol: 'د.م' },
  { code: 'TND', name: 'دينار تونسي', symbol: 'د.ت' },
  { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
];
