import React from 'react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
      >
        Previous
      </button>
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  )
}

export default Pagination

