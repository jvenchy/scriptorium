
import prisma from '../../../lib/prisma'; // Adjust the path to your Prisma client setup

// API handler
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.body;

  // Check if the id is provided
  if (!id) {
    return res.status(400).json({ message: 'Missing id in request body.' });
  }

  try {
    // Delete the CodeTemplate with the provided id
    const deletedCodeTemplate = await prisma.codeTemplate.delete({
      where: { id: Number(id) },
    });

    return res.status(200).json({ message: `CodeTemplate with id ${id} was deleted successfully.`, deletedCodeTemplate });
  } catch (error) {
    console.error('Error deleting CodeTemplate:', error);
    if (error.code === 'P2025') {
      // Prisma specific error code for "Record to delete does not exist"
      return res.status(404).json({ message: `CodeTemplate with id ${id} not found.` });
    }
    return res.status(500).json({ message: `Error deleting the CodeTemplate: ${error.message}` });
  }
}