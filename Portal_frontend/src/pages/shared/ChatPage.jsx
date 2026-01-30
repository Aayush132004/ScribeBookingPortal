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
import { Video, Loader2, ArrowLeft } from 'lucide-react';
import "stream-chat-react/dist/css/v2/index.css";
import { useStreamClient } from '../../hooks/useStreamClient';

const ChatPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { chat: client } = useStreamClient(); // Access the chat client from our custom hook
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    if (!client || !requestId) return;

    const initChannel = async () => {
      try {
        // Create a unique channel for this specific exam request
        const newChannel = client.channel('messaging', `exam-${requestId}`, {
          name: `Exam Support - Request #${requestId}`,
        });
        
        await newChannel.watch();
        setChannel(newChannel);
      } catch (err) {
        console.error("Error initializing chat channel:", err);
      }
    };

    initChannel();
  }, [client, requestId]);

  if (!client || !channel) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-slate-500 font-medium">Connecting to secure chat...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[85vh] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Custom Header with Video Call Action */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Exam Support Chat</h2>
            <p className="text-xs text-green-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" /> Secure & Encrypted
            </p>
          </div>
        </div>

        <button 
          onClick={() => navigate(`/video/${requestId}`)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-all shadow-md active:scale-95"
        >
          <Video size={18} />
          <span>Start Video Call</span>
        </button>
      </div>

      {/* Stream Chat UI */}
      <div className="flex-1 overflow-hidden">
        <Chat client={client} theme="messaging light">
          <Channel channel={channel}>
            <Window>
              <ChannelHeader hideOnThread />
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