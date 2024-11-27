interface RunButtonProps {
    onClick: () => void
  }
  
  export default function RunButton({ onClick }: RunButtonProps) {
    return (
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
        onClick={onClick}
      >
        Run Code
      </button>
    )
  }
  
  