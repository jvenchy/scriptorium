import { useState } from 'react'

interface CommentFormProps {
  onSubmit: (content: string) => void
  placeholder?: string
  buttonText?: string
  initialValue?: string
}

export default function CommentForm({ onSubmit, placeholder = 'Write a comment...', buttonText = 'Submit', initialValue = '' }: CommentFormProps) {
  const [content, setContent] = useState(initialValue)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim()) {
      onSubmit(content)
      setContent('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2 border rounded mb-2"
        rows={4}
      />
      <button 
        type="submit"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {buttonText}
      </button>
    </form>
  )
}
