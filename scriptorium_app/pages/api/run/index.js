import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const { code, language } = req.body;

            if (!code || !language) {
                return res.status(400).json({ error: 'Code and language are required.' });
            }

            // Create a unique file name
            const timestamp = Date.now();
            const fileName = language.toLowerCase() === 'java' ? 'Main.java' : `code_${timestamp}.${getFileExtension(language)}`;
            const filePath = path.join(process.cwd(), 'tmp', fileName);

            // Ensure the tmp directory exists
            await fs.mkdir(path.join(process.cwd(), 'tmp'), { recursive: true });

            // Write the code to the file
            await fs.writeFile(filePath, code);

            // Call the runCode function and capture the output
            const output = await runCode(filePath, language);

            // Return the output
            res.status(200).json({ output });
        } catch (error) {
            console.error('Error executing code:', error);
            res.status(500).json({ error: 'Something went wrong while executing the code.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

// Utility function to determine the file extension based on the language
function getFileExtension(language) {
    switch (language.toLowerCase()) {
        case 'javascript':
            return 'js';
        case 'python':
            return 'py';
        case 'java':
            return 'java';
        case 'c':
            return 'c';
        case 'cpp':
            return 'cpp';
        default:
            return 'txt'; // Fallback for unsupported languages
    }
}


const execAsync = promisify(exec);

// This function executes the file with the appropriate command based on the language.
export async function runCode(file, language) {
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
        // Execute the command
        const { stdout, stderr } = await execAsync(command);

        if (stderr) {
            return `Error: ${stderr}`;
        }

        return stdout;
    } catch (error) {
        return `Execution error: ${error.message}`;
    }
}