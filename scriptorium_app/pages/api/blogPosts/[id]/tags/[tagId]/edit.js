// /tags/[id]/edit.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract token from Authorization header
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

  // Fetch user id from database
  const account = await prisma.account.findUnique({
    where: { email },
    select: { id: true },
  });

  const userId = account.id;

  // Get tag ID from URL parameter
  const { tagId } = req.query;
  const { name } = req.body;

  if (!tagId) {
    return res.status(400).json({ error: "Tag ID is required" });
  }

  try {
    // Check if the tag exists
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(tagId) },
      select: { name: true },
    });

    if (!tag) {
      return res.status(404).json({ error: "Tag not found" });
    }

    // Check if the provided name is different from the current name
    if (name !== tag.name) {
      // Check if the new tag name already exists
      const existingTag = await prisma.tag.findUnique({
        where: { name },
      });

      if (existingTag) {
        return res.status(400).json({ error: "Tag name already exists" });
      }
    }

    // Update the tag name if provided
    const updatedTag = await prisma.tag.update({
      where: { id: parseInt(tagId) },
      data: {
        name: name !== undefined ? name : tag.name,
      },
    });

    return res.status(200).json(updatedTag);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
