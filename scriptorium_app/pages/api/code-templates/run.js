import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const supportedLanguages = ['python', 'javascript', 'c', 'cpp', 'java', 'ruby', 'php', 'perl', 'bash', 'lua'];

const extensions = {
  python: 'py',
  javascript: 'js',
  c: 'c',
  cpp: 'cpp',
  java: 'java',
  ruby: 'rb',
  php: 'php',
  perl: 'pl',
  bash: 'sh',
  lua: 'lua',
};


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ errorString: 'Method Not Allowed', outputString: '' });
  }

  const { codeSnippet, language, stdin } = req.body;

  if (!supportedLanguages.includes(language)) {
    return res.status(400).json({
      errorString: `Unsupported language. Supported languages are: ${supportedLanguages.join(', ')}`,
      outputString: '',
    });
  }

  try {
    const dockerDir = path.join(process.cwd(), 'docker');
    const extension = extensions[language];

    const codeFilePath = path.join(dockerDir, `code.${extension}`);
    const dockerfilePath = path.join(dockerDir, `Dockerfile.${language}`);

    // Write the code snippet to a temporary file
    fs.writeFileSync(codeFilePath, codeSnippet, 'utf8');
    console.log(codeFilePath);

    // Build the Docker image
    const buildCommand = `docker build -t ${language}-runner -f ${dockerfilePath} ${dockerDir}`;

    exec(buildCommand, (buildErr, stdout, stderr) => {
      if (buildErr) {
        fs.unlinkSync(codeFilePath);
        return res.status(200).json({ errorString: stderr, outputString: '' });
      }

      // Run the container, passing standard input via echo
      const runCommand = `echo "${stdin.replace(/"/g, '\\"')}" | docker run --rm -i --memory="64m" --memory-swap="64m" -v ${codeFilePath}:/app/code.${extension} ${language}-runner`;

      exec(runCommand, { timeout: 2000 }, (runErr, output, errorOutput) => {
        fs.unlinkSync(codeFilePath);

        if (runErr) {
          // Check if the error is due to timeout
          if (runErr.killed && runErr.signal === 'SIGTERM') {
            return res.status(200).json({ 
              errorString: 'Time Limit Exceeded: Program execution took longer than 2 seconds', 
              outputString: '' 
            });
          }
          // Check if error output indicates memory limit exceeded
          if (!errorOutput) {
            return res.status(200).json({ 
              errorString: 'Memory Limit Exceeded: Program used more than 64MB of memory', 
              outputString: ''
            });
          }
          return res.status(200).json({ errorString: errorOutput, outputString: '' });
        }

        return res.status(200).json({ errorString: '', outputString: output });
      });
    });
  } catch (error) {
    return res.status(200).json({ errorString: error.message, outputString: '' });
  }
}
