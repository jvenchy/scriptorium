import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // extract token from Authorization header
  const token = req.headers.authorization;

  if (!token || !token.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Authorization header is missing or invalid" });
  }

  // verify the token
  const decodedToken = verifyToken(token, ACCESS_TOKEN_SECRET);

  if (!decodedToken) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const email = decodedToken.email;

  // fetch user id from database
  const account = await prisma.account.findUnique({
    where: { email },
    select: {
      id: true
    },
  });

  const userId = account.id;

  // get blog post ID from URL parameter
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }

  try {
    // first check if blog post exists and if user has permission to edit
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: true,
        tags: true, // Ensure you include the fields you actually have
        codeTemplates: true
      }
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // check if user is author or editor (if you have an editor concept)
    const canEdit = existingPost.authorId === userId;

    if (!canEdit) {
      return res.status(403).json({ error: "You don't have permission to edit this post" });
    }

    // extract fields from request body
    const { title, description, tags, codeTemplates } = req.body;

    // prepare update data
    const updateData = {};

    // only include fields that are provided
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    // handle tags if provided
    if (tags !== undefined) {
      updateData.tags = {
        set: [],  // first disconnect all existing tags
        connect: tags.map(tag => ({ id: tag }))  // then connect new tags
      };
    }

    // handle code templates if provided
    if (codeTemplates !== undefined) {
      updateData.codeTemplates = {
        set: [],  // first disconnect all existing templates
        connect: codeTemplates.map(templateId => ({ id: templateId }))
      };
    }

    // update blog post
    const updatedBlogPost = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        tags: true,
        codeTemplates: true,
        author: {
          select: {
            id: true,
            email: true
          }
        }
      }
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
