'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { EditorProps } from '@monaco-editor/react'
import { useTheme } from '@/contexts/ThemeContext'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

interface CodeEditorProps {
  code: string
  setCode: (code: string) => void
  language: string
}

export default function CodeEditor({ code, setCode, language }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleEditorChange: EditorProps['onChange'] = (value) => {
    if (value) setCode(value)
  }

  if (!mounted) return null

  return (
    <div style={{ 
      border: `1px solid ${theme.colors.border}`,
      borderRadius: '0.375rem',
      overflow: 'hidden'
    }}>
      <MonacoEditor
        height="400px"
        language={language.toLowerCase()}
        theme={theme.isDarkMode ? 'light' : 'vs-dark'}
        value={code}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: 'monospace',
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          renderLineHighlight: 'all',
          lineNumbers: 'on',
          roundedSelection: true,
          automaticLayout: true,
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12,
          },
        }}
      />
    </div>
  )
}

