// /comments/[id]/edit.js
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

  const authorId = account.id;

  // extract comment ID from URL parameters
  const { commentId: commentId } = req.query;

  // extract content from request body
  const { content } = req.body;
  console.log(content)

  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }
  console.log(commentId);

  try {
    // find the comment to ensure it exists
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
      select: {
        id: true,
        authorId: true
      }
    });

    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    if (comment.authorId !== authorId) {
      return res.status(403).json({ error: "You are not authorized to edit this comment." });
    }

    // update the comment
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        content: content !== undefined ? content : comment.content, // update only if content is provided
        updatedAt: new Date(), // update the timestamp
      },
    });

    return res.status(200).json({
      id: updatedComment.id,
      content: updatedComment.content,
      authorId: updatedComment.authorId,
      blogPostId: updatedComment.blogPostId,
      parentCommentId: updatedComment.parentCommentId,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt
    }); // return the updated comment

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
