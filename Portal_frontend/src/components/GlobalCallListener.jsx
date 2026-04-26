import React, { useEffect } from 'react';
import { useStreamClient } from '../hooks/useStreamClient';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { Phone, PhoneOff, PhoneIncoming, BellRing, Clock } from 'lucide-react';

const GlobalCallListener = () => {
  const { chat: client } = useStreamClient();
  const { t, highContrast } = useAccessibility();
  const { addToast, removeToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!client || !user) return;

    const handleEvent = async (event) => {
      // We only care about new messages (signals)
      if (event.type !== 'message.new' && event.type !== 'notification.message_new') return;
      
      const message = event.message || {};
      if (!message.text || message.user?.id === client.userID || event.user?.id === client.userID) return;

      const messageText = message.text;
      const callerName = message.caller_name || message.user?.name || event.user?.name || 'Someone';
      const channelId = event.channel_id || (event.channel && event.channel.id) || '';
      const cleanId = channelId.split(':').pop() || ''; 
      const requestId = cleanId.replace('exam-', '');

      if (!requestId) return;

      // --- INCOMING CALL ---
      if (messageText === 'VIDEO_CALL_STARTED') {
        if (location.pathname.includes('/video/')) return;
        
        const toastId = `call-${requestId}`;
        addToast(
          <div className="flex items-center gap-4 py-1">
             <div className={`p-3 rounded-2xl animate-bounce ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-100 text-primary-600'}`}>
                <PhoneIncoming size={24} />
             </div>
             <div>
                <p className="font-black text-[9px] uppercase tracking-[0.2em] text-gray-400 mb-1">{t.video?.incoming || "Incoming Call"}</p>
                <p className={`font-black text-lg ${highContrast ? 'text-yellow-400' : 'text-gray-900'}`}>{callerName}</p>
             </div>
          </div>,
          'call',
          {
            label: t.video?.join || 'Answer',
            onClick: () => navigate(`/video/${requestId}`),
            onDismiss: async () => {
              try {
                const channel = client.channel('messaging', `exam-${requestId}`);
                await channel.sendMessage({ text: 'VIDEO_CALL_DECLINED' });
              } catch (err) { console.error("Decline failed", err); }
            }
          },
          toastId
        );

        // Sound effect for incoming call
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'); 
          audio.play().catch(() => {});
        } catch (e) {}
      }

      // --- CALL CANCELED / DECLINED / ENDED / MISSED ---
      if (['VIDEO_CALL_ENDED', 'VIDEO_CALL_DECLINED', 'VIDEO_CALL_MISSED'].includes(messageText)) {
        removeToast(`call-${requestId}`);
        
        // Auto-navigate away from video if call ended
        if (location.pathname.includes(`/video/${requestId}`)) {
           navigate(`/chat/${requestId}`, { replace: true });
        }

        if (messageText === 'VIDEO_CALL_MISSED') {
           addToast(
             <div className="flex items-center gap-4 py-1">
               <div className="p-3 rounded-2xl bg-red-50 text-red-600">
                  <PhoneOff size={20} />
               </div>
               <div>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{t.video?.missed || "Missed Call"}</p>
                  <p className="font-black text-gray-900">{callerName}</p>
               </div>
             </div>,
             'error',
             null,
             `missed-${requestId}-${Date.now()}` // Unique ID for missed calls
           );
        }
      }
    };

    // Listen to all events
    client.on(handleEvent);

    return () => {
      client.off(handleEvent);
    };
  }, [client, user, navigate, location.pathname, addToast, removeToast, t, highContrast]);

  return null;
};

export default GlobalCallListener;