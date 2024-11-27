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

const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphbmUuZG9lQGV4YW1wbGUuY29tIiwiaXNBZG1pbmlzdHJhdG9yIjpmYWxzZSwiZXhwIjoxNzMyNzcwMDM4LCJpYXQiOjE3MzI2NDE2OTh9.eSnT3pyloiBupkI5ES8wg6W3drcUblNSTmUcSsEuV74'

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
    avatar: null
  },
  forks: []
}

export default function EditorPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template')

  const [template, setTemplate] = useState<CodeTemplate | null>(null)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('')
  const [stdin, setStdin] = useState('')
  const [output, setOutput] = useState({ errorString: '', outputString: '' })
  const [title, setTitle] = useState('')
  const [explanation, setExplanation] = useState('')
  const [tags, setTags] = useState<string[]>([])

  useEffect(() => {
    if (templateId) {
      fetch(`/api/code-templates/${templateId}`, {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`
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
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({ codeSnippet: code, language, stdin }),
    })
    const result = await response.json()
    setOutput(result)
  }

  const saveTemplate = async () => {
    if (template && template.id !== 0) {
      // Update existing template
      const response = await fetch('/api/code-templates/update', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
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
      const result = await response.json()
      alert('updated')
    } else {
      // Create new template
      const response = await fetch('/api/code-templates/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
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
      console.log('Template created:', result)
      router.push(`/editor?template=${result.codeTemplateId}`)
    }
  }

  const forkTemplate = async () => {
    if (!template) return

    const response = await fetch('/api/code-templates/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
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
    console.log('Template forked:', result)
    router.push(`/editor?template=${result.codeTemplateId}`)
  }

  const deleteTemplate = async () => {
    if (!template || template.id === 0) return

    const confirmDelete = window.confirm('Are you sure you want to delete this template?')
    if (!confirmDelete) return

    const response = await fetch('/api/code-templates/delete', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        codeTemplateId: template.id
      }),
    })
    const result = await response.json()
    console.log('Template deleted:', result)
    router.push('/editor') // Redirect to the default editor page
  }

  if (!template) return <div>Loading...</div>

  return (
    <div className="container mx-auto p-4">
      <EditableField
        value={title}
        onChange={setTitle}
        className="text-2xl font-bold mb-4"
        isEditing={true}
      />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <LanguageSelector language={language} setLanguage={setLanguage} />
          <CodeEditor code={code} setCode={setCode} language={language} />
          <div className="mt-4">
            <label htmlFor="stdin" className="block text-sm font-medium text-gray-700">
              Standard Input
            </label>
            <textarea
              id="stdin"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows={3}
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
            />
          </div>
          <div className="mt-4 flex space-x-4">
            <RunButton onClick={runCode} />
            <SaveButton onClick={saveTemplate} />
            {templateId && (
              <>
                <ForkButton onClick={forkTemplate} />
                <DeleteButton onClick={deleteTemplate} />
              </>
            )}
          </div>
        </div>
        <div>
          <OutputBox output={output} />
          <AuthorInfo author={template.author} forkedFromId={template.forkedFromId} />
        </div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Explanation</h2>
        <EditableField
          value={explanation}
          onChange={setExplanation}
          multiline
          className="w-full p-2 border rounded"
          isEditing={true}
        />
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Tags</h2>
        <TagEditor tags={tags} setTags={setTags} isEditing={true}/>
      </div>
    </div>
  )
}
