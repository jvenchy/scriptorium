import React from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface Author {
  id: number
  email: string
  firstName: string
  lastName: string
  avatar: string
}

interface BlogPost {
  id: number
  title: string
  description: string
  content: string
  createdAt: string
  updatedAt: string
  author: Author
  reportCount: number
}

interface Comment {
  id: number
  author: {
    id: number
    firstName: string
    lastName: string
    avatar: string
  }
  content: string
  createdAt: string
  parentCommentId: number | null
  reportCount: number
}

interface ReportedItemsListProps {
  items: BlogPost[] | Comment[]
  onHide: (id: number) => void
  type: 'blogPosts' | 'comments'
}

const ReportedItemsList: React.FC<ReportedItemsListProps> = ({ items, onHide, type }) => {
  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="border p-4 rounded">
          {type === 'blogPosts' && 'title' in item && (
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
          )}
          <p className="mb-2">
            {type === 'blogPosts' && 'description' in item
              ? item.description
              : item.content}
          </p>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-red-500 mr-4">Reports: {item.reportCount}</span>
              <span className="text-gray-500">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </span>
            </div>
            <div>
              <Link
                href={type === 'blogPosts' ? `/blog?id=${item.id}` : `/blog?commentId=${item.id}`}
                className="text-blue-500 hover:underline mr-4"
              >
                View
              </Link>
              <button
                onClick={() => onHide(item.id)}
                className="text-red-500 hover:underline"
              >
                Hide
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  )
}

export default ReportedItemsList

