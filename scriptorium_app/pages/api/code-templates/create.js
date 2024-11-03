import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';
import { SUPPORTED_LANGUAGES } from './run.js';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

  try {
    // Fetch the account ID based on the authenticated user's email
    const account = await prisma.account.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!account) {
      return res.status(404).json({ error: "Account not found" });
    }

    const { codeSnippet, title, explanation, tags, forkedFromId, language } = req.body;

    // Ensure required fields are present
    if (!title || !explanation || !language) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the language is supported
    if (!SUPPORTED_LANGUAGES.includes(language.toLowerCase())) {
      return res.status(400).json({ error: `Unsupported language. Supported languages are: ${SUPPORTED_LANGUAGES.join(', ')}` });
    }

    // Validate forkedFromId if provided
    if (forkedFromId) {
      const parentTemplate = await prisma.codeTemplate.findUnique({
        where: { id: forkedFromId },
      });

      if (!parentTemplate) {
        return res.status(400).json({ error: "Invalid forkedFromId, template not found" });
      }
    }

    // Create the code template
    const codeTemplate = await prisma.codeTemplate.create({
      data: {
        codeSnippet,
        title,
        explanation,
        language,
        forkedFromId,
        authorId: account.id,
        tags: {
          connectOrCreate: tags.map((tagName) => ({
            where: { name: tagName },
            create: { name: tagName },
          })),
        },
      },
      select: { id: true },
    });

    // Respond with the newly created code template ID
    return res.status(201).json({ codeTemplateId: codeTemplate.id });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
