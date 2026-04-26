// src/pages/VideoCall.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  StreamVideo, StreamCall, useCallStateHooks, ParticipantView, StreamTheme, 
  ToggleAudioPublishingButton, ToggleVideoPublishingButton 
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useStreamClient } from '../../hooks/useStreamClient';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Loader2, PhoneOff, Clock, ShieldCheck, Maximize2, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';

// --- WAITING TIMER COMPONENT ---
const WaitingTimer = ({ seconds, t }) => (
  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-6 py-4 rounded-[2rem] border border-white/10 shadow-2xl z-50 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
    <div className="relative">
      <div className="absolute inset-0 bg-yellow-400/20 blur-lg rounded-full animate-pulse"></div>
      <Clock className="text-yellow-400 relative z-10" size={20} />
    </div>
    <div>
      <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">{t.video?.auto_hangup || "Auto-hangup in"}</p>
      <p className="text-2xl font-black text-white tabular-nums leading-none">{seconds}<span className="text-xs ml-1 opacity-50">S</span></p>
    </div>
  </div>
);

// --- LAYOUT ---
const SimpleTwoScreenLayout = ({ showTimer, timeLeft, t, highContrast }) => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const local = participants.find(p => p.isLocalParticipant);
  const remote = participants.find(p => !p.isLocalParticipant);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 gap-4 p-4 md:p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-600/5 blur-[120px] rounded-full pointer-events-none"></div>

      {showTimer && !remote && <WaitingTimer seconds={timeLeft} t={t} />}
      
      <div className="flex-1 rounded-[3rem] overflow-hidden relative flex items-center justify-center border border-white/5 bg-zinc-900 shadow-2xl group">
        {remote ? (
          <ParticipantView participant={remote} />
        ) : (
          <div className="text-center relative z-10">
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-primary-500 blur-[60px] opacity-20 rounded-full animate-pulse"></div>
               <div className="h-32 w-32 rounded-[2.5rem] bg-zinc-800 border border-white/10 flex items-center justify-center mx-auto shadow-2xl relative">
                  <Loader2 className="animate-spin text-primary-500" size={48} strokeWidth={3} />
               </div>
            </div>
            <h3 className="text-white text-3xl font-black tracking-tight mb-2">
              {t.video?.calling_remote || "Calling..."}
            </h3>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px]">
              {t.video?.waiting || "Establishing secure line"}
            </p>
          </div>
        )}
        
        {/* Name Badge */}
        <div className="absolute top-6 left-6 flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-white text-xs font-black tracking-widest uppercase">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          {remote ? remote.name : (t.video?.waiting || "Connecting...")}
        </div>
      </div>
      
      {/* PiP Local Video */}
      <div className="absolute bottom-32 right-8 md:bottom-32 md:right-12 h-40 w-40 md:h-56 md:w-56 rounded-[2.5rem] overflow-hidden border-2 border-white/10 shadow-2xl bg-zinc-800 z-20 group transition-transform hover:scale-105 duration-500">
          {local && <ParticipantView participant={local} />}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">
            {t.video?.you || "You"}
          </div>
      </div>
    </div>
  );
};

// --- CONTROLS ---
const CustomControls = ({ onLeave }) => {
  const { useMicrophoneState, useCameraState } = useCallStateHooks();
  const { isMuted: isMicMuted } = useMicrophoneState();
  const { isMuted: isCamMuted } = useCameraState();

  return (
    <div className="flex items-center gap-6 p-5 bg-zinc-900/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 animate-in slide-in-from-bottom-8 duration-700">
       <div className="flex items-center gap-4">
          <div className="group relative">
            <ToggleAudioPublishingButton />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isMicMuted ? 'Unmute' : 'Mute'}
            </div>
          </div>
          <div className="group relative">
            <ToggleVideoPublishingButton />
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-800 text-white text-[10px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {isCamMuted ? 'Start Video' : 'Stop Video'}
            </div>
          </div>
       </div>
       
       <div className="w-px h-10 bg-white/10 mx-2"></div>
       
       <button 
         onClick={onLeave} 
         className="bg-red-600 hover:bg-red-500 text-white h-14 w-14 rounded-3xl transition-all shadow-xl shadow-red-900/20 flex items-center justify-center hover:scale-110 active:scale-95 group"
       >
         <PhoneOff size={24} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
       </button>
    </div>
  );
};

// --- MAIN COMPONENT ---
const VideoCall = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { t, highContrast } = useAccessibility();
  const { video: videoClient, chat: chatClient } = useStreamClient();
  const [call, setCall] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [showTimer, setShowTimer] = useState(false);
  
  const callRef = useRef(null);
  const inviteSentRef = useRef(false);
  const callConnectedRef = useRef(false);
  const participantLeftListenerRef = useRef(null);
  const timerRef = useRef(null);
  const callDeclinedRef = useRef(false);

  useEffect(() => {
    if (!videoClient || !requestId) return;
    
    const initCall = async () => {
      try {
        const callInstance = videoClient.call('default', `exam-${requestId}`);
        await callInstance.join({ create: true });
        setCall(callInstance);
        callRef.current = callInstance;

        const handleParticipantJoined = (event) => {
          if (event.participant.user_id !== callInstance.currentUserId) {
            callConnectedRef.current = true;
            setShowTimer(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        };

        const handleParticipantLeft = async (event) => {
          if (event.participant.user_id !== callInstance.currentUserId) {
            if (chatClient) {
              try {
                const channel = chatClient.channel('messaging', `exam-${requestId}`);
                await channel.sendMessage({ text: 'VIDEO_CALL_ENDED' });
              } catch (err) {}
            }
            await callInstance.leave();
            callRef.current = null;
            navigate(`/chat/${requestId}`, { replace: true });
          }
        };

        callInstance.on('call.session_participant_joined', handleParticipantJoined);
        callInstance.on('call.session_participant_left', handleParticipantLeft);
        participantLeftListenerRef.current = handleParticipantLeft;

      } catch (err) {
        console.error("Video join error:", err);
        navigate(-1);
      }
    };
    
    initCall();
    
    return () => {
      if (callRef.current) {
        if (participantLeftListenerRef.current) {
          callRef.current.off('call.session_participant_left', participantLeftListenerRef.current);
        }
        callRef.current.leave().catch(() => {});
        callRef.current = null;
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [videoClient, requestId, navigate, chatClient]);

  useEffect(() => {
    if (!chatClient || !requestId || !call || inviteSentRef.current) return;
    
    const sendInvite = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      if (call.state.participantCount <= 1 && !inviteSentRef.current) {
        try {
          const channel = chatClient.channel('messaging', `exam-${requestId}`);
          await channel.watch();
          const myName = chatClient.user?.name || chatClient.user?.id || 'Someone';
          await channel.sendMessage({ text: `VIDEO_CALL_STARTED`, caller_name: myName });
          inviteSentRef.current = true;
          setShowTimer(true);
          timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(timerRef.current);
                handleAutoHangup();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        } catch (err) {}
      }
    };
    sendInvite();
  }, [chatClient, requestId, call]);

  useEffect(() => {
    if (!chatClient || !requestId) return;
    const channel = chatClient.channel('messaging', `exam-${requestId}`);
    const handleCallDeclined = async (event) => {
      if (event.user?.id === chatClient.userID) return;
      if (event.message?.text === 'VIDEO_CALL_DECLINED') {
        callDeclinedRef.current = true;
        if (timerRef.current) clearInterval(timerRef.current);
        if (callRef.current) await callRef.current.leave();
        navigate(`/chat/${requestId}`, { replace: true });
      }
    };
    channel.on('message.new', handleCallDeclined);
    return () => channel.off('message.new', handleCallDeclined);
  }, [chatClient, requestId, navigate]);

  const handleAutoHangup = async () => {
    if (!callRef.current || !chatClient) return;
    try {
      if (!callConnectedRef.current) {
        const channel = chatClient.channel('messaging', `exam-${requestId}`);
        await channel.sendMessage({ text: 'VIDEO_CALL_MISSED' });
      }
      await callRef.current.leave();
      navigate(`/chat/${requestId}`, { replace: true });
    } catch (err) {
      navigate(`/chat/${requestId}`, { replace: true });
    }
  };

  const handleLeave = async () => {
    if (!callRef.current) {
      navigate(`/chat/${requestId}`, { replace: true });
      return;
    }
    try {
      if (timerRef.current) clearInterval(timerRef.current);
      if (inviteSentRef.current && !callConnectedRef.current && !callDeclinedRef.current && chatClient) {
        const channel = chatClient.channel('messaging', `exam-${requestId}`);
        await channel.sendMessage({ text: 'VIDEO_CALL_MISSED' });
      } else if (callConnectedRef.current && chatClient) {
        const channel = chatClient.channel('messaging', `exam-${requestId}`);
        await channel.sendMessage({ text: 'VIDEO_CALL_ENDED' });
      }
      if (participantLeftListenerRef.current) {
        callRef.current.off('call.session_participant_left', participantLeftListenerRef.current);
      }
      await callRef.current.leave();
    } catch (err) {
    } finally {
      navigate(`/chat/${requestId}`, { replace: true });
    }
  };

  if (!call) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-600 blur-[80px] opacity-20 rounded-full animate-pulse"></div>
        <Loader2 className="animate-spin text-primary-600 relative z-10" size={80} strokeWidth={3} />
      </div>
      <div className="text-center space-y-2">
        <p className="font-black text-white text-2xl tracking-tight">{t.video?.connecting || "Establishing Secure Connection"}</p>
        <div className="flex items-center justify-center gap-2 text-primary-400 font-bold text-[10px] uppercase tracking-widest">
           <ShieldCheck size={14} strokeWidth={3} /> Military Grade Encryption
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 text-white font-sans">
      <StreamVideo client={videoClient}>
        <StreamTheme as="main" className="stream-video-theme-dark h-full">
          <StreamCall call={call}>
            <div className="h-full w-full">
              <SimpleTwoScreenLayout showTimer={showTimer} timeLeft={timeLeft} t={t} highContrast={highContrast} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent pb-4">
               <CustomControls onLeave={handleLeave} />
            </div>
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    </div>
  );
};

export default VideoCall;