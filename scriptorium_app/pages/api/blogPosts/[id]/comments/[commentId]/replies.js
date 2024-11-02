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

  // Extract query parameters for pagination and sorting
  const { page = 1, limit = 10 } = req.query;

  // Convert page and limit to numbers
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Validate page and limit parameters
  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({ error: "Invalid page number" });
  }
  if (isNaN(limitNum) || limitNum < 1) {
    return res.status(400).json({ error: "Invalid limit number" });
  }

  try {
    // Get total count for pagination
    const totalCount = await prisma.comment.count({
      where: { parentCommentId: parseInt(commentId) },
    });

    // Fetch child comments for given comment ID with pagination
    const replies = await prisma.comment.findMany({
      where: { parentCommentId: parseInt(commentId) },
      orderBy: { createdAt: 'desc' }, // Sort by createdAt only
      skip,
      take: limitNum,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    // Return replies with pagination metadata
    return res.status(200).json({
      replies,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limitNum,
        hasNextPage,
        hasPreviousPage
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
