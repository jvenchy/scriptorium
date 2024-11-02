// /pages/api/admin/comment/[commentId]/hide.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import authMiddleware from '@/middleware/admin';

const hideComment = async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract commentId from URL parameters
  const { commentId } = req.query;
  if (!commentId) {
    return res.status(400).json({ error: "Comment ID is required" });
  }

  if (isNaN(commentId)) {
    return res.status(400).json({ error: "Comment ID must be a number" });
  }

  try {
    // Update comment to set isVisible to false
    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: {
        isVisible: false,
        canEdit: false,
      },
    });

    return res.status(200).json({ message: "Comment hidden successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export default authMiddleware(hideComment);
