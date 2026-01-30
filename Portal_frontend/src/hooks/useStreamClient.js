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
  const initializedRef = useRef(false); // ✅ StrictMode guard

  useEffect(() => {
    if (!user || initializedRef.current) return;

    initializedRef.current = true;

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
        if (!chatInstance) {
          chatInstance = StreamChat.getInstance(apiKey);
          await chatInstance.connectUser(userCredentials, data.token);
        }

        // ---------- VIDEO ----------
        if (!videoInstance) {
          videoInstance = StreamVideoClient.getOrCreateInstance({
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
      // cleanup on logout / unmount
      initializedRef.current = false;
    };
  }, [user]);

  return clients;
};
