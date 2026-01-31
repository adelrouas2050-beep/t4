import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { ScrollArea } from '../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
import { useAdvancedChat } from '../context/AdvancedChatContext';
import { 
  ArrowLeft, Send, Search, MessageCircle, User, 
  Menu, Clock, Check, CheckCheck,
  UserPlus, MoreVertical, Reply, Copy,
  Trash2, Edit2, Pin, Image as ImageIcon,
  Paperclip, Smile, Mic, X, Phone, Video,
  BellOff, Settings, Moon, Archive, Bookmark,
  Home, Bell, Palette, UserX, Users, ChevronLeft,
  PinOff, Volume2, VolumeX, ImageOff, Forward, Square, CheckSquare,
  Radio, Plus, Megaphone, UsersRound, MessageSquare, Hash,
  Cloud, File, FileText, Music, Film, HardDrive, Upload, Eye, ChevronRight,
  Camera, Type, CirclePlus, ArchiveRestore, RotateCcw, AlertCircle, Loader2
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
    searchUsers,
    getOrCreateConversation,
    sendMessage,
    markAsRead,
    getTotalUnreadCount,
    getFilteredConversations,
    getArchivedCount,
    folders,
    activeFolder,
    setActiveFolder,
    togglePin,
    toggleMute,
    archiveConversation,
    unarchiveConversation,
    deleteConversation,
    editMessage,
    deleteMessage,
    clearConversationHistory,
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
    getStorageUsed
  } = useAdvancedChat();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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
  const [chatBackground, setChatBackground] = useState('default');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [convActionMenu, setConvActionMenu] = useState({ show: false, x: 0, y: 0, convId: null });
  const [showNewMenu, setShowNewMenu] = useState(false);
  
  // Stories state
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentStoryUser, setCurrentStoryUser] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showAddStory, setShowAddStory] = useState(false);
  const [storyType, setStoryType] = useState('image');
  const [storyText, setStoryText] = useState('');
  const [storyColor, setStoryColor] = useState('#5288c1');
  
  // Cloud Storage state
  const [showCloudStorage, setShowCloudStorage] = useState(false);
  const [cloudFileType, setCloudFileType] = useState('all');
  
  // Call state
  const [activeCall, setActiveCall] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  
  // Deleted Messages / Restore state
  const [showDeletedMessages, setShowDeletedMessages] = useState(false);
  const [myDeletedMessages, setMyDeletedMessages] = useState([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const storyImageInputRef = useRef(null);
  const longPressTimer = useRef(null);
  const storyTimerRef = useRef(null);
  const callTimerRef = useRef(null);
  const MAX_PINNED = 5;

  // Tab definitions for Telegram-like navigation
  const tabs = [
    { id: 'All', label: t('الكل', 'All'), icon: MessageCircle },
    { id: 'Personal', label: t('شخصي', 'Personal'), icon: User },
    { id: 'Groups', label: t('مجموعات', 'Groups'), icon: UsersRound },
    { id: 'Channels', label: t('قنوات', 'Channels'), icon: Megaphone },
    { id: 'Archived', label: t('الأرشيف', 'Archived'), icon: Archive, count: getArchivedCount() },
  ];

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
  }, [activeConversation?.id]);

  useEffect(() => {
    if (messageText) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [messageText]);

  const handleSearchUser = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('الرجاء إدخال اسم المستخدم', 'Please enter username'),
        variant: 'destructive'
      });
      return;
    }

    setIsSearching(true);
    
    // البحث في قاعدة البيانات
    const results = await searchUsers(searchQuery);
    
    if (results && results.length > 0) {
      setSearchResults(results);
      setIsSearching(false);
    } else {
      // محاولة البحث بالـ ID المباشر
      const foundUser = await searchUserById(searchQuery.toUpperCase());
      if (foundUser) {
        setSearchResults([foundUser]);
      } else {
        setSearchResults([]);
        toast({
          title: t('لم يتم العثور', 'Not Found'),
          description: t('لا يوجد مستخدم بهذا الاسم', 'No user with this name'),
          variant: 'destructive'
        });
      }
      setIsSearching(false);
    }
  };

  const handleSelectUser = (selectedUser) => {
    const conv = getOrCreateConversation(selectedUser.userId || selectedUser.id, selectedUser);
    if (conv) {
      setActiveConversation(conv);
      setSearchDialogOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      toast({
        title: t('تم بدء المحادثة', 'Chat Started'),
        description: language === 'ar' ? selectedUser.name : selectedUser.nameEn
      });
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeConversation) return;

    if (editingMessage) {
      // Actually edit the message
      editMessage(activeConversation.id, editingMessage.id, messageText, messageText);
      toast({
        title: t('تم التعديل', 'Message Edited'),
        description: t('تم تعديل الرسالة بنجاح', 'Message edited successfully')
      });
      setEditingMessage(null);
    } else {
      sendMessage(activeConversation.id, {
        type: 'text',
        text: messageText,
        textEn: messageText,
        replyTo: replyingTo
      });
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

  const handleDeleteMessage = async (messageId, deleteForBoth = true) => {
    if (activeConversation) {
      await deleteMessage(activeConversation.id, messageId, deleteForBoth);
      toast({
        title: t('تم الحذف', 'Deleted'),
        description: t('تم حذف الرسالة بنجاح', 'Message deleted successfully')
      });
    }
  };

  const handleReplyToMessage = (message) => {
    setReplyingTo(message);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setMessageText(language === 'ar' ? message.text : message.textEn);
  };

  // Stories handlers
  const handleOpenStory = (userStories) => {
    setCurrentStoryUser(userStories);
    setCurrentStoryIndex(0);
    setShowStoryViewer(true);
    // Mark story as viewed
    if (userStories.stories[0]) {
      viewStory(userStories.stories[0].id, 'user1');
    }
  };

  const handleNextStory = () => {
    if (currentStoryUser && currentStoryIndex < currentStoryUser.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      viewStory(currentStoryUser.stories[currentStoryIndex + 1].id, 'user1');
    } else {
      setShowStoryViewer(false);
      setCurrentStoryUser(null);
      setCurrentStoryIndex(0);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  const handleAddTextStory = () => {
    if (!storyText.trim()) return;
    addStory({
      type: 'text',
      content: storyText,
      contentEn: storyText,
      backgroundColor: storyColor
    });
    setStoryText('');
    setShowAddStory(false);
    toast({
      title: t('تمت الإضافة', 'Story Added'),
      description: t('تم نشر الستوري بنجاح', 'Story published successfully')
    });
  };

  const handleStoryImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        addStory({
          type: 'image',
          content: reader.result,
          caption: '',
          captionEn: ''
        });
        setShowAddStory(false);
        toast({
          title: t('تمت الإضافة', 'Story Added'),
          description: t('تم نشر الستوري بنجاح', 'Story published successfully')
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Cloud Storage handlers
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch(type) {
      case 'image': return ImageIcon;
      case 'video': return Film;
      case 'audio': return Music;
      case 'document': return FileText;
      default: return File;
    }
  };

  const handleCloudFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile({
        name: file.name,
        nameEn: file.name,
        type: file.type.startsWith('image') ? 'image' 
          : file.type.startsWith('video') ? 'video'
          : file.type.startsWith('audio') ? 'audio' 
          : 'document',
        size: file.size,
        url: URL.createObjectURL(file)
      });
      toast({
        title: t('تم الرفع', 'Uploaded'),
        description: t('تم رفع الملف بنجاح', 'File uploaded successfully')
      });
    }
  };

  const handleDeleteCloudFile = (fileId) => {
    deleteFile(fileId);
    toast({
      title: t('تم الحذف', 'Deleted'),
      description: t('تم حذف الملف', 'File deleted')
    });
  };

  // Archive handlers
  const handleUnarchiveConversation = (convId) => {
    unarchiveConversation(convId);
    toast({
      title: t('تم إلغاء الأرشفة', 'Unarchived'),
      description: t('تم استعادة المحادثة', 'Conversation restored')
    });
    setConvActionMenu({ show: false, x: 0, y: 0, convId: null });
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

  const handlePinConversation = (convId) => {
    togglePin(convId);
    toast({
      title: t('تم التحديث', 'Updated'),
      description: t('تم تحديث حالة التثبيت', 'Pin status updated')
    });
    setConvActionMenu({ show: false, x: 0, y: 0, convId: null });
  };

  const handleMuteConversation = (convId) => {
    toggleMute(convId);
    toast({
      title: t('تم التحديث', 'Updated'),
      description: t('تم تحديث حالة الإشعارات', 'Notification status updated')
    });
    setConvActionMenu({ show: false, x: 0, y: 0, convId: null });
  };

  const handleArchiveConversation = (convId) => {
    archiveConversation(convId);
    setActiveConversation(null);
    toast({
      title: t('تم الأرشفة', 'Archived'),
      description: t('تم نقل المحادثة للأرشيف', 'Conversation archived')
    });
    setConvActionMenu({ show: false, x: 0, y: 0, convId: null });
  };

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

  const handleDeleteSelectedMessages = async () => {
    if (!activeConversation || selectedMessages.length === 0) return;
    
    // حذف كل الرسائل المحددة
    for (const msgId of selectedMessages) {
      await deleteMessage(activeConversation.id, msgId, true);
    }
    
    toast({
      title: t('تم الحذف', 'Deleted'),
      description: t(`تم حذف ${selectedMessages.length} رسائل`, `${selectedMessages.length} messages deleted`)
    });
    setSelectionMode(false);
    setSelectedMessages([]);
  };

  const handleClearHistory = async (deleteForBoth) => {
    if (activeConversation) {
      await clearConversationHistory(activeConversation.id);
    }
    toast({
      title: t('تم مسح السجل', 'History Cleared'),
      description: deleteForBoth 
        ? t('تم مسح سجل المحادثة من الطرفين', 'Chat history cleared for both sides')
        : t('تم مسح سجل المحادثة من طرفك فقط', 'Chat history cleared from your side only')
    });
    setClearHistoryDialog(false);
  };

  const handleDeleteConversation = async (deleteForBoth) => {
    if (activeConversation) {
      await deleteConversation(activeConversation.id);
    }
    toast({
      title: t('تم الحذف', 'Deleted'),
      description: deleteForBoth 
        ? t('تم حذف المحادثة من الطرفين', 'Conversation deleted for both sides')
        : t('تم حذف المحادثة من طرفك فقط', 'Conversation deleted from your side only')
    });
    setDeleteConversationDialog(false);
    setActiveConversation(null);
  };

  // ============== DELETED MESSAGES FUNCTIONS ==============
  
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  
  const fetchMyDeletedMessages = async () => {
    const userId = user?.userId || user?.id;
    if (!userId) return;
    
    setLoadingDeleted(true);
    try {
      const response = await fetch(`${API_URL}/api/chat/my-deleted-messages/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMyDeletedMessages(data);
      }
    } catch (error) {
      console.error('Error fetching deleted messages:', error);
    } finally {
      setLoadingDeleted(false);
    }
  };
  
  const requestRestore = async (messageId, reason = '') => {
    const userId = user?.userId || user?.id;
    if (!userId) return;
    
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/request-restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          requestedBy: userId,
          reason
        })
      });
      
      if (response.ok) {
        toast({
          title: t('تم إرسال الطلب', 'Request Sent'),
          description: t('سيتم مراجعة طلبك من قبل المدير', 'Your request will be reviewed by admin')
        });
        fetchMyDeletedMessages(); // تحديث القائمة
      } else {
        const error = await response.json();
        toast({
          title: t('خطأ', 'Error'),
          description: error.detail || t('فشل في إرسال الطلب', 'Failed to send request'),
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('فشل في الاتصال', 'Connection failed'),
        variant: 'destructive'
      });
    }
  };
  
  const getRemainingDays = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  // ============== CALL FUNCTIONS ==============
  
  const startCall = (type) => {
    if (!activeConversation) return;
    
    setActiveCall({
      type,
      status: 'calling',
      startTime: null,
      otherUser: activeConversation.otherUser
    });
    
    // محاكاة الاتصال - بعد 3 ثواني يتم الرد
    setTimeout(() => {
      setActiveCall(prev => {
        if (prev && prev.status === 'calling') {
          return {
            ...prev,
            status: 'connected',
            startTime: new Date()
          };
        }
        return prev;
      });
    }, 3000);
    
    toast({
      title: type === 'voice' ? t('جاري الاتصال...', 'Calling...') : t('مكالمة فيديو...', 'Video calling...'),
      description: activeConversation.otherUser?.name
    });
  };
  
  const endCall = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    const wasConnected = activeCall?.status === 'connected';
    const duration = callDuration;
    
    setActiveCall(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsSpeakerOn(false);
    
    if (wasConnected) {
      toast({
        title: t('انتهت المكالمة', 'Call Ended'),
        description: t(`مدة المكالمة: ${formatCallDuration(duration)}`, `Duration: ${formatCallDuration(duration)}`)
      });
    }
  };
  
  const formatCallDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // تحديث مدة المكالمة
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [activeCall?.status]);

  const handleChangeBackground = (bg) => {
    setChatBackground(bg);
    toast({
      title: t('تم تغيير الخلفية', 'Background Changed'),
      description: t('تم تغيير خلفية المحادثة', 'Chat background updated')
    });
  };

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

  // Get conversation name and photo based on type
  const getConversationInfo = (conv) => {
    if (conv.type === 'private') {
      return {
        name: language === 'ar' ? conv.otherUser?.name : conv.otherUser?.nameEn,
        photo: conv.otherUser?.photo,
        status: conv.otherUser?.status,
        icon: null,
        memberCount: null
      };
    } else if (conv.type === 'group') {
      return {
        name: language === 'ar' ? conv.group?.name : conv.group?.nameEn,
        photo: conv.group?.photo,
        status: null,
        icon: UsersRound,
        memberCount: conv.group?.memberCount
      };
    } else if (conv.type === 'channel') {
      return {
        name: language === 'ar' ? conv.channel?.name : conv.channel?.nameEn,
        photo: conv.channel?.photo,
        status: null,
        icon: Megaphone,
        memberCount: conv.channel?.memberCount,
        isVerified: conv.channel?.isVerified
      };
    }
    return { name: '', photo: '', status: null, icon: null };
  };

  const currentMessages = activeConversation ? (messages[activeConversation.id] || []) : [];
  const unreadCount = getTotalUnreadCount();

  const filteredMessages = currentMessages.filter(msg => {
    if (!searchInChat) return true;
    const text = language === 'ar' ? msg.text : msg.textEn;
    return text?.toLowerCase().includes(searchInChat.toLowerCase());
  });

  // Get filtered conversations based on active tab and search
  const filteredConversations = getFilteredConversations().filter(conv => {
    if (!sidebarSearch) return true;
    const info = getConversationInfo(conv);
    return info.name?.toLowerCase().includes(sidebarSearch.toLowerCase());
  });

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#17212b] overflow-hidden" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* ============== CALL OVERLAY ============== */}
      {activeCall && (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center">
          {/* خلفية الفيديو للمكالمات المرئية */}
          {activeCall.type === 'video' && activeCall.status === 'connected' && !isVideoOff && (
            <div className="absolute inset-0 bg-gradient-to-br from-[#232e3c] to-[#0e1621]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-[#5288c1] text-lg">{t('كاميرا المستخدم الآخر', 'Other user camera')}</div>
              </div>
            </div>
          )}
          
          {/* معلومات المكالمة */}
          <div className="relative z-10 flex flex-col items-center">
            {/* صورة المستخدم */}
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-[#5288c1] to-[#7a5fca] flex items-center justify-center mb-6 ${activeCall.status === 'calling' ? 'animate-pulse' : ''}`}>
              {activeCall.otherUser?.photo ? (
                <img src={activeCall.otherUser.photo} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-white text-4xl font-bold">
                  {activeCall.otherUser?.name?.charAt(0) || '?'}
                </span>
              )}
            </div>
            
            {/* اسم المستخدم */}
            <h2 className="text-white text-2xl font-semibold mb-2">
              {activeCall.otherUser?.name || t('مستخدم', 'User')}
            </h2>
            
            {/* حالة المكالمة */}
            <p className="text-[#8b9eb0] text-lg mb-8">
              {activeCall.status === 'calling' && (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                  {t('جاري الاتصال...', 'Calling...')}
                </span>
              )}
              {activeCall.status === 'connected' && (
                <span className="text-green-400 font-mono text-xl">
                  {formatCallDuration(callDuration)}
                </span>
              )}
            </p>
            
            {/* نوع المكالمة */}
            <div className="flex items-center gap-2 mb-8 text-[#5288c1]">
              {activeCall.type === 'voice' ? (
                <>
                  <Phone className="w-5 h-5" />
                  <span>{t('مكالمة صوتية', 'Voice Call')}</span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  <span>{t('مكالمة فيديو', 'Video Call')}</span>
                </>
              )}
            </div>
          </div>
          
          {/* أزرار التحكم */}
          <div className="relative z-10 flex items-center gap-4">
            {/* كتم الصوت */}
            <Button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-[#232e3c] hover:bg-[#2d3a4a]'}`}
              data-testid="mute-btn"
            >
              {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
            </Button>
            
            {/* إيقاف الفيديو (للمكالمات المرئية فقط) */}
            {activeCall.type === 'video' && (
              <Button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`w-14 h-14 rounded-full ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-[#232e3c] hover:bg-[#2d3a4a]'}`}
                data-testid="video-off-btn"
              >
                {isVideoOff ? <ImageOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
              </Button>
            )}
            
            {/* مكبر الصوت */}
            <Button
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-14 h-14 rounded-full ${isSpeakerOn ? 'bg-[#5288c1] hover:bg-[#4a7ab0]' : 'bg-[#232e3c] hover:bg-[#2d3a4a]'}`}
              data-testid="speaker-btn"
            >
              <Volume2 className="w-6 h-6 text-white" />
            </Button>
            
            {/* إنهاء المكالمة */}
            <Button
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600"
              data-testid="end-call-btn"
            >
              <Phone className="w-7 h-7 text-white rotate-[135deg]" />
            </Button>
          </div>
          
          {/* الكاميرا الصغيرة (للمكالمات المرئية) */}
          {activeCall.type === 'video' && activeCall.status === 'connected' && (
            <div className="absolute bottom-32 left-4 w-32 h-44 bg-[#232e3c] rounded-xl overflow-hidden border-2 border-[#5288c1] shadow-lg">
              {isVideoOff ? (
                <div className="w-full h-full flex items-center justify-center bg-[#1a2836]">
                  <ImageOff className="w-8 h-8 text-[#6c7883]" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#5288c1] to-[#7a5fca]">
                  <span className="text-white text-xs">{t('الكاميرا', 'Camera')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Sidebar */}
      <div className={`${!activeConversation ? 'flex' : 'hidden md:flex'} w-full md:w-[320px] bg-[#17212b] md:border-l border-[#232e3c] flex-col transition-all duration-300 overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="h-[56px] px-3 flex items-center justify-between bg-[#17212b] border-b border-[#232e3c]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0" data-testid="menu-btn">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-[#17212b] border-[#232e3c] text-white">
              <DropdownMenuItem onClick={() => navigate('/rider')} className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer" data-testid="menu-home">
                <Home className="w-5 h-5" />
                {t('الصفحة الرئيسية', 'Home Page')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#232e3c]" />
              
              {/* Cloud Storage */}
              <DropdownMenuItem onClick={() => setShowCloudStorage(true)} className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer" data-testid="menu-cloud">
                <Cloud className="w-5 h-5" />
                {t('التخزين السحابي', 'Cloud Storage')}
              </DropdownMenuItem>
              
              {/* New Group */}
              <DropdownMenuItem onClick={() => navigate('/create-group')} className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer" data-testid="menu-new-group">
                <UsersRound className="w-5 h-5" />
                {t('مجموعة جديدة', 'New Group')}
              </DropdownMenuItem>
              
              {/* New Channel */}
              <DropdownMenuItem onClick={() => navigate('/create-channel')} className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer" data-testid="menu-new-channel">
                <Megaphone className="w-5 h-5" />
                {t('قناة جديدة', 'New Channel')}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-[#232e3c]" />
              
              <DropdownMenuItem className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer" data-testid="menu-saved">
                <Bookmark className="w-5 h-5" />
                {t('الرسائل المحفوظة', 'Saved Messages')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveFolder('Archived')} className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer" data-testid="menu-archived">
                <Archive className="w-5 h-5" />
                {t('الأرشيف', 'Archived')}
                {getArchivedCount() > 0 && (
                  <Badge className="bg-[#5288c1] mr-auto text-xs">{getArchivedCount()}</Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#232e3c]" />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer" data-testid="menu-profile">
                <User className="w-5 h-5" />
                {t('الملف الشخصي', 'Profile')}
              </DropdownMenuItem>
              
              {/* Settings - Navigate to Settings Page */}
              <DropdownMenuItem onClick={() => navigate('/settings')} className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer" data-testid="menu-settings">
                <Settings className="w-5 h-5" />
                {t('الإعدادات', 'Settings')}
              </DropdownMenuItem>
              
              <DropdownMenuItem className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer" data-testid="menu-night-mode">
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
                data-testid="search-input"
              />
            </div>
          </div>
        </div>

        {/* Tabs - Telegram Style */}
        <div className="flex items-center bg-[#17212b] border-b border-[#232e3c] overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFolder(tab.id)}
              className={`flex-1 min-w-[60px] py-3 px-1 text-center transition-all duration-200 relative ${
                activeFolder === tab.id 
                  ? 'text-[#5288c1]' 
                  : 'text-[#8b9eb0] hover:text-white'
              }`}
              data-testid={`tab-${tab.id.toLowerCase()}`}
            >
              <div className="flex flex-col items-center gap-1 relative">
                <tab.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
                {tab.count > 0 && (
                  <Badge className="absolute -top-1 -right-2 bg-[#5288c1] text-[10px] h-4 min-w-[16px] px-1">
                    {tab.count}
                  </Badge>
                )}
              </div>
              {activeFolder === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5288c1] rounded-t-full" />
              )}
            </button>
          ))}
        </div>

        {/* Stories Section - Only show on All and Personal tabs */}
        {(activeFolder === 'All' || activeFolder === 'Personal') && stories && stories.length > 0 && (
          <div className="border-b border-[#232e3c] p-3">
            <div className="flex gap-3 overflow-x-auto hide-scrollbar">
              {/* Add Story Button */}
              <div 
                className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
                onClick={() => setShowAddStory(true)}
                data-testid="add-story-btn"
              >
                <div className="relative">
                  <div className="w-[58px] h-[58px] rounded-full bg-[#232e3c] flex items-center justify-center border-2 border-dashed border-[#5288c1]">
                    <Plus className="w-6 h-6 text-[#5288c1]" />
                  </div>
                </div>
                <span className="text-[11px] text-[#8b9eb0] w-[60px] text-center truncate">
                  {t('ستوري', 'Story')}
                </span>
              </div>
              
              {/* Other Users Stories */}
              {stories.map((userStories) => (
                <div 
                  key={userStories.userId}
                  className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0"
                  onClick={() => handleOpenStory(userStories)}
                  data-testid={`story-${userStories.userId}`}
                >
                  <div className={`p-[2px] rounded-full ${userStories.hasUnviewed ? 'bg-gradient-to-tr from-[#5288c1] to-[#7a5fca]' : 'bg-[#3d4d5c]'}`}>
                    <Avatar className="w-[54px] h-[54px] border-2 border-[#17212b]">
                      <AvatarImage src={userStories.user.photo} />
                      <AvatarFallback className="bg-gradient-to-br from-[#5288c1] to-[#7a5fca] text-white">
                        {userStories.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <span className="text-[11px] text-[#8b9eb0] w-[60px] text-center truncate">
                    {language === 'ar' ? userStories.user.name.split(' ')[0] : userStories.user.nameEn.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-[#232e3c] rounded-full flex items-center justify-center mx-auto mb-4">
                {activeFolder === 'Archived' ? (
                  <Archive className="w-10 h-10 text-[#5288c1]" />
                ) : (
                  <MessageCircle className="w-10 h-10 text-[#5288c1]" />
                )}
              </div>
              <p className="text-[#8b9eb0] text-sm mb-2">
                {activeFolder === 'Groups' 
                  ? t('لا توجد مجموعات', 'No groups')
                  : activeFolder === 'Channels'
                  ? t('لا توجد قنوات', 'No channels')
                  : activeFolder === 'Archived'
                  ? t('لا توجد محادثات مؤرشفة', 'No archived conversations')
                  : t('لا توجد محادثات', 'No conversations')}
              </p>
              {activeFolder !== 'Archived' && (
                <Button
                  onClick={() => {
                    if (activeFolder === 'Groups') {
                      navigate('/create-group');
                    } else if (activeFolder === 'Channels') {
                      navigate('/create-channel');
                    } else {
                      setSearchDialogOpen(true);
                    }
                  }}
                  className="mt-4 bg-[#5288c1] hover:bg-[#4a7ab0] text-white"
                  data-testid="start-chat-btn"
                >
                  {activeFolder === 'Groups' ? (
                    <>
                      <UsersRound className="w-4 h-4 ml-2" />
                      {t('إنشاء مجموعة', 'Create Group')}
                    </>
                  ) : activeFolder === 'Channels' ? (
                    <>
                      <Megaphone className="w-4 h-4 ml-2" />
                      {t('إنشاء قناة', 'Create Channel')}
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 ml-2" />
                      {t('بدء محادثة', 'Start Chat')}
                    </>
                  )}
                </Button>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const convInfo = getConversationInfo(conv);
              const isPinned = conv.pinned;
              const isMuted = conv.muted;
              const isArchived = conv.archived;
              
              return (
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
                  data-testid={`conversation-${conv.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-[54px] h-[54px]">
                        <AvatarImage src={convInfo.photo} />
                        <AvatarFallback className={`text-white text-lg font-medium ${
                          conv.type === 'channel' 
                            ? 'bg-gradient-to-br from-[#7a5fca] to-[#5288c1]'
                            : conv.type === 'group'
                            ? 'bg-gradient-to-br from-[#10b981] to-[#059669]'
                            : 'bg-gradient-to-br from-[#5288c1] to-[#7a5fca]'
                        }`}>
                          {conv.type === 'channel' ? (
                            <Megaphone className="w-6 h-6" />
                          ) : conv.type === 'group' ? (
                            <UsersRound className="w-6 h-6" />
                          ) : (
                            convInfo.name?.charAt(0)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      {conv.type === 'private' && convInfo.status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-[14px] h-[14px] bg-[#4dcd5e] border-[3px] border-[#17212b] rounded-full" />
                      )}
                      {convInfo.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#5288c1] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-[2px]">
                        <div className="flex items-center gap-2">
                          {/* Type Icon for Groups/Channels */}
                          {convInfo.icon && (
                            <convInfo.icon className="w-4 h-4 text-[#5288c1]" />
                          )}
                          <h3 className="font-semibold text-[15px] text-white truncate">
                            {convInfo.name}
                          </h3>
                          {isMuted && (
                            <VolumeX className="w-4 h-4 text-[#6c7883]" />
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {isPinned && (
                            <Pin className="w-4 h-4 text-[#6c7883]" />
                          )}
                          {conv.lastMessage && (
                            <>
                              {conv.lastMessage.senderId === (user?.userId || user?.id) && conv.type === 'private' && (
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
                        <div className="flex-1 flex items-center gap-1">
                          {/* Show sender name for groups */}
                          {conv.type === 'group' && conv.lastMessage?.senderName && (
                            <span className="text-[#5288c1] text-[14px]">
                              {conv.lastMessage.senderName.split(' ')[0]}:
                            </span>
                          )}
                          <p className="text-[14px] text-[#8b9eb0] truncate flex-1 leading-[20px]">
                            {conv.lastMessage 
                              ? (language === 'ar' ? conv.lastMessage.text : conv.lastMessage.textEn)
                              : t('ابدأ المحادثة', 'Start conversation')
                            }
                          </p>
                        </div>
                        {/* Member count for groups/channels */}
                        {convInfo.memberCount && !conv.unreadCount && (
                          <span className="text-[11px] text-[#6c7883] mr-1">
                            {convInfo.memberCount.toLocaleString()} {conv.type === 'channel' ? t('مشترك', 'subscribers') : t('عضو', 'members')}
                          </span>
                        )}
                        {conv.unreadCount > 0 && !isMuted && (
                          <Badge className="bg-[#5288c1] hover:bg-[#5288c1] text-white text-[12px] min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-[6px] font-medium mr-1">
                            {conv.unreadCount}
                          </Badge>
                        )}
                        {conv.unreadCount > 0 && isMuted && (
                          <Badge className="bg-[#3d4d5c] hover:bg-[#3d4d5c] text-white text-[12px] min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-[6px] font-medium mr-1">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Floating Action Button */}
        <div className="absolute bottom-6 left-6 md:relative md:bottom-auto md:left-auto md:p-4">
          <DropdownMenu open={showNewMenu} onOpenChange={setShowNewMenu}>
            <DropdownMenuTrigger asChild>
              <Button
                className="w-14 h-14 rounded-full bg-[#5288c1] hover:bg-[#4a7ab0] shadow-lg md:w-full md:h-12 md:rounded-lg"
                data-testid="fab-new"
              >
                <Plus className="w-6 h-6 md:hidden" />
                <span className="hidden md:flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  {t('جديد', 'New')}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#17212b] border-[#232e3c] text-white mb-2">
              <DropdownMenuItem 
                onClick={() => { setShowNewMenu(false); setSearchDialogOpen(true); }}
                className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                data-testid="new-chat"
              >
                <MessageSquare className="w-5 h-5" />
                {t('محادثة جديدة', 'New Chat')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => { setShowNewMenu(false); navigate('/create-group'); }}
                className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                data-testid="new-group"
              >
                <UsersRound className="w-5 h-5" />
                {t('مجموعة جديدة', 'New Group')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => { setShowNewMenu(false); navigate('/create-channel'); }}
                className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                data-testid="new-channel"
              >
                <Megaphone className="w-5 h-5" />
                {t('قناة جديدة', 'New Channel')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#232e3c]" />
              <DropdownMenuItem 
                onClick={() => { setShowNewMenu(false); setShowDeletedMessages(true); fetchMyDeletedMessages(); }}
                className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                data-testid="my-deleted-messages"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
                {t('رسائلي المحذوفة', 'My Deleted Messages')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                  data-testid="back-btn"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                {(() => {
                  const info = getConversationInfo(activeConversation);
                  return (
                    <>
                      <Avatar className="w-[42px] h-[42px]">
                        <AvatarImage src={info.photo} />
                        <AvatarFallback className={`text-white ${
                          activeConversation.type === 'channel' 
                            ? 'bg-gradient-to-br from-[#7a5fca] to-[#5288c1]'
                            : activeConversation.type === 'group'
                            ? 'bg-gradient-to-br from-[#10b981] to-[#059669]'
                            : 'bg-gradient-to-br from-[#5288c1] to-[#7a5fca]'
                        }`}>
                          {activeConversation.type === 'channel' ? (
                            <Megaphone className="w-5 h-5" />
                          ) : activeConversation.type === 'group' ? (
                            <UsersRound className="w-5 h-5" />
                          ) : (
                            info.name?.charAt(0)
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-[15px] text-white leading-tight">
                            {info.name}
                          </h2>
                          {info.isVerified && (
                            <div className="w-4 h-4 bg-[#5288c1] rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-[13px] text-[#8b9eb0] leading-tight">
                          {activeConversation.type === 'private' ? (
                            isTyping ? (
                              <span className="text-[#5288c1]">{t('يكتب...', 'typing...')}</span>
                            ) : info.status === 'online' 
                              ? <span className="text-[#4dcd5e]">{t('متصل', 'online')}</span>
                              : t('آخر ظهور منذ قليل', 'last seen recently')
                          ) : (
                            <span>
                              {info.memberCount?.toLocaleString()} {activeConversation.type === 'channel' ? t('مشترك', 'subscribers') : t('عضو', 'members')}
                            </span>
                          )}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center gap-1">
                {activeConversation.type === 'private' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
                      onClick={() => startCall('voice')}
                      data-testid="call-btn"
                    >
                      <Phone className="w-5 h-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
                      onClick={() => startCall('video')}
                      data-testid="video-btn"
                    >
                      <Video className="w-5 h-5" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
                  data-testid="search-chat-btn"
                >
                  <Search className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
                      data-testid="chat-menu-btn"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#17212b] border-[#232e3c] text-white">
                    <DropdownMenuItem 
                      onSelect={() => setShowSearchInChat(true)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      {t('بحث', 'Search')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onSelect={() => handleMuteConversation(activeConversation.id)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      {activeConversation.muted ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      {activeConversation.muted ? t('تشغيل الإشعارات', 'Unmute') : t('كتم الإشعارات', 'Mute')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-[#232e3c]" />
                    
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
                    
                    <DropdownMenuItem 
                      onSelect={() => handlePinConversation(activeConversation.id)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      {activeConversation.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      {activeConversation.pinned ? t('إلغاء التثبيت', 'Unpin') : t('تثبيت', 'Pin')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onSelect={() => handleArchiveConversation(activeConversation.id)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      {t('أرشفة', 'Archive')}
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-[#232e3c]" />
                    
                    <DropdownMenuItem 
                      onSelect={() => setClearHistoryDialog(true)}
                      className="gap-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('مسح السجل', 'Clear History')}
                    </DropdownMenuItem>
                    
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
                  data-testid="search-in-chat-input"
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
                const currentUserId = user?.userId || user?.id || 'user1';
                const isOwn = msg.senderId === currentUserId;
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
                        <AvatarImage src={activeConversation.type === 'private' ? activeConversation.otherUser?.photo : msg.senderPhoto} />
                        <AvatarFallback className="bg-gradient-to-br from-[#5288c1] to-[#7a5fca] text-white text-sm">
                          {(activeConversation.type === 'private' ? activeConversation.otherUser?.name : msg.senderName)?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    {!isOwn && !showAvatar && !selectionMode && <div className="w-[34px]" />}
                    
                    <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {/* Show sender name in groups */}
                      {!isOwn && activeConversation.type !== 'private' && showAvatar && (
                        <span className="text-[#5288c1] text-[13px] font-medium mb-1 mr-3">
                          {msg.senderName}
                        </span>
                      )}
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
                          {isOwn && activeConversation.type === 'private' && (
                            msg.read ? (
                              <CheckCheck className="w-[16px] h-[16px] text-[#4dcd5e]" />
                            ) : (
                              <Check className="w-[16px] h-[16px] text-[#6c7883]" />
                            )
                          )}
                        </div>
                        
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

            {/* Message Input - Only show for private chats and groups with send permission */}
            {(activeConversation.type !== 'channel' || activeConversation.channel?.canSendMessages) && (
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
                      data-testid="upload-image-btn"
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
                      data-testid="upload-file-btn"
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
                      data-testid="message-input"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 text-[#8b9eb0] hover:text-white hover:bg-transparent"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      data-testid="emoji-btn"
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
                      data-testid="send-btn"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleVoiceRecord}
                      variant="ghost"
                      className="h-[44px] w-[44px] p-0 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] rounded-full"
                      data-testid="voice-btn"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Channel View Only Notice */}
            {activeConversation.type === 'channel' && !activeConversation.channel?.canSendMessages && (
              <div className="px-4 py-3 bg-[#17212b] border-t border-[#232e3c] text-center">
                <p className="text-[#8b9eb0] text-sm">
                  {t('هذه قناة للقراءة فقط', 'This is a read-only channel')}
                </p>
              </div>
            )}
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
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={() => navigate('/rider')}
                  variant="outline"
                  className="bg-transparent border-[#5288c1] text-[#5288c1] hover:bg-[#5288c1] hover:text-white"
                  data-testid="home-btn"
                >
                  <Home className="w-4 h-4 ml-2" />
                  {t('الرئيسية', 'Home')}
                </Button>
                <Dialog open={searchDialogOpen} onOpenChange={(open) => {
                    setSearchDialogOpen(open);
                    if (!open) {
                      setSearchResults([]);
                      setSearchQuery('');
                    }
                  }}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#5288c1] hover:bg-[#4a7ab0] text-white" data-testid="new-chat-btn">
                      <UserPlus className="w-4 h-4 ml-2" />
                      {t('محادثة جديدة', 'New Chat')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#17212b] border-[#232e3c] text-white max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        {t('البحث عن مستخدم', 'Search for User')}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4 flex-1 overflow-hidden flex flex-col">
                      <div className="flex gap-2">
                        <Input
                          placeholder={t('أدخل اسم المستخدم أو البريد', 'Enter username or email')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
                          className="h-12 bg-[#242f3d] border-0 text-white placeholder:text-[#6c7883] flex-1"
                          data-testid="user-search-input"
                        />
                        <Button
                          onClick={handleSearchUser}
                          className="h-12 bg-[#5288c1] hover:bg-[#4a7ab0] px-6"
                          data-testid="search-user-btn"
                          disabled={isSearching}
                        >
                          {isSearching ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Search className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* نتائج البحث */}
                      {searchResults.length > 0 && (
                        <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
                          <p className="text-[#8b9eb0] text-sm">{t('نتائج البحث', 'Search Results')} ({searchResults.length})</p>
                          {searchResults.map((user) => (
                            <div
                              key={user.userId || user.id}
                              onClick={() => handleSelectUser(user)}
                              className="flex items-center gap-3 p-3 rounded-lg bg-[#242f3d] hover:bg-[#2b3848] cursor-pointer transition-colors"
                              data-testid={`search-result-${user.userId || user.id}`}
                            >
                              <img
                                src={user.photo || `https://ui-avatars.com/api/?name=${user.name}&background=5288c1&color=fff`}
                                alt={user.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white truncate">{user.name}</p>
                                <p className="text-sm text-[#8b9eb0] truncate">@{user.userId || user.id}</p>
                              </div>
                              <MessageCircle className="w-5 h-5 text-[#5288c1]" />
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.length === 0 && searchQuery && !isSearching && (
                        <p className="text-center text-[#8b9eb0] py-4">
                          {t('لم يتم العثور على نتائج', 'No results found')}
                        </p>
                      )}
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
              data-testid="ctx-pin"
            >
              {conversations.find(c => c.id === convActionMenu.convId)?.pinned ? (
                <>
                  <PinOff className="w-5 h-5" />
                  {t('إلغاء التثبيت', 'Unpin')}
                </>
              ) : (
                <>
                  <Pin className="w-5 h-5" />
                  {t('تثبيت', 'Pin')}
                </>
              )}
            </button>
            <button
              onClick={() => handleMuteConversation(convActionMenu.convId)}
              className="w-full flex items-center gap-3 px-4 py-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] text-right"
              data-testid="ctx-mute"
            >
              {conversations.find(c => c.id === convActionMenu.convId)?.muted ? (
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
            {conversations.find(c => c.id === convActionMenu.convId)?.archived ? (
              <button
                onClick={() => handleUnarchiveConversation(convActionMenu.convId)}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] text-right"
                data-testid="ctx-unarchive"
              >
                <ArchiveRestore className="w-5 h-5" />
                {t('إلغاء الأرشفة', 'Unarchive')}
              </button>
            ) : (
              <button
                onClick={() => handleArchiveConversation(convActionMenu.convId)}
                className="w-full flex items-center gap-3 px-4 py-3 text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] text-right"
                data-testid="ctx-archive"
              >
                <Archive className="w-5 h-5" />
                {t('أرشفة', 'Archive')}
              </button>
            )}
            <div className="h-px bg-[#232e3c] my-1" />
            <button
              onClick={() => {
                setConvActionMenu({ show: false, x: 0, y: 0, convId: null });
                setDeleteConversationDialog(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-[#232e3c] text-right"
              data-testid="ctx-delete"
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
              data-testid="cancel-selection"
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
              onClick={() => toast({ title: t('قريباً', 'Coming Soon') })}
              className="text-[#8b9eb0] hover:text-white"
              data-testid="forward-selected"
            >
              <Forward className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteSelectedMessages}
              className="text-red-400 hover:text-red-300"
              data-testid="delete-selected"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {showStoryViewer && currentStoryUser && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          <div className="relative w-full h-full max-w-lg">
            {/* Story Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              {currentStoryUser.stories.map((_, idx) => (
                <div key={idx} className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-white transition-all duration-300 ${
                      idx < currentStoryIndex ? 'w-full' : idx === currentStoryIndex ? 'w-full animate-progress' : 'w-0'
                    }`}
                  />
                </div>
              ))}
            </div>

            {/* Story Header */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-white">
                  <AvatarImage src={currentStoryUser.user.photo} />
                  <AvatarFallback>{currentStoryUser.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium text-sm">
                    {language === 'ar' ? currentStoryUser.user.name : currentStoryUser.user.nameEn}
                  </p>
                  <p className="text-white/70 text-xs">
                    {formatTime(currentStoryUser.stories[currentStoryIndex]?.timestamp)}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStoryViewer(false)}
                className="text-white hover:bg-white/20 h-10 w-10 p-0"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Story Content */}
            <div 
              className="w-full h-full flex items-center justify-center"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (x < rect.width / 2) {
                  handlePrevStory();
                } else {
                  handleNextStory();
                }
              }}
            >
              {currentStoryUser.stories[currentStoryIndex]?.type === 'image' ? (
                <img 
                  src={currentStoryUser.stories[currentStoryIndex].content} 
                  alt="Story"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center p-8"
                  style={{ backgroundColor: currentStoryUser.stories[currentStoryIndex]?.backgroundColor || '#5288c1' }}
                >
                  <p className="text-white text-2xl font-medium text-center">
                    {language === 'ar' 
                      ? currentStoryUser.stories[currentStoryIndex]?.content 
                      : currentStoryUser.stories[currentStoryIndex]?.contentEn}
                  </p>
                </div>
              )}
            </div>

            {/* Story Caption */}
            {currentStoryUser.stories[currentStoryIndex]?.caption && (
              <div className="absolute bottom-20 left-4 right-4 text-center">
                <p className="text-white text-lg bg-black/50 px-4 py-2 rounded-lg inline-block">
                  {language === 'ar' 
                    ? currentStoryUser.stories[currentStoryIndex].caption 
                    : currentStoryUser.stories[currentStoryIndex].captionEn}
                </p>
              </div>
            )}

            {/* View Count */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Eye className="w-4 h-4" />
                <span>{currentStoryUser.stories[currentStoryIndex]?.viewCount || 0} {t('مشاهدة', 'views')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Story Dialog */}
      <Dialog open={showAddStory} onOpenChange={setShowAddStory}>
        <DialogContent className="bg-[#17212b] border-[#232e3c] text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {t('إضافة ستوري', 'Add Story')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {/* Story Type Tabs */}
            <div className="flex gap-2">
              <Button
                variant={storyType === 'image' ? 'default' : 'outline'}
                onClick={() => setStoryType('image')}
                className={storyType === 'image' ? 'bg-[#5288c1] flex-1' : 'border-[#232e3c] text-[#8b9eb0] flex-1'}
              >
                <Camera className="w-4 h-4 ml-2" />
                {t('صورة', 'Image')}
              </Button>
              <Button
                variant={storyType === 'text' ? 'default' : 'outline'}
                onClick={() => setStoryType('text')}
                className={storyType === 'text' ? 'bg-[#5288c1] flex-1' : 'border-[#232e3c] text-[#8b9eb0] flex-1'}
              >
                <Type className="w-4 h-4 ml-2" />
                {t('نص', 'Text')}
              </Button>
            </div>

            {storyType === 'image' ? (
              <div>
                <input
                  type="file"
                  ref={storyImageInputRef}
                  accept="image/*"
                  onChange={handleStoryImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => storyImageInputRef.current?.click()}
                  className="w-full h-32 bg-[#232e3c] hover:bg-[#2d3a4a] border-2 border-dashed border-[#3d4d5c]"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8 text-[#5288c1]" />
                    <span className="text-[#8b9eb0]">{t('اختر صورة', 'Choose Image')}</span>
                  </div>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder={t('اكتب ستوري...', 'Write your story...')}
                  className="w-full h-32 bg-[#232e3c] border-0 text-white placeholder:text-[#6c7883] rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#5288c1]"
                  maxLength={280}
                />
                <div className="flex items-center gap-2">
                  <span className="text-[#8b9eb0] text-sm">{t('لون الخلفية', 'Background')}</span>
                  <div className="flex gap-2">
                    {['#5288c1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                      <button
                        key={color}
                        onClick={() => setStoryColor(color)}
                        className={`w-8 h-8 rounded-full ${storyColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#17212b]' : ''}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <Button
                  onClick={handleAddTextStory}
                  className="w-full bg-[#5288c1] hover:bg-[#4a7ab0]"
                  disabled={!storyText.trim()}
                >
                  {t('نشر الستوري', 'Publish Story')}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cloud Storage Dialog */}
      <Dialog open={showCloudStorage} onOpenChange={setShowCloudStorage}>
        <DialogContent className="bg-[#17212b] border-[#232e3c] text-white max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Cloud className="w-5 h-5 text-[#5288c1]" />
              {t('التخزين السحابي', 'Cloud Storage')}
            </DialogTitle>
          </DialogHeader>
          
          {/* Storage Usage */}
          <div className="bg-[#232e3c] rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#8b9eb0] text-sm">{t('المساحة المستخدمة', 'Storage Used')}</span>
              <span className="text-white text-sm font-medium">
                {formatFileSize(getStorageUsed())} / 5 GB
              </span>
            </div>
            <Progress value={(getStorageUsed() / (5 * 1024 * 1024 * 1024)) * 100} className="h-2 bg-[#3d4d5c]" />
          </div>

          {/* File Type Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
            {[
              { id: 'all', label: t('الكل', 'All'), icon: HardDrive },
              { id: 'image', label: t('صور', 'Images'), icon: ImageIcon },
              { id: 'video', label: t('فيديو', 'Videos'), icon: Film },
              { id: 'audio', label: t('صوت', 'Audio'), icon: Music },
              { id: 'document', label: t('مستندات', 'Docs'), icon: FileText },
            ].map(tab => (
              <Button
                key={tab.id}
                variant={cloudFileType === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCloudFileType(tab.id)}
                className={cloudFileType === tab.id ? 'bg-[#5288c1]' : 'text-[#8b9eb0] hover:text-white'}
              >
                <tab.icon className="w-4 h-4 ml-1" />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Upload Button */}
          <div className="mb-4">
            <input
              type="file"
              id="cloud-upload"
              onChange={handleCloudFileUpload}
              className="hidden"
            />
            <label htmlFor="cloud-upload">
              <Button asChild className="w-full bg-[#5288c1] hover:bg-[#4a7ab0] cursor-pointer">
                <span>
                  <Upload className="w-4 h-4 ml-2" />
                  {t('رفع ملف', 'Upload File')}
                </span>
              </Button>
            </label>
          </div>

          {/* Files List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {(cloudFileType === 'all' ? cloudFiles : cloudFiles.filter(f => f.type === cloudFileType)).map(file => {
              const FileIcon = getFileIcon(file.type);
              return (
                <div key={file.id} className="flex items-center gap-3 p-3 bg-[#232e3c] rounded-lg hover:bg-[#2d3a4a] transition-colors">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    file.type === 'image' ? 'bg-blue-500/20' :
                    file.type === 'video' ? 'bg-purple-500/20' :
                    file.type === 'audio' ? 'bg-green-500/20' :
                    'bg-orange-500/20'
                  }`}>
                    {file.type === 'image' && file.thumbnail ? (
                      <img src={file.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <FileIcon className={`w-6 h-6 ${
                        file.type === 'image' ? 'text-blue-400' :
                        file.type === 'video' ? 'text-purple-400' :
                        file.type === 'audio' ? 'text-green-400' :
                        'text-orange-400'
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {language === 'ar' ? file.name : file.nameEn}
                    </p>
                    <p className="text-[#8b9eb0] text-xs">
                      {formatFileSize(file.size)} • {formatTime(file.uploadedAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCloudFile(file.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
            
            {(cloudFileType === 'all' ? cloudFiles : cloudFiles.filter(f => f.type === cloudFileType)).length === 0 && (
              <div className="text-center py-8">
                <HardDrive className="w-12 h-12 text-[#3d4d5c] mx-auto mb-2" />
                <p className="text-[#8b9eb0]">{t('لا توجد ملفات', 'No files')}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
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
              data-testid="clear-both"
            >
              <Users className="w-4 h-4" />
              {t('مسح من الطرفين', 'Clear for both sides')}
            </Button>
            <Button
              onClick={() => handleClearHistory(false)}
              variant="outline"
              className="border-[#232e3c] text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] w-full justify-start gap-3"
              data-testid="clear-me"
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
              data-testid="delete-both"
            >
              <Users className="w-4 h-4" />
              {t('حذف من الطرفين', 'Delete for both sides')}
            </Button>
            <Button
              onClick={() => handleDeleteConversation(false)}
              variant="outline"
              className="border-[#232e3c] text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] w-full justify-start gap-3"
              data-testid="delete-me"
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
