import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Chat, 
  Channel, 
  Window, 
  ChannelHeader, 
  MessageList, 
  MessageInput, 
  Thread 
} from 'stream-chat-react';
import { Video, Loader2, ArrowLeft, Lock } from 'lucide-react';
import "stream-chat-react/dist/css/v2/index.css";
import { useStreamClient } from '../../hooks/useStreamClient';
import api from '../../api/axios';
import { useAccessibility } from '../../context/AccessibilityContext';

const ChatPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { chat: client } = useStreamClient();
  const { highContrast } = useAccessibility();
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!client || !requestId) return;

    const initChannel = async () => {
      try {
        let members = [];
        // Try to sync with backend
        try {
          const { data } = await api.get(`/auth/chat/participants/${requestId}`);
          members = data.members;
        } catch (backendErr) {
          console.warn("Backend sync failed, trying local cache...", backendErr);
        }

        // Initialize Channel
        const newChannel = client.channel('messaging', `exam-${requestId}`, {
          name: `Exam Support - Request #${requestId}`,
          ...(members?.length ? { members } : {}), // Only pass members if we have them
        });
        
        await newChannel.watch();
        setChannel(newChannel);
      } catch (err) {
        console.error("Chat init error:", err);
        setError("Could not load chat history. Please try refreshing.");
      }
    };

    initChannel();
  }, [client, requestId]);

  // Styles
  const containerClass = highContrast ? "bg-black border-2 border-yellow-400" : "bg-white border border-slate-200 shadow-xl";
  const headerClass = highContrast ? "bg-black border-b border-yellow-400 text-yellow-400" : "bg-white border-b border-slate-100 text-slate-900";

  if (!client || !channel) {
    if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className={`animate-spin ${highContrast ? 'text-yellow-400' : 'text-primary'}`} size={40} />
        <p className="font-medium text-slate-500">Connecting...</p>
      </div>
    );
  }

  return (
    <div className={`max-w-6xl mx-auto h-[85vh] rounded-2xl overflow-hidden flex flex-col transition-colors ${containerClass}`}>
      <div className={`flex items-center justify-between px-6 py-4 z-10 ${headerClass}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg">Exam Support Chat</h1>
            <div className="text-xs text-green-600 font-bold flex items-center gap-1">
               <Lock size={10} /> Secure & Encrypted
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/video/${requestId}`)}
          className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:bg-opacity-90 ${highContrast ? 'bg-yellow-400 text-black' : 'bg-primary text-white'}`}
        >
          <Video size={18} />
          <span>Start Video Call</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <Chat client={client} theme={highContrast ? "messaging dark" : "messaging light"}>
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>
    </div>
  );
};

export default ChatPage;