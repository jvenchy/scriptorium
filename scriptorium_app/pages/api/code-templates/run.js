import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import prisma from '../../../lib/prisma'; // Adjust the path to your Prisma client

const execAsync = promisify(exec);

// Function to run the code based on the language
async function runCode(file, language) {
  let command;
  switch (language.toLowerCase()) {
    case 'javascript':
      command = `node ${file}`;
      break;
    case 'python':
      command = `python ${file}`;
      break;
    case 'java':
      command = `javac ${file} && java -cp ${path.dirname(file)} Main`;
      break;
    case 'c':
      command = `gcc ${file} -o ${file.replace('.c', '')} && ${file.replace('.c', '')}`;
      break;
    case 'cpp':
      command = `g++ ${file} -o ${file.replace('.cpp', '')} && ${file.replace('.cpp', '')}`;
      break;
    default:
      throw new Error(`Unsupported language: ${language}`);
  }
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr) {
      return `Error: ${stderr}`;
    }
    return stdout;
  } catch (error) {
    return `Execution error: ${error.message}`;
  }
}

// API handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: 'Missing id in request body.' });
  }

  try {
    // Fetch the CodeTemplate from the database using Prisma
    const codeTemplate = await prisma.codeTemplate.findUnique({
      where: { id: Number(id) },
    });

    if (!codeTemplate) {
      return res.status(404).json({ message: `CodeTemplate with id ${id} not found.` });
    }

    const { codeSnippet, language } = codeTemplate;

    if (!codeSnippet || !language) {
      return res.status(400).json({ message: 'The CodeTemplate is missing either the codeSnippet or the language.' });
    }

    // Define a temporary file name based on the language
    const fileExtension = getFileExtension(language);
    if (!fileExtension) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }

    const tempDir = path.join(process.cwd(), 'tmp');
    const tempFile = path.join(tempDir, `tempfile${fileExtension}`);

    // Ensure the tmp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Write the code snippet to a temporary file
    fs.writeFileSync(tempFile, codeSnippet);

    // Run the code
    const output = await runCode(tempFile, language);

    // Clean up by removing the temp file
    fs.unlinkSync(tempFile);

    return res.status(200).json({ output });
  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({ message: `Error executing the code: ${error.message}` });
  }
}

// Helper function to get file extension based on language
function getFileExtension(language) {
  switch (language.toLowerCase()) {
    case 'javascript':
      return '.js';
    case 'python':
      return '.py';
    case 'java':
      return '.java';
    case 'c':
      return '.c';
    case 'cpp':
      return '.cpp';
    default:
      return null;
  }
}