'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReportedItemsList from '@/components/ReportedItemsList'
import Pagination from '@/components/Pagination'

const ADMIN_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaXNBZG1pbmlzdHJhdG9yIjp0cnVlLCJleHAiOjE3MzI3Njc2MTAsImlhdCI6MTczMjY2MzAzMH0.ln89xRrdnRpIOFMxFpy2iJUD8Jylj9OCqViaHBl9X1Q'

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

interface ApiResponse<T> {
  items: T[]
  totalPages: number
}

export default function AdminReportsPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<'blogPosts' | 'comments'>('blogPosts')
  const router = useRouter()

  useEffect(() => {
    fetchReportedItems()
  }, [currentPage, activeTab])

  const fetchReportedItems = async () => {
    try {
      const response = await fetch(`/api/admin/reports/${activeTab}?sortBy=reports&page=${currentPage}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${ADMIN_ACCESS_TOKEN}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch reported items')
      }
      const data: ApiResponse<BlogPost | Comment> = await response.json()
      if (activeTab === 'blogPosts') {
        setBlogPosts(data.items as BlogPost[])
      } else {
        setComments(data.items as Comment[])
      }
      setTotalPages(data.totalPages)
    } catch (error) {
      console.error('Error fetching reported items:', error)
    }
  }

  const hideItem = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/reports/${activeTab}/${id}/hide`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ADMIN_ACCESS_TOKEN}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to hide item')
      }
      fetchReportedItems() // Refresh the list after hiding an item
    } catch (error) {
      console.error('Error hiding item:', error)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Reports</h1>
      <div className="mb-4">
        <button
          className={`mr-2 px-4 py-2 rounded ${activeTab === 'blogPosts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('blogPosts')}
        >
          Blog Posts
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'comments' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('comments')}
        >
          Comments
        </button>
      </div>
      <ReportedItemsList
        items={activeTab === 'blogPosts' ? blogPosts : comments}
        onHide={hideItem}
        type={activeTab}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

