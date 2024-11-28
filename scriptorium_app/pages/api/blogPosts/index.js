// for visitor and user, doesn't needs auth
// THIS ONE DISPLAYS ALL POSTS AND FILTERS BY DIFFERENT PARAMETERS

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      title,
      description,
      tags, // Expecting tag names as a comma-separated string
      templateName,
      templateId,
      sort = 'createdAt', // default sort by creation date
      page = 1,           // default to first page
      limit = 10          // default items per page
    } = req.query;

    // Convert page and limit to numbers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause based on filters
    const where = {
      AND: [] // Initialize AND array for combining conditions
    };

    // Title search
    if (title) {
      where.AND.push({
        title: {
          contains: title,
        }
      });
    }

    // Description search
    if (description) {
      where.AND.push({
        description: {
          contains: description,
        }
      });
    }

    // Tags filter by name
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
      where.AND.push({
        tags: {
          some: {
            name: {
              in: tagArray
            }
          }
        }
      });
    }

    // Code templates filter by name or ID
    if (templateName || templateId) {
      const templateFilter = {};
      if (templateId) {
        templateFilter.id = parseInt(templateId);
      }
      if (templateName) {
        templateFilter.title = { contains: templateName };
      }
      where.AND.push({
        codeTemplates: {
          some: templateFilter
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
      case 'upvotes':
        orderBy = { upvotes: 'desc' };
        break;
      case 'downvotes':
        orderBy = { downvotes: 'desc' };
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
    const totalCount = await prisma.blogPost.count({
      where
    });

    // Fetch filtered blog posts
    const blogPosts = await prisma.blogPost.findMany({
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
        codeTemplates: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            comments: true,
            reports: true
          }
        }
      }
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    // Format the response
    const formattedPosts = blogPosts.map(post => ({
      id: post.id,
      title: post.title,
      description: post.description,
      author: post.author,
      tags: post.tags,
      codeTemplates: post.codeTemplates,
      createdAt: post.createdAt,
      stats: {
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        comments: post._count.comments,
        reports: post._count.reports,
        visibility: post.isVisible
      }
    }));

    return res.status(200).json({
      posts: formattedPosts,
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
