'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import EditableField from '@/components/EditableField'
// import AuthorInfo from '@/components/AuthorInfo'
import TagEditor from '@/components/TagEditor'
import SaveButton from '@/components/SaveButton'
import CommentForm from '@/components/CommentForm'
import ReportModal from '@/components/ReportModal'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar, Typography, Button } from '@mui/material'
import { Navbar } from '@/components/NavBar'
import { ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';
import ProfileComponent from '@/components/ProfileComponent';

const defaultAvatar = '/broken-image.jpg'

interface Author {
  id: number
  email: string
  firstName: string
  lastName: string
  avatar: string
}

interface Tag {
  id: number
  name: string
}

interface CodeTemplate {
  id: number
  title: string
  explanation: string
  language: string
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
  replies?: Comment[]
  upvotes: number
  downvotes: number
  canEdit: boolean
}

interface BlogPost {
  id: number
  title: string
  description: string
  createdAt: string
  updatedAt: string
  author: Author
  tags: Tag[]
  codeTemplates: CodeTemplate[]
  comments: Comment[]
  upvotes: number
  downvotes: number
}

const getImageSrc = (src: string) => {
  return src.startsWith('http') ? src : `/placeholder.svg?height=40&width=40`
}

export default function BlogPostPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { id: postId } = router.query // Extract `id` from dynamic route
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const commentRefs = useRef<{ [key: number]: HTMLLIElement | null }>({})
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'comment', id: number } | null>(null)

  useEffect(() => {
    if (postId) {
      fetchBlogPost(postId as string)
    }
  }, [postId])

  const fetchBlogPost = async (id: string) => {
    try {
      const response = await fetch(`/api/blogPosts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch blog post')
      }
      const data = await response.json()
      setBlogPost(data)
      setTitle(data.title)
      setDescription(data.description)
      setTags(data.tags.map((tag: Tag) => tag.name))
    } catch (err) {
      setError('An error occurred while fetching the blog post.')
    } finally {
      setIsLoading(false)
    }
  }

  const saveBlogPost = async () => {
    if (!blogPost || !user) return

    try {
      const response = await fetch(`/api/blogPosts/${blogPost.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          title,
          description,
          tags: tags
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update blog post')
      }

      await fetchBlogPost(blogPost.id.toString())
      setIsEditMode(false)
      alert('Blog post updated successfully!')
    } catch (err) {
      setError('An error occurred while updating the blog post.')
    }
  }

  const createComment = async (content: string, parentCommentId: number | null = null) => {
    if (!blogPost) return

    try {
      const response = await fetch(`/api/blogPosts/${blogPost.id}/comments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          content,
          parentCommentId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create comment')
      }

      await fetchBlogPost(blogPost.id.toString())
      setReplyingTo(null)
    } catch (err) {
      setError('An error occurred while creating the comment.')
    }
  }

  const editComment = async (commentId: number, newContent: string) => {
    if (!blogPost) return

    const originalComment = blogPost.comments.find(c => c.id === commentId)
    if (originalComment && originalComment.content === newContent) {
      setEditingCommentId(null)
      return
    }

    try {
      const response = await fetch(`/api/blogPosts/${blogPost.id}/comments/${commentId}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          content: newContent
        })
      })

      if (!response.ok) {
        throw new Error('Failed to edit comment')
      }

      await fetchBlogPost(blogPost.id.toString())
      setEditingCommentId(null)
    } catch (err) {
      setError('An error occurred while editing the comment.')
    }
  }

  const voteComment = async (commentId: number, voteType: 'upvote' | 'downvote') => {
    if (!blogPost) return

    try {
      const response = await fetch(`/api/blogPosts/${blogPost.id}/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ voteType })
      })

      if (!response.ok) {
        throw new Error('Failed to vote on comment')
      }

      await fetchBlogPost(blogPost.id.toString())
    } catch (err) {
      setError('An error occurred while voting on the comment.')
    }
  }

  const scrollToComment = (commentId: number) => {
    const commentElement = commentRefs.current[commentId]
    if (commentElement) {
      commentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const reportBlogPost = async (explanation: string) => {
    if (!blogPost) return

    try {
      const response = await fetch(`/api/blogPosts/${blogPost.id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ explanation })
      })

      if (!response.ok) {
        throw new Error('Failed to report blog post')
      }

      alert('Blog post reported successfully')
    } catch (err) {
      setError('An error occurred while reporting the blog post.')
    }
  }

  const reportComment = async (commentId: number, explanation: string) => {
    if (!blogPost) return

    try {
      const response = await fetch(`/api/blogPosts/${blogPost.id}/comments/${commentId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ explanation })
      })

      if (!response.ok) {
        throw new Error('Failed to report comment')
      }

      alert('Comment reported successfully')
    } catch (err) {
      setError('An error occurred while reporting the comment.')
    }
  }

  const handleReport = (explanation: string) => {
    if (reportTarget) {
      if (reportTarget.type === 'post') {
        reportBlogPost(explanation)
      } else {
        reportComment(reportTarget.id, explanation)
      }
    }
    setReportTarget(null)
  }

  const renderComments = (comments: Comment[], level = 0) => {
    return comments.map((comment) => (
      <li 
        key={comment.id} 
        className={`border-b pb-4 ${level > 0 ? 'ml-8' : ''}`}
        ref={el => commentRefs.current[comment.id] = el}
      >
        <div className="flex items-center mb-2">
          <Avatar
            src={comment.author.avatar || defaultAvatar}
            alt={`${comment.author.firstName} ${comment.author.lastName}`}
            sx={{ width: 32, height: 32, mr: 2 }}
          />
          <div>
            <Typography
              variant="body2"
              sx={{ fontWeight: 'bold', mr: 2 }}
            >
              {`${comment.author.firstName} ${comment.author.lastName}`}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </Typography>
          </div>
        </div>
        {comment.parentCommentId && (
          <Typography variant="caption" color="text.secondary" className="mb-2">
            replying to{' '}
            <button 
              onClick={() => scrollToComment(comment.parentCommentId!)}
              className="text-blue-500 hover:underline"
            >
              {comments.find(c => c.id === comment.parentCommentId)?.author.firstName || 'author'}
            </button>
          </Typography>
        )}
        {editingCommentId === comment.id ? (
          <>
            <CommentForm
              onSubmit={(content) => editComment(comment.id, content)}
              initialValue={comment.content}
              buttonText="Save Edit"
            />
            <button
              onClick={() => setEditingCommentId(null)}
              className="mt-2 text-red-500 hover:underline"
            >
              Cancel Edit
            </button>
          </>
        ) : (
          <Typography variant="body2" className="mb-2">
            {comment.content}
          </Typography>
        )}
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => voteComment(comment.id, 'upvote')}
            variant="text"
            color="primary"
            sx={{
              textTransform: 'none',
              '&:hover': {
                color: 'primary.dark',
              },
            }}
            startIcon={<ThumbUpIcon />}
          >
            {comment.upvotes}
          </Button>
          <Button
            onClick={() => voteComment(comment.id, 'downvote')}
            variant="text"
            color="error"
            sx={{
              textTransform: 'none',
              '&:hover': {
                color: 'error.dark',
              },
            }}
            startIcon={<ThumbDownIcon />}
          >
            {comment.downvotes}
          </Button>
          {replyingTo === comment.id ? (
            <CommentForm
              onSubmit={(content) => createComment(content, comment.id)}
              placeholder="Write a reply..."
              buttonText="Reply"
            />
          ) : (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-blue-500 hover:underline"
            >
              Reply
            </button>
          )}
          {comment.canEdit && comment.author.id === user?.id && (
            <>
              <button
                onClick={() => setEditingCommentId(comment.id)}
                className="text-blue-500 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => deleteComment(comment.id)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </>
          )}
          <button
            onClick={() => {
              setReportTarget({ type: 'comment', id: comment.id })
              setIsReportModalOpen(true)
            }}
            className="text-red-500 hover:underline"
          >
            Report
          </button>
        </div>
        {comment.replies && comment.replies.length > 0 && (
          <ul className="mt-4">
            {renderComments(comment.replies, level + 1)}
          </ul>
        )}
      </li>
    ))
  }

  const voteBlogPost = async (voteType: 'upvote' | 'downvote') => {
    if (!blogPost) return

    try {
      const response = await fetch(`/api/blogPosts/${blogPost.id}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ voteType })
      })

      if (!response.ok) {
        throw new Error('Failed to vote on blog post')
      }

      await fetchBlogPost(blogPost.id.toString())
    } catch (err) {
      setError('An error occurred while voting on the blog post.')
    }
  }

  const deleteBlogPost = async () => {
    if (!blogPost || !user) return
    
    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/blogPosts/${blogPost.id}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete blog post')
      }

      router.push('/')
    } catch (err) {
      setError('An error occurred while deleting the blog post.')
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!blogPost) return

    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/blogPosts/${blogPost.id}/comments/${commentId}/delete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete comment')
      }

      await fetchBlogPost(blogPost.id.toString())
    } catch (err) {
      setError('An error occurred while deleting the comment.')
    }
  }

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>
  }

  if (!blogPost) {
    return <div className="container mx-auto p-4">Blog post not found.</div>
  }

  return (
    <div className="flex min-h-screen bg-white text-black">
      <Navbar
        isAuthenticated={!!user}
        onAuthClick={() => {}}
        onLogoutClick={() => {
          // Add your logout logic here
        }}
        user={user}
        onCreatePostClick={() => router.push('/createPost')}
      />
      <div className="container mx-auto p-4 ml-60">
        {user && (
          <div className="mb-6 flex items-center justify-end space-x-4">
            <ProfileComponent />
          </div>
        )}

        <article className="max-w-3xl mx-auto">
          <header className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {isEditMode ? (
                <EditableField
                  value={title}
                  onChange={setTitle}
                  className="text-4xl font-bold"
                />
              ) : (
                <h1 className="text-4xl font-bold">{blogPost.title}</h1>
              )}
              <div className="space-x-2">
                {user?.id === blogPost.author.id && (
                  <>
                    <Button
                      onClick={() => setIsEditMode(!isEditMode)}
                      variant="contained"
                      color="primary"
                      sx={{
                        textTransform: 'none',
                        boxShadow: 3,
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                      }}
                    >
                      {isEditMode ? 'Cancel Edit' : 'Edit Post'}
                    </Button>
                    <Button
                      onClick={deleteBlogPost}
                      variant="contained"
                      color="error"
                      sx={{
                        textTransform: 'none',
                        boxShadow: 3,
                        '&:hover': {
                          backgroundColor: 'error.dark',
                        },
                      }}
                    >
                      Delete Post
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => {
                    setReportTarget({ type: 'post', id: blogPost.id });
                    setIsReportModalOpen(true);
                  }}
                  variant="outlined"
                  color="secondary"
                  sx={{
                    textTransform: 'none',
                    boxShadow: 3,
                    '&:hover': {
                      backgroundColor: 'secondary.light',
                    },
                  }}
                >
                  Report Post
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <Avatar
                src={blogPost.author.avatar || defaultAvatar}
                sx={{ width: 24, height: 24 }}
              />
              <Typography
                variant="body2"
                color="text.primary"
                sx={{
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                // {blogPost.author.firstName} {blogPost.author.lastName}
              </Typography>
            </div>

            {isEditMode ? (
              <div className="mb-8">
                <EditableField
                  value={description}
                  onChange={setDescription}
                  multiline
                  className="prose max-w-none"
                />
              </div>
            ) : (
              <>
                <div className="prose max-w-none mb-8">
                  {blogPost.description}
                </div>
                <div className="flex items-center space-x-4 mb-8 justify-center">
                  <Button
                    onClick={() => voteBlogPost('upvote')}
                    variant="text"
                    color="primary"
                    sx={{
                      textTransform: 'none',
                      '&:hover': {
                        color: 'primary.dark',
                      },
                    }}
                    startIcon={<ThumbUpIcon />}
                  >
                    {blogPost.upvotes}
                  </Button>
                  <Button
                    onClick={() => voteBlogPost('downvote')}
                    variant="text"
                    color="error"
                    sx={{
                      textTransform: 'none',
                      '&:hover': {
                        color: 'error.dark',
                      },
                    }}
                    startIcon={<ThumbDownIcon />}
                  >
                    {blogPost.downvotes}
                  </Button>
                </div>
              </>
            )}
          </header>

          {blogPost.codeTemplates.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Attached Code Template</h2>
              <ul className="space-y-4">
                {blogPost.codeTemplates.map((template) => (
                  <li key={template.id} className="border rounded p-4">
                    <Link href={`/editor?template=${template.id}`} className="text-blue-500 hover:underline">
                      <h3 className="text-xl font-semibold mb-2">{template.title}</h3>
                    </Link>
                    <p className="text-gray-600 mb-2">{template.explanation}</p>
                    <p className="text-sm text-gray-500">Language: {template.language}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section>
            <h2 className="text-2xl font-bold mb-4">Comments</h2>
            <CommentForm onSubmit={(content) => createComment(content)} />
            <ul className="space-y-4 mt-4">
              {renderComments(blogPost.comments)}
            </ul>
          </section>
          {isEditMode && (
            <div className="mt-8">
              <SaveButton onClick={saveBlogPost} />
            </div>
          )}
        </article>
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false)
            setReportTarget(null)
          }}
          onSubmit={handleReport}
          title={reportTarget?.type === 'post' ? 'Report Blog Post' : 'Report Comment'}
        />
      </div>
    </div>
  )
}
