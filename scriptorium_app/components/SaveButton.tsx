interface SaveButtonProps {
    onClick: () => void
  }
  
  export default function SaveButton({ onClick }: SaveButtonProps) {
    return (
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 font-mono"
        onClick={onClick}
      >
        Save Changes
      </button>
    )
  }
  
  