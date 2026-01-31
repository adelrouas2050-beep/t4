// Mock data for Chat System

export const mockUsers = [
  {
    id: 'user1',
    name: 'محمد أحمد',
    nameEn: 'Mohammed Ahmed',
    username: 'mohammed_ahmed',
    userId: 'TV12345',
    phone: '+966501234567',
    email: 'mohammed@example.com',
    photo: 'https://randomuser.me/api/portraits/men/10.jpg',
    status: 'online',
    lastSeen: new Date().toISOString(),
    bio: 'راكب نشيط في ترانسفيرز',
    bioEn: 'Active rider on TransVerse'
  },
  {
    id: 'user2',
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohammed',
    username: 'ahmed_driver',
    userId: 'TV67890',
    phone: '+966501234568',
    email: 'ahmed@example.com',
    photo: 'https://randomuser.me/api/portraits/men/1.jpg',
    status: 'online',
    lastSeen: new Date().toISOString(),
    bio: 'سائق محترف',
    bioEn: 'Professional driver'
  },
  {
    id: 'user3',
    name: 'فاطمة علي',
    nameEn: 'Fatima Ali',
    username: 'fatima_ali',
    userId: 'TV11111',
    phone: '+966501234569',
    email: 'fatima@example.com',
    photo: 'https://randomuser.me/api/portraits/women/1.jpg',
    status: 'offline',
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    bio: 'أحب استخدام ترانسفيرز',
    bioEn: 'Love using TransVerse'
  },
  {
    id: 'user4',
    name: 'خالد العتيبي',
    nameEn: 'Khaled Al-Otaibi',
    username: 'khaled_otaibi',
    userId: 'TV22222',
    phone: '+966501234570',
    email: 'khaled@example.com',
    photo: 'https://randomuser.me/api/portraits/men/2.jpg',
    status: 'online',
    lastSeen: new Date().toISOString(),
    bio: 'سائق وموصل',
    bioEn: 'Driver and courier'
  }
];

export const mockConversations = [
  {
    id: 'conv1',
    participants: ['user1', 'user2'],
    otherUser: mockUsers[1],
    lastMessage: {
      id: 'msg1',
      senderId: 'user2',
      text: 'شكراً على الرحلة!',
      textEn: 'Thanks for the ride!',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: true
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 'conv2',
    participants: ['user1', 'user4'],
    otherUser: mockUsers[3],
    lastMessage: {
      id: 'msg2',
      senderId: 'user4',
      text: 'وصلت بسلامة',
      textEn: 'Arrived safely',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 7200000).toISOString()
  }
];

export const mockMessages = {
  conv1: [
    {
      id: 'msg1-1',
      senderId: 'user1',
      text: 'مرحباً! هل يمكنك قبول الرحلة؟',
      textEn: 'Hello! Can you accept the ride?',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      read: true
    },
    {
      id: 'msg1-2',
      senderId: 'user2',
      text: 'نعم بالتأكيد، أنا في الطريق',
      textEn: 'Yes sure, I\'m on my way',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      read: true
    },
    {
      id: 'msg1-3',
      senderId: 'user1',
      text: 'رائع! في انتظارك',
      textEn: 'Great! Waiting for you',
      timestamp: new Date(Date.now() - 400000).toISOString(),
      read: true
    },
    {
      id: 'msg1-4',
      senderId: 'user2',
      text: 'شكراً على الرحلة!',
      textEn: 'Thanks for the ride!',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: true
    }
  ],
  conv2: [
    {
      id: 'msg2-1',
      senderId: 'user1',
      text: 'الطلب في الطريق',
      textEn: 'Order is on the way',
      timestamp: new Date(Date.now() - 7500000).toISOString(),
      read: true
    },
    {
      id: 'msg2-2',
      senderId: 'user4',
      text: 'ممتاز، شكراً',
      textEn: 'Perfect, thank you',
      timestamp: new Date(Date.now() - 7300000).toISOString(),
      read: true
    },
    {
      id: 'msg2-3',
      senderId: 'user4',
      text: 'وصلت بسلامة',
      textEn: 'Arrived safely',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false
    }
  ]
};