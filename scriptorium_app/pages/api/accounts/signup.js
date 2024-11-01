import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';
import { hashPassword } from "@/utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  if (!firstName || !lastName || !email || !phoneNumber || !password) {
    return res.status(400).json({
      error: "Please provide all the required fields",
    });
  }

  // password should be at least 7 characters
  if (password.length < 7) {
    return res.status(400).json({ error: "Password must be at least 7 characters long" });
  }

  // email should contain an '@'
  if (!email.includes('@')) {
    return res.status(400).json({ error: "Email must be valid" });
  }

  // phone number should be only digits
  if (!/^\d+$/.test(phoneNumber)) {
    return res.status(400).json({ error: "Phone number must contain only digits" });
  }

  try {
    // check for unique email
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
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      user: {
        firstName: newAccount.firstName,
        lastName: newAccount.lastName,
        email: newAccount.email,
        phoneNumber: newAccount.phoneNumber,
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