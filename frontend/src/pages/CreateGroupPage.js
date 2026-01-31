import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { Checkbox } from '../components/ui/checkbox';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/use-toast';
import {
  ArrowLeft, Camera, Users, Check, Search,
  Lock, Globe, Link, Image as ImageIcon
} from 'lucide-react';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const [step, setStep] = useState(1); // 1: select members, 2: group info
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupPhoto, setGroupPhoto] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Mock contacts
  const contacts = [
    { id: 'user2', name: 'أحمد محمد', nameEn: 'Ahmed Mohammed', photo: '', status: 'online' },
    { id: 'user3', name: 'خالد العتيبي', nameEn: 'Khaled Al-Otaibi', photo: '', status: 'offline' },
    { id: 'user4', name: 'سارة أحمد', nameEn: 'Sara Ahmed', photo: '', status: 'online' },
    { id: 'user5', name: 'محمد علي', nameEn: 'Mohammed Ali', photo: '', status: 'offline' },
    { id: 'user6', name: 'فاطمة حسن', nameEn: 'Fatima Hassan', photo: '', status: 'online' },
    { id: 'user7', name: 'عبدالله سعيد', nameEn: 'Abdullah Saeed', photo: '', status: 'offline' },
  ];

  const filteredContacts = contacts.filter(contact => {
    if (!searchQuery) return true;
    const name = language === 'ar' ? contact.name : contact.nameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const toggleMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('يرجى إدخال اسم المجموعة', 'Please enter group name'),
        variant: 'destructive'
      });
      return;
    }

    // Create group logic here
    toast({
      title: t('تم إنشاء المجموعة', 'Group Created'),
      description: t(`تم إنشاء "${groupName}" بنجاح`, `"${groupName}" created successfully`)
    });
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-[#0e1621]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-[#17212b] border-b border-[#232e3c] sticky top-0 z-50">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => step === 1 ? navigate(-1) : setStep(1)}
              className="text-[#8b9eb0] hover:text-white hover:bg-[#232e3c] h-10 w-10 p-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white mr-4">
              {step === 1 
                ? t('إضافة أعضاء', 'Add Members')
                : t('مجموعة جديدة', 'New Group')}
            </h1>
          </div>
          {step === 1 && selectedMembers.length > 0 && (
            <Button
              onClick={() => setStep(2)}
              className="bg-[#5288c1] hover:bg-[#4a7ab0]"
            >
              {t('التالي', 'Next')}
              <span className="mr-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {selectedMembers.length}
              </span>
            </Button>
          )}
          {step === 2 && (
            <Button
              onClick={handleCreateGroup}
              className="bg-[#5288c1] hover:bg-[#4a7ab0]"
            >
              <Check className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {step === 1 ? (
        /* Step 1: Select Members */
        <div>
          {/* Selected Members */}
          {selectedMembers.length > 0 && (
            <div className="p-4 bg-[#17212b] border-b border-[#232e3c]">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {selectedMembers.map(memberId => {
                  const member = contacts.find(c => c.id === memberId);
                  return (
                    <div 
                      key={memberId}
                      onClick={() => toggleMember(memberId)}
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <div className="relative">
                        <Avatar className="w-14 h-14">
                          <AvatarImage src={member?.photo} />
                          <AvatarFallback className="bg-gradient-to-br from-[#5288c1] to-[#7a5fca] text-white">
                            {member?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✕</span>
                        </div>
                      </div>
                      <span className="text-[#8b9eb0] text-xs mt-1 max-w-[60px] truncate">
                        {language === 'ar' ? member?.name?.split(' ')[0] : member?.nameEn?.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6c7883]" />
              <Input
                placeholder={t('البحث عن جهات الاتصال...', 'Search contacts...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pr-10 bg-[#242f3d] border-0 text-white placeholder:text-[#6c7883] rounded-lg"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="divide-y divide-[#232e3c]">
            {filteredContacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => toggleMember(contact.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${
                  selectedMembers.includes(contact.id) ? 'bg-[#2b5278]/30' : 'hover:bg-[#17212b]'
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={contact.photo} />
                    <AvatarFallback className="bg-gradient-to-br from-[#5288c1] to-[#7a5fca] text-white">
                      {contact.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {contact.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4dcd5e] border-2 border-[#0e1621] rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">
                    {language === 'ar' ? contact.name : contact.nameEn}
                  </h3>
                  <p className="text-[#8b9eb0] text-sm">
                    {contact.status === 'online' 
                      ? t('متصل', 'online')
                      : t('غير متصل', 'offline')}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedMembers.includes(contact.id) 
                    ? 'bg-[#5288c1] border-[#5288c1]' 
                    : 'border-[#6c7883]'
                }`}>
                  {selectedMembers.includes(contact.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Step 2: Group Info */
        <div className="p-4 space-y-6">
          {/* Group Photo */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-[#232e3c]">
                <AvatarImage src={groupPhoto} />
                <AvatarFallback className="bg-[#232e3c] text-[#5288c1]">
                  <Users className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#5288c1] hover:bg-[#4a7ab0] cursor-pointer flex items-center justify-center">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <Label className="text-[#8b9eb0]">{t('اسم المجموعة', 'Group Name')}</Label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={t('أدخل اسم المجموعة', 'Enter group name')}
              className="h-12 bg-[#17212b] border-[#232e3c] text-white placeholder:text-[#6c7883]"
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <Label className="text-[#8b9eb0]">{t('وصف المجموعة', 'Group Description')} ({t('اختياري', 'Optional')})</Label>
            <Textarea
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              placeholder={t('أدخل وصف المجموعة...', 'Enter group description...')}
              className="bg-[#17212b] border-[#232e3c] text-white placeholder:text-[#6c7883] min-h-[100px]"
            />
          </div>

          {/* Members Preview */}
          <div className="space-y-2">
            <Label className="text-[#8b9eb0]">
              {t('الأعضاء', 'Members')} ({selectedMembers.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map(memberId => {
                const member = contacts.find(c => c.id === memberId);
                return (
                  <div 
                    key={memberId}
                    className="flex items-center gap-2 bg-[#17212b] px-3 py-2 rounded-full"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-[#5288c1] text-white text-xs">
                        {member?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white text-sm">
                      {language === 'ar' ? member?.name?.split(' ')[0] : member?.nameEn?.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGroupPage;
