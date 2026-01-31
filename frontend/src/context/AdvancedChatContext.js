import React, { createContext, useContext, useState } from 'react';
import { mockConversations, mockMessages, mockUsers, mockGroups, mockStickers, mockGifs } from '../mock/advancedChatData';

const AdvancedChatContext = createContext();

export const useAdvancedChat = () => {
  const context = useContext(AdvancedChatContext);
  if (!context) {
    throw new Error('useAdvancedChat must be used within an AdvancedChatProvider');
  }
  return context;
};

export const AdvancedChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [activeConversation, setActiveConversation] = useState(null);
  const [folders, setFolders] = useState(['All', 'Personal', 'Groups', 'Channels']);
  const [activeFolder, setActiveFolder] = useState('All');
  const [secretChats, setSecretChats] = useState([]);
  const [scheduledMessages, setScheduledMessages] = useState([]);
  const [theme, setTheme] = useState('default');
  const [appLocked, setAppLocked] = useState(false);
  const [callInProgress, setCallInProgress] = useState(null);

  const searchUserById = (userId) => {
    return mockUsers.find(user => user.userId === userId);
  };

  const getOrCreateConversation = (otherUserId) => {
    const existingConv = conversations.find(conv => 
      conv.type === 'private' && conv.participants.includes(otherUserId)
    );

    if (existingConv) return existingConv;

    const otherUser = mockUsers.find(u => u.id === otherUserId);
    if (!otherUser) return null;

    const newConv = {
      id: 'conv_' + Date.now(),
      type: 'private',
      participants: ['user1', otherUserId],
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

  const sendMessage = (conversationId, messageData) => {
    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId: 'user1',
      ...messageData,
      timestamp: new Date().toISOString(),
      read: false,
      edited: false,
      deleted: false
    };

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

  const deleteConversation = (conversationId) => {
    setConversations(conversations.filter(conv => conv.id !== conversationId));
    const newMessages = { ...messages };
    delete newMessages[conversationId];
    setMessages(newMessages);
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
    let filtered = conversations.filter(conv => !conv.archived);
    
    if (activeFolder === 'Personal') {
      filtered = filtered.filter(conv => conv.type === 'private');
    } else if (activeFolder === 'Groups') {
      filtered = filtered.filter(conv => conv.type === 'group');
    } else if (activeFolder === 'Channels') {
      filtered = filtered.filter(conv => conv.type === 'channel');
    }
    
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
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
      deleteConversation,
      markAsRead,
      getTotalUnreadCount,
      getFilteredConversations,
      stickers: mockStickers,
      gifs: mockGifs
    }}>
      {children}
    </AdvancedChatContext.Provider>
  );
};

export default AdvancedChatContext;