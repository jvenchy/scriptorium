interface ForkButtonProps {
    onClick: () => void
  }
  
  export default function ForkButton({ onClick }: ForkButtonProps) {
    return (
      <button
        className="mt-4 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
        onClick={onClick}
      >
        Fork Template
      </button>
    )
  }
  