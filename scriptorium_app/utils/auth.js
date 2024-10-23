import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

// generate expiration time for access token (5-60 minutes)
export const generateAccessTokenExpiresAt = () => {
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * (60 - 5 + 1)) + 5; // between 5 and 60 minutes
  now.setMinutes(now.getMinutes() + randomMinutes);
  return now;
};

// hash passwords
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// generate expiration time for refresh token (2 hours - 30 days)
export const generateRefreshTokenExpiresAt = () => {
  const now = new Date();
  const minMillis = 2 * 60 * 60 * 1000;  // 2 hours
  const maxMillis = 30 * 24 * 60 * 60 * 1000;  // 30 days
  
  const randomMillis = Math.floor(Math.random() * (maxMillis - minMillis + 1)) + minMillis;
  now.setTime(now.getTime() + randomMillis);
  return now;
};

// generate token
export const generateToken = (payload, secret, expiresAt) => {
  return jwt.sign(
    {
      email: payload.email,
      isAdministrator: payload.isAdministrator,
      expiresAt: expiresAt.toISOString(),
    },
    secret
  );
};

export const verifyToken = (token, secret) =>
{
  if (!token?.startsWith("Bearer ")) {
    return null;
  }
  token = token.split(" ")[1];
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};