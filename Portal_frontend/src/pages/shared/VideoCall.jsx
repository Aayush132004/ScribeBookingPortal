// src/pages/VideoCall.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  StreamVideo, StreamCall, useCallStateHooks, ParticipantView, StreamTheme, 
  ToggleAudioPublishingButton, ToggleVideoPublishingButton 
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import { useStreamClient } from '../../hooks/useStreamClient';
import { Loader2, PhoneOff, Clock } from 'lucide-react';

// --- WAITING TIMER COMPONENT ---
const WaitingTimer = ({ seconds }) => (
  <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md px-4 py-3 rounded-xl border border-zinc-700 shadow-xl">
    <div className="flex items-center gap-3">
      <Clock className="text-yellow-400 animate-pulse" size={20} />
      <div>
        <p className="text-xs text-zinc-400 font-medium">Auto-hangup in</p>
        <p className="text-2xl font-bold text-white tabular-nums">{seconds}s</p>
      </div>
    </div>
  </div>
);

// --- LAYOUT ---
const SimpleTwoScreenLayout = ({ showTimer, timeLeft }) => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const local = participants.find(p => p.isLocalParticipant);
  const remote = participants.find(p => !p.isLocalParticipant);

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-black gap-2 p-2 relative">
      {/* Timer - Only show if waiting and no remote participant */}
      {showTimer && !remote && <WaitingTimer seconds={timeLeft} />}
      
      <div className="flex-1 bg-zinc-900 rounded-2xl overflow-hidden relative flex items-center justify-center border border-zinc-800 shadow-2xl">
        {remote ? <ParticipantView participant={remote} /> : (
          <div className="text-center">
            <div className="relative">
               <div className="absolute inset-0 bg-green-500 blur-xl opacity-20 rounded-full"></div>
               <Loader2 className="animate-spin text-green-500 mx-auto mb-6 relative z-10" size={64} />
            </div>
            <p className="text-zinc-200 font-bold text-2xl">Calling...</p>
            <p className="text-zinc-500 text-sm mt-2 font-mono">Waiting for response...</p>
          </div>
        )}
        {remote && <div className="absolute top-4 left-4 bg-black/60 text-white px-4 py-2 rounded-lg text-sm font-bold backdrop-blur-md">{remote.name}</div>}
      </div>
      
      <div className="h-1/4 md:h-auto md:w-1/4 md:absolute md:bottom-4 md:right-4 bg-zinc-800 rounded-xl overflow-hidden border-2 border-zinc-700 shadow-2xl md:aspect-video z-10">
         {local && <ParticipantView participant={local} />}
         <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-bold backdrop-blur">You</div>
      </div>
    </div>
  );
};

// --- CONTROLS ---
const CustomControls = ({ onLeave }) => (
  <div className="flex items-center gap-4 p-4 bg-zinc-900/90 backdrop-blur-xl rounded-full border border-zinc-700 shadow-xl mb-6">
     <div className="scale-110"><ToggleAudioPublishingButton /></div>
     <div className="scale-110"><ToggleVideoPublishingButton /></div>
     <div className="w-px h-8 bg-zinc-700 mx-2"></div>
     <button onClick={onLeave} className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-all shadow-lg hover:scale-110 active:scale-95">
       <PhoneOff size={24} fill="currentColor" />
     </button>
  </div>
);

// --- MAIN COMPONENT ---
const VideoCall = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { video: videoClient, chat: chatClient } = useStreamClient();
  const [call, setCall] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30); // ✅ 30 second countdown
  const [showTimer, setShowTimer] = useState(false);
  
  const callRef = useRef(null);
  const inviteSentRef = useRef(false);
  const callConnectedRef = useRef(false);
  const participantLeftListenerRef = useRef(null);
  const timerRef = useRef(null); // ✅ Timer reference
  const callDeclinedRef = useRef(false); // ✅ Track if call was declined

  // 1. Initialize Call
  useEffect(() => {
    if (!videoClient || !requestId) return;
    
    const initCall = async () => {
      try {
        const callInstance = videoClient.call('default', `exam-${requestId}`);
        await callInstance.join({ create: true });
        setCall(callInstance);
        callRef.current = callInstance;

        // ✅ Track when another participant joins
        const handleParticipantJoined = (event) => {
          if (event.participant.user_id !== callInstance.currentUserId) {
            callConnectedRef.current = true;
            setShowTimer(false); // ✅ Hide timer when someone joins
            
            // ✅ Clear the auto-hangup timer
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
          }
        };

        // ✅ Track when the OTHER participant leaves
        const handleParticipantLeft = async (event) => {
          if (event.participant.user_id !== callInstance.currentUserId) {
            console.log('Other participant left, ending call...');
            
            // Send "Call Ended" message
            if (chatClient) {
              try {
                const channel = chatClient.channel('messaging', `exam-${requestId}`);
                await channel.sendMessage({ text: '📞 Call Ended' });
              } catch (err) {
                console.error('Failed to send call ended message:', err);
              }
            }
            
            // Leave and navigate back
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
    
    // Cleanup on unmount
    return () => {
      if (callRef.current) {
        if (participantLeftListenerRef.current) {
          callRef.current.off('call.session_participant_left', participantLeftListenerRef.current);
        }
        callRef.current.leave().catch(() => {});
        callRef.current = null;
      }
      // ✅ Clear timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [videoClient, requestId, navigate, chatClient]);

  // 2. Send Invite & Start Timer
  useEffect(() => {
    if (!chatClient || !requestId || !call || inviteSentRef.current) return;
    
    const sendInvite = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      try {
        const participantCount = call.state.participantCount;
        
        if (participantCount <= 1 && !inviteSentRef.current) {
          const channel = chatClient.channel('messaging', `exam-${requestId}`);
          await channel.watch();
          
          const myName = chatClient.user?.name || chatClient.user?.id || 'Someone';
          await channel.sendMessage({ 
            text: `📞 Started a Video Call`,
            caller_name: myName
          });
          
          inviteSentRef.current = true;
          
          // ✅ Start 30-second countdown timer
          setShowTimer(true);
          timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                // Time's up! Auto-hangup
                clearInterval(timerRef.current);
                handleAutoHangup();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (err) {
        console.error("Failed to send call invite:", err);
      }
    };
    
    sendInvite();
  }, [chatClient, requestId, call]);

  // 3. Listen for Call Declined
  useEffect(() => {
    if (!chatClient || !requestId) return;

    const channel = chatClient.channel('messaging', `exam-${requestId}`);
    
    const handleCallDeclined = async (event) => {
      // Ignore my own messages
      if (event.user?.id === chatClient.userID) return;
      
      const messageText = event.message?.text || '';
      
      // ✅ If call was declined, auto-hangup immediately
      if (messageText.includes('❌ Call Declined')) {
        callDeclinedRef.current = true;
        
        // Clear timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        
        // Leave call and go back
        if (callRef.current) {
          await callRef.current.leave();
          callRef.current = null;
        }
        
        navigate(`/chat/${requestId}`, { replace: true });
      }
    };

    channel.watch().then(() => {
      channel.on('message.new', handleCallDeclined);
    });

    return () => {
      channel.off('message.new', handleCallDeclined);
    };
  }, [chatClient, requestId, navigate]);

  // ✅ Auto-hangup function (called when timer reaches 0)
  const handleAutoHangup = async () => {
    if (!callRef.current || !chatClient) return;

    try {
      // Only send "Missed Call" if nobody joined
      if (!callConnectedRef.current) {
        const channel = chatClient.channel('messaging', `exam-${requestId}`);
        await channel.sendMessage({ text: '❌ Missed Video Call' });
      }
      
      // Leave call
      await callRef.current.leave();
      callRef.current = null;
      
      // Navigate back
      navigate(`/chat/${requestId}`, { replace: true });
    } catch (err) {
      console.error('Error during auto-hangup:', err);
      navigate(`/chat/${requestId}`, { replace: true });
    }
  };

  // 4. Handle Manual Hangup
  const handleLeave = async () => {
    if (!callRef.current) {
      navigate(`/chat/${requestId}`, { replace: true });
      return;
    }

    try {
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // ✅ Only send "Missed Call" if I was caller and nobody joined and not declined
      if (inviteSentRef.current && !callConnectedRef.current && !callDeclinedRef.current && chatClient) {
        const channel = chatClient.channel('messaging', `exam-${requestId}`);
        await channel.sendMessage({ text: '❌ Missed Video Call' });
      }
      // ✅ If call was connected, send "Call Ended"
      else if (callConnectedRef.current && chatClient) {
        const channel = chatClient.channel('messaging', `exam-${requestId}`);
        await channel.sendMessage({ text: '📞 Call Ended' });
      }
      
      // Remove listener
      if (participantLeftListenerRef.current) {
        callRef.current.off('call.session_participant_left', participantLeftListenerRef.current);
      }
      
      // Leave the call
      await callRef.current.leave();
      callRef.current = null;
      
    } catch (err) {
      console.error("Error leaving call:", err);
    } finally {
      // Reset refs
      inviteSentRef.current = false;
      callConnectedRef.current = false;
      callDeclinedRef.current = false;
      participantLeftListenerRef.current = null;
      
      navigate(`/chat/${requestId}`, { replace: true });
    }
  };

  if (!call) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 gap-6">
      <Loader2 className="animate-spin text-green-500" size={64} />
      <p className="font-bold text-zinc-400 text-xl animate-pulse">Establishing Secure Connection...</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white">
      <StreamVideo client={videoClient}>
        <StreamTheme as="main" className="stream-video-theme-dark h-full">
          <StreamCall call={call}>
            <div className="h-full w-full pb-24">
              <SimpleTwoScreenLayout showTimer={showTimer} timeLeft={timeLeft} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-8 pt-4 bg-gradient-to-t from-black/90 to-transparent">
               <CustomControls onLeave={handleLeave} />
            </div>
          </StreamCall>
        </StreamTheme>
      </StreamVideo>
    </div>
  );
};

export default VideoCall;