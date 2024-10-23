import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import {verifyToken, generateAccessTokenExpiresAt, generateToken} from '@/utils/auth';

const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization;
  const decodedRefreshToken = verifyToken(token, REFRESH_TOKEN_SECRET);

  if (!decodedRefreshToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (new Date() < new Date(decodedRefreshToken.expiresAt)) {
    const accessTokenExpiresAt = generateAccessTokenExpiresAt();
    const accessToken = generateToken(
      { email: decodedRefreshToken.email, isAdministrator: decodedRefreshToken.isAdministrator},
      ACCESS_TOKEN_SECRET,
      accessTokenExpiresAt
    );

    return res.status(200).json({
      accessToken
    });
  }
  return res.status(403).json({ error: "Refresh Token Expired" });
}