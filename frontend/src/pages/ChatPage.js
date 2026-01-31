import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import EmojiPicker from 'emoji-picker-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../components/ui/dropdown-menu';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useChat } from '../context/ChatContext';
import { 
  ArrowLeft, Send, Search, MessageCircle, User, 
  Menu, Clock, Check, CheckCheck,
  UserPlus, MoreVertical, Reply, Copy,
  Trash2, Edit2, Pin, Image as ImageIcon,
  Paperclip, Smile, Mic, X, Phone, Video,
  BellOff, Settings, Moon, Archive, Bookmark,
  Home, Bell, Palette, UserX, Users, ChevronLeft,
  PinOff, Volume2, VolumeX, ImageOff, Forward, Square, CheckSquare
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const ChatPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t, language } = useLanguage();
  const { 
    conversations, 
    messages,
    activeConversation,
    setActiveConversation,
    searchUserById,
    getOrCreateConversation,
    sendMessage,
    markAsRead,
    getTotalUnreadCount
  } = useChat();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [searchInChat, setSearchInChat] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [clearHistoryDialog, setClearHistoryDialog] = useState(false);
  const [deleteConversationDialog, setDeleteConversationDialog] = useState(false);
  const [pinnedConversations, setPinnedConversations] = useState([]);
  const [mutedConversations, setMutedConversations] = useState([]);
  const [archivedConversations, setArchivedConversations] = useState([]);
  const [chatBackground, setChatBackground] = useState('default');
  // New states for selection mode
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [longPressedConv, setLongPressedConv] = useState(null);
  const [convActionMenu, setConvActionMenu] = useState({ show: false, x: 0, y: 0, convId: null });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const longPressTimer = useRef(null);
  const MAX_PINNED = 5;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation, messages]);

  useEffect(() => {
    if (activeConversation) {
      markAsRead(activeConversation.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?.id]);

  useEffect(() => {
    if (messageText) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [messageText]);

  const handleSearchUser = () => {
    if (!searchQuery.trim()) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('الرجاء إدخال ID المستخدم', 'Please enter user ID'),
        variant: 'destructive'
      });
      return;
    }

    const foundUser = searchUserById(searchQuery.toUpperCase());
    if (foundUser) {
      const conv = getOrCreateConversation(foundUser.id);
      if (conv) {
        setActiveConversation(conv);
        setSearchDialogOpen(false);
        setSearchQuery('');
        toast({
          title: t('تم العثور على المستخدم', 'User Found'),
          description: language === 'ar' ? foundUser.name : foundUser.nameEn
        });
      }
    } else {
      toast({
        title: t('لم يتم العثور', 'Not Found'),
        description: t('لا يوجد مستخدم بهذا الـ ID', 'No user with this ID'),
        variant: 'destructive'
      });
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;

    if (editingMessage) {
      toast({
        title: t('تم التعديل', 'Message Edited'),
        description: t('تم تعديل الرسالة بنجاح', 'Message edited successfully')
      });
      setEditingMessage(null);
    } else {
      sendMessage(activeConversation.id, messageText, messageText, replyingTo);
    }
    
    setMessageText('');
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('تم النسخ', 'Copied'),
      description: t('تم نسخ الرسالة', 'Message copied')
    });
  };

  const handleDeleteMessage = (messageId) => {
    toast({
      title: t('تم الحذف', 'Deleted'),
      description: t('تم حذف الرسالة', 'Message deleted')
    });
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setMessageText(language === 'ar' ? message.text : message.textEn);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: t('تم الإرسال', 'Sent'),
        description: t('تم إرسال الصورة', 'Image sent')
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({
        title: t('تم الإرسال', 'Sent'),
        description: t('تم إرسال الملف', 'File sent')
      });
    }
  };

  const handleVoiceRecord = () => {
    toast({
      title: t('قريباً', 'Coming Soon'),
      description: t('ميزة الرسائل الصوتية قريباً', 'Voice messages coming soon')
    });
  };

  // Pin/Unpin conversation with max limit
  const handlePinConversation = (convId) => {
    if (pinnedConversations.includes(convId)) {
      setPinnedConversations(prev => prev.filter(id => id !== convId));
      toast({
        title: t('تم إلغاء التثبيت', 'Unpinned'),
        description: t('تم إلغاء تثبيت المحادثة', 'Conversation unpinned')
      });
    } else {
      if (pinnedConversations.length >= MAX_PINNED) {
        toast({
          title: t('حد التثبيت', 'Pin Limit'),
          description: t(`لا يمكن تثبيت أكثر من ${MAX_PINNED} محادثات`, `Cannot pin more than ${MAX_PINNED} conversations`),
          variant: 'destructive'
        });
        return;
      }
      setPinnedConversations(prev => [...prev, convId]);
      toast({
        title: t('تم التثبيت', 'Pinned'),
        description: t('تم تثبيت المحادثة في الأعلى', 'Conversation pinned to top')
      });
    }
    setConvActionMenu({ show: false, x: 0, y: 0, convId: null });
  };

  // Mute/Unmute conversation
  const handleMuteConversation = (convId) => {
    if (mutedConversations.includes(convId)) {
      setMutedConversations(prev => prev.filter(id => id !== convId));
      toast({
        title: t('تم تشغيل الإشعارات', 'Unmuted'),
        description: t('سيتم إشعارك بالرسائل الجديدة', 'You will receive notifications')
      });
    } else {
      setMutedConversations(prev => [...prev, convId]);
      toast({
        title: t('تم كتم الإشعارات', 'Muted'),
        description: t('لن تتلقى إشعارات من هذه المحادثة', 'Notifications muted')
      });
    }
    setConvActionMenu({ show: false, x: 0, y: 0, convId: null });
  };

  // Archive conversation
  const handleArchiveConversation = (convId) => {
    if (archivedConversations.includes(convId)) {
      setArchivedConversations(prev => prev.filter(id => id !== convId));
      toast({
        title: t('تم إلغاء الأرشفة', 'Unarchived'),
        description: t('تم إعادة المحادثة للقائمة الرئيسية', 'Conversation restored')
      });
    } else {
      setArchivedConversations(prev => [...prev, convId]);
      setActiveConversation(null);
      toast({
        title: t('تم الأرشفة', 'Archived'),
        description: t('تم نقل المحادثة للأرشيف', 'Conversation archived')
      });
    }
    setConvActionMenu({ show: false, x: 0, y: 0, convId: null });
  };

  // Long press handlers for conversation
  const handleConvLongPress = (e, convId) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setConvActionMenu({
      show: true,
      x: e.clientX || rect.left + rect.width / 2,
      y: e.clientY || rect.top,
      convId: convId
    });
  };

  const handleConvTouchStart = (e, convId) => {
    longPressTimer.current = setTimeout(() => {
      const touch = e.touches[0];
      setConvActionMenu({
        show: true,
        x: touch.clientX,
        y: touch.clientY,
        convId: convId
      });
    }, 500);
  };

  const handleConvTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Message selection handlers
  const handleMessageLongPress = (msgId) => {
    setSelectionMode(true);
    setSelectedMessages([msgId]);
  };

  const handleMessageSelect = (msgId) => {
    if (selectionMode) {
      setSelectedMessages(prev => 
        prev.includes(msgId) 
          ? prev.filter(id => id !== msgId)
          : [...prev, msgId]
      );
    }
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedMessages([]);
  };

  const handleDeleteSelectedMessages = () => {
    toast({
      title: t('تم الحذف', 'Deleted'),
      description: t(`تم حذف ${selectedMessages.length} رسائل`, `${selectedMessages.length} messages deleted`)
    });
    setSelectionMode(false);
    setSelectedMessages([]);
  };

  const handleForwardSelectedMessages = () => {
    toast({
      title: t('قريباً', 'Coming Soon'),
      description: t('ميزة إعادة التوجيه قريباً', 'Forward feature coming soon')
    });
  };

  // Clear history
  const handleClearHistory = (deleteForBoth) => {
    if (deleteForBoth) {
      toast({
        title: t('تم مسح السجل', 'History Cleared'),
        description: t('تم مسح سجل المحادثة من الطرفين', 'Chat history cleared for both sides')
      });
    } else {
      toast({
        title: t('تم مسح السجل', 'History Cleared'),
        description: t('تم مسح سجل المحادثة من طرفك فقط', 'Chat history cleared from your side only')
      });
    }
    setClearHistoryDialog(false);
  };

  // Delete conversation
  const handleDeleteConversation = (deleteForBoth) => {
    if (deleteForBoth) {
      toast({
        title: t('تم الحذف', 'Deleted'),
        description: t('تم حذف المحادثة من الطرفين', 'Conversation deleted for both sides')
      });
    } else {
      toast({
        title: t('تم الحذف', 'Deleted'),
        description: t('تم حذف المحادثة من طرفك فقط', 'Conversation deleted from your side only')
      });
    }
    setDeleteConversationDialog(false);
    setActiveConversation(null);
  };

  // Change chat background
  const handleChangeBackground = (bg) => {
    setChatBackground(bg);
    toast({
      title: t('تم تغيير الخلفية', 'Background Changed'),
      description: t('تم تغيير خلفية المحادثة', 'Chat background updated')
    });
  };

  // Get background style
  const getBackgroundStyle = () => {
    switch(chatBackground) {
      case 'pattern1':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23232e3c' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#0e1621'
        };
      case 'pattern2':
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23354658' fill-opacity='0.3'%3E%3Ccircle cx='20' cy='20' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#0e1621'
        };
      case 'solid':
        return { backgroundColor: '#0e1621' };
      case 'gradient':
        return { background: 'linear-gradient(135deg, #0e1621 0%, #1a2836 100%)' };
      default:
        return {
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23232e3c' fill-opacity='0.3'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#0e1621'
        };
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return t('الآن', 'Now');
    if (diff < 3600000) return Math.floor(diff / 60000) + t('د', 'm');
    if (diff < 86400000) return date.toLocaleTimeString(language === 'ar' ? 'ar-SA' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
    return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
  };

  const currentMessages = activeConversation ? (messages[activeConversation.id] || []) : [];
  const unreadCount = getTotalUnreadCount();

  const filteredMessages = currentMessages.filter(msg => {
    if (!searchInChat) return true;
    const text = language === 'ar' ? msg.text : msg.textEn;
    return text.toLowerCase().includes(searchInChat.toLowerCase());
  });

  // Filter and sort conversations (pinned first, then archived filtered out, then by last message)
  const filteredConversations = conversations
    .filter(conv => {
      // Filter out archived unless in archive view
      if (archivedConversations.includes(conv.id)) return false;
      if (!sidebarSearch) return true;
      const name = language === 'ar' ? conv.otherUser.name : conv.otherUser.nameEn;
      return name.toLowerCase().includes(sidebarSearch.toLowerCase());
    })
    .sort((a, b) => {
      // Pinned conversations first
      const aPinned = pinnedConversations.includes(a.id);
      const bPinned = pinnedConversations.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      // Then by last message time
      const aTime = a.lastMessage?.timestamp || 0;
      const bTime = b.lastMessage?.timestamp || 0;
      return new Date(bTime) - new Date(aTime);
    });

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#17212b] overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Sidebar */}
      <div className={`${!activeConversation ? 'flex' : 'hidden md:flex'} w-full md:w-[320px] bg-[#17212b] md:border-l border-[#232e3c] flex-col transition-all duration-300 overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="h-[56px] px-3 flex items-center justify-between bg-[#17212b] border-b border-[#232e3c]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-[#17212b] border-[#232e3c] text-white">
              <DropdownMenuItem onClick={() => navigate('/rider')} className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer">
                <Home className="w-5 h-5" />
                {t('الصفحة الرئيسية', 'Home Page')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#232e3c]" />
              <DropdownMenuItem className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer">
                <Bookmark className="w-5 h-5" />
                {t('الرسائل المحفوظة', 'Saved Messages')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer">
                <Archive className="w-5 h-5" />
                {t('الأرشيف', 'Archived')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#232e3c]" />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer">
                <User className="w-5 h-5" />
                {t('الملف الشخصي', 'Profile')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer">
                <Settings className="w-5 h-5" />
                {t('الإعدادات', 'Settings')}
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer">
                <Moon className="w-5 h-5" />
                {t('الوضع الليلي', 'Night Mode')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex-1 mx-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6c7883]" />
              <Input
                placeholder={t('بحث', 'Search')}
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="h-[36px] pr-10 bg-[#242f3d] border-0 text-white placeholder:text-[#6c7883] rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-[#232e3c] rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-[#5288c1]" />
              </div>
              <p className="text-[#8b9eb0] text-sm mb-2">
                {t('لا توجد محادثات', 'No conversations')}
              </p>
              <Button
                onClick={() => setSearchDialogOpen(true)}
                className="mt-4 bg-[#5288c1] hover:bg-[#4a7ab0] text-white"
              >
                <UserPlus className="w-4 h-4 ml-2" />
                {t('بدء محادثة', 'Start Chat')}
              </Button>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => !convActionMenu.show && setActiveConversation(conv)}
                onContextMenu={(e) => handleConvLongPress(e, conv.id)}
                onTouchStart={(e) => handleConvTouchStart(e, conv.id)}
                onTouchEnd={handleConvTouchEnd}
                onTouchMove={handleConvTouchEnd}
                className={`px-3 py-2 cursor-pointer transition-all duration-150 relative ${
                  activeConversation?.id === conv.id 
                    ? 'bg-[#2b5278]' 
                    : 'hover:bg-[#202b36]'
                } ${convActionMenu.convId === conv.id ? 'bg-[#202b36]' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-[54px] h-[54px]">
                      <AvatarImage src={conv.otherUser.photo} />
                      <AvatarFallback className="bg-gradient-to-br from-[#5288c1] to-[#7a5fca] text-white text-lg font-medium">
                        {conv.otherUser.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.otherUser.status === 'online' && (
                      <div className="absolute bottom-0 right-0 w-[14px] h-[14px] bg-[#4dcd5e] border-[3px] border-[#17212b] rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-[2px]">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[15px] text-white truncate">
                          {language === 'ar' ? conv.otherUser.name : conv.otherUser.nameEn}
                        </h3>
                        {mutedConversations.includes(conv.id) && (
                          <VolumeX className="w-4 h-4 text-[#6c7883]" />
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {pinnedConversations.includes(conv.id) && (
                          <Pin className="w-4 h-4 text-[#6c7883]" />
                        )}
                        {conv.lastMessage && (
                          <>
                            {conv.lastMessage.senderId === 'user1' && (
                              <CheckCheck className={`w-[18px] h-[18px] ${conv.lastMessage.read ? 'text-[#4dcd5e]' : 'text-[#6c7883]'}`} />
                            )}
                            <span className="text-[12px] text-[#6c7883]">
                              {formatTime(conv.lastMessage.timestamp)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[14px] text-[#8b9eb0] truncate flex-1 leading-[20px]">
                        {conv.lastMessage 
                          ? (language === 'ar' ? conv.lastMessage.text : conv.lastMessage.textEn)
                          : t('ابدأ المحادثة', 'Start conversation')
                        }
                      </p>
                      {conv.unreadCount > 0 && !mutedConversations.includes(conv.id) && (
                        <Badge className="bg-[#5288c1] hover:bg-[#5288c1] text-white text-[12px] min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-[6px] font-medium mr-1">
                          {conv.unreadCount}
                        </Badge>
                      )}
                      {conv.unreadCount > 0 && mutedConversations.includes(conv.id) && (
                        <Badge className="bg-[#3d4d5c] hover:bg-[#3d4d5c] text-white text-[12px] min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-[6px] font-medium mr-1">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${activeConversation ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#0e1621]`}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="h-[56px] px-4 flex items-center justify-between bg-[#17212b] border-b border-[#232e3c]">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setActiveConversation(null);
                    setShowSidebar(true);
                  }}
                  className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0 md:hidden"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-[42px] h-[42px]">
                  <AvatarImage src={activeConversation.otherUser.photo} />
                  <AvatarFallback className="bg-gradient-to-br from-[#5288c1] to-[#7a5fca] text-white">
                    {activeConversation.otherUser.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-[15px] text-white leading-tight">
                    {language === 'ar' 
                      ? activeConversation.otherUser.name 
                      : activeConversation.otherUser.nameEn
                    }
                  </h2>
                  <p className="text-[13px] text-[#8b9eb0] leading-tight">
                    {isTyping ? (
                      <span className="text-[#5288c1]">{t('يكتب...', 'typing...')}</span>
                    ) : activeConversation.otherUser.status === 'online' 
                      ? <span className="text-[#4dcd5e]">{t('متصل', 'online')}</span>
                      : t('آخر ظهور منذ قليل', 'last seen recently')
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
                >
                  <Phone className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
                >
                  <Video className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
                >
                  <Search className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#17212b] border-[#232e3c] text-white">
                    {/* Search */}
                    <DropdownMenuItem 
                      onSelect={() => setShowSearchInChat(true)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      {t('بحث', 'Search')}
                    </DropdownMenuItem>
                    
                    {/* Mute/Unmute */}
                    <DropdownMenuItem 
                      onSelect={() => handleMuteConversation(activeConversation.id)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      {mutedConversations.includes(activeConversation?.id) ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      {mutedConversations.includes(activeConversation?.id) ? t('تشغيل الإشعارات', 'Unmute') : t('كتم الإشعارات', 'Mute')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-[#232e3c]" />
                    
                    {/* Change Background */}
                    <DropdownMenuItem 
                      onSelect={() => {
                        const backgrounds = ['default', 'pattern2', 'solid', 'gradient'];
                        const currentIndex = backgrounds.indexOf(chatBackground);
                        const nextIndex = (currentIndex + 1) % backgrounds.length;
                        handleChangeBackground(backgrounds[nextIndex]);
                      }}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      <Palette className="w-4 h-4" />
                      {t('تغيير الخلفية', 'Change Background')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-[#232e3c]" />
                    
                    {/* Pin/Unpin */}
                    <DropdownMenuItem 
                      onSelect={() => handlePinConversation(activeConversation.id)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      {pinnedConversations.includes(activeConversation?.id) ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      {pinnedConversations.includes(activeConversation?.id) ? t('إلغاء التثبيت', 'Unpin') : t('تثبيت', 'Pin')}
                    </DropdownMenuItem>
                    
                    {/* Archive */}
                    <DropdownMenuItem 
                      onSelect={() => handleArchiveConversation(activeConversation.id)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      {t('أرشفة', 'Archive')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-[#232e3c]" />
                    
                    {/* Clear History */}
                    <DropdownMenuItem 
                      onSelect={() => setClearHistoryDialog(true)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('مسح السجل', 'Clear History')}
                    </DropdownMenuItem>
                    
                    {/* Delete Conversation */}
                    <DropdownMenuItem 
                      onSelect={() => setDeleteConversationDialog(true)}
                      className="gap-3 text-red-400 hover:text-red-300 hover:bg-[#232e3c] cursor-pointer"
                    >
                      <UserX className="w-4 h-4" />
                      {t('حذف المحادثة', 'Delete Chat')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Search in Chat Bar */}
            {showSearchInChat && (
              <div className="px-4 py-2 bg-[#17212b] border-b border-[#232e3c] flex items-center gap-3">
                <Search className="w-5 h-5 text-[#6c7883]" />
                <Input
                  placeholder={t('البحث في المحادثة...', 'Search in chat...')}
                  value={searchInChat}
                  onChange={(e) => setSearchInChat(e.target.value)}
                  className="flex-1 h-9 bg-[#242f3d] border-0 text-white placeholder:text-[#6c7883] rounded-lg"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSearchInChat(false);
                    setSearchInChat('');
                  }}
                  className="text-[#8b9eb0] hover:text-white h-8 w-8 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 custom-scrollbar"
              style={getBackgroundStyle()}
            >
              {filteredMessages.map((msg, index) => {
                const isOwn = msg.senderId === 'user1';
                const showAvatar = index === 0 || filteredMessages[index - 1].senderId !== msg.senderId;
                const isLastInGroup = index === filteredMessages.length - 1 || filteredMessages[index + 1]?.senderId !== msg.senderId;
                const isSelected = selectedMessages.includes(msg.id);
                
                return (
                  <div
                    key={msg.id}
                    onClick={() => selectionMode && handleMessageSelect(msg.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleMessageLongPress(msg.id);
                    }}
                    onTouchStart={() => {
                      longPressTimer.current = setTimeout(() => {
                        handleMessageLongPress(msg.id);
                      }, 500);
                    }}
                    onTouchEnd={() => {
                      if (longPressTimer.current) clearTimeout(longPressTimer.current);
                    }}
                    onTouchMove={() => {
                      if (longPressTimer.current) clearTimeout(longPressTimer.current);
                    }}
                    className={`flex gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'} group ${
                      isSelected ? 'bg-[#5288c1]/20 rounded-lg' : ''
                    } ${selectionMode ? 'cursor-pointer' : ''}`}
                  >
                    {/* Selection Checkbox */}
                    {selectionMode && (
                      <div className="flex items-center justify-center w-8">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-[#5288c1]" />
                        ) : (
                          <Square className="w-5 h-5 text-[#6c7883]" />
                        )}
                      </div>
                    )}
                    
                    {!isOwn && showAvatar && !selectionMode && (
                      <Avatar className="w-[34px] h-[34px] mt-auto">
                        <AvatarImage src={activeConversation.otherUser.photo} />
                        <AvatarFallback className="bg-gradient-to-br from-[#5288c1] to-[#7a5fca] text-white text-sm">
                          {activeConversation.otherUser.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!isOwn && !showAvatar && !selectionMode && <div className="w-[34px]" />}
                    
                    <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {msg.replyTo && (
                        <div className={`text-[12px] px-3 py-2 mb-1 rounded-xl border-r-2 ${
                          isOwn ? 'bg-[#2b5278]/50 border-[#5288c1]' : 'bg-[#182533] border-[#5288c1]'
                        }`}>
                          <Reply className="w-3 h-3 inline ml-1 text-[#5288c1]" />
                          <span className="text-[#8b9eb0]">
                            {language === 'ar' ? msg.replyTo.text : msg.replyTo.textEn}
                          </span>
                        </div>
                      )}
                      <div
                        className={`relative px-3 py-[6px] shadow-sm ${
                          isOwn
                            ? `bg-[#2b5278] text-white ${isLastInGroup ? 'rounded-[18px] rounded-br-[4px]' : 'rounded-[18px]'}`
                            : `bg-[#182533] text-white ${isLastInGroup ? 'rounded-[18px] rounded-bl-[4px]' : 'rounded-[18px]'}`
                        }`}
                      >
                        <p className="text-[15px] leading-[21px] whitespace-pre-wrap break-words">
                          {language === 'ar' ? msg.text : msg.textEn}
                        </p>
                        <div className={`flex items-center gap-1 mt-[2px] ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <span className="text-[11px] text-[#8b9eb0]">
                            {formatTime(msg.timestamp)}
                          </span>
                          {msg.edited && (
                            <span className="text-[11px] text-[#6c7883]">
                              {t('معدّلة', 'edited')}
                            </span>
                          )}
                          {isOwn && (
                            msg.read ? (
                              <CheckCheck className="w-[16px] h-[16px] text-[#4dcd5e]" />
                            ) : (
                              <Check className="w-[16px] h-[16px] text-[#6c7883]" />
                            )
                          )}
                        </div>
                        
                        {/* Message Actions - Show on hover when not in selection mode */}
                        {!selectionMode && (
                          <div className={`absolute ${isOwn ? 'left-0' : 'right-0'} -top-8 opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                            <div className="flex gap-[2px] bg-[#17212b] shadow-lg rounded-lg p-1 border border-[#232e3c]">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c]"
                                onClick={(e) => { e.stopPropagation(); handleReplyToMessage(msg); }}
                              >
                                <Reply className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c]"
                                onClick={(e) => { e.stopPropagation(); handleCopyMessage(language === 'ar' ? msg.text : msg.textEn); }}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c]"
                                onClick={(e) => { e.stopPropagation(); handleMessageLongPress(msg.id); }}
                              >
                                <CheckSquare className="w-4 h-4" />
                              </Button>
                              {isOwn && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 w-7 p-0 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c]"
                                  onClick={(e) => { e.stopPropagation(); handleEditMessage(msg); }}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-[#232e3c]"
                                onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg.id); }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyingTo && (
              <div className="px-4 py-2 bg-[#17212b] border-t border-[#232e3c] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-10 bg-[#5288c1] rounded-full" />
                  <div>
                    <p className="text-[13px] text-[#5288c1] font-medium">
                      {t('الرد على رسالة', 'Reply to message')}
                    </p>
                    <p className="text-[14px] text-[#8b9eb0] truncate max-w-[300px]">
                      {language === 'ar' ? replyingTo.text : replyingTo.textEn}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(null)}
                  className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-8 w-8 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Message Input */}
            <div className="px-3 py-2 bg-[#17212b] border-t border-[#232e3c]">
              <div className="flex items-end gap-2">
                <div className="flex gap-1">
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c]"
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>
                
                <div className="flex-1 relative">
                  <Input
                    placeholder={t('اكتب رسالة...', 'Write a message...')}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="h-[44px] pr-12 bg-[#242f3d] border-0 text-white placeholder:text-[#6c7883] rounded-[22px] focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px]"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-[#8b9eb0] hover:text-white hover:bg-transparent"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                  
                  {showEmojiPicker && (
                    <div className="absolute bottom-14 left-0 z-50">
                      <EmojiPicker 
                        onEmojiClick={handleEmojiClick}
                        width={350}
                        height={400}
                        theme="dark"
                      />
                    </div>
                  )}
                </div>
                
                {messageText.trim() ? (
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#5288c1] hover:bg-[#4a7ab0] h-[44px] w-[44px] p-0 rounded-full"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleVoiceRecord}
                    variant="ghost"
                    className="h-[44px] w-[44px] p-0 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] rounded-full"
                  >
                    <Mic className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#0e1621' }}>
            <div className="text-center px-6">
              <div className="w-[140px] h-[140px] bg-[#17212b] rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <MessageCircle className="w-16 h-16 text-[#5288c1]" />
              </div>
              <h3 className="text-[22px] font-semibold text-white mb-3">
                {t('ترانسفيرز شات', 'TransVerse Chat')}
              </h3>
              <p className="text-[#8b9eb0] text-[15px] max-w-[320px] mx-auto mb-6 leading-relaxed">
                {t('ابدأ محادثة جديدة أو اختر محادثة من القائمة الجانبية', 'Start a new conversation or select one from the sidebar')}
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => navigate('/rider')}
                  variant="outline"
                  className="bg-transparent border-[#5288c1] text-[#5288c1] hover:bg-[#5288c1] hover:text-white"
                >
                  <Home className="w-4 h-4 ml-2" />
                  {t('الرئيسية', 'Home')}
                </Button>
                <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#5288c1] hover:bg-[#4a7ab0] text-white">
                      <UserPlus className="w-4 h-4 ml-2" />
                      {t('محادثة جديدة', 'New Chat')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#17212b] border-[#232e3c] text-white">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        {t('البحث عن مستخدم', 'Search for User')}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <Input
                        placeholder={t('أدخل ID المستخدم (مثال: TV12345)', 'Enter User ID (e.g., TV12345)')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                        className="h-12 bg-[#242f3d] border-0 text-white placeholder:text-[#6c7883]"
                      />
                      <Button
                        onClick={handleSearchUser}
                        className="w-full bg-[#5288c1] hover:bg-[#4a7ab0]"
                      >
                        <Search className="w-4 h-4 ml-2" />
                        {t('بحث', 'Search')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Conversation Action Menu (Context Menu) */}
      {convActionMenu.show && (
        <div 
          className="fixed inset-0 z-50"
          onClick={() => setConvActionMenu({ show: false, x: 0, y: 0, convId: null })}
        >
          <div 
            className="absolute bg-[#17212b] border border-[#232e3c] rounded-lg shadow-xl py-1 min-w-[180px]"
            style={{ 
              top: Math.min(convActionMenu.y, window.innerHeight - 250),
              left: Math.min(convActionMenu.x, window.innerWidth - 200)
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => handlePinConversation(convActionMenu.convId)}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] text-right"
            >
              {pinnedConversations.includes(convActionMenu.convId) ? (
                <>
                  <PinOff className="w-5 h-5" />
                  {t('إلغاء التثبيت', 'Unpin')}
                </>
              ) : (
                <>
                  <Pin className="w-5 h-5" />
                  {t('تثبيت', 'Pin')}
                  {pinnedConversations.length >= MAX_PINNED && (
                    <span className="text-xs text-[#6c7883] mr-auto">({MAX_PINNED}/{MAX_PINNED})</span>
                  )}
                </>
              )}
            </button>
            <button
              onClick={() => handleMuteConversation(convActionMenu.convId)}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] text-right"
            >
              {mutedConversations.includes(convActionMenu.convId) ? (
                <>
                  <Bell className="w-5 h-5" />
                  {t('تشغيل الإشعارات', 'Unmute')}
                </>
              ) : (
                <>
                  <BellOff className="w-5 h-5" />
                  {t('كتم الإشعارات', 'Mute')}
                </>
              )}
            </button>
            <button
              onClick={() => handleArchiveConversation(convActionMenu.convId)}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] text-right"
            >
              <Archive className="w-5 h-5" />
              {t('أرشفة', 'Archive')}
            </button>
            <div className="h-px bg-[#232e3c] my-1" />
            <button
              onClick={() => {
                setConvActionMenu({ show: false, x: 0, y: 0, convId: null });
                setDeleteConversationDialog(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-[#232e3c] text-right"
            >
              <Trash2 className="w-5 h-5" />
              {t('حذف', 'Delete')}
            </button>
          </div>
        </div>
      )}

      {/* Selection Mode Bar */}
      {selectionMode && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#17212b] border-t border-[#232e3c] p-3 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancelSelection}
              className="text-[#8b9eb0] hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
            <span className="text-white font-medium">
              {selectedMessages.length} {t('محدد', 'selected')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleForwardSelectedMessages}
              className="text-[#8b9eb0] hover:text-white"
            >
              <Forward className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelectedMessages}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #3d4d5c;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4d5d6c;
        }
      `}</style>

      {/* Clear History Dialog */}
      <Dialog open={clearHistoryDialog} onOpenChange={setClearHistoryDialog}>
        <DialogContent className="bg-[#17212b] border-[#232e3c] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {t('مسح سجل المحادثة', 'Clear Chat History')}
            </DialogTitle>
            <DialogDescription className="text-[#8b9eb0]">
              {t('هل تريد مسح سجل المحادثة؟', 'Do you want to clear chat history?')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => handleClearHistory(true)}
              className="bg-red-500 hover:bg-red-600 text-white w-full justify-start gap-3"
            >
              <Users className="w-4 h-4" />
              {t('مسح من الطرفين', 'Clear for both sides')}
            </Button>
            <Button
              onClick={() => handleClearHistory(false)}
              variant="outline"
              className="border-[#232e3c] text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] w-full justify-start gap-3"
            >
              <User className="w-4 h-4" />
              {t('مسح من طرفي فقط', 'Clear for me only')}
            </Button>
            <Button
              onClick={() => setClearHistoryDialog(false)}
              variant="ghost"
              className="text-[#8b9eb0] hover:text-white w-full mt-2"
            >
              {t('إلغاء', 'Cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Conversation Dialog */}
      <Dialog open={deleteConversationDialog} onOpenChange={setDeleteConversationDialog}>
        <DialogContent className="bg-[#17212b] border-[#232e3c] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white text-lg">
              {t('حذف المحادثة', 'Delete Conversation')}
            </DialogTitle>
            <DialogDescription className="text-[#8b9eb0]">
              {t('هل أنت متأكد من حذف هذه المحادثة؟', 'Are you sure you want to delete this conversation?')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button
              onClick={() => handleDeleteConversation(true)}
              className="bg-red-500 hover:bg-red-600 text-white w-full justify-start gap-3"
            >
              <Users className="w-4 h-4" />
              {t('حذف من الطرفين', 'Delete for both sides')}
            </Button>
            <Button
              onClick={() => handleDeleteConversation(false)}
              variant="outline"
              className="border-[#232e3c] text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] w-full justify-start gap-3"
            >
              <User className="w-4 h-4" />
              {t('حذف من طرفي فقط', 'Delete for me only')}
            </Button>
            <Button
              onClick={() => setDeleteConversationDialog(false)}
              variant="ghost"
              className="text-[#8b9eb0] hover:text-white w-full mt-2"
            >
              {t('إلغاء', 'Cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
