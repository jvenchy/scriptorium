import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;

const ACCESS_TOKEN_EXPIRES_MINUTES = process.env.ACCESS_TOKEN_EXPIRES_MINUTES;
const REFRESH_TOKEN_EXPIRES_MINUTES = process.env.REFRESH_TOKEN_EXPIRES_MINUTES;

// generate expiration time for access token (set somewhere from 5-60 minutes)
export const generateAccessTokenExpiresAt = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + ACCESS_TOKEN_EXPIRES_MINUTES);
  return now;
};

// hash passwords
export async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// generate expiration time for refresh token (set somewhere from 2 hours - 30 days)
export const generateRefreshTokenExpiresAt = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + REFRESH_TOKEN_EXPIRES_MINUTES);
  return now;
};

// generate token
export const generateToken = (payload, secret, expiresAt) => {
  return jwt.sign(
    {
      email: payload.email,
      isAdministrator: payload.isAdministrator,
      exp: Math.floor(expiresAt.getTime() / 1000)
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
    const decodedToken = jwt.verify(token, secret);

    // manual check for expiration
    const currentTime = Math.floor(Date.now() / 1000); // current time in seconds since epoch
    console.log(decodedToken.exp);
    console.log(currentTime);
    if (decodedToken.exp < currentTime) {
      console.error("Token has expired");
      return null;
    }

    return decodedToken;
  } catch (err) {
    console.error(err);
    return null;
  }
};