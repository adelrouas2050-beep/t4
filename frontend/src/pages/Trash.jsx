import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useToast } from '../hooks/use-toast';
import { 
  Trash2, RotateCcw, Clock, User, MessageSquare, 
  CheckCircle, XCircle, Search, AlertTriangle, Loader2 
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const Trash = () => {
  const { toast } = useToast();
  const [deletedMessages, setDeletedMessages] = useState([]);
  const [restoreRequests, setRestoreRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, requests

  const getToken = () => localStorage.getItem('userToken') || localStorage.getItem('adminToken');

  // جلب الرسائل المحذوفة
  const fetchDeletedMessages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDeletedMessages(data);
      }
    } catch (error) {
      console.error('Error fetching deleted messages:', error);
    }
  };

  // جلب طلبات الاستعادة
  const fetchRestoreRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/requests`, {
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
      await Promise.all([fetchDeletedMessages(), fetchRestoreRequests()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // الموافقة على الاستعادة
  const handleApproveRestore = async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/approve-restore/${messageId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast({
          title: 'تم الاستعادة',
          description: 'تم استعادة الرسالة بنجاح'
        });
        fetchDeletedMessages();
        fetchRestoreRequests();
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في استعادة الرسالة',
        variant: 'destructive'
      });
    }
  };

  // رفض الاستعادة
  const handleRejectRestore = async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/reject-restore/${messageId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast({
          title: 'تم الرفض',
          description: 'تم رفض طلب الاستعادة'
        });
        fetchRestoreRequests();
        fetchDeletedMessages();
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
  const handlePermanentDelete = async (messageId) => {
    if (!window.confirm('هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/permanent/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast({
          title: 'تم الحذف',
          description: 'تم الحذف النهائي للرسالة'
        });
        fetchDeletedMessages();
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في الحذف',
        variant: 'destructive'
      });
    }
  };

  // تنظيف الرسائل المنتهية
  const handleCleanup = async () => {
    try {
      const response = await fetch(`${API_URL}/api/chat/trash/cleanup`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'تم التنظيف',
          description: `تم حذف ${data.deleted_count} رسالة منتهية الصلاحية`
        });
        fetchDeletedMessages();
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
  const getRemainingTime = (expiresAt) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return 'منتهية';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} يوم`;
    return `${hours} ساعة`;
  };

  // فلترة الرسائل
  const filteredMessages = deletedMessages.filter(msg => {
    const matchesSearch = !searchQuery || 
      msg.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.senderName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'requests') {
      return matchesSearch && msg.status === 'restore_requested';
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
            سلة المهملات
          </h1>
          <p className="text-zinc-400 mt-1">
            إدارة الرسائل المحذوفة وطلبات الاستعادة (تنتهي الصلاحية بعد 30 يوم)
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
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{deletedMessages.length}</p>
              <p className="text-zinc-400 text-sm">رسالة محذوفة</p>
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
            الكل ({deletedMessages.length})
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
            placeholder="بحث في الرسائل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-zinc-800/50 border-zinc-700"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3">
        {filteredMessages.length === 0 ? (
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-8 text-center">
              <Trash2 className="w-12 h-12 mx-auto text-zinc-600 mb-4" />
              <p className="text-zinc-400">لا توجد رسائل محذوفة</p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((msg) => (
            <Card key={msg.id} className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="font-medium text-white">{msg.senderName}</span>
                      <Badge 
                        className={
                          msg.status === 'restore_requested' 
                            ? 'bg-yellow-500/20 text-yellow-400' 
                            : 'bg-red-500/20 text-red-400'
                        }
                      >
                        {msg.status === 'restore_requested' ? 'طلب استعادة' : 'محذوفة'}
                      </Badge>
                    </div>
                    
                    {/* Content */}
                    <p className="text-zinc-300 mb-2 line-clamp-2">{msg.content}</p>
                    
                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        حُذفت: {new Date(msg.deletedAt).toLocaleDateString('ar')}
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        تنتهي: {getRemainingTime(msg.expiresAt)}
                      </span>
                      {msg.restoreRequestedBy && (
                        <span className="flex items-center gap-1 text-yellow-500">
                          <User className="w-3 h-3" />
                          طالب الاستعادة: {msg.restoreRequestedBy}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {msg.status === 'restore_requested' ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApproveRestore(msg.originalMessageId)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 ml-1" />
                          موافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectRestore(msg.originalMessageId)}
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
                        onClick={() => handlePermanentDelete(msg.originalMessageId)}
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
