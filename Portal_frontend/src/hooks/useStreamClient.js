import { useEffect, useRef, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

let chatInstance = null;
let videoInstance = null; // ✅ singleton

export const useStreamClient = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState({ chat: null, video: null });

  useEffect(() => {
    if (!user) {
      // Cleanup on logout
      if (chatInstance) {
        chatInstance.disconnectUser();
        chatInstance = null;
      }
      if (videoInstance) {
        videoInstance.disconnectUser();
        videoInstance = null;
      }
      setClients({ chat: null, video: null });
      return;
    }

    const initClients = async () => {
      try {
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        const { data } = await api.post('/auth/streamToken');

        const userCredentials = {
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name || ''}`,
          image: user.profile_image_url,
        };

        // ---------- CHAT ----------
        if (chatInstance && chatInstance.userID !== user.id.toString()) {
            await chatInstance.disconnectUser();
            chatInstance = null;
        }

        if (!chatInstance) {
          chatInstance = StreamChat.getInstance(apiKey);
          await chatInstance.connectUser(userCredentials, data.token);
        }

        // ---------- VIDEO ----------
        if (videoInstance && videoInstance.currentUserId !== user.id.toString()) {
            await videoInstance.disconnectUser();
            videoInstance = null;
        }

        if (!videoInstance) {
          videoInstance = new StreamVideoClient({
            apiKey,
            user: userCredentials,
            token: data.token,
          });
        }

        setClients({ chat: chatInstance, video: videoInstance });
      } catch (err) {
        console.error('Stream initialization failed:', err);
      }
    };

    initClients();

    return () => {
      // Don't disconnect here because we want persistent connection across pages
      // Disconnect only when user object changes (logout/switch)
    };
  }, [user]);

  return clients;
};
