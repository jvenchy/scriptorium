import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

// Function to run the code based on the language
async function runCode(file, language, stdin = '') {
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
            return { errorString: `Unsupported language: ${language}`, outputString: '' };
    }

    try {
        const { stdout, stderr } = await execAsync(command, { input: stdin });
        return { outputString: stdout, errorString: stderr };
    } catch (error) {
        return { errorString: error.message, outputString: '' };
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

// API handler
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ errorString: 'Method not allowed', outputString: '' });
    }

    const { codeSnippet, language, stdin = '' } = req.body;

    if (!codeSnippet || !language) {
        return res.status(400).json({ errorString: 'Missing codeSnippet or language in request body.', outputString: '' });
    }

    try {
        // Get file extension based on language
        const fileExtension = getFileExtension(language);
        if (!fileExtension) {
            return res.status(400).json({ errorString: `Unsupported language: ${language}`, outputString: '' });
        }

        // Define a temporary directory and file path
        const tempDir = path.join(process.cwd(), 'tmp');
        // Define a temporary file name based on the language
        const tempFile = language.toLowerCase() === 'java'
            ? path.join(tempDir, 'Main.java')
            : path.join(tempDir, `tempfile${fileExtension}`);

        // Ensure the tmp directory exists
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Write the code snippet to the temporary file
        fs.writeFileSync(tempFile, codeSnippet);

        // Run the code with the optional stdin input
        const { outputString, errorString } = await runCode(tempFile, language, stdin);

        // Clean up by removing the temp file
        fs.unlinkSync(tempFile);

        return res.status(200).json({ errorString, outputString });
    } catch (error) {
        console.error('Execution error:', error);
        return res.status(500).json({ errorString: `Error executing the code: ${error.message}`, outputString: '' });
    }
}
