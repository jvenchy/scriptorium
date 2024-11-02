import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { authorId, page = 1, pageSize = 10 } = req.query;

  if (!authorId) {
    return res.status(400).json({ error: "Missing authorId parameter" });
  }

  try {
    // Convert page and pageSize to integers and calculate skip value
    const pageInt = parseInt(page, 10);
    const pageSizeInt = parseInt(pageSize, 10);
    const skip = (pageInt - 1) * pageSizeInt;

    // Fetch code templates by author with pagination
    const codeTemplates = await prisma.codeTemplate.findMany({
      where: { authorId: parseInt(authorId, 10) },
      skip,
      take: pageSizeInt,
      select: {
        id: true,
        codeSnippet: true,
        title: true,
        explanation: true,
        language: true,
        forkedFromId: true,
        tags: { select: { name: true } },
      },
    });

    // Respond with the code templates list
    return res.status(200).json(codeTemplates);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}