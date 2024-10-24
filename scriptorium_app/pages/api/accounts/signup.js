import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import { hashPassword } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName, lastName, email, phoneNumber, password, avatar } = req.body;

  // Basic validation for required fields
  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    return res.status(400).json({ error: "Please provide all the required fields" });
  }

   // Ensure all JSON parameters are correct type
   if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof phoneNumber !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: "Parameters are of the incorrect type!" });
  }

  // Password should be at least 7 characters
  if (password.length < 7) {
    return res.status(400).json({ error: "Password must be at least 7 characters long" });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email must be valid" });
  }

  // Phone number validation
  const phoneNumberRegex = /^\+?\d{10,15}$/;
  if (!phoneNumberRegex.test(phoneNumber)) {
    return res.status(400).json({ error: "Phone number must contain only digits and be between 10 to 15 characters long" });
  }

  // Optional avatar validation (must be a valid URL if provided)
  const avatarRegex = /^https?:\/\/.+\.(jpg|jpeg|png|webp|avif|gif|svg)$/;
  if (avatar && !avatarRegex.test(avatar)) {
    return res.status(400).json({ error: "Avatar must be a valid image URL" });
  }

  try {
    // Check for unique email
    const existingAccount = await prisma.account.findUnique({ where: { email } });
    if (existingAccount) {
      return res.status(400).json({ error: "Account with that email already exists!" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new account
    const newAccount = await prisma.account.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        passwordHash: hashedPassword,
        avatar, // Include avatar if provided
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        firstName: newAccount.firstName,
        lastName: newAccount.lastName,
        email: newAccount.email,
        phoneNumber: newAccount.phoneNumber,
        avatar: newAccount.avatar, // Include avatar in the response if provided
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
}
