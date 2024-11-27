interface LanguageSelectorProps {
    language: string
    setLanguage: (language: string) => void
  }
  
  export default function LanguageSelector({ language, setLanguage }: LanguageSelectorProps) {
    const languages = ['JavaScript', 'Python', 'Java', 'C++', 'Ruby']
  
    return (
      <div className="mb-4">
        <label htmlFor="language-select" className="block text-sm font-medium text-gray-700">
          Select Language
        </label>
        <select
          id="language-select"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
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
  
  