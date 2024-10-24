import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import authMiddleware from '@/middleware/admin';

const hideBlogPost = async (req, res) => {
  if (req.method !== "PUT") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract blogPostId from URL parameters
  const { blogPostId } = req.query;
  console.log(blogPostId);

  if (!blogPostId) {
    return res.status(400).json({ error: "Blog post ID is required" });
  }

  try {
    // Update blog post to set isVisible to false and canEdit to false
    const updatedBlogPost = await prisma.blogPost.update({
      where: { id: parseInt(blogPostId) },
      data: {
        isVisible: false,
        canEdit: false,
      },
    });

    return res.status(200).json({ message: "Blog post hidden successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export default authMiddleware(hideBlogPost);
