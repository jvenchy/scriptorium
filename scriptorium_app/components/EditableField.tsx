import React from 'react'

interface EditableFieldProps {
  value: string
  onChange: (value: string) => void
  multiline?: boolean
  className?: string
  isEditing?: boolean
}

const EditableField: React.FC<EditableFieldProps> = ({ value, onChange, multiline = false, className = '' }) => {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 border rounded ${className}`}
        rows={5}
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full p-2 border rounded ${className}`}
    />
  )
}

export default EditableField

