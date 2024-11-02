import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
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

  const email = decodedToken.email;
  const { codeTemplateId } = req.body;

  if (!codeTemplateId) {
    return res.status(400).json({ error: "Missing codeTemplateId" });
  }

  try {
    // Fetch the account to verify the user exists
    const account = await prisma.account.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    // Check if the authenticated user is the author of the code template
    const codeTemplate = await prisma.codeTemplate.findUnique({
      where: { id: codeTemplateId },
      select: { authorId: true },
    });

    if (!codeTemplate || codeTemplate.authorId !== account.id) {
      return res.status(403).json({ error: "You are not authorized to delete this code template" });
    }

    // Delete the code template
    await prisma.codeTemplate.delete({
      where: { id: codeTemplateId },
    });

    // Respond with a success message
    return res.status(200).json({ message: "Code template deleted successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}