import prisma from '../../../lib/prisma';


// POST /api/codeTemplate/create
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { codeSnippet, title, explanation, tags, forkedFromId, authorId, language } = req.body;

  // Validate required fields and return descriptive error messages
  if (!title) {
    return res.status(400).json({ message: 'The "title" field is required.' });
  }

  if (!explanation) {
    return res.status(400).json({ message: 'The "explanation" field is required.' });
  }

  if (!authorId) {
    return res.status(400).json({ message: 'The "authorId" field is required and should reference an existing user.' });
  }

  if (!language) {
    return res.status(400).json({ message: 'The "language" field is required.' });
  }

  try {
    // Handle tags creation or association
    const tagData = tags
      ? tags.map(tag => ({
        where: { name: tag },
        create: { name: tag },
      }))
      : [];

    const newCodeTemplate = await prisma.codeTemplate.create({
      data: {
        codeSnippet,
        title,
        explanation,
        language,
        forkedFrom: forkedFromId ? { connect: { id: forkedFromId } } : undefined,
        author: { connect: { id: authorId } },
        tags: {
          connectOrCreate: tagData,
        },
      },
      include: {
        tags: true,
        author: true,
        forkedFrom: true,
      },
    });

    return res.status(201).json(newCodeTemplate);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong', error });
  }
}
