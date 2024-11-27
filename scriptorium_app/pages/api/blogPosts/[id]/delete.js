import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
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

  // fetch user id and isAdministrator from database
  const account = await prisma.account.findUnique({
    where: { email },
    select: {
      id: true,
      isAdministrator: true // Check if user is admin
    },
  });

  const userId = account.id;

  // get blog post ID from URL parameter
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }
  if (isNaN(id)) {
    return res.status(400).json({ error: "Blog post ID must be a number" });
  }

  try {
    // first check if blog post exists and get author information
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: true,
      }
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // check if user is author or admin
    const canDelete = existingPost.author.id === userId || account.isAdministrator === true;

    if (!canDelete) {
      return res.status(403).json({ error: "You don't have permission to delete this post" });
    }

    await prisma.$transaction(async (tx) => {
      // Delete all comments for this post
      await tx.comment.deleteMany({
        where: {
          blogPostId: parseInt(id)
        }
      });

      // Delete all blog post votes
      await tx.blogPostVote.deleteMany({
        where: {
          blogPostId: parseInt(id)
        }
      });

      // Delete all blog post reports
      await tx.postReport.deleteMany({
        where: {
          blogPostId: parseInt(id)
        }
      });

      // Remove tag relationships
      await tx.blogPost.update({
        where: { id: parseInt(id) },
        data: {
          tags: {
            set: []
          }
        }
      });

      // Finally delete the blog post
      await tx.blogPost.delete({
        where: { id: parseInt(id) }
      });
    });

    return res.status(200).json({
      message: "Blog post and related records deleted successfully",
      deletedPostId: id
    });

  } catch (error) {
    console.error(error);

    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Blog post not found" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
}
