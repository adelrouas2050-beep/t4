import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../hooks/use-toast';
import {
  ArrowLeft, Camera, Radio, Check, Lock, Globe,
  Link, Copy, Users, MessageSquare, Bell, Settings
} from 'lucide-react';

const CreateChannelPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: channel info, 2: channel type
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channelPhoto, setChannelPhoto] = useState('');
  const [channelUsername, setChannelUsername] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [allowComments, setAllowComments] = useState(true);
  const [signMessages, setSignMessages] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setChannelPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateUsername = () => {
    const slug = channelName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 20);
    setChannelUsername(slug || 'channel_' + Math.random().toString(36).slice(2, 8));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://t.me/${channelUsername}`);
    toast({
      title: t('تم النسخ', 'Copied'),
      description: t('تم نسخ رابط القناة', 'Channel link copied')
    });
  };

  const handleCreateChannel = () => {
    if (!channelName.trim()) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('يرجى إدخال اسم القناة', 'Please enter channel name'),
        variant: 'destructive'
      });
      return;
    }

    if (isPublic && !channelUsername.trim()) {
      toast({
        title: t('خطأ', 'Error'),
        description: t('يرجى إدخال معرف القناة', 'Please enter channel username'),
        variant: 'destructive'
      });
      return;
    }

    // Create channel logic
    toast({
      title: t('تم إنشاء القناة', 'Channel Created'),
      description: t(`تم إنشاء "${channelName}" بنجاح`, `"${channelName}" created successfully`)
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
                ? t('قناة جديدة', 'New Channel')
                : t('نوع القناة', 'Channel Type')}
            </h1>
          </div>
          {step === 1 && channelName.trim() && (
            <Button
              onClick={() => setStep(2)}
              className="bg-[#5288c1] hover:bg-[#4a7ab0]"
            >
              {t('التالي', 'Next')}
            </Button>
          )}
          {step === 2 && (
            <Button
              onClick={handleCreateChannel}
              className="bg-[#5288c1] hover:bg-[#4a7ab0]"
            >
              <Check className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {step === 1 ? (
        /* Step 1: Channel Info */
        <div className="p-4 space-y-6">
          {/* Info Box */}
          <div className="bg-[#17212b] rounded-lg p-4">
            <p className="text-[#8b9eb0] text-sm leading-relaxed">
              {t(
                'القنوات هي أداة لبث الرسائل للجماهير الكبيرة. يمكن أن تحتوي على عدد غير محدود من المشتركين.',
                'Channels are a tool for broadcasting messages to large audiences. They can have an unlimited number of subscribers.'
              )}
            </p>
          </div>

          {/* Channel Photo */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-[#232e3c]">
                <AvatarImage src={channelPhoto} />
                <AvatarFallback className="bg-[#232e3c] text-[#5288c1]">
                  <Radio className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#5288c1] hover:bg-[#4a7ab0] p-0"
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Channel Name */}
          <div className="space-y-2">
            <Label className="text-[#8b9eb0]">{t('اسم القناة', 'Channel Name')}</Label>
            <Input
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder={t('أدخل اسم القناة', 'Enter channel name')}
              className="h-12 bg-[#17212b] border-[#232e3c] text-white placeholder:text-[#6c7883]"
            />
          </div>

          {/* Channel Description */}
          <div className="space-y-2">
            <Label className="text-[#8b9eb0]">{t('وصف القناة', 'Channel Description')} ({t('اختياري', 'Optional')})</Label>
            <Textarea
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              placeholder={t('أدخل وصف القناة...', 'Enter channel description...')}
              className="bg-[#17212b] border-[#232e3c] text-white placeholder:text-[#6c7883] min-h-[100px]"
            />
          </div>
        </div>
      ) : (
        /* Step 2: Channel Type */
        <div className="p-4 space-y-6">
          {/* Channel Type */}
          <div className="space-y-3">
            <Label className="text-[#8b9eb0]">{t('نوع القناة', 'Channel Type')}</Label>
            
            <button
              onClick={() => setIsPublic(true)}
              className={`w-full flex items-start gap-4 p-4 rounded-lg transition-colors ${
                isPublic ? 'bg-[#2b5278] border border-[#5288c1]' : 'bg-[#17212b]'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPublic ? 'bg-[#5288c1]' : 'bg-[#232e3c]'
              }`}>
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-white font-medium">{t('قناة عامة', 'Public Channel')}</h3>
                <p className="text-[#8b9eb0] text-sm mt-1">
                  {t('يمكن لأي شخص البحث عن قناتك والاشتراك فيها', 
                     'Anyone can find and subscribe to your channel')}
                </p>
              </div>
              {isPublic && <Check className="w-5 h-5 text-[#5288c1]" />}
            </button>

            <button
              onClick={() => setIsPublic(false)}
              className={`w-full flex items-start gap-4 p-4 rounded-lg transition-colors ${
                !isPublic ? 'bg-[#2b5278] border border-[#5288c1]' : 'bg-[#17212b]'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                !isPublic ? 'bg-[#5288c1]' : 'bg-[#232e3c]'
              }`}>
                <Lock className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-white font-medium">{t('قناة خاصة', 'Private Channel')}</h3>
                <p className="text-[#8b9eb0] text-sm mt-1">
                  {t('يمكن الانضمام فقط عبر رابط الدعوة', 
                     'Can only be joined via invite link')}
                </p>
              </div>
              {!isPublic && <Check className="w-5 h-5 text-[#5288c1]" />}
            </button>
          </div>

          {/* Channel Username (for public) */}
          {isPublic && (
            <div className="space-y-2">
              <Label className="text-[#8b9eb0]">{t('معرف القناة', 'Channel Username')}</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6c7883]">@</span>
                  <Input
                    value={channelUsername}
                    onChange={(e) => setChannelUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="channel_name"
                    className="h-12 pr-8 bg-[#17212b] border-[#232e3c] text-white placeholder:text-[#6c7883]"
                  />
                </div>
                <Button
                  onClick={generateUsername}
                  variant="outline"
                  className="h-12 border-[#232e3c] text-[#8b9eb0]"
                >
                  {t('توليد', 'Generate')}
                </Button>
              </div>
              {channelUsername && (
                <div className="flex items-center gap-2 p-3 bg-[#17212b] rounded-lg">
                  <Link className="w-4 h-4 text-[#5288c1]" />
                  <span className="text-[#8b9eb0] flex-1 text-sm">t.me/{channelUsername}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyLink}
                    className="text-[#5288c1] h-8"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Additional Settings */}
          <div className="space-y-3">
            <Label className="text-[#8b9eb0]">{t('إعدادات إضافية', 'Additional Settings')}</Label>
            
            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#5288c1]" />
                <div>
                  <span className="text-white">{t('السماح بالتعليقات', 'Allow Comments')}</span>
                  <p className="text-[#6c7883] text-xs">{t('يمكن للمشتركين التعليق على المنشورات', 'Subscribers can comment on posts')}</p>
                </div>
              </div>
              <Switch
                checked={allowComments}
                onCheckedChange={setAllowComments}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-[#17212b] rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#5288c1]" />
                <div>
                  <span className="text-white">{t('توقيع الرسائل', 'Sign Messages')}</span>
                  <p className="text-[#6c7883] text-xs">{t('إظهار اسم المشرف على المنشورات', 'Show admin name on posts')}</p>
                </div>
              </div>
              <Switch
                checked={signMessages}
                onCheckedChange={setSignMessages}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6">
            <Label className="text-[#8b9eb0] mb-3 block">{t('معاينة', 'Preview')}</Label>
            <div className="bg-[#17212b] rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={channelPhoto} />
                  <AvatarFallback className="bg-gradient-to-br from-[#5288c1] to-[#7a5fca] text-white">
                    <Radio className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-white font-semibold">{channelName || t('اسم القناة', 'Channel Name')}</h3>
                  <p className="text-[#8b9eb0] text-sm">
                    {isPublic ? `@${channelUsername || 'username'}` : t('قناة خاصة', 'Private Channel')}
                  </p>
                </div>
              </div>
              {channelDescription && (
                <p className="text-[#8b9eb0] text-sm mt-3 border-t border-[#232e3c] pt-3">
                  {channelDescription}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateChannelPage;
