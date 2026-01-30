import { generateStreamToken } from "../config/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.body?.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    const token = generateStreamToken(userId);

    res.status(200).json({ token });
  } catch (err) {
    console.error("Error generating Stream token:", err);
    res.status(500).json({ message: "Failed to generate token" });
  }
};
