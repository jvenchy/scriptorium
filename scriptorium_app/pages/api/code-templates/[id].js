import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const template = await prisma.codeTemplate.findUnique({
        where: { id: Number(id) },
        include: { 
          tags: true,
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          },
        },
      });
      if (!template) {
        res.status(404).json({ error: 'CodeTemplate not found' });
        return;
      }
      res.status(200).json(template);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching code template' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
