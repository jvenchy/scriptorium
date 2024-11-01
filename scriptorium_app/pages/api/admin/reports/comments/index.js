// /pages/api/admin/reports/comments.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import authMiddleware from '@/middleware/admin';

const getReportedComments = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract sortBy from query parameters
  const { sortBy } = req.query;

  let sortField;
  switch (sortBy) {
    case 'date':
      sortField = { createdAt: 'desc' };
      break;
    case 'reports':
    default:
      sortField = { numReports: 'desc' };
      break;
  }

  try {
    // Fetch reported comments, sorted by the specified field
    const reportedComments = await prisma.comment.findMany({
      where: { numReports: { gt: 0 } },
      orderBy: sortField,
    });

    return res.status(200).json(reportedComments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await prisma.$disconnect();
  }
};

export default authMiddleware(getReportedComments);
