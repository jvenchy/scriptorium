import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import { hashPassword } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { firstName, lastName, email, phoneNumber, password, avatar } = req.body;

  // Validate required fields
  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    return res.status(400).json({
      error: "Please provide all the required fields",
    });
  }

  // Validate types of fields
  if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof email !== 'string' ||
      typeof phoneNumber !== 'string' || typeof password !== 'string' || (avatar && typeof avatar !== 'string')) {
    return res.status(400).json({
      error: "Invalid data types provided",
    });
  }

  // Password should be at least 7 characters
  if (password.length < 7) {
    return res.status(400).json({ error: "Password must be at least 7 characters long" });
  }

  // Email should contain the proper format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Email must be valid" });
  }

  // Phone number should be only digits and exactly 10 characters long
  if (!/^\d+$/.test(phoneNumber)) {
    return res.status(400).json({ error: "Phone number must contain only digits" });
  }
  if (phoneNumber.length !== 10) {
    return res.status(400).json({ error: "Phone number must be exactly 10 digits long" });
  }

  try {
    // Check for unique email
    const existingAccount = await prisma.account.findUnique({ where: { email } });
    if (existingAccount) {
      return res.status(400).json({ error: "Account with that email already exists!" });
    }

    const hashedPassword = await hashPassword(password);

    const newAccount = await prisma.account.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        passwordHash: hashedPassword,
        avatar, // Optional avatar field
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        firstName: newAccount.firstName,
        lastName: newAccount.lastName,
        email: newAccount.email,
        phoneNumber: newAccount.phoneNumber,
        avatar: newAccount.avatar, // Include avatar in the response if available
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal server error",
    });
  } finally {
    await prisma.$disconnect();
  }
}
