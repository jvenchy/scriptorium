import fs from 'fs';
import path from 'path';
const { spawn } = require('child_process');

export const SUPPORTED_LANGUAGES = ['java', 'javascript', 'python', 'c', 'cpp'];

async function runCode(file, language, stdin = '') {
  switch (language.toLowerCase()) {
    case 'javascript':
      return await runJavaScript(file, stdin);
    case 'python':
      return await runPython(file, stdin);
    case 'java':
      return await runJava(file, stdin);
    case 'c':
      return await runC(file, stdin);
    case 'cpp':
      return await runCpp(file, stdin);
    default:
      return { errorString: `Unsupported language: ${language}`, outputString: '' };
  }
}

async function runJavaScript(file, stdin) {
  return await executeCommand('node', [file], stdin);
}

async function runPython(file, stdin) {
  return await executeCommand('python3', [file], stdin);
}

async function runJava(file, stdin) {
  const compileResult = await compileJava(file);
  if (compileResult.errorString) return compileResult;
  return await executeCommand('java', ['-cp', path.dirname(file), 'Main'], stdin);
}

async function runC(file, stdin) {
  const executable = file.replace('.c', '');
  const compileResult = await compileC(file, executable);
  console.log('compile:', compileResult, executable);
  if (compileResult.errorString) return compileResult;
  return await executeCommand(`${executable}`, [], stdin);
}

async function runCpp(file, stdin) {
  const executable = file.replace('.cpp', '');
  const compileResult = await compileCpp(file, executable);
  if (compileResult.errorString) return compileResult;
  return await executeCommand(`${executable}`, [], stdin);
}

function compileJava(file) {
  return new Promise((resolve) => {
    const compile = spawn('javac', [file]);
    let error = '';

    // Capture compilation errors
    compile.stderr.on('data', (data) => {
      error += data.toString();
    });

    compile.on('close', (code) => {
      if (code === 0) resolve({ errorString: '', outputString: '' });
      else resolve({ errorString: error, outputString: '' });
    });
  });
}

function compileC(file, output) {
  return new Promise((resolve) => {
    const compile = spawn('gcc', [file, '-o', output]);
    let error = '';

    // Capture compilation errors
    compile.stderr.on('data', (data) => {
      error += data.toString();
    });

    compile.on('close', (code) => {
      if (code === 0) resolve({ errorString: '', outputString: '' });
      else resolve({ errorString: error, outputString: '' });
    });
  });
}

function compileCpp(file, output) {
  return new Promise((resolve) => {
    const compile = spawn('g++', [file, '-o', output]);
    let error = '';

    // Capture compilation errors
    compile.stderr.on('data', (data) => {
      error += data.toString();
    });

    compile.on('close', (code) => {
      if (code === 0) resolve({ errorString: '', outputString: '' });
      else resolve({ errorString: error, outputString: '' });
    });
  });
}

function executeCommand(command, args, stdin) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args);
    let output = '';
    let error = '';

    // Write to stdin
    process.stdin.write(stdin);
    process.stdin.end();

    // Collect stdout and stderr data
    process.stdout.on('data', (data) => {
      output += data.toString();
    });
    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Resolve on close with output
    process.on('close', () => {
      resolve({ outputString: output, errorString: error });
    });

    // Handle errors
    process.on('error', (err) => {
      reject({ errorString: err.message, outputString: '' });
    });
  });
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
    const tempFile = path.join(tempDir, language.toLowerCase() === 'java' ? 'Main.java' : `tempfile${fileExtension}`);

    console.log(tempFile);

    // Ensure the tmp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Write the code snippet to the temporary file
    fs.writeFileSync(tempFile, codeSnippet);

    // Run the code with a timeout of 5 seconds
    const { outputString, errorString } = await runCode(tempFile, language, stdin);

    // Clean up by removing the temp file
    fs.unlinkSync(tempFile);

    return res.status(200).json({ errorString, outputString });
  } catch (error) {
    console.error('Execution error:', error);
    return res.status(500).json({ errorString: `Error executing the code: ${error.message}`, outputString: '' });
  }
}
