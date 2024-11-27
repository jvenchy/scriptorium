interface OutputBoxProps {
    output: {
      errorString: string
      outputString: string
    }
  }
  
  export default function OutputBox({ output }: OutputBoxProps) {
    return (
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Output</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">
          {output.errorString && <span className="text-red-500">{output.errorString}</span>}
          {output.outputString && <span className="text-green-500">{output.outputString}</span>}
        </pre>
      </div>
    )
  }
  
  