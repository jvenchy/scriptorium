// /blog-posts/[id]/comments/create.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
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
    select: { id: true },
  });

  const authorId = account.id;

  // Extract blog post ID from URL parameters
  const { id: blogPostId } = req.query;

  // Extract parentCommentId from request body and validate
  let { parentCommentId } = req.body;
  if (parentCommentId && isNaN(parentCommentId)) {
    return res.status(400).json({ error: "parentCommentId must be a number" });
  }
  parentCommentId = parentCommentId ? parseInt(parentCommentId) : null;

  // Extract content from request body
  const { content } = req.body;

  // Validate required fields
  if (!content || !authorId || !blogPostId) {
    return res.status(400).json({ error: "Content, authorId, and blogPostId are required." });
  }

  if (isNaN(blogPostId)) {
    return res.status(400).json({ error: "Blog post ID must be a number" });
  }

  if (typeof content !== 'string') {
    return res.status(400).json({ error: "Invalid data type provided" });
  }

  try {
    // Create a new comment or reply
    const newCommentData = {
      content,
      author: {
        connect: { id: authorId } // Connect the author to the comment
      },
      blogPost: {
        connect: { id: parseInt(blogPostId) } // Connect the blog post to the comment
      }
    };

    if (parentCommentId) {
      newCommentData.parentComment = { connect: { id: parseInt(parentCommentId) } }; // Connect to parent comment if parentCommentId exists
    }

    const newComment = await prisma.comment.create({
      data: newCommentData,
    });

    return res.status(201).json({
      id: newComment.id,
      content: newComment.content,
      authorId: newComment.authorId,
      blogPostId: newComment.blogPostId,
      parentCommentId: newComment.parentCommentId, // Include parentCommentId in the response
      createdAt: newComment.createdAt,
      updatedAt: newComment.updatedAt,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
