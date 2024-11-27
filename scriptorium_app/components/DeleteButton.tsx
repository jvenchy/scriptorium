interface DeleteButtonProps {
    onClick: () => void
  }
  
  export default function DeleteButton({ onClick }: DeleteButtonProps) {
    return (
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        onClick={onClick}
      >
        Delete Template
      </button>
    )
  }
  