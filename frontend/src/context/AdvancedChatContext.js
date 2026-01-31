import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockConversations, mockMessages, mockUsers, mockGroups, mockStickers, mockGifs, mockStories, mockCloudFiles } from '../mock/advancedChatData';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const AdvancedChatContext = createContext();

export const useAdvancedChat = () => {
  const context = useContext(AdvancedChatContext);
  if (!context) {
    throw new Error('useAdvancedChat must be used within an AdvancedChatProvider');
  }
  return context;
};

// Test accounts that can see demo data
const TEST_ACCOUNTS = [
  'test@test.com',
  'admin@transfers.com',
  'rider@transfers.com',
  'driver@transfers.com'
];

export const AdvancedChatProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Check if current user is a test account
  const isTestAccount = user?.email && TEST_ACCOUNTS.includes(user.email.toLowerCase());
  
  // Initialize with empty data for new users, mock data for test accounts
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeConversation, setActiveConversation] = useState(null);
  const [folders, setFolders] = useState(['All', 'Personal', 'Groups', 'Channels', 'Archived']);
  const [activeFolder, setActiveFolder] = useState('All');
  const [secretChats, setSecretChats] = useState([]);
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [theme, setTheme] = useState('default');
  const [appLocked, setAppLocked] = useState(false);
  const [callInProgress, setCallInProgress] = useState(null);
  
  // Stories state
  const [stories, setStories] = useState([]);
  const [myStories, setMyStories] = useState([]);
  
  // Cloud Storage state
  const [cloudFiles, setCloudFiles] = useState([]);

  // Load appropriate data based on user type
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.userId && !user?.id) {
        // No user logged in
        setConversations([]);
        setMessages({});
        return;
      }

      const userId = user.userId || user.id;
      
      // جلب المحادثات من قاعدة البيانات
      try {
        const response = await fetch(`${API_URL}/api/chat/conversations/${userId}`);
        if (response.ok) {
          const dbConversations = await response.json();
          if (dbConversations.length > 0) {
            // المحادثات تأتي مع otherUser من الـ Backend
            setConversations(dbConversations);
            
            // جلب الرسائل لكل محادثة
            const messagesObj = {};
            for (const conv of dbConversations) {
              const msgResponse = await fetch(`${API_URL}/api/chat/messages/${conv.id}`);
              if (msgResponse.ok) {
                const msgs = await msgResponse.json();
                // تحويل الرسائل للشكل المطلوب
                messagesObj[conv.id] = msgs.map(m => ({
                  ...m,
                  text: m.content,
                  timestamp: m.createdAt
                }));
              }
            }
            setMessages(messagesObj);
            return;
          }
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      }

      // إذا لم توجد محادثات في قاعدة البيانات، استخدم البيانات التجريبية للحسابات التجريبية
      if (isTestAccount) {
        setConversations(mockConversations);
        setMessages(mockMessages);
        setStories(mockStories);
        setCloudFiles(mockCloudFiles);
      } else {
        setConversations([]);
        setMessages({});
        setStories([]);
        setCloudFiles([]);
      }
    };

    loadUserData();
  }, [isTestAccount, user]);

  const searchUserById = async (userId) => {
    // أولاً البحث في mock users للتوافق مع البيانات الموجودة
    const mockUser = mockUsers.find(user => user.userId === userId || user.userId?.toUpperCase() === userId?.toUpperCase());
    if (mockUser) return mockUser;
    
    // البحث في قاعدة البيانات
    try {
      const response = await fetch(`${API_URL}/api/auth/user/${userId}`);
      if (response.ok) {
        const userData = await response.json();
        return userData;
      }
    } catch (error) {
      console.error('Error searching user:', error);
    }
    return null;
  };

  // دالة جديدة للبحث عن المستخدمين
  const searchUsers = async (query) => {
    if (!query || query.length < 2) return [];
    
    try {
      const response = await fetch(`${API_URL}/api/auth/search-users?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        return data.users || [];
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
    return [];
  };

  const getOrCreateConversation = async (otherUserId, otherUserData = null) => {
    const existingConv = conversations.find(conv => 
      conv.type === 'private' && conv.participants.includes(otherUserId)
    );

    if (existingConv) return existingConv;

    // البحث في mock users أولاً
    let otherUser = mockUsers.find(u => u.id === otherUserId || u.userId === otherUserId);
    
    // إذا لم يوجد في mock، استخدم البيانات المرسلة
    if (!otherUser && otherUserData) {
      otherUser = otherUserData;
    }
    
    if (!otherUser) return null;

    const userId = user?.userId || user?.id || 'user1';

    // حفظ في قاعدة البيانات أولاً للحصول على ID الصحيح
    let convId = 'conv_' + Date.now();
    try {
      const response = await fetch(`${API_URL}/api/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'private',
          participants: [userId, otherUserId],
          createdBy: userId
        })
      });
      if (response.ok) {
        const savedConv = await response.json();
        convId = savedConv.id; // استخدام ID من قاعدة البيانات
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }

    const newConv = {
      id: convId,
      type: 'private',
      participants: [userId, otherUserId],
      otherUser,
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      pinned: false,
      muted: false,
      archived: false
    };

    setConversations([newConv, ...conversations]);
    setMessages({ ...messages, [newConv.id]: [] });

    return newConv;
  };

  const createGroup = (name, nameEn, memberIds, isPublic = true) => {
    const newGroup = {
      id: 'group_' + Date.now(),
      name,
      nameEn,
      type: 'group',
      photo: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
      members: ['user1', ...memberIds],
      admins: ['user1'],
      creator: 'user1',
      description: '',
      memberCount: memberIds.length + 1,
      isPublic,
      canSendMessages: true,
      createdAt: new Date().toISOString()
    };

    const newConv = {
      id: newGroup.id,
      type: 'group',
      group: newGroup,
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      pinned: false,
      muted: false
    };

    setConversations([newConv, ...conversations]);
    setMessages({ ...messages, [newGroup.id]: [] });
    return newGroup;
  };

  const createChannel = (name, nameEn, isPublic = true) => {
    const newChannel = {
      id: 'channel_' + Date.now(),
      name,
      nameEn,
      type: 'channel',
      photo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200&h=200&fit=crop',
      members: ['user1'],
      admins: ['user1'],
      creator: 'user1',
      description: '',
      memberCount: 1,
      isPublic,
      canSendMessages: false,
      createdAt: new Date().toISOString(),
      isVerified: false
    };

    const newConv = {
      id: newChannel.id,
      type: 'channel',
      channel: newChannel,
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      pinned: false,
      muted: false
    };

    setConversations([newConv, ...conversations]);
    setMessages({ ...messages, [newChannel.id]: [] });
    return newChannel;
  };

  const sendMessage = async (conversationId, messageData) => {
    const userId = user?.userId || user?.id || 'user1';
    const userName = user?.name || 'مستخدم';
    
    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId: userId,
      senderName: userName,
      ...messageData,
      timestamp: new Date().toISOString(),
      read: false,
      edited: false,
      deleted: false
    };

    // تحديث الحالة المحلية فوراً
    setMessages({
      ...messages,
      [conversationId]: [...(messages[conversationId] || []), newMessage]
    });

    setConversations(conversations.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          lastMessage: newMessage,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    }));

    // حفظ في قاعدة البيانات
    try {
      await fetch(`${API_URL}/api/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          senderId: userId,
          senderName: userName,
          content: messageData.content || messageData.text || '',
          type: messageData.type || 'text',
          fileUrl: messageData.fileUrl,
          fileName: messageData.fileName,
          replyTo: messageData.replyTo?.id
        })
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }

    return newMessage;
  };

  const scheduleMessage = (conversationId, messageData, scheduledTime) => {
    const scheduled = {
      id: 'scheduled_' + Date.now(),
      conversationId,
      messageData,
      scheduledTime,
      status: 'pending'
    };
    setScheduledMessages([...scheduledMessages, scheduled]);
    return scheduled;
  };

  const createSecretChat = (otherUserId) => {
    const secretChat = {
      id: 'secret_' + Date.now(),
      participants: ['user1', otherUserId],
      otherUser: mockUsers.find(u => u.id === otherUserId),
      selfDestructTimer: 0,
      encrypted: true,
      createdAt: new Date().toISOString()
    };
    setSecretChats([...secretChats, secretChat]);
    return secretChat;
  };

  const startCall = (conversationId, type = 'voice') => {
    const call = {
      id: 'call_' + Date.now(),
      conversationId,
      type,
      status: 'calling',
      startedAt: new Date().toISOString()
    };
    setCallInProgress(call);
    return call;
  };

  const endCall = () => {
    if (callInProgress) {
      setCallInProgress({
        ...callInProgress,
        status: 'ended',
        endedAt: new Date().toISOString()
      });
      setTimeout(() => setCallInProgress(null), 1000);
    }
  };

  const togglePin = (conversationId) => {
    setConversations(conversations.map(conv => 
      conv.id === conversationId ? { ...conv, pinned: !conv.pinned } : conv
    ));
  };

  const toggleMute = (conversationId) => {
    setConversations(conversations.map(conv => 
      conv.id === conversationId ? { ...conv, muted: !conv.muted } : conv
    ));
  };

  const archiveConversation = (conversationId) => {
    setConversations(conversations.map(conv => 
      conv.id === conversationId ? { ...conv, archived: true } : conv
    ));
  };

  const unarchiveConversation = (conversationId) => {
    setConversations(conversations.map(conv => 
      conv.id === conversationId ? { ...conv, archived: false } : conv
    ));
  };

  const deleteConversation = (conversationId) => {
    setConversations(conversations.filter(conv => conv.id !== conversationId));
    const newMessages = { ...messages };
    delete newMessages[conversationId];
    setMessages(newMessages);
  };

  const editMessage = (conversationId, messageId, newText, newTextEn) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: prev[conversationId]?.map(msg => 
        msg.id === messageId 
          ? { ...msg, text: newText, textEn: newTextEn, edited: true, editedAt: new Date().toISOString() }
          : msg
      ) || []
    }));
  };

  const deleteMessage = async (conversationId, messageId, deleteForBoth = false) => {
    // حذف من قاعدة البيانات
    try {
      await fetch(`${API_URL}/api/chat/messages/${messageId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting message from database:', error);
    }

    if (deleteForBoth) {
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId]?.filter(msg => msg.id !== messageId) || []
      }));
    } else {
      setMessages(prev => ({
        ...prev,
        [conversationId]: prev[conversationId]?.map(msg => 
          msg.id === messageId 
            ? { ...msg, deleted: true, text: 'تم حذف هذه الرسالة', textEn: 'This message was deleted' }
            : msg
        ) || []
      }));
    }
    
    // Update last message if needed
    const convMessages = messages[conversationId]?.filter(msg => msg.id !== messageId) || [];
    if (convMessages.length > 0) {
      const lastMsg = convMessages[convMessages.length - 1];
      setConversations(conversations.map(conv => 
        conv.id === conversationId ? { ...conv, lastMessage: lastMsg } : conv
      ));
    }
  };

  // Stories functions
  const addStory = (storyData) => {
    const newStory = {
      id: 'story_' + Date.now(),
      userId: 'user1',
      user: mockUsers[0],
      ...storyData,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      views: [],
      viewCount: 0
    };
    setMyStories(prev => [...prev, newStory]);
    return newStory;
  };

  const viewStory = (storyId, viewerId) => {
    setStories(prev => prev.map(userStories => ({
      ...userStories,
      stories: userStories.stories.map(story => 
        story.id === storyId && !story.views.includes(viewerId)
          ? { ...story, views: [...story.views, viewerId], viewCount: story.viewCount + 1 }
          : story
      )
    })));
  };

  const deleteStory = (storyId) => {
    setMyStories(prev => prev.filter(story => story.id !== storyId));
  };

  const getActiveStories = () => {
    const now = new Date();
    return stories.filter(userStories => 
      userStories.stories.some(story => new Date(story.expiresAt) > now)
    );
  };

  // Cloud Storage functions
  const uploadFile = (fileData) => {
    const newFile = {
      id: 'file_' + Date.now(),
      ...fileData,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'user1'
    };
    setCloudFiles(prev => [...prev, newFile]);
    return newFile;
  };

  const deleteFile = (fileId) => {
    setCloudFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const getCloudFiles = (type = null) => {
    if (!type) return cloudFiles;
    return cloudFiles.filter(file => file.type === type);
  };

  const getStorageUsed = () => {
    return cloudFiles.reduce((total, file) => total + (file.size || 0), 0);
  };

  const markAsRead = (conversationId) => {
    setConversations(conversations.map(conv => {
      if (conv.id === conversationId) {
        return { ...conv, unreadCount: 0 };
      }
      return conv;
    }));
  };

  const getTotalUnreadCount = () => {
    return conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  };

  const getFilteredConversations = () => {
    let filtered = conversations;
    
    if (activeFolder === 'Archived') {
      filtered = filtered.filter(conv => conv.archived);
    } else {
      filtered = filtered.filter(conv => !conv.archived);
      
      if (activeFolder === 'Personal') {
        filtered = filtered.filter(conv => conv.type === 'private');
      } else if (activeFolder === 'Groups') {
        filtered = filtered.filter(conv => conv.type === 'group');
      } else if (activeFolder === 'Channels') {
        filtered = filtered.filter(conv => conv.type === 'channel');
      }
    }
    
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  };

  const getArchivedCount = () => {
    return conversations.filter(conv => conv.archived).length;
  };

  return (
    <AdvancedChatContext.Provider value={{
      conversations,
      messages,
      activeConversation,
      setActiveConversation,
      folders,
      activeFolder,
      setActiveFolder,
      theme,
      setTheme,
      appLocked,
      setAppLocked,
      callInProgress,
      searchUserById,
      searchUsers,
      getOrCreateConversation,
      createGroup,
      createChannel,
      sendMessage,
      scheduleMessage,
      createSecretChat,
      startCall,
      endCall,
      togglePin,
      toggleMute,
      archiveConversation,
      unarchiveConversation,
      deleteConversation,
      editMessage,
      deleteMessage,
      markAsRead,
      getTotalUnreadCount,
      getFilteredConversations,
      getArchivedCount,
      // Stories
      stories,
      myStories,
      addStory,
      viewStory,
      deleteStory,
      getActiveStories,
      // Cloud Storage
      cloudFiles,
      uploadFile,
      deleteFile,
      getCloudFiles,
      getStorageUsed,
      stickers: mockStickers,
      gifs: mockGifs
    }}>
      {children}
    </AdvancedChatContext.Provider>
  );
};

export default AdvancedChatContext;