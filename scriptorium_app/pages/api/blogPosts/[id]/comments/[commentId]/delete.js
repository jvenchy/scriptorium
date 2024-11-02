// /comments/[commentId]/delete.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
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

  // fetch user id from database
  const account = await prisma.account.findUnique({
    where: { email },
    select: {
      id: true
    },
  });

  const userId = account.id;

  // Extract comment ID from URL parameters
  const { commentId } = req.query;

  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }

  if (isNaN(commentId)) {
    return res.status(400).json({ error: "Comment ID must be a number" });
  }

  try {
    // Fetch the comment to be deleted
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      include: {
        author: true
      }
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // Check if the user is the author of the comment
    if (comment.authorId !== userId) {
      return res.status(403).json({ error: "You don't have permission to delete this comment" });
    }

    // Delete the comment
    await prisma.comment.delete({
      where: { id: parseInt(commentId) }
    });

    return res.status(200).json({ message: "Comment deleted successfully", deletedCommentId: commentId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
