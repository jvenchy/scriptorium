import React, { useState } from 'react'

interface TagEditorProps {
  tags: string[]
  setTags: React.Dispatch<React.SetStateAction<string[]>>
}

const TagEditor: React.FC<TagEditorProps> = ({ tags, setTags }) => {
  const [newTag, setNewTag] = useState('')

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, index) => (
          <span key={index} className="bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
            {tag}
            <button onClick={() => removeTag(tag)} className="ml-2 text-red-500">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTag()}
          placeholder="Add a tag"
          className="flex-grow p-2 border rounded-l"
        />
        <button onClick={addTag} className="bg-blue-500 text-white px-4 py-2 rounded-r">Add</button>
      </div>
    </div>
  )
}

export default TagEditor

