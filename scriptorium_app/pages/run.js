import { useState, useEffect } from 'react';

export default function CodeRunner() {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default code snippets for each language
  const defaultCode = {
    javascript: `console.log("Hello, World!");`,
    python: `print("Hello, World!")`,
    java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}`,
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`
  };

  // Update code when language changes
  useEffect(() => {
    setCode(defaultCode[language]);
  }, [language]);

  const handleRunCode = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setOutput('');

    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data.output);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to execute the code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Code Runner</h1>
      <form onSubmit={handleRunCode}>
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="language" style={{ marginRight: '10px' }}>Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
          </select>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label htmlFor="code">Code:</label>
          <textarea
            id="code"
            rows="10"
            style={{ width: '100%' }}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here..."
          ></textarea>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Running...' : 'Run Code'}
        </button>
      </form>

      {output && (
        <div style={{ marginTop: '20px' }}>
          <h3>Output:</h3>
          <pre>{output}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '20px', color: 'red' }}>
          <h3>Error:</h3>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}
