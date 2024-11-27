interface LanguageSelectorProps {
  language: string
  setLanguage: (language: string) => void
}

export default function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
  const languages = ['JavaScript', 'Python', 'Java', 'C++', 'Ruby']

  return (
    <div>
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Language
      </label>
      <select
        id="language-select"
        className="w-full p-2 border rounded font-mono"
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

