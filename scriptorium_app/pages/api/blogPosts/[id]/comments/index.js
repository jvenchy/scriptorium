// /blog-posts/[id]/comments.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract blog post ID from URL parameters
  const { id: blogPostId } = req.query;

  try {
    // Fetch comments for the given blog post
    const comments = await prisma.comment.findMany({
      where: { blogPostId: parseInt(blogPostId) },
      orderBy: [
        req.query.sort === 'upvotes' ? { upvotes: 'desc' } :
        req.query.sort === 'downvotes' ? { downvotes: 'desc' } :
        req.query.sort === 'createdAt' ? { createdAt: 'desc' } :
        { createdAt: 'desc' } // default sort
      ],
    });

    // Return comments
    return res.status(200).json(comments);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}