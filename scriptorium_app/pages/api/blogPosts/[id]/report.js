// /blog-posts/[id]/report.js
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/utils/auth';
const prisma = new PrismaClient();
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

  // Fetch user ID from database
  const account = await prisma.account.findUnique({
    where: { email },
    select: {
      id: true,
    },
  });

  const reporterId = account.id;

  // Get blog post ID from URL parameter
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }

  // Check if explanation is provided
  const { explanation } = req.body;

  if (!explanation) {
    return res.status(400).json({ error: "Explanation is required" });
  }

  try {
    // Check if the blog post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Create a new post report entry
    const report = await prisma.postReport.create({
      data: {
        blogPostId: parseInt(id), // Connect to the blog post
        reporterId: reporterId,   // Connect to the reporter
        explanation,
      },
    });

    // Increment numReports in the blog post
    await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        numReports: existingPost.numReports + 1,
      },
    });

    return res.status(201).json(report);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
