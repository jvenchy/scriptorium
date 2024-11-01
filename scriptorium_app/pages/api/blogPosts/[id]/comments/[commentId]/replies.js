// /blog-posts/[id]/comments/[commentId]/replies.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract blog post ID and comment ID from URL parameters
  const { id: blogPostId, commentId } = req.query;

  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }

  try {
    // fetch child comments for given comment ID
    const replies = await prisma.comment.findMany({
      where: { parentCommentId: parseInt(commentId) },
      orderBy: { createdAt: 'desc' } // sort by createdAt only
    });

    // return replies
    return res.status(200).json(replies);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
