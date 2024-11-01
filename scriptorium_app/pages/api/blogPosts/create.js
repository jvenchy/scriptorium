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
  
  // Ensure all JSON parameters are correct type
  if (typeof title !== 'string' || typeof description !== 'string') {
    return res.status(400).json({ error: "One of more parameters are of the incorrect type!" });
  }

  if (!title || !description || !authorId) {
    return res.status(400).json({ error: "Title, description, and authorId are required." });
  }

  try {
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