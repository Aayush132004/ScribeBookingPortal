import React, { useEffect, useRef } from 'react';
import { useStreamClient } from '../hooks/useStreamClient';
import { useToast } from '../context/ToastContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GlobalCallListener = () => {
  const { chat: client } = useStreamClient();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const checkedMissedCalls = useRef(false);

  useEffect(() => {
    if (!client || !user) return;

    const handleNewMessage = (event) => {
      // FIX: Remove 'system' type check. Just check the text content.
      if (event.message.text === 'VIDEO_CALL_STARTED') {
        
        // Ignore my own messages
        if (event.user.id === user.id.toString()) return;
        
        // Ignore if I'm already in the video call
        if (location.pathname.includes('/video/')) return;

        const requestId = event.channel_id.replace('exam-', '');

        addToast(
          `${event.user.name} is calling you...`,
          'call',
          {
            label: 'Join Video',
            onClick: () => navigate(`/video/${requestId}`)
          }
        );
      }
    };

    const checkMissedCalls = async () => {
      if (checkedMissedCalls.current) return;
      checkedMissedCalls.current = true;

      const filter = { type: 'messaging', members: { $in: [user.id.toString()] } };
      const sort = { last_message_at: -1 };

      try {
        const channels = await client.queryChannels(filter, sort, { limit: 5 });
        
        for (const channel of channels) {
          const lastMsg = channel.state.messages[channel.state.messages.length - 1];
          if (!lastMsg) continue;

          const isCall = lastMsg.text === 'VIDEO_CALL_STARTED';
          const notMe = lastMsg.user.id !== user.id.toString();
          const isRecent = (new Date() - new Date(lastMsg.created_at)) < 5 * 60 * 1000;

          if (isCall && notMe && isRecent) {
             const requestId = channel.id.replace('exam-', '');
             addToast(
              `You missed a call from ${lastMsg.user.name}`,
              'info',
              {
                label: 'Call Back',
                onClick: () => navigate(`/video/${requestId}`)
              }
            );
          }
        }
      } catch (err) {
        console.error("Error checking missed calls", err);
      }
    };

    client.on('message.new', handleNewMessage);
    checkMissedCalls();

    return () => {
      client.off('message.new', handleNewMessage);
    };
  }, [client, user, location.pathname, addToast, navigate]);

  return null;
};

export default GlobalCallListener;