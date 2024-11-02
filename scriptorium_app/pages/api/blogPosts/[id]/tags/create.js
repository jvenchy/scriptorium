// /blog-posts/[id]/tags/create.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

  const authorId = account.id;

  // Get blog post ID from URL parameter
  const { id } = req.query;
  const { name } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }
  if (isNaN(id)) {
    return res.status(400).json({ error: "Blog post ID must be a number" });
  }

  if (!name) {
    return res.status(400).json({ error: "Tag name is required" });
  }
  if (typeof name !== 'string') {
    return res.status(400).json({ error: "Invalid data type provided" });
  }

  try {
    // Check if the blog post exists and belongs to the user
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      select: { authorId: true },
    });

    if (!blogPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    if (blogPost.authorId !== authorId) {
      return res.status(403).json({ error: "You are not authorized to add tags to this post" });
    }

    // Check if the tag name already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name },
    });

    if (existingTag) {
      return res.status(400).json({ error: "Tag name already exists" });
    }

    // Create a new tag
    const newTag = await prisma.tag.create({
      data: { name },
    });

    // Add the new tag to the blog post
    await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        tags: { connect: { id: newTag.id } },
      },
    });

    return res.status(201).json(newTag);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
