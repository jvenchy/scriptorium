import React, { useState } from 'react'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (explanation: string) => void
  title: string
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, onSubmit, title }) => {
  const [explanation, setExplanation] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(explanation)
    setExplanation('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Please provide a reason for reporting..."
            className="w-full p-2 border rounded mb-4 h-32"
            required
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={!explanation.trim()}
            >
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportModal
