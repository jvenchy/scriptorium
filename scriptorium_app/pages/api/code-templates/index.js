import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const codeTemplates = await prisma.codeTemplate.findMany({
        include: { tags: true, author: true, forks: true },
      });
      res.status(200).json(codeTemplates);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching code templates' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
