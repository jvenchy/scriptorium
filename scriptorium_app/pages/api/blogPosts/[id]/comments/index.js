// /blog-posts/[id]/comments.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract blog post ID from URL parameters
  const { id: blogPostId } = req.query;

  // Extract query parameters for pagination and sorting
  const { sort = 'createdAt', page = 1, limit = 10 } = req.query;

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

  // Define sort order
  let orderBy;
  switch (sort) {
    case 'upvotes':
      orderBy = { upvotes: 'desc' };
      break;
    case 'downvotes':
      orderBy = { downvotes: 'desc' };
      break;
    case 'createdAt':
    default:
      orderBy = { createdAt: 'desc' };
      break;
  }

  try {
    // Get total count for pagination
    const totalCount = await prisma.comment.count({
      where: { blogPostId: parseInt(blogPostId) },
    });

    // Fetch comments for the given blog post with pagination
    const comments = await prisma.comment.findMany({
      where: { blogPostId: parseInt(blogPostId) },
      orderBy,
      skip,
      take: limitNum,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true
          }
        }
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    // Return comments with pagination metadata
    return res.status(200).json({
      comments,
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
