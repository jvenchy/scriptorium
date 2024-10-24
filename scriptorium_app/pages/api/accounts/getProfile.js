import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth'; // Ensure this function verifies the JWT

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract the token from the Authorization header
  const token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authorization header is missing or invalid" });
  }

  // Verify the token
  const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);

  if (!decodedToken) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const email = decodedToken.email; // Assuming email is in the token payload
  console.log(email);

  try {
    // Fetch the user profile from the database
    const account = await prisma.account.findUnique({
      where: { email },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        phoneNumber: true,
        passwordHash: true, // If you need to send the password (hash), but not recommended
        isAdministrator: true,
      },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Respond with the account details
    return res.status(200).json({
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email,
      avatar: account.avatar,
      phoneNumber: account.phoneNumber,
      isAdministrator: account.isAdministrator,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}