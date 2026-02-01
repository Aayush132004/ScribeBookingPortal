// src/pages/ChatPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chat, Channel, Window, MessageList, MessageInput, Thread, useChatContext } from 'stream-chat-react';
import { Video, Loader2, ArrowLeft, Lock } from 'lucide-react';
import "stream-chat-react/dist/css/v2/index.css";
import { useStreamClient } from '../../hooks/useStreamClient';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useToast } from '../../context/ToastContext';

const CustomChannelHeader = ({ channel, onVideoCall, highContrast, onBack }) => {
  const { client } = useChatContext();
  const members = Object.values(channel.state.members || {});
  const otherMember = members.find(m => m.user_id !== client.userID)?.user || {};
  const displayName = otherMember.name || otherMember.id || "Exam Support";
  
  return (
    <div className={`flex items-center justify-between px-6 py-4 z-10 ${highContrast ? "bg-black border-b-2 border-yellow-400" : "bg-white border-b border-slate-100 shadow-sm"}`}>
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100"><ArrowLeft size={20}/></button>
        <div>
          <h1 className={`font-bold text-lg ${highContrast ? "text-yellow-400" : "text-slate-900"}`}>{displayName}</h1>
          <div className="text-xs text-green-600 font-bold flex items-center gap-1"><Lock size={10} /> Secure</div>
        </div>
      </div>
      <button onClick={onVideoCall} className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary text-white'}`}>
        <Video size={18} /> <span>Video Call</span>
      </button>
    </div>
  );
};

const ChatPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { chat: client } = useStreamClient();
  const { highContrast } = useAccessibility();
  const { addToast, removeToast } = useToast();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);
  const activeToastRef = useRef(null);

  // Initialize Channel & Listeners
  useEffect(() => {
    if (!client || !requestId) return;

    let channelInstance = null;

    const initChannel = async () => {
      try {
        // Sync members
        let members = [];
        try {
          const { data } = await api.get(`/auth/chat/participants/${requestId}`);
          members = data.members;
        } catch (backendErr) { 
          console.warn("Backend sync failed"); 
        }

        channelInstance = client.channel('messaging', `exam-${requestId}`, {
          name: `Exam Support`,
          ...(members?.length ? { members } : {}),
        });
        
        await channelInstance.watch();
        setChannel(channelInstance);

        // ✅ LISTEN FOR INCOMING CALLS
        const handleNewMessage = async (event) => {
          // Ignore my own messages
          if (event.user.id === client.userID) return;

          const messageText = event.message.text || '';
          const callerName = event.user?.name || event.user?.id || 'Someone';

          // ✅ Show toast for call invitations
          if (messageText.includes('📞 Started a Video Call')) {
            
            // Remove any existing toast first
            if (activeToastRef.current) {
              removeToast(activeToastRef.current);
            }

            // Create unique toast ID
            const toastId = `call-${requestId}-${Date.now()}`;
            activeToastRef.current = toastId;

            // ✅ Show toast with Join AND Dismiss actions
            addToast(
              `${callerName} is calling you`,
              'call',
              {
                label: 'Join',
                onClick: () => {
                  activeToastRef.current = null;
                  navigate(`/video/${requestId}`);
                },
                // ✅ ADD DISMISS HANDLER
                onDismiss: async () => {
                  try {
                    // Send "Call Declined" message to notify caller
                    await channelInstance.sendMessage({ text: '❌ Call Declined' });
                    
                    // Remove toast
                    if (activeToastRef.current) {
                      removeToast(activeToastRef.current);
                      activeToastRef.current = null;
                    }
                  } catch (err) {
                    console.error('Failed to send decline message:', err);
                  }
                }
              },
              toastId
            );
          }

          // ✅ Clear toast when call ends, is missed, or declined
          if (messageText.includes('❌ Missed Video Call') || 
              messageText.includes('📞 Call Ended') ||
              messageText.includes('❌ Call Declined')) {
            if (activeToastRef.current) {
              removeToast(activeToastRef.current);
              activeToastRef.current = null;
            }
          }
        };

        channelInstance.on('message.new', handleNewMessage);

      } catch (err) {
        console.error("Chat init error:", err);
        setError("Could not load chat.");
      }
    };

    initChannel();

    // Cleanup on unmount
    return () => {
      if (channelInstance) {
        channelInstance.off('message.new');
      }
      if (activeToastRef.current) {
        removeToast(activeToastRef.current);
        activeToastRef.current = null;
      }
    };
  }, [client, requestId, navigate, addToast, removeToast]);

  const containerClass = highContrast ? "bg-black border-2 border-yellow-400" : "bg-white border border-slate-200 shadow-xl";

  if (!client || !channel) {
    if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
    return (
      <div className={`flex flex-col items-center justify-center h-[60vh] gap-4 ${highContrast ? 'bg-black' : ''}`}>
        <Loader2 className={`animate-spin ${highContrast ? 'text-yellow-400' : 'text-primary'}`} size={40} />
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto h-[85vh] rounded-2xl overflow-hidden flex flex-col transition-colors ${containerClass}`}>
      <Chat client={client} theme={highContrast ? "messaging dark" : "messaging light"}>
        <Channel channel={channel}>
          <Window>
            <CustomChannelHeader 
                channel={channel} 
                highContrast={highContrast}
                onVideoCall={() => navigate(`/video/${requestId}`)} 
                onBack={() => navigate(-1)}
            />
            <MessageList />
            <MessageInput focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
      {highContrast && <style>{`.str-chat { background-color: #000 !important; color: #facc15 !important; }`}</style>}
    </div>
  );
};

export default ChatPage;