import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import { generateAccessTokenExpiresAt,generateRefreshTokenExpiresAt, generateToken } from "@/utils/auth";

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET;


export default async function handler(req, res){

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {email, password} = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Please provide all the required fields",
    });
  }

  // validate types of fields
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      error: "Invalid data types provided",
    });
  }

  const account = await prisma.account.findUnique({
    where: {
      email,
    },
  });

  const comparePassword = async (input, expected) => {
    return await bcrypt.compare(input, expected);
  }

  if (!account || !(await comparePassword(password, account.passwordHash))) {
    return res.status(401).json({
      error: "Invalid Credentials. Try again.",
    });
  }

  const accessTokenExpiresAt = generateAccessTokenExpiresAt();
  const refreshTokenExpiresAt = generateRefreshTokenExpiresAt();

  const accessToken = generateToken(
    { email: account.email, isAdministrator: account.isAdministrator},
    ACCESS_TOKEN_SECRET,
    accessTokenExpiresAt
  );

  const refreshToken = generateToken(
    { username: account.email, isAdministrator: account.isAdministrator},
    REFRESH_TOKEN_SECRET,
    refreshTokenExpiresAt
  );

  return res.status(200).json({
    message: "Login Successful",
    accessToken,
    refreshToken,
  });
}