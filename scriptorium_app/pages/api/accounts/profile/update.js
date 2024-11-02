import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import { verifyToken } from '@/utils/auth'; // Ensure this function verifies the JWT

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // extract the token from the Authorization header
  const token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authorization header is missing or invalid" });
  }

  // verify the token
  const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);

  if (!decodedToken) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const email = decodedToken.email;

  // extract fields from the request body that need to be updated
  const { firstName, lastName, newEmail, avatar, phoneNumber, password } = req.body;

  // validate types of fields
  if ((firstName && typeof firstName !== 'string') ||
      (lastName && typeof lastName !== 'string') ||
      (newEmail && typeof newEmail !== 'string') ||
      (avatar && typeof avatar !== 'string') ||
      (phoneNumber && typeof phoneNumber !== 'string') ||
      (password && typeof password !== 'string')) {
    return res.status(400).json({ error: "Invalid data types provided" });
  }

  try {
    // Fetch the current user profile from the database to ensure it exists
    const account = await prisma.account.findUnique({
      where: { email },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Create an object to hold the fields that are going to be updated
    const updateData = {};

    // Conditionally add the fields if they are provided in the request
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (newEmail) updateData.email = newEmail;
    if (avatar) updateData.avatar = avatar;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    
    // Handle password change, if provided
    if (password) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateData.passwordHash = hashedPassword;
    }

    // Update the account in the database
    const updatedAccount = await prisma.account.update({
      where: { email },
      data: updateData,
    });

    // Respond with the updated account details (excluding sensitive info)
    return res.status(200).json({
      message: "Profile updated successfully",
      firstName: updatedAccount.firstName,
      lastName: updatedAccount.lastName,
      email: updatedAccount.email,
      avatar: updatedAccount.avatar,
      phoneNumber: updatedAccount.phoneNumber,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}