import { useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateCodeTemplate() {
  const [title, setTitle] = useState('');
  const [explanation, setExplanation] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState('');
  const [authorId, setAuthorId] = useState(1); // Hardcoded authorId for now
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      title,
      explanation,
      codeSnippet,
      language,
      tags: tags.split(',').map((tag) => tag.trim()), // Split tags by commas
      authorId, // Set authorId (you could replace this with dynamic data)
    };

    try {
      const res = await fetch('/api/code-templates/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setLoading(false);
        router.push('/code-templates'); // Redirect to the templates list after successful submission
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Something went wrong');
        setLoading(false);
      }
    } catch (error) {
      setError('Failed to submit form. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Create a New Code Template</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Explanation:</label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Code Snippet:</label>
          <textarea
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
          />
        </div>
        <div>
          <label>Language:</label>
          <input
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Tags (comma separated):</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Template'}
        </button>
      </form>
    </div>
  );
}
