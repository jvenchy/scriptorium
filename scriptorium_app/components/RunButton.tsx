interface RunButtonProps {
    onClick: () => Promise<void>;
    isRunning: boolean;
  }
  
  export default function RunButton({ onClick, isRunning }: RunButtonProps) {
    return (
      <button
        onClick={onClick}
        disabled={isRunning}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
          isRunning 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isRunning ? 'Running...' : 'Run Code'}
      </button>
    )
  }
  
  