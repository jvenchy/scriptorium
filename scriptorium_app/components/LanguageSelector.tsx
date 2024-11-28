import { useTheme } from '@/contexts/ThemeContext';

interface LanguageSelectorProps {
  language: string
  setLanguage: (language: string) => void
}

export default function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
  const languages = ['Python', 'JavaScript', 'C', 'C++', 'Java', 'Ruby', 'PHP', 'Perl', 'Bash', 'Lua']
  const { theme } = useTheme();

  return (
    <div>
      <label 
        htmlFor="language-select" 
        style={{ 
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: theme.colors.text 
        }}
      >
        Select Language
      </label>
      <select
        id="language-select"
        style={{
          width: '100%',
          padding: '0.5rem',
          borderRadius: '0.25rem',
          fontFamily: 'monospace',
          backgroundColor: theme.colors.cardBackground,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
        }}
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </div>
  )
}

