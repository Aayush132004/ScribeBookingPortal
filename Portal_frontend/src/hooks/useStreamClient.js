import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const useStreamClient = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState({ chat: null, video: null });

  useEffect(() => {
    const initClients = async () => {
      if (!user) return;

      const apiKey = import.meta.env.VITE_STREAM_API_KEY;
      const chatInstance = StreamChat.getInstance(apiKey);

      try {
        const { data } = await api.post('/auth/streamToken');
        
        const userCredentials = {
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name || ''}`,
          image: user.profile_image_url,
        };

        // Initialize Chat
        await chatInstance.connectUser(userCredentials, data.token);

        // Initialize Video
        const videoInstance = new StreamVideoClient({
          apiKey,
          user: userCredentials,
          token: data.token,
        });

        setClients({ chat: chatInstance, video: videoInstance });
      } catch (err) {
        console.error("Stream initialization failed:", err);
      }
    };

    initClients();

    return () => {
      if (clients.chat) clients.chat.disconnectUser();
    };
  }, [user]);

  return clients;
};