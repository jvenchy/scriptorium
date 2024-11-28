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
import { Modal, Box, Typography, Button, Stack } from '@mui/material'

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
            <div className="bg-gray-100 p-4 rounded-lg">
              <h2 className="text-2xl font-helvetica font-semibold mb-4">Standard Input</h2>
              <textarea
                id="stdin"
                className="w-full p-2 border rounded font-mono bg-white"
                rows={3}
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-6">
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
            <AuthorInfo author={template.author} forkedFromId={template.forkedFromId} />
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
            bgcolor: 'background.paper',
            color: 'black',
            borderRadius: 2,
            boxShadow: 24,
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Sign In Required
          </Typography>
          <Typography sx={{ mb: 3 }}>
            You need to sign in to {authAction === 'save' ? 'save templates' : 'fork this template'}.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button 
              variant="contained" 
              onClick={() => router.push('/auth')}
            >
              Sign In
            </Button>
            <Button 
              variant="outlined" 
              onClick={closeAuthModal}
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  )
}
