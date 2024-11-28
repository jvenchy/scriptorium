import { useTheme } from '@/contexts/ThemeContext'

interface OutputBoxProps {
  output: {
    errorString: string
    outputString: string
  }
}

export default function OutputBox({ output }: OutputBoxProps) {
  const { theme } = useTheme()
  
  return (
    <div style={{ 
      backgroundColor: theme.colors.cardBackground,
      padding: '1rem',
      borderRadius: '0.5rem',
      transition: 'all 0.3s ease'
    }}>
      <h2 style={{ 
        fontSize: '1.5rem',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 600,
        marginBottom: '1rem',
        color: theme.colors.text
      }}>
        Output
      </h2>
      <pre style={{
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        overflow: 'auto',
        maxHeight: '15rem',
        padding: '0.5rem',
        backgroundColor: theme.isDarkMode ? '#1e1e1e' : '#ffffff',
        borderRadius: '0.25rem',
        border: `1px solid ${theme.colors.border}`,
      }}>
        {output.errorString && <span style={{ color: '#f44336' }}>{output.errorString}</span>}
        {output.outputString && <span style={{ color: '#4caf50' }}>{output.outputString}</span>}
      </pre>
    </div>
  )
}

