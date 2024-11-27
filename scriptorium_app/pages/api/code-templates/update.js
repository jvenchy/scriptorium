import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';
import { SUPPORTED_LANGUAGES } from './run.js';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  // Allow only PUT requests
  if (req.method !== "PUT") {
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
  const { codeTemplateId, codeSnippet, title, explanation, tags, language } = req.body;

  // Ensure required fields are present
  if (!codeTemplateId || !title || !explanation || !language) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Check if the language is supported
  if (!SUPPORTED_LANGUAGES.includes(language.toLowerCase())) {
    return res.status(400).json({ error: `Unsupported language. Supported languages are: ${SUPPORTED_LANGUAGES.join(', ')}` });
  }

  try {
    // Fetch the account to ensure the user exists
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
      return res.status(403).json({ error: "You are not authorized to edit this code template" });
    }

    // Update the code template
    const updatedCodeTemplate = await prisma.codeTemplate.update({
      where: { id: codeTemplateId },
      data: {
        codeSnippet,
        title,
        explanation,
        language,
        tags: {
          set: [],  // Clear existing tags
          connectOrCreate: tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
      },
      select: { 
        id: true,
        createdAt: true,
        updatedAt: true 
      },
    });

    // Respond with the updated code template ID and timestamps
    return res.status(200).json({
      codeTemplateId: updatedCodeTemplate.id,
      createdAt: updatedCodeTemplate.createdAt,
      updatedAt: updatedCodeTemplate.updatedAt
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
