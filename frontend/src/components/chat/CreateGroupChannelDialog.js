import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useLanguage } from '../../context/LanguageContext';
import { useAdvancedChat } from '../../context/AdvancedChatContext';
import { mockUsers } from '../../mock/advancedChatData';
import { Users, Radio, Plus, Search, X, Shield, Lock, Globe } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const CreateGroupChannelDialog = ({ type = 'group' }) => {
  const { t, language } = useLanguage();
  const { createGroup, createChannel } = useAdvancedChat();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    isPublic: true,
    selectedMembers: []
  });

  const handleCreate = () => {
    if (!formData.name || !formData.nameEn) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('الرجاء إدخال الاسم', 'Please enter name'),
        variant: 'destructive'
      });
      return;
    }

    if (type === 'group') {
      if (formData.selectedMembers.length === 0) {
        toast({
          title: t('خطأ', 'Error'),
          description: t('الرجاء اختيار أعضاء', 'Please select members'),
          variant: 'destructive'
        });
        return;
      }
      createGroup(formData.name, formData.nameEn, formData.selectedMembers, formData.isPublic);
      toast({
        title: t('تم إنشاء المجموعة', 'Group Created'),
        description: t('تم إنشاء المجموعة بنجاح', 'Group created successfully')
      });
    } else {
      createChannel(formData.name, formData.nameEn, formData.isPublic);
      toast({
        title: t('تم إنشاء القناة', 'Channel Created'),
        description: t('تم إنشاء القناة بنجاح', 'Channel created successfully')
      });
    }

    setOpen(false);
    setStep(1);
    setFormData({ name: '', nameEn: '', description: '', isPublic: true, selectedMembers: [] });
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(userId)
        ? prev.selectedMembers.filter(id => id !== userId)
        : [...prev.selectedMembers, userId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          {type === 'group' ? t('مجموعة جديدة', 'New Group') : t('قناة جديدة', 'New Channel')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {type === 'group' 
              ? t('إنشاء مجموعة جديدة', 'Create New Group')
              : t('إنشاء قناة جديدة', 'Create New Channel')
            }
          </DialogTitle>
        </DialogHeader>

        <Tabs value={`step${step}`} onValueChange={(v) => setStep(parseInt(v.replace('step', '')))}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="step1">1. {t('المعلومات', 'Info')}</TabsTrigger>
            <TabsTrigger value="step2" disabled={!formData.name}>
              2. {type === 'group' ? t('الأعضاء', 'Members') : t('الإعدادات', 'Settings')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="step1" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>{t('اسم', 'Name')} ({t('عربي', 'Arabic')})</Label>
              <Input
                placeholder={t('أدخل الاسم بالعربية', 'Enter name in Arabic')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('اسم', 'Name')} ({t('إنجليزي', 'English')})</Label>
              <Input
                placeholder={t('أدخل الاسم بالإنجليزية', 'Enter name in English')}
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('الوصف', 'Description')} ({t('اختياري', 'Optional')})</Label>
              <Textarea
                placeholder={t('أدخل وصف المجموعة/القناة', 'Enter description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                {formData.isPublic ? <Globe className="w-5 h-5 text-blue-600" /> : <Lock className="w-5 h-5 text-slate-600" />}
                <div>
                  <p className="font-semibold">
                    {formData.isPublic ? t('عام', 'Public') : t('خاص', 'Private')}
                  </p>
                  <p className="text-xs text-slate-600">
                    {formData.isPublic 
                      ? t('يمكن لأي شخص الانضمام', 'Anyone can join')
                      : t('يحتاج دعوة للانضمام', 'Needs invitation to join')
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.isPublic}
                onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
              />
            </div>
            <Button onClick={() => setStep(2)} className="w-full" disabled={!formData.name || !formData.nameEn}>
              {t('التالي', 'Next')}
            </Button>
          </TabsContent>

          <TabsContent value="step2" className="space-y-4 mt-4">
            {type === 'group' ? (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input placeholder={t('بحث عن أعضاء', 'Search members')} className="pl-10" />
                </div>
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {mockUsers.filter(u => u.id !== 'user1').map(user => (
                    <div
                      key={user.id}
                      onClick={() => toggleMember(user.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        formData.selectedMembers.includes(user.id)
                          ? 'bg-blue-50 border-2 border-blue-600'
                          : 'hover:bg-slate-50 border-2 border-transparent'
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={user.photo} />
                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold">{language === 'ar' ? user.name : user.nameEn}</p>
                        <p className="text-xs text-slate-600">@{user.username}</p>
                      </div>
                      {formData.selectedMembers.includes(user.id) && (
                        <Badge className="bg-blue-600">{t('محدد', 'Selected')}</Badge>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-slate-600">
                    {t('المحدد', 'Selected')}: {formData.selectedMembers.length}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setStep(1)}>{t('السابق', 'Back')}</Button>
                    <Button onClick={handleCreate} disabled={formData.selectedMembers.length === 0}>
                      {t('إنشاء المجموعة', 'Create Group')}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{t('قناة موثقة', 'Verified Channel')}</p>
                        <p className="text-xs text-slate-600">{t('طلب التوثيق', 'Request verification')}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">{t('طلب', 'Request')}</Button>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {t('ملاحظة: القنوات مخصصة للبث فقط. الأعضاء لا يمكنهم إرسال رسائل.', 
                         'Note: Channels are for broadcasting only. Members cannot send messages.')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">{t('السابق', 'Back')}</Button>
                  <Button onClick={handleCreate} className="flex-1">{t('إنشاء القناة', 'Create Channel')}</Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupChannelDialog;