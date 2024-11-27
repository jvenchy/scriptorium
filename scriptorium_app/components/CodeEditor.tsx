'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { EditorProps } from '@monaco-editor/react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  language: string
}

export default function CodeEditor({ code, setCode, language }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditorChange: EditorProps['onChange'] = (value) => {
    if (value) setCode(value)
  }

  if (!mounted) return null

  return (
    <MonacoEditor
      height="400px"
      language={language.toLowerCase()}
      theme="vs-dark"
      value={code}
      onChange={handleEditorChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
      }}
    />
  )
}

