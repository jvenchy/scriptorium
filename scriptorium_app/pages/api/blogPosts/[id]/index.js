import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // get blog post ID from URL parameter
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }
  
  if (isNaN(id)) {
    return res.status(400).json({ error: "Blog post ID must be a number" });
  }

  try {
    // Fetch blog post with all related data
    const blogPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) }, // Ensure id is an integer
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        },
        codeTemplates: {
          select: {
            id: true,
            title: true,
            explanation: true,
            language: true
          }
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!blogPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Format the response
    const formattedResponse = {
      id: blogPost.id,
      title: blogPost.title,
      description: blogPost.description,
      content: blogPost.content,
      upvotes: blogPost.upvotes,
      downvotes: blogPost.downvotes,
      createdAt: blogPost.createdAt,
      updatedAt: blogPost.updatedAt,
      author: blogPost.author,
      tags: blogPost.tags,
      codeTemplates: blogPost.codeTemplates,
      comments: blogPost.comments,
      canEdit: blogPost.canEdit,
      isVisible: blogPost.isVisible
    };

    return res.status(200).json(formattedResponse);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
