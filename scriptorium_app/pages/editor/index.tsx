'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CodeEditor from '@/components/CodeEditor'
import LanguageSelector from '@/components/LanguageSelector'
import RunButton from '@/components/RunButton'
import OutputBox from '@/components/OutputBox'
import AuthorInfo from '@/components/AuthorInfo'
import EditableField from '@/components/EditableField'
import TagEditor from '@/components/TagEditor'
import SaveButton from '@/components/SaveButton'
import ForkButton from '@/components/ForkButton'
import DeleteButton from '@/components/DeleteButton'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import { Navbar } from '@/components/NavBar'
import { Modal, Box, Typography, Button, Stack } from '@mui/material'
import Link from 'next/link'
import { useTheme } from '@/contexts/ThemeContext'

interface CodeTemplate {
  id: number
  codeSnippet: string
  title: string
  explanation: string
  forkedFromId: number | null
  authorId: number | null
  language: string
  tags: { id: number; name: string }[]
  author: {
    id: number
    firstName: string
    lastName: string
    email: string
    avatar: string | null
  }
  forks: any[]
}

interface BlogPost {
  id: number
  title: string
  description: string
  author: {
    firstName: string
    lastName: string
  }
  stats: {
    upvotes: number
    comments: number
  }
}

const DEFAULT_TEMPLATE = {
  id: 0,
  codeSnippet: 'console.log("Hello World");',
  title: 'Untitled Code Template',
  explanation: 'Add a description here.',
  forkedFromId: null,
  authorId: null,
  language: 'JavaScript',
  tags: [],
  author: {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    avatar: null,
  },
  forks: []
}

const SUPPORTED_LANGUAGES = {
  'Python': 'python',
  'JavaScript': 'javascript',
  'C': 'c',
  'C++': 'cpp',
  'Java': 'java',
  'Ruby': 'ruby',
  'PHP': 'php',
  'Perl': 'perl',
  'Bash': 'bash',
  'Lua': 'lua'
} as const;

const HELLO_WORLD_PROGRAMS = {
  'Python': 'print("Hello, World!")',
  'JavaScript': 'console.log("Hello, World!");',
  'C': '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  'C++': '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  'Java': 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  'Ruby': 'puts "Hello, World!"',
  'PHP': '<?php\necho "Hello, World!";\n?>',
  'Perl': 'print "Hello, World!\\n";',
  'Bash': 'echo "Hello, World!"',
  'Lua': 'print("Hello, World!")'
} as const;

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const { user } = useAuth()
  const { theme } = useTheme()

  const [template, setTemplate] = useState<CodeTemplate | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState({ errorString: '', outputString: '' })
  const [title, setTitle] = useState('')
  const [explanation, setExplanation] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authAction, setAuthAction] = useState<'save' | 'fork' | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const POSTS_PER_PAGE = 5

  const isAuthor = !templateId || user?.id === template?.authorId

  useEffect(() => {
    if (templateId) {
      fetch(`/api/code-templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
        .then((res) => res.json())
        .then((data) => {
          setTemplate(data)
          setCode(data.codeSnippet)
          setLanguage(data.language)
          setTitle(data.title)
          setExplanation(data.explanation)
          setTags(data.tags.map((tag: { name: string }) => tag.name))
        })
    } else {
      setTemplate(DEFAULT_TEMPLATE)
      setCode(DEFAULT_TEMPLATE.codeSnippet)
      setLanguage(DEFAULT_TEMPLATE.language)
      setTitle(DEFAULT_TEMPLATE.title)
      setExplanation(DEFAULT_TEMPLATE.explanation)
      setTags(DEFAULT_TEMPLATE.tags.map(tag => tag.name))
    }
  }, [templateId])

  useEffect(() => {
    if (templateId) {
      fetch(`/api/blogPosts?templateId=${templateId}&page=${currentPage}&limit=${POSTS_PER_PAGE}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
        .then(res => res.json())
        .then(data => {
          setRelatedPosts(data.posts)
          setTotalPages(data.pagination.totalPages)
        })
        .catch(error => console.error('Failed to fetch related posts:', error))
    }
  }, [templateId, currentPage])

  const runCode = async () => {
    setIsRunning(true)
    try {
      const apiLanguage = SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES] || language.toLowerCase();
      
      const response = await fetch('/api/code-templates/run', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ 
          codeSnippet: code, 
          language: apiLanguage, 
          stdin 
        }),
      })
      const result = await response.json()
      setOutput(result)
    } catch (error) {
      setOutput({ errorString: 'Failed to run code', outputString: '' })
    } finally {
      setIsRunning(false)
    }
  }

  const handleAuthRequired = (action: 'save' | 'fork') => {
    setAuthAction(action)
    setShowAuthModal(true)
  }

  const saveTemplate = async () => {
    if (!user) {
      handleAuthRequired('save')
      return
    }

    if (template && template.id !== 0) {
      // Update existing template
      const response = await fetch('/api/code-templates/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          codeTemplateId: template.id,
          codeSnippet: code,
          title,
          explanation,
          tags,
          language,
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update template')
      }

      // Refetch the template to get fresh data
      const updatedResponse = await fetch(`/api/code-templates/${template.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      const updatedData = await updatedResponse.json()
      setTemplate(updatedData)
      alert('Template updated successfully!')
    } else {
      // Create new template
      const response = await fetch('/api/code-templates/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          codeSnippet: code,
          title,
          explanation,
          tags,
          language,
        }),
      })
      const result = await response.json()
      router.push(`/editor?template=${result.codeTemplateId}`)
    }
  }

  const forkTemplate = async () => {
    if (!user) {
      handleAuthRequired('fork')
      return
    }

    if (!template || !user) return

    const response = await fetch('/api/code-templates/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        codeSnippet: code,
        title: `Fork of ${title}`,
        explanation,
        tags,
        language,
        forkedFromId: template.id
      }),
    })
    const result = await response.json()
    router.push(`/editor?template=${result.codeTemplateId}`)
  }

  const deleteTemplate = async () => {
    if (!template || template.id === 0 || !user) return

    const confirmDelete = window.confirm('Are you sure you want to delete this template?')
    if (!confirmDelete) return

    const response = await fetch('/api/code-templates/delete', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        codeTemplateId: template.id
      }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete template')
    }
    
    router.push('/editor')
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Only change the code if it's a new template or the default template
    if (!templateId || template?.id === 0) {
      setCode(HELLO_WORLD_PROGRAMS[newLanguage as keyof typeof HELLO_WORLD_PROGRAMS]);
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false)
    setAuthAction(null)
  }

  if (!template) return (
    <div style={{ 
      color: theme.colors.text,
      backgroundColor: theme.colors.background 
    }}>
      Loading...
    </div>
  );

  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      transition: 'all 0.3s ease'
    }}>
      <Navbar
        isAuthenticated={!!user}
        onAuthClick={() => {}}
        onLogoutClick={() => {}}
        user={user}
        onCreatePostClick={() => router.push('/createPost')}
      />
      <div className="flex-grow container mx-auto p-8 ml-60">
        <div className="mb-6">
          <label 
            htmlFor="template-title" 
            style={{ 
              color: theme.colors.text,
              marginBottom: '0.5rem',
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500 
            }}
          >
            Template Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1.5rem',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 'bold',
              backgroundColor: theme.colors.cardBackground,
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '0.375rem',
              transition: 'all 0.3s ease',
            }}
            readOnly={!isAuthor}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <LanguageSelector language={language} setLanguage={handleLanguageChange} />
            <div className="flex flex-wrap gap-4">
              <RunButton onClick={runCode} isRunning={isRunning} />
              {isAuthor && <SaveButton onClick={saveTemplate} />}
              {templateId && (
                <>
                  <ForkButton onClick={forkTemplate} />
                  {isAuthor && <DeleteButton onClick={deleteTemplate} />}
                </>
              )}
            </div>
            <CodeEditor code={code} setCode={setCode} language={language} />
            <OutputBox output={output} />
            <div style={{ 
              backgroundColor: theme.colors.cardBackground,
              padding: '1rem',
              borderRadius: '0.5rem',
              border: `1px solid ${theme.colors.border}`,
            }}>
              <h2 style={{ 
                fontSize: '1.5rem',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
                marginBottom: '1rem',
                color: theme.colors.text 
              }}>
                Standard Input
              </h2>
              <textarea
                id="stdin"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.25rem',
                  fontFamily: 'monospace',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                }}
                rows={3}
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 style={{ 
                fontSize: '1.5rem',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: theme.colors.text 
              }}>
                Explanation
              </h2>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '0.75rem',
                  backgroundColor: theme.colors.cardBackground,
                  color: theme.colors.text,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '0.375rem',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  resize: 'vertical',
                  transition: 'all 0.3s ease',
                }}
                readOnly={!isAuthor}
              />
            </div>

            <div>
              <h2 style={{ 
                fontSize: '1.5rem',
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: theme.colors.text 
              }}>
                Tags
              </h2>
              <TagEditor tags={tags} setTags={setTags} isEditing={isAuthor} />
            </div>

            <AuthorInfo author={template.author} forkedFromId={template.forkedFromId} />

            {templateId && (
              <div style={{
                marginTop: '3rem',
                paddingTop: '2rem',
                borderTop: `1px solid ${theme.colors.border}`
              }}>
                <h2 style={{ 
                  fontSize: '1.5rem',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: theme.colors.text 
                }}>
                  Related Blog Posts
                </h2>
                {relatedPosts.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      {relatedPosts.map(post => (
                        <Link href={`/blog/${post.id}`} key={post.id}>
                          <div className="p-4 border rounded-lg hover:shadow-lg transition-shadow">
                            <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                            <span className="text-sm text-gray-500">
                              By {post.author.firstName} {post.author.lastName}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded ${
                            currentPage === 1 
                              ? 'bg-gray-100 text-gray-400' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded ${
                            currentPage === totalPages 
                              ? 'bg-gray-100 text-gray-400' 
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No related blog posts found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={showAuthModal}
        onClose={closeAuthModal}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Box
          sx={{
            width: 400,
            bgcolor: theme.colors.cardBackground,
            color: theme.colors.text,
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2, color: theme.colors.text }}>
            Sign In Required
          </Typography>
          <Typography sx={{ mb: 3, color: theme.colors.text }}>
            You need to sign in to {authAction === 'save' ? 'save templates' : 'fork this template'}.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="outlined" 
              onClick={closeAuthModal}
              sx={{
                color: theme.colors.text,
                borderColor: theme.colors.border,
                '&:hover': {
                  borderColor: theme.colors.text,
                  bgcolor: theme.colors.hover,
                }
              }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
