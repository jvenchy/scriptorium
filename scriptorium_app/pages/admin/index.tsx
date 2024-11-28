'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ReportedItemsList from '@/components/ReportedItemsList'
import Pagination from '@/components/Pagination'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Navbar } from '@/components/NavBar'
import ProfileComponent from '@/components/ProfileComponent'

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
  upvotes: number
  downvotes: number
  numReports: number
  authorId: number
  canEdit: boolean
  isVisible: boolean
  createdAt: string
  updatedAt: string
  reportExplanations: string[]
}

interface Comment {
  id: number
  content: string
  author: {
    id: number
    firstName: string
    lastName: string
    avatar: string
  }
  createdAt: string
  parentCommentId: number | null
  numReports: number
  reportExplanations: string[]
  isVisible: boolean
}

interface ApiResponse<T> {
  items: T[]
  totalPages: number
}

export default function AdminReportsPage() {
  const { user } = useAuth()
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
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch reported items')
      }
      const data = await response.json()
      if (activeTab === 'blogPosts') {
        setBlogPosts(data as BlogPost[])
      } else {
        setComments(data as Comment[])
      }
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching reported items:', error)
      if (activeTab === 'blogPosts') {
        setBlogPosts([])
      } else {
        setComments([])
      }
    }
  }

  const hideItem = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/reports/${activeTab}/${id}/hide`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
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

  if (!user?.isAdministrator) {
    return <div className="container mx-auto p-4">Access Denied</div>
  }

  return (
    <div className="flex min-h-screen bg-white text-black">
      <Navbar
        isAuthenticated={!!user}
        onAuthClick={() => {}}
        onLogoutClick={() => {}}
        user={user}
        onCreatePostClick={() => router.push('/createPost')}
      />
      <div className="container mx-auto p-4 ml-60">
        {user && (
          <div className="mb-6 flex items-center justify-end space-x-4">
            <ProfileComponent />
          </div>
        )}

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
        
        <div className="space-y-4">
          {activeTab === 'blogPosts' ? (
            blogPosts.map((post) => (
              <div 
                key={post.id} 
                className={`border p-4 rounded-lg ${!post.isVisible ? 'bg-red-50' : ''}`}
              >
                <div className={`${!post.isVisible ? 'hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                  <Link href={`/blog/${post.id}`} className="block">
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                    <p className="text-red-600">Reports: {post.numReports}</p>
                    {!post.isVisible && (
                      <p className="text-red-600 font-medium">Hidden</p>
                    )}
                    {post.reportExplanations.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Report Reasons:</p>
                        <ul className="list-disc list-inside">
                          {post.reportExplanations.map((explanation, index) => (
                            <li key={index} className="text-gray-600">{explanation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Link>
                  {post.isVisible && (
                    <button
                      onClick={() => hideItem(post.id)}
                      className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hide Blog Post
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            comments.map((comment) => (
              <div 
                key={comment.id} 
                className={`border p-4 rounded-lg ${!comment.isVisible ? 'bg-red-50' : ''}`}
              >
                <div className={`${!comment.isVisible ? 'hover:bg-red-100' : 'hover:bg-gray-50'}`}>
                  {comment.author && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <p className="mb-2">{comment.content}</p>
                  <p className="text-red-600">Reports: {comment.numReports}</p>
                  {!comment.isVisible && (
                    <p className="text-red-600 font-medium">Hidden</p>
                  )}
                  {comment.reportExplanations?.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Report Reasons:</p>
                      <ul className="list-disc list-inside">
                        {comment.reportExplanations.map((explanation, index) => (
                          <li key={index} className="text-gray-600">{explanation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {comment.isVisible && (
                    <button
                      onClick={() => hideItem(comment.id)}
                      className="mt-2 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hide Comment
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}

