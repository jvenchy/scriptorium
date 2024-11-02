// /pages/api/admin/blog-post/[blogPostId]/edit.js
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
    select: {
      id: true
    },
  });
  const userId = account.id;

  // Get blog post ID from URL parameter
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }

  try {
    // First check if blog post exists and if user has permission to edit
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        authorId: true,
        canEdit: true, // Use select to get scalar fields
        tags: true,
        codeTemplates: true,
      },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Check if user is author
    const isAuthor = existingPost.authorId === userId;
    if (!isAuthor || !existingPost.canEdit) {
      return res.status(403).json({ error: "You don't have permission to edit this post" });
    }

    // Extract fields from request body
    const { title, description, tags, codeTemplates } = req.body;

    // Prepare update data
    const updateData = {};
    // Only include fields that are provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    // Handle tags if provided
    if (tags !== undefined) {
      updateData.tags = {
        set: [], // First disconnect all existing tags
        connect: tags.map(tag => ({ id: tag })), // Then connect new tags
      };
    }

    // Handle code templates if provided
    if (codeTemplates !== undefined) {
      updateData.codeTemplates = {
        set: [], // First disconnect all existing templates
        connect: codeTemplates.map(templateId => ({ id: templateId })),
      };
    }

    // Update blog post
    const updatedBlogPost = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        tags: true,
        codeTemplates: true,
        author: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      id: updatedBlogPost.id,
      title: updatedBlogPost.title,
      description: updatedBlogPost.description,
      authorId: updatedBlogPost.authorId,
      tags: updatedBlogPost.tags,
      codeTemplates: updatedBlogPost.codeTemplates,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}