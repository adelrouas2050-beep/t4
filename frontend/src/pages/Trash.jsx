import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  Trash2, RotateCcw, Clock, User, MessageSquare, 
  CheckCircle, XCircle, Search, AlertTriangle, Loader2,
  Users, MessageCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Trash = () => {
  const { toast } = useToast();
  const [deletedConversations, setDeletedConversations] = useState([]);
  const [restoreRequests, setRestoreRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, requests

  const getToken = () => localStorage.getItem('userToken') || localStorage.getItem('adminToken');

  // جلب المحادثات المحذوفة
  const fetchDeletedConversations = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/conversations`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDeletedConversations(data);
      }
    } catch (error) {
      console.error('Error fetching deleted conversations:', error);
    }
  };

  // جلب طلبات الاستعادة
  const fetchRestoreRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/conversation-requests`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRestoreRequests(data);
      }
    } catch (error) {
      console.error('Error fetching restore requests:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchDeletedConversations(), fetchRestoreRequests()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // الموافقة على استعادة محادثة
  const handleApproveRestore = async (conversationId) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/approve-conversation-restore/${conversationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'تم الاستعادة',
          description: `تم استعادة المحادثة مع ${data.restoredMessages || 0} رسالة`
        });
        fetchDeletedConversations();
        fetchRestoreRequests();
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في استعادة المحادثة',
        variant: 'destructive'
      });
    }
  };

  // رفض الاستعادة
  const handleRejectRestore = async (conversationId) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/reject-conversation-restore/${conversationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast({
          title: 'تم الرفض',
          description: 'تم رفض طلب الاستعادة'
        });
        fetchRestoreRequests();
        fetchDeletedConversations();
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في رفض الطلب',
        variant: 'destructive'
      });
    }
  };

  // الحذف النهائي
  const handlePermanentDelete = async (conversationId) => {
    if (!window.confirm('هل أنت متأكد من الحذف النهائي؟ سيتم حذف المحادثة وجميع رسائلها نهائياً.')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/conversation-permanent/${conversationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast({
          title: 'تم الحذف',
          description: 'تم الحذف النهائي للمحادثة'
        });
        fetchDeletedConversations();
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في الحذف',
        variant: 'destructive'
      });
    }
  };

  // تنظيف المحادثات المنتهية
  const handleCleanup = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/conversations-cleanup`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'تم التنظيف',
          description: `تم حذف ${data.deleted_count} محادثة منتهية الصلاحية`
        });
        fetchDeletedConversations();
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في التنظيف',
        variant: 'destructive'
      });
    }
  };

  // حساب الوقت المتبقي
  const getRemainingDays = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  // فلترة المحادثات
  const filteredConversations = deletedConversations.filter(conv => {
    const matchesSearch = !searchQuery || 
      conv.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participants?.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === 'requests') {
      return matchesSearch && conv.status === 'restore_requested';
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trash2 className="w-7 h-7 text-red-400" />
            سلة المهملات - المحادثات
          </h1>
          <p className="text-zinc-400 mt-1">
            إدارة المحادثات المحذوفة وطلبات الاستعادة (تنتهي الصلاحية بعد 30 يوم)
          </p>
        </div>
        
        <Button 
          onClick={handleCleanup}
          variant="outline" 
          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
        >
          <AlertTriangle className="w-4 h-4 ml-2" />
          تنظيف المنتهية
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/20">
              <MessageSquare className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{deletedConversations.length}</p>
              <p className="text-zinc-400 text-sm">محادثة محذوفة</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-yellow-500/20">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{restoreRequests.length}</p>
              <p className="text-zinc-400 text-sm">طلب استعادة معلق</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-500/20">
              <RotateCcw className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">30</p>
              <p className="text-zinc-400 text-sm">يوم للاستعادة</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'bg-indigo-600' : 'border-zinc-700'}
          >
            الكل ({deletedConversations.length})
          </Button>
          <Button
            variant={activeTab === 'requests' ? 'default' : 'outline'}
            onClick={() => setActiveTab('requests')}
            className={activeTab === 'requests' ? 'bg-yellow-600' : 'border-zinc-700'}
          >
            طلبات الاستعادة ({restoreRequests.length})
          </Button>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="بحث في المحادثات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-zinc-800/50 border-zinc-700"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
              <p className="text-zinc-400">لا توجد محادثات محذوفة</p>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conv) => (
            <Card key={conv.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        {conv.type === 'private' ? (
                          <User className="w-6 h-6 text-white" />
                        ) : (
                          <Users className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white text-lg">
                          {conv.otherUserName || conv.name || 'محادثة'}
                        </h3>
                        <p className="text-zinc-500 text-sm">
                          {conv.type === 'private' ? 'محادثة خاصة' : conv.type === 'group' ? 'مجموعة' : 'قناة'}
                        </p>
                      </div>
                      <Badge 
                        className={
                          conv.status === 'restore_requested' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-red-500/20 text-red-400'
                        }
                      >
                        {conv.status === 'restore_requested' ? 'طلب استعادة' : 'محذوفة'}
                      </Badge>
                    </div>
                    
                    {/* Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-3">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {conv.messagesCount} رسالة
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {conv.participants?.length || 0} مشارك
                      </span>
                    </div>
                    
                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        حُذفت: {new Date(conv.deletedAt).toLocaleDateString('ar')}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        تنتهي خلال: {getRemainingDays(conv.expiresAt)} يوم
                      </span>
                      {conv.restoreRequestedBy && (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <User className="w-3 h-3" />
                          طالب الاستعادة: {conv.restoreRequestedBy}
                        </span>
                      )}
                      {conv.restoreReason && (
                        <span className="flex items-center gap-1 text-blue-400">
                          السبب: {conv.restoreReason}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {conv.status === 'restore_requested' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveRestore(conv.originalConversationId)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRestore(conv.originalConversationId)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                        >
                          <XCircle className="w-4 h-4 ml-1" />
                          رفض
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePermanentDelete(conv.originalConversationId)}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 ml-1" />
                        حذف نهائي
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Trash;
