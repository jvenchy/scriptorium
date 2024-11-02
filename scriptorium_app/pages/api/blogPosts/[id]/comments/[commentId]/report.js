// /blog-posts/[id]/comments/[commentId]/reports.js
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';
const prisma = new PrismaClient();
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
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

  // fetch user ID from database
  const account = await prisma.account.findUnique({
    where: { email },
    select: {
      id: true,
    },
  });

  const reporterId = account.id;

  // extract blog post ID and comment ID from URL parameters
  const { id: blogPostId, commentId } = req.query;

  if (!blogPostId || !commentId) {
    return res.status(400).json({ error: "Blog post ID and comment ID are required" });
  }

  if (isNaN(blogPostId)) {
    return res.status(400).json({ error: "Blog post ID must be a number" });
  }

  if (isNaN(commentId)) {
    return res.status(400).json({ error: "Comment ID must be a number" });
  }

  // check if explanation is provided
  const { explanation } = req.body;

  if (!explanation) {
    return res.status(400).json({ error: "Explanation is required" });
  }

  if (typeof explanation !== 'string') {
    return res.status(400).json({ error: "Invalid data type provided" });
  }

  try {
    // check if the comment exists
    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(commentId) },
    });

    if (!existingComment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    // create a new comment report entry
    const report = await prisma.commentReport.create({
      data: {
        commentId: parseInt(commentId), // connect to the comment
        reporterId: reporterId,         // connect to the reporter
        explanation,
      },
    });

    // increment numReports in the comment
    await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        numReports: existingComment.numReports + 1,
      },
    });

    return res.status(201).json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
