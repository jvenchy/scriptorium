// /pages/api/admin/blog-post/[blogPostId]/edit.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authorization header is missing or invalid" });
  }

  const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);
  if (!decodedToken) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  const email = decodedToken.email;

  const account = await prisma.account.findUnique({
    where: { email },
    select: { id: true },
  });
  const userId = account?.id;
  if (!userId) {
    return res.status(404).json({ error: "Account not found" });
  }

  const { id } = req.query;
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: "Valid blog post ID is required" });
  }

  try {
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        authorId: true,
        canEdit: true,
        tags: true,
      },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const isAuthor = existingPost.authorId === userId;
    if (!isAuthor || !existingPost.canEdit) {
      return res.status(403).json({ error: "You don't have permission to edit this post" });
    }

    const { title, description, tags, codeTemplates } = req.body;

    if ((title !== undefined && typeof title !== 'string') ||
        (description !== undefined && typeof description !== 'string') ||
        (tags !== undefined && (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'string'))) ||
        (codeTemplates !== undefined && (!Array.isArray(codeTemplates) || codeTemplates.some(template => typeof template !== 'number')))) {
      return res.status(400).json({ error: "One or more parameters are of the incorrect type!" });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    if (tags !== undefined) {
      updateData.tags = {
        set: [], // Disconnect existing tags
        connectOrCreate: tags.map(tagName => ({
          where: { name: tagName },
          create: { name: tagName },
        })),
      };
    }

    if (codeTemplates !== undefined) {
      updateData.codeTemplates = {
        set: [],
        connect: codeTemplates.map(templateId => ({ id: templateId })),
      };
    }

    const updatedBlogPost = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        tags: true,
        codeTemplates: true,
        author: { select: { id: true, email: true } },
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
