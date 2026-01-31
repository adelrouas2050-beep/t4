import React, { createContext, useContext, useState } from 'react';
import { mockConversations, mockMessages, mockUsers } from '../mock/chatData';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);
  const [activeConversation, setActiveConversation] = useState(null);

  const searchUserById = (userId) => {
    return mockUsers.find(user => user.userId === userId);
  };

  const searchUserByUsername = (username) => {
    return mockUsers.find(user => 
      user.username.toLowerCase().includes(username.toLowerCase()) ||
      user.name.includes(username) ||
      user.nameEn.toLowerCase().includes(username.toLowerCase())
    );
  };

  const getOrCreateConversation = (otherUserId) => {
    // Check if conversation exists
    const existingConv = conversations.find(conv => 
      conv.participants.includes(otherUserId)
    );

    if (existingConv) {
      return existingConv;
    }

    // Create new conversation
    const otherUser = mockUsers.find(u => u.id === otherUserId);
    if (!otherUser) return null;

    const newConv = {
      id: 'conv_' + Date.now(),
      participants: ['user1', otherUserId],
      otherUser,
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString()
    };

    setConversations([newConv, ...conversations]);
    setMessages({ ...messages, [newConv.id]: [] });
    return newConv;
  };

  const sendMessage = (conversationId, text, textEn) => {
    const newMessage = {
      id: 'msg_' + Date.now(),
      senderId: 'user1',
      text,
      textEn,
      timestamp: new Date().toISOString(),
      read: false
    };

    // Add message to conversation
    setMessages({
      ...messages,
      [conversationId]: [...(messages[conversationId] || []), newMessage]
    });

    // Update conversation last message
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

  return (
    <ChatContext.Provider value={{
      conversations,
      messages,
      activeConversation,
      setActiveConversation,
      searchUserById,
      searchUserByUsername,
      getOrCreateConversation,
      sendMessage,
      markAsRead,
      getTotalUnreadCount
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;