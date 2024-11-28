interface RunButtonProps {
    onClick: () => Promise<void>;
    isRunning: boolean;
  }
  
  export default function RunButton({ onClick, isRunning }: RunButtonProps) {
    return (
      <button
        onClick={onClick}
        disabled={isRunning}
        className={`mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 font-mono ${
          isRunning ? 'cursor-not-allowed' : ''
        }`}
      >
        {isRunning ? 'Running...' : 'Run Code'}
      </button>
    )
  }
  
  