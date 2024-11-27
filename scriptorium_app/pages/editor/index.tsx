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
import ProfileComponent from '@/components/ProfileComponent'

interface CodeTemplate {
  id: number
  codeSnippet: string
  title: string
  explanation: string
  forkedFromId: number | null
  authorId: number
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

const DEFAULT_TEMPLATE = {
  id: 0,
  codeSnippet: 'console.log("Hello World");',
  title: 'Simple JavaScript Console Log',
  explanation: 'This code prints Hello World to the console.',
  forkedFromId: null,
  authorId: 1,
  language: 'JavaScript',
  tags: [{ id: 1, name: 'JavaScript' }, { id: 2, name: 'Beginner' }, { id: 3, name: 'Example' }],
  author: {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    avatar: '/broken-image.jpg',
  },
  forks: []
}

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')
  const { user } = useAuth()

  const [template, setTemplate] = useState<CodeTemplate | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState({ errorString: '', outputString: '' })
  const [title, setTitle] = useState('')
  const [explanation, setExplanation] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const isAuthor = user?.id === template?.authorId

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

  const runCode = async () => {
    const response = await fetch('/api/code-templates/run', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ codeSnippet: code, language, stdin }),
    })
    const result = await response.json()
    setOutput(result)
  }

  const saveTemplate = async () => {
    if (!user) return

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

  if (!template) return <div>Loading...</div>

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
      <div className="flex-grow container mx-auto p-8 ml-60">
        {user && (
          <div className="mb-6 flex items-center justify-end space-x-4">
            <ProfileComponent />
          </div>
        )}

        <EditableField
          value={title}
          onChange={setTitle}
          className="text-3xl font-helvetica font-bold mb-6"
          isEditing={isAuthor}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <LanguageSelector language={language} setLanguage={setLanguage} />
            <CodeEditor code={code} setCode={setCode} language={language} />
            <div>
              <label htmlFor="stdin" className="block text-sm font-medium text-gray-700 mb-2">
                Standard Input
              </label>
              <textarea
                id="stdin"
                className="w-full p-2 border rounded font-mono"
                rows={3}
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-4">
              <RunButton onClick={runCode} />
              {isAuthor && <SaveButton onClick={saveTemplate} />}
              {templateId && (
                <>
                  <ForkButton onClick={forkTemplate} />
                  {isAuthor && <DeleteButton onClick={deleteTemplate} />}
                </>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <OutputBox output={output} />
            <AuthorInfo author={template.author} forkedFromId={template.forkedFromId} />
            <div>
              <h2 className="text-2xl font-helvetica font-semibold mb-2">Explanation</h2>
              <EditableField
                value={explanation}
                onChange={setExplanation}
                multiline
                className="w-full p-2 border rounded font-mono"
                isEditing={isAuthor}
              />
            </div>
            <div>
              <h2 className="text-2xl font-helvetica font-semibold mb-2">Tags</h2>
              <TagEditor tags={tags} setTags={setTags} isEditing={isAuthor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
