// src/pages/ChatPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chat, Channel, Window, MessageList, MessageInput, Thread, useChatContext, MessageSimple, useMessageContext } from 'stream-chat-react';
import { Video, Loader2, ArrowLeft, Lock, ShieldCheck, Phone, Check, Clock, PhoneOff, AlertTriangle, Shield } from 'lucide-react';
import "stream-chat-react/dist/css/v2/index.css";
import { useStreamClient } from '../../hooks/useStreamClient';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useToast } from '../../context/ToastContext';

const CustomChannelHeader = ({ channel, onVideoCall, highContrast, onBack }) => {
  const { client } = useChatContext();
  const members = Object.values(channel.state.members || {});
  const otherMember = members.find(m => m.user_id !== client.userID)?.user || {};
  const displayName = otherMember.name || otherMember.id || "Exam Partner";
  
  return (
    <div className={`flex items-center justify-between px-6 py-4 transition-all ${highContrast ? "bg-black border-b-2 border-yellow-400" : "bg-white border-b border-gray-100"}`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black shadow-sm ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-600 text-white'}`}>
            {displayName[0].toUpperCase()}
          </div>
          <div>
            <h1 className={`font-black text-sm md:text-base leading-none mb-1 ${highContrast ? "text-yellow-400" : "text-gray-900"}`}>
              {displayName}
            </h1>
            <div className="flex items-center gap-1.5">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Online</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
         <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-xl border border-gray-100">
            <Shield size={12} className="text-primary-600" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">E2E Encrypted</span>
         </div>
         <button 
          onClick={onVideoCall} 
          className={`h-11 px-6 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary-600 text-white shadow-primary-200 hover:bg-primary-700'}`}
        >
          <Video size={18} strokeWidth={2.5} /> 
          <span className="uppercase text-[10px] tracking-widest">Call</span>
        </button>
      </div>
    </div>
  );
};

const CustomMessage = () => {
  const { message } = useMessageContext();
  const techSignals = ['VIDEO_CALL_STARTED', 'VIDEO_CALL_MISSED', 'VIDEO_CALL_ENDED', 'VIDEO_CALL_DECLINED'];
  const isTechnical = techSignals.includes(message.text);
  
  if (isTechnical) {
      let Icon = Phone;
      let label = '';
      let colorClass = 'text-gray-400';
      const { t } = useAccessibility();

      if (message.text === 'VIDEO_CALL_STARTED') {
        label = t.video?.started || 'Video call started';
        Icon = Phone;
        colorClass = 'text-blue-500';
      }
      if (message.text === 'VIDEO_CALL_MISSED') {
        label = t.video?.missed || 'Missed video call';
        Icon = Clock;
        colorClass = 'text-red-500';
      }
      if (message.text === 'VIDEO_CALL_ENDED') {
        label = t.video?.ended || 'Call ended';
        Icon = PhoneOff;
        colorClass = 'text-gray-400';
      }
      if (message.text === 'VIDEO_CALL_DECLINED') {
        label = t.video?.declined || 'Call declined';
        Icon = AlertTriangle;
        colorClass = 'text-orange-500';
      }
      
      return (
          <div className="flex justify-center my-4">
              <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] opacity-60 ${colorClass}`}>
                  <Icon size={12} strokeWidth={3} />
                  {label}
              </div>
          </div>
      );
  }

  return <MessageSimple />;
};

const ChatPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { chat: client } = useStreamClient();
  const { highContrast } = useAccessibility();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!client || !requestId) return;

    let channelInstance = null;

    const initChannel = async () => {
      try {
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
      } catch (err) {
        console.error("Chat init error:", err);
        setError("Could not load chat.");
      }
    };

    initChannel();
    return () => {};
  }, [client, requestId]);

  if (!client || !channel) {
    if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <Loader2 className="animate-spin text-primary-600" size={48} />
        <p className="font-black text-gray-400 uppercase tracking-widest text-sm animate-pulse">Establishing Line...</p>
      </div>
    );
  }

  return (
    <div className={`h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] flex flex-col transition-all overflow-hidden border shadow-2xl rounded-[3rem] ${highContrast ? "bg-black border-yellow-400" : "bg-white border-gray-100"}`}>
      <Chat client={client} theme={highContrast ? "messaging dark" : "messaging light"}>
        <Channel channel={channel} Message={CustomMessage}>
          <Window>
            <CustomChannelHeader 
                channel={channel} 
                highContrast={highContrast}
                onVideoCall={() => navigate(`/video/${requestId}`)} 
                onBack={() => navigate(-1)}
            />
            <MessageList />
            <div className="px-6 py-4 bg-white">
              <MessageInput focus grow />
            </div>
          </Window>
          <Thread />
        </Channel>
      </Chat>
      
      {/* Premium Stream Chat Overrides */}
      <style>{`
        .str-chat { font-family: 'Inter', sans-serif !important; height: 100% !important; }
        .str-chat__container { background-color: transparent !important; }
        .str-chat-channel { height: 100% !important; }
        .str-chat__main-panel { padding: 0 !important; }
        .str-chat__message-simple { padding: 10px 24px !important; }
        .str-chat__message-simple-text-inner { border-radius: 20px !important; padding: 12px 18px !important; font-weight: 600 !important; font-size: 14px !important; border: 1px solid #f3f4f6 !important; background-color: #f9fafb !important; color: #1f2937 !important; }
        .str-chat__message-simple--me .str-chat__message-simple-text-inner { background-color: #2563eb !important; color: white !important; border-color: #2563eb !important; }
        .str-chat__input-flat { background-color: #f9fafb !important; border-radius: 24px !important; border: 1px solid #f3f4f6 !important; padding: 4px 8px !important; margin: 0 !important; }
        .str-chat__message-input { border-top: none !important; padding: 0 !important; }
        .str-chat__message-list { background-color: white !important; }
        ${highContrast ? `
          .str-chat__message-list { background-color: #000 !important; }
          .str-chat { background-color: #000 !important; color: #facc15 !important; }
          .str-chat__message-simple-text-inner { background-color: #000 !important; color: #facc15 !important; border: 2px solid #facc15 !important; }
          .str-chat__message-simple--me .str-chat__message-simple-text-inner { background-color: #facc15 !important; color: #000 !important; }
          .str-chat__input-flat { background-color: #000 !important; border: 2px solid #facc15 !important; }
          .str-chat__message-input-textarea { color: #facc15 !important; }
        ` : ''}
      `}</style>
    </div>
  );
};

export default ChatPage;