// /middleware/admin.js
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { verifyToken } from '@/utils/auth'; // Ensure this function verifies the JWT

const prisma = new PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

const authMiddleware = (handler) => async (req, res) => {
  const token = req.headers.authorization;
  const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
  if (!decodedToken) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.user = decodedToken;

  // Check for admin access
  const account = await prisma.account.findUnique({
    where: { email: decodedToken.email },
    select: { isAdministrator: true },
  });

  if (!account || !account.isAdministrator) {
    return res.status(403).json({ error: "Forbidden. Admin access required." });
  }

  return handler(req, res);
};

export default authMiddleware;
