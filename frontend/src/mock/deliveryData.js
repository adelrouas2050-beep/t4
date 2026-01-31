// Mock data for Delivery Service

export const restaurantCategories = [
  { id: 'all', nameAr: 'الكل', nameEn: 'All', icon: 'Utensils' },
  { id: 'burgers', nameAr: 'برجر', nameEn: 'Burgers', icon: 'Beef' },
  { id: 'pizza', nameAr: 'بيتزا', nameEn: 'Pizza', icon: 'Pizza' },
  { id: 'arabic', nameAr: 'عربي', nameEn: 'Arabic', icon: 'Drumstick' },
  { id: 'asian', nameAr: 'آسيوي', nameEn: 'Asian', icon: 'Coffee' },
  { id: 'desserts', nameAr: 'حلويات', nameEn: 'Desserts', icon: 'IceCream' },
  { id: 'drinks', nameAr: 'مشروبات', nameEn: 'Drinks', icon: 'Coffee' },
  { id: 'grocery', nameAr: 'بقالة', nameEn: 'Grocery', icon: 'ShoppingBag' }
];

export const mockRestaurants = [
  {
    id: 'rest1',
    nameAr: 'مطعم البيك',
    nameEn: 'Al Baik Restaurant',
    category: 'burgers',
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop',
    rating: 4.8,
    reviewCount: 1250,
    deliveryTime: '20-30',
    deliveryFee: 5,
    minOrder: 20,
    cuisineAr: 'وجبات سريعة',
    cuisineEn: 'Fast Food',
    isOpen: true,
    popular: true
  },
  {
    id: 'rest2',
    nameAr: 'مطعم الرومانسية',
    nameEn: 'Romansia Restaurant',
    category: 'arabic',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop',
    rating: 4.7,
    reviewCount: 890,
    deliveryTime: '30-40',
    deliveryFee: 8,
    minOrder: 30,
    cuisineAr: 'مأكولات عربية',
    cuisineEn: 'Arabic Cuisine',
    isOpen: true,
    popular: true
  },
  {
    id: 'rest3',
    nameAr: 'بيتزا هت',
    nameEn: 'Pizza Hut',
    category: 'pizza',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop',
    rating: 4.5,
    reviewCount: 2100,
    deliveryTime: '25-35',
    deliveryFee: 0,
    minOrder: 25,
    cuisineAr: 'بيتزا إيطالية',
    cuisineEn: 'Italian Pizza',
    isOpen: true,
    popular: true
  },
  {
    id: 'rest4',
    nameAr: 'مقهى ستارباكس',
    nameEn: 'Starbucks Cafe',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=300&fit=crop',
    rating: 4.6,
    reviewCount: 1580,
    deliveryTime: '15-25',
    deliveryFee: 5,
    minOrder: 15,
    cuisineAr: 'قهوة ومشروبات',
    cuisineEn: 'Coffee & Drinks',
    isOpen: true,
    popular: false
  },
  {
    id: 'rest5',
    nameAr: 'مطعم باندا الصيني',
    nameEn: 'Panda Chinese Restaurant',
    category: 'asian',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop',
    rating: 4.4,
    reviewCount: 750,
    deliveryTime: '35-45',
    deliveryFee: 7,
    minOrder: 35,
    cuisineAr: 'مأكولات صينية',
    cuisineEn: 'Chinese Food',
    isOpen: true,
    popular: false
  },
  {
    id: 'rest6',
    nameAr: 'متجر بنده',
    nameEn: 'Panda Grocery',
    category: 'grocery',
    image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=400&h=300&fit=crop',
    rating: 4.3,
    reviewCount: 980,
    deliveryTime: '20-30',
    deliveryFee: 10,
    minOrder: 50,
    cuisineAr: 'بقالة',
    cuisineEn: 'Grocery',
    isOpen: true,
    popular: false
  }
];

export const mockMenuItems = {
  rest1: [
    {
      id: 'item1',
      nameAr: 'برجر دجاج',
      nameEn: 'Chicken Burger',
      descriptionAr: 'برجر دجاج طازج مع الخضار والصوص الخاص',
      descriptionEn: 'Fresh chicken burger with vegetables and special sauce',
      price: 18,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop',
      category: 'burgers',
      popular: true
    },
    {
      id: 'item2',
      nameAr: 'برجر لحم',
      nameEn: 'Beef Burger',
      descriptionAr: 'برجر لحم فاخر مع جبنة شيدر',
      descriptionEn: 'Premium beef burger with cheddar cheese',
      price: 22,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=200&fit=crop',
      category: 'burgers',
      popular: true
    },
    {
      id: 'item3',
      nameAr: 'بطاطس مقلية',
      nameEn: 'French Fries',
      descriptionAr: 'بطاطس مقرمشة ولذيذة',
      descriptionEn: 'Crispy and delicious fries',
      price: 8,
      image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300&h=200&fit=crop',
      category: 'sides',
      popular: false
    },
    {
      id: 'item4',
      nameAr: 'عصير برتقال',
      nameEn: 'Orange Juice',
      descriptionAr: 'عصير برتقال طبيعي طازج',
      descriptionEn: 'Fresh natural orange juice',
      price: 10,
      image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=200&fit=crop',
      category: 'drinks',
      popular: false
    }
  ],
  rest2: [
    {
      id: 'item5',
      nameAr: 'كبسة دجاج',
      nameEn: 'Chicken Kabsa',
      descriptionAr: 'كبسة دجاج على الطريقة السعودية',
      descriptionEn: 'Traditional Saudi chicken kabsa',
      price: 35,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=200&fit=crop',
      category: 'main',
      popular: true
    },
    {
      id: 'item6',
      nameAr: 'مندي لحم',
      nameEn: 'Lamb Mandi',
      descriptionAr: 'مندي لحم يمني أصلي',
      descriptionEn: 'Authentic Yemeni lamb mandi',
      price: 45,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&h=200&fit=crop',
      category: 'main',
      popular: true
    },
    {
      id: 'item7',
      nameAr: 'سلطة فتوش',
      nameEn: 'Fattoush Salad',
      descriptionAr: 'سلطة فتوش لبنانية',
      descriptionEn: 'Lebanese fattoush salad',
      price: 15,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
      category: 'salads',
      popular: false
    }
  ],
  rest3: [
    {
      id: 'item8',
      nameAr: 'بيتزا مارغريتا',
      nameEn: 'Margherita Pizza',
      descriptionAr: 'بيتزا كلاسيكية مع الجبنة والريحان',
      descriptionEn: 'Classic pizza with cheese and basil',
      price: 30,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop',
      category: 'pizza',
      popular: true
    },
    {
      id: 'item9',
      nameAr: 'بيتزا بيبروني',
      nameEn: 'Pepperoni Pizza',
      descriptionAr: 'بيتزا مع شرائح البيبروني',
      descriptionEn: 'Pizza with pepperoni slices',
      price: 38,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=200&fit=crop',
      category: 'pizza',
      popular: true
    }
  ]
};

export const mockDeliveryOrders = [
  {
    id: 'order1',
    restaurantId: 'rest1',
    restaurant: mockRestaurants[0],
    customerId: 'user1',
    items: [
      { ...mockMenuItems.rest1[0], quantity: 2 },
      { ...mockMenuItems.rest1[2], quantity: 1 }
    ],
    status: 'preparing', // preparing, ready, picked_up, delivered
    totalPrice: 44,
    deliveryFee: 5,
    deliveryAddress: {
      addressAr: 'شارع الملك فهد، الرياض',
      addressEn: 'King Fahd Road, Riyadh',
      lat: 24.7136,
      lng: 46.6753
    },
    restaurantAddress: {
      addressAr: 'حي العليا، الرياض',
      addressEn: 'Al Olaya District, Riyadh',
      lat: 24.7236,
      lng: 46.6853
    },
    orderTime: new Date().toISOString(),
    estimatedDelivery: '25-35',
    paymentMethod: 'cash'
  }
];