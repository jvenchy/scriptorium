import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function CodeTemplates() {
  const { data, error } = useSWR('/api/code-templates', fetcher);

  if (error) return <div>Failed to load code templates</div>;
  if (!data) return <div>Loading...</div>;

  // Add a check to make sure `data` is an array before mapping over it
  return (
    <div>
      <h1>Code Templates</h1>
      <ul>
        {Array.isArray(data) && data.length > 0 ? (
          data.map((template) => (
            <li key={template.id}>
              <Link href={`/code-templates/${template.id}`}>
                {template.title}
              </Link>
            </li>
          ))
        ) : (
          <li>No templates found</li>
        )}
      </ul>
    </div>
  );
}
