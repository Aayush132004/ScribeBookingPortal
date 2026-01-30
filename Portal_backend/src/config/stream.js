import { StreamChat } from 'stream-chat';
import 'dotenv/config';

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error('STREAM_API_KEY or STREAM_API_SECRET missing in .env');
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

// Create or update user
export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (err) {
    console.error('Error creating Stream user:', err);
    throw err;
  }
};

// Generate token
export const generateStreamToken = (userId) => {
  try {
    const userIdStr = userId.toString();
    return streamClient.createToken(userIdStr);
  } catch (err) {
    console.error('Error generating Stream token:', err);
    return null;
  }
};
