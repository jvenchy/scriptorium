import { verifyToken } from '@/utils/auth';

const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).json({ error: "No token provided" });
  }

  // Verify the refresh token
  const decodedRefreshToken = verifyToken(token, REFRESH_TOKEN_SECRET);

  if (!decodedRefreshToken) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  // If token is valid, simulate logout by clearing the token on the client side
  return res.status(200).json({ message: "Logged out successfully" });
}