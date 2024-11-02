// /pages/api/admin/reports/comments.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import authMiddleware from '@/middleware/admin';

const getReportedComments = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Extract query parameters
  const { sortBy, page = 1, limit = 10 } = req.query;

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
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    // validate page and limit parameters
    if (isNaN(pageNumber) || pageNumber < 1) {
      return res.status(400).json({ error: "Invalid page number" });
    }
    if (isNaN(pageSize) || pageSize < 1) {
      return res.status(400).json({ error: "Invalid limit number" });
    }

    // fetch reported comments, sorted by the specified field, with pagination
    const reportedComments = await prisma.comment.findMany({
      where: { numReports: { gt: 0 } },
      orderBy: sortField,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
    });

    return res.status(200).json(reportedComments);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Error retrieving reported comments" });
  } finally {
    await prisma.$disconnect();
  }
};

export default authMiddleware(getReportedComments);
