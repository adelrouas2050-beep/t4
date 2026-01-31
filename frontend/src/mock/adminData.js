// Mock data for Admin Dashboard

export const adminStats = {
  totalUsers: 15420,
  totalDrivers: 2340,
  totalRiders: 13080,
  totalRides: 45230,
  todayRides: 342,
  totalRevenue: 2543000,
  monthlyRevenue: 456000,
  todayRevenue: 15430,
  totalRestaurants: 156,
  totalOrders: 28940,
  activeUsers: 8930,
  pendingDrivers: 45,
  pendingRestaurants: 12,
  activeRides: 89,
  completedRides: 44800,
  cancelledRides: 430,
  averageRating: 4.7,
  commissionRate: 15
};

export const revenueData = [
  { month: 'يناير', monthEn: 'Jan', revenue: 320000, rides: 3200 },
  { month: 'فبراير', monthEn: 'Feb', revenue: 380000, rides: 3800 },
  { month: 'مارس', monthEn: 'Mar', revenue: 420000, rides: 4200 },
  { month: 'أبريل', monthEn: 'Apr', revenue: 390000, rides: 3900 },
  { month: 'مايو', monthEn: 'May', revenue: 450000, rides: 4500 },
  { month: 'يونيو', monthEn: 'Jun', revenue: 480000, rides: 4800 }
];

export const adminUsers = [
  {
    id: 'user1',
    name: 'محمد أحمد',
    nameEn: 'Mohammed Ahmed',
    email: 'mohammed@example.com',
    userId: 'TV12345',
    phone: '+966501234567',
    type: 'rider',
    status: 'active',
    joinDate: '2024-01-15',
    totalRides: 45,
    totalSpent: 2340,
    rating: 4.8,
    verified: true
  },
  {
    id: 'user2',
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohammed',
    email: 'ahmed@example.com',
    userId: 'TV67890',
    phone: '+966501234568',
    type: 'driver',
    status: 'active',
    joinDate: '2024-01-10',
    totalRides: 523,
    totalEarnings: 45600,
    rating: 4.9,
    verified: true,
    vehicleType: 'تويوتا كامري 2022',
    licenseNumber: 'ABC123',
    documentsStatus: 'approved'
  },
  {
    id: 'user3',
    name: 'فاطمة علي',
    nameEn: 'Fatima Ali',
    email: 'fatima@example.com',
    userId: 'TV11111',
    phone: '+966501234569',
    type: 'rider',
    status: 'suspended',
    joinDate: '2024-02-20',
    totalRides: 12,
    totalSpent: 560,
    rating: 3.2,
    verified: false
  }
];

export const adminDrivers = [
  {
    id: 'driver1',
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohammed',
    email: 'ahmed@example.com',
    phone: '+966501234568',
    status: 'approved',
    rating: 4.9,
    totalRides: 523,
    totalEarnings: 45600,
    vehicleType: 'تويوتا كامري 2022',
    vehicleTypeEn: 'Toyota Camry 2022',
    plateNumber: 'ABC 1234',
    licenseNumber: 'LIC123456',
    documents: {
      driverLicense: { status: 'approved', url: '/docs/license1.pdf' },
      vehicleRegistration: { status: 'approved', url: '/docs/reg1.pdf' },
      insurance: { status: 'approved', url: '/docs/ins1.pdf' }
    },
    joinDate: '2024-01-10',
    lastActive: '2025-01-30T10:30:00'
  },
  {
    id: 'driver2',
    name: 'خالد العتيبي',
    nameEn: 'Khaled Al-Otaibi',
    email: 'khaled@example.com',
    phone: '+966501234570',
    status: 'pending',
    rating: 0,
    totalRides: 0,
    totalEarnings: 0,
    vehicleType: 'هيونداي النترا 2023',
    vehicleTypeEn: 'Hyundai Elantra 2023',
    plateNumber: 'XYZ 5678',
    licenseNumber: 'LIC789012',
    documents: {
      driverLicense: { status: 'pending', url: '/docs/license2.pdf' },
      vehicleRegistration: { status: 'pending', url: '/docs/reg2.pdf' },
      insurance: { status: 'pending', url: '/docs/ins2.pdf' }
    },
    joinDate: '2025-01-28',
    lastActive: '2025-01-30T09:15:00'
  }
];

export const adminRestaurants = [
  {
    id: 'rest1',
    name: 'مطعم البيك',
    nameEn: 'Al Baik Restaurant',
    email: 'albaik@example.com',
    phone: '+966501111111',
    status: 'active',
    rating: 4.8,
    totalOrders: 2340,
    totalRevenue: 156000,
    category: 'burgers',
    deliveryFee: 5,
    minOrder: 20,
    commissionRate: 15,
    joinDate: '2024-01-05',
    documents: {
      commercialLicense: { status: 'approved', url: '/docs/com1.pdf' },
      healthCertificate: { status: 'approved', url: '/docs/health1.pdf' }
    }
  },
  {
    id: 'rest2',
    name: 'مطعم الرومانسية',
    nameEn: 'Romansia Restaurant',
    email: 'romansia@example.com',
    phone: '+966502222222',
    status: 'pending',
    rating: 0,
    totalOrders: 0,
    totalRevenue: 0,
    category: 'arabic',
    deliveryFee: 8,
    minOrder: 30,
    commissionRate: 15,
    joinDate: '2025-01-25',
    documents: {
      commercialLicense: { status: 'pending', url: '/docs/com2.pdf' },
      healthCertificate: { status: 'pending', url: '/docs/health2.pdf' }
    }
  }
];

export const adminRides = [
  {
    id: 'ride1',
    riderId: 'user1',
    riderName: 'محمد أحمد',
    driverId: 'driver1',
    driverName: 'أحمد محمد',
    pickup: 'شارع الملك فهد، الرياض',
    dropoff: 'العليا، الرياض',
    status: 'completed',
    price: 45,
    commission: 6.75,
    distance: 12.5,
    duration: 18,
    date: '2025-01-30T10:30:00',
    paymentMethod: 'cash',
    rating: 5
  },
  {
    id: 'ride2',
    riderId: 'user3',
    riderName: 'فاطمة علي',
    driverId: 'driver1',
    driverName: 'أحمد محمد',
    pickup: 'العليا، الرياض',
    dropoff: 'مطار الملك خالد',
    status: 'in_progress',
    price: 85,
    commission: 12.75,
    distance: 35.2,
    duration: 32,
    date: '2025-01-30T11:00:00',
    paymentMethod: 'points'
  },
  {
    id: 'ride3',
    riderId: 'user1',
    riderName: 'محمد أحمد',
    driverId: 'driver1',
    driverName: 'أحمد محمد',
    pickup: 'حي السفارات، الرياض',
    dropoff: 'برج المملكة',
    status: 'cancelled',
    price: 35,
    commission: 0,
    distance: 8.3,
    duration: 12,
    date: '2025-01-29T09:00:00',
    paymentMethod: 'paypal',
    cancelReason: 'تأخر السائق'
  }
];

export const adminPromotions = [
  {
    id: 'promo1',
    code: 'WELCOME50',
    type: 'percentage',
    value: 50,
    description: 'خصم 50% على أول رحلة',
    descriptionEn: '50% off first ride',
    validFrom: '2025-01-01',
    validTo: '2025-12-31',
    maxUses: 1000,
    usedCount: 234,
    status: 'active'
  },
  {
    id: 'promo2',
    code: 'SAVE20',
    type: 'fixed',
    value: 20,
    description: 'خصم 20 ريال',
    descriptionEn: 'SAR 20 off',
    validFrom: '2025-01-01',
    validTo: '2025-06-30',
    maxUses: 500,
    usedCount: 123,
    status: 'active'
  }
];

export const adminNotifications = [
  {
    id: 'notif1',
    title: 'تحديث جديد متاح',
    titleEn: 'New Update Available',
    message: 'تحديث التطبيق الآن للحصول على ميزات جديدة',
    messageEn: 'Update the app now to get new features',
    type: 'all',
    sentDate: '2025-01-30T08:00:00',
    sentTo: 15420,
    opened: 8934
  }
];

export const adminSupport = [
  {
    id: 'ticket1',
    userId: 'user1',
    userName: 'محمد أحمد',
    subject: 'مشكلة في الدفع',
    subjectEn: 'Payment Issue',
    message: 'لم أتمكن من إكمال الدفع',
    status: 'open',
    priority: 'high',
    createdAt: '2025-01-30T09:00:00'
  },
  {
    id: 'ticket2',
    userId: 'user3',
    userName: 'فاطمة علي',
    subject: 'استفسار عن الخصومات',
    subjectEn: 'Question about discounts',
    message: 'كيف أستخدم كود الخصم؟',
    status: 'resolved',
    priority: 'low',
    createdAt: '2025-01-29T14:30:00',
    resolvedAt: '2025-01-29T15:00:00'
  }
];

export const activityLog = [
  {
    id: 'log1',
    admin: 'Admin',
    action: 'approved_driver',
    targetId: 'driver1',
    targetName: 'أحمد محمد',
    timestamp: '2025-01-30T10:00:00'
  },
  {
    id: 'log2',
    admin: 'Admin',
    action: 'suspended_user',
    targetId: 'user3',
    targetName: 'فاطمة علي',
    timestamp: '2025-01-30T09:30:00'
  },
  {
    id: 'log3',
    admin: 'Admin',
    action: 'created_promotion',
    targetId: 'promo1',
    targetName: 'WELCOME50',
    timestamp: '2025-01-30T08:00:00'
  }
];