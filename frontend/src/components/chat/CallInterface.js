import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useLanguage } from '../../context/LanguageContext';
import { useAdvancedChat } from '../../context/AdvancedChatContext';
import { Phone, Video, X, Mic, MicOff, VideoOff, Volume2 } from 'lucide-react';
import { useState } from 'react';

const CallInterface = () => {
  const { t, language } = useLanguage();
  const { callInProgress, endCall } = useAdvancedChat();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  if (!callInProgress) return null;

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  React.useEffect(() => {
    if (callInProgress && callInProgress.status === 'in_progress') {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [callInProgress]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 to-blue-700 z-50 flex items-center justify-center">
      <Card className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border-white/20 text-white">
        <div className="text-center space-y-6">
          {/* Caller Info */}
          <div className="space-y-4">
            <Avatar className="w-32 h-32 mx-auto border-4 border-white/30">
              <AvatarImage src="https://randomuser.me/api/portraits/men/1.jpg" />
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {t('أحمد محمد', 'Ahmed Mohammed')}
              </h2>
              <p className="text-white/70">
                {callInProgress.status === 'calling' && t('جاري الاتصال...', 'Calling...')}
                {callInProgress.status === 'in_progress' && formatDuration(callDuration)}
                {callInProgress.status === 'ended' && t('انتهت المكالمة', 'Call Ended')}
              </p>
            </div>
          </div>

          {/* Call Type Indicator */}
          <div className="flex items-center justify-center gap-2 text-white/80">
            {callInProgress.type === 'video' ? (
              <><Video className="w-5 h-5" /> {t('مكالمة فيديو', 'Video Call')}</>
            ) : (
              <><Phone className="w-5 h-5" /> {t('مكالمة صوتية', 'Voice Call')}</>
            )}
          </div>

          {/* Call Controls */}
          {callInProgress.status === 'in_progress' && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button
                size="lg"
                variant="ghost"
                className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              
              {callInProgress.type === 'video' && (
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                >
                  {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </Button>
              )}
              
              <Button
                size="lg"
                variant="ghost"
                className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30"
              >
                <Volume2 className="w-6 h-6" />
              </Button>
            </div>
          )}

          {/* End Call Button */}
          <Button
            size="lg"
            onClick={endCall}
            className="w-full bg-red-500 hover:bg-red-600 text-white gap-2"
          >
            <X className="w-5 h-5" />
            {t('إنهاء المكالمة', 'End Call')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CallInterface;