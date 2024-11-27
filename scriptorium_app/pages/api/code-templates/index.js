import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      author,        // Search by author name
      title,         // Search by title
      explanation,   // Search by explanation
      codeSnippet,   // Search by code snippet
      tags,          // Filter by tags
      sort = 'createdAt', // Default sort by creation date
      page = 1,      // Default to first page
      limit = 10     // Default items per page
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause based on filters
    const where = {
      AND: [] // Initialize AND array for combining conditions
    };

    // Author search (searches first and last name)
    if (author) {
      where.AND.push({
        author: {
          OR: [
            { firstName: { contains: author } },
            { lastName: { contains: author } }
          ]
        }
      });
    }

    // Title search
    if (title) {
      where.AND.push({
        title: {
          contains: title
        }
      });
    }

    // Explanation search
    if (explanation) {
      where.AND.push({
        explanation: {
          contains: explanation
        }
      });
    }

    // Code snippet search
    if (codeSnippet) {
      where.AND.push({
        codeSnippet: {
          contains: codeSnippet
        }
      });
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      where.AND.push({
        tags: {
          some: {
            id: {
              in: tagArray
            }
          }
        }
      });
    }

    // If no filters were added, remove the empty AND array
    if (where.AND.length === 0) {
      delete where.AND;
    }

    // Define sort order
    let orderBy = {};
    switch (sort) {
      case 'title':
        orderBy = { title: 'asc' };
        break;
      case 'createdAt_desc':
        orderBy = { createdAt: 'desc' };
        break;
      case 'createdAt_asc':
        orderBy = { createdAt: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // Get total count for pagination
    const totalCount = await prisma.codeTemplate.count({
      where
    });

    // Fetch filtered code templates
    const codeTemplates = await prisma.codeTemplate.findMany({
      where,
      orderBy,
      skip,
      take: limitNum,
      include: {
        author: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        },
        tags: {
          select: {
            id: true,
            name: true
          }
        },
        forkedFrom: {
          select: {
            id: true,
            title: true
          }
        },
        forks: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    // Format the response
    const formattedTemplates = codeTemplates.map(template => ({
      id: template.id,
      title: template.title,
      explanation: template.explanation,
      codeSnippet: template.codeSnippet,
      language: template.language,
      author: template.author,
      tags: template.tags,
      forkedFrom: template.forkedFrom,
      forks: template.forks,
      createdAt: template.createdAt
    }));

    return res.status(200).json({
      codeTemplates: formattedTemplates,
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
