import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { verifyToken } from '@/utils/auth';

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

  // fetch user id from database
  const account = await prisma.account.findUnique({
    where: { email },
    select: {
      id: true
    },
  });

  const authorId = account.id;

  // extract fields from request body with default values
  const { title, description, tags = [], codeTemplates = [] } = req.body;


  if (!title || !description || !authorId) {
    return res.status(400).json({ error: "Title, description, and/or an author are required." });
  }

  // ensure all JSON parameters are of the correct type
  if (typeof title !== 'string' || typeof description !== 'string' ||
      (tags && (!Array.isArray(tags) || tags.some(tag => typeof tag !== 'number'))) ||
      (codeTemplates && (!Array.isArray(codeTemplates) || codeTemplates.some(template => typeof template !== 'number')))) {
    return res.status(400).json({ error: "One or more parameters are of the incorrect type!" });
  }

  try {

    // check if tags exist
    for (let tag of tags) {
      const tagExists = await prisma.tag.findUnique({ where: { id: tag } });
      if (!tagExists) {
        return res.status(400).json({ error: `Tag with ID ${tag} does not exist` });
      }
    }

    // check if codeTemplates exist
    for (let template of codeTemplates) {
      const templateExists = await prisma.codeTemplate.findUnique({ where: { id: template } });
      if (!templateExists) {
        return res.status(400).json({ error: `Code template with ID ${template} does not exist` });
      }
    }

    // create new blog post
    const newBlogPost = await prisma.blogPost.create({
      data: {
        title,
        description,
        author: {
          connect: { id: authorId }, // connect author to blog post
        },
        tags: {
          connect: tags.map(tag => ({ id: tag })),
        },
        codeTemplates: {
          connect: codeTemplates.map(codeTemplateId => ({ id: codeTemplateId })), // assuming codeTemplates are passed as IDs
        },
      },
    });

    return res.status(201).json({
      id: newBlogPost.id,
      title: newBlogPost.title,
      description: newBlogPost.description,
      authorId: newBlogPost.authorId,
      tags: newBlogPost.tags,
      codeTemplates: newBlogPost.codeTemplates,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}