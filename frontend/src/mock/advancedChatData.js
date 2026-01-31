// Enhanced Mock data for Advanced Chat System

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
    bioEn: 'Active rider on TransVerse',
    isVerified: true,
    isPremium: true,
    twoStepVerification: true
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
    bioEn: 'Professional driver',
    isVerified: true
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
  },
  {
    id: 'user5',
    name: 'نورة السعيد',
    nameEn: 'Noura Al-Saeed',
    username: 'noura_saeed',
    userId: 'TV33333',
    phone: '+966501234571',
    email: 'noura@example.com',
    photo: 'https://randomuser.me/api/portraits/women/2.jpg',
    status: 'online',
    lastSeen: new Date().toISOString(),
    bio: 'مستخدمة نشطة',
    bioEn: 'Active user'
  }
];

export const mockGroups = [
  {
    id: 'group1',
    name: 'سائقي ترانسفيرز',
    nameEn: 'TransVerse Drivers',
    type: 'group',
    photo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=200&fit=crop',
    members: ['user1', 'user2', 'user4'],
    admins: ['user2'],
    creator: 'user2',
    description: 'مجموعة سائقي ترانسفيرز',
    descriptionEn: 'TransVerse drivers group',
    memberCount: 150,
    isPublic: true,
    canSendMessages: true,
    createdAt: '2024-01-01'
  },
  {
    id: 'channel1',
    name: 'أخبار ترانسفيرز',
    nameEn: 'TransVerse News',
    type: 'channel',
    photo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=200&h=200&fit=crop',
    members: ['user1', 'user2', 'user3', 'user4', 'user5'],
    admins: ['user1'],
    creator: 'user1',
    description: 'قناة أخبار ترانسفيرز الرسمية',
    descriptionEn: 'Official TransVerse news channel',
    memberCount: 5000,
    isPublic: true,
    canSendMessages: false,
    createdAt: '2024-01-01',
    isVerified: true
  }
];

export const mockConversations = [
  {
    id: 'conv1',
    type: 'private',
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
    updatedAt: new Date(Date.now() - 300000).toISOString(),
    pinned: false,
    muted: false,
    archived: false
  },
  {
    id: 'conv2',
    type: 'private',
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
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    pinned: true,
    muted: false
  },
  {
    id: 'group1',
    type: 'group',
    group: mockGroups[0],
    lastMessage: {
      id: 'msg3',
      senderId: 'user2',
      senderName: 'أحمد محمد',
      text: 'مرحباً بالجميع!',
      textEn: 'Welcome everyone!',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: true
    },
    unreadCount: 5,
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    pinned: false,
    muted: false
  },
  {
    id: 'channel1',
    type: 'channel',
    channel: mockGroups[1],
    lastMessage: {
      id: 'msg4',
      senderId: 'user1',
      text: 'تحديث جديد متاح الآن!',
      textEn: 'New update available now!',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    pinned: true,
    muted: false
  }
];

export const messageTypes = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video',
  AUDIO: 'audio',
  VOICE: 'voice',
  FILE: 'file',
  LOCATION: 'location',
  CONTACT: 'contact',
  STICKER: 'sticker',
  GIF: 'gif',
  POLL: 'poll'
};

export const mockMessages = {
  conv1: [
    {
      id: 'msg1-1',
      senderId: 'user1',
      type: 'text',
      text: 'مرحباً! هل يمكنك قبول الرحلة؟',
      textEn: 'Hello! Can you accept the ride?',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      read: true,
      edited: false,
      deleted: false
    },
    {
      id: 'msg1-2',
      senderId: 'user2',
      type: 'text',
      text: 'نعم بالتأكيد، أنا في الطريق',
      textEn: 'Yes sure, I\'m on my way',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      read: true
    },
    {
      id: 'msg1-3',
      senderId: 'user1',
      type: 'image',
      text: 'هذا موقعي الحالي',
      textEn: 'This is my current location',
      media: {
        url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=300&fit=crop',
        thumbnail: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=100&h=75&fit=crop',
        type: 'image',
        size: '2.5 MB'
      },
      timestamp: new Date(Date.now() - 450000).toISOString(),
      read: true
    },
    {
      id: 'msg1-4',
      senderId: 'user2',
      type: 'voice',
      text: 'رسالة صوتية',
      textEn: 'Voice message',
      media: {
        duration: 15,
        type: 'voice'
      },
      timestamp: new Date(Date.now() - 350000).toISOString(),
      read: true
    },
    {
      id: 'msg1-5',
      senderId: 'user2',
      type: 'text',
      text: 'شكراً على الرحلة!',
      textEn: 'Thanks for the ride!',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: true
    }
  ],
  group1: [
    {
      id: 'grp1-1',
      senderId: 'user2',
      senderName: 'أحمد محمد',
      senderPhoto: mockUsers[1].photo,
      type: 'text',
      text: 'مرحباً بالجميع في المجموعة!',
      textEn: 'Welcome everyone to the group!',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: true
    },
    {
      id: 'grp1-2',
      senderId: 'user4',
      senderName: 'خالد العتيبي',
      senderPhoto: mockUsers[3].photo,
      type: 'text',
      text: 'شكراً على الإضافة',
      textEn: 'Thanks for adding',
      timestamp: new Date(Date.now() - 2400000).toISOString(),
      read: true
    },
    {
      id: 'grp1-3',
      senderId: 'user2',
      senderName: 'أحمد محمد',
      senderPhoto: mockUsers[1].photo,
      type: 'poll',
      text: 'ما رأيكم في الخدمة الجديدة؟',
      textEn: 'What do you think about the new service?',
      poll: {
        question: 'ما رأيكم في الخدمة الجديدة؟',
        questionEn: 'What do you think about the new service?',
        options: [
          { id: 1, text: 'ممتازة', textEn: 'Excellent', votes: 45 },
          { id: 2, text: 'جيدة', textEn: 'Good', votes: 30 },
          { id: 3, text: 'تحتاج تحسين', textEn: 'Needs improvement', votes: 15 }
        ],
        totalVotes: 90,
        isAnonymous: false
      },
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      read: true
    }
  ]
};

export const mockStickers = [
  {
    id: 'sticker1',
    pack: 'مشاعر',
    packEn: 'Emotions',
    url: '😊',
    emoji: '😊'
  },
  {
    id: 'sticker2',
    pack: 'مشاعر',
    packEn: 'Emotions',
    url: '😂',
    emoji: '😂'
  },
  {
    id: 'sticker3',
    pack: 'مشاعر',
    packEn: 'Emotions',
    url: '❤️',
    emoji: '❤️'
  },
  {
    id: 'sticker4',
    pack: 'مشاعر',
    packEn: 'Emotions',
    url: '👍',
    emoji: '👍'
  }
];

export const mockGifs = [
  {
    id: 'gif1',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI6SIIHBdRxXI40/giphy.gif',
    thumbnail: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oEjI6SIIHBdRxXI40/100.gif',
    title: 'Happy'
  },
  {
    id: 'gif2',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u4cqiYI30juCOGY/giphy.gif',
    thumbnail: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkwYWJjZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u4cqiYI30juCOGY/100.gif',
    title: 'Thumbs Up'
  }
];

export const chatThemes = [
  { id: 'default', name: 'الافتراضي', nameEn: 'Default', colors: { primary: '#3B82F6', background: '#FFFFFF' } },
  { id: 'dark', name: 'داكن', nameEn: 'Dark', colors: { primary: '#1F2937', background: '#111827' } },
  { id: 'green', name: 'أخضر', nameEn: 'Green', colors: { primary: '#10B981', background: '#FFFFFF' } },
  { id: 'purple', name: 'بنفسجي', nameEn: 'Purple', colors: { primary: '#8B5CF6', background: '#FFFFFF' } },
  { id: 'pink', name: 'وردي', nameEn: 'Pink', colors: { primary: '#EC4899', background: '#FFFFFF' } }
];