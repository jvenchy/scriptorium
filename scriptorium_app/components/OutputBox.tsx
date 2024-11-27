interface OutputBoxProps {
  output: {
    errorString: string
    outputString: string
  }
}

export default function OutputBox({ output }: OutputBoxProps) {
  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h2 className="text-2xl font-helvetica font-semibold mb-4">Output</h2>
      <pre className="font-mono text-sm overflow-auto max-h-60 p-2 bg-white rounded border">
        {output.errorString && <span className="text-red-500">{output.errorString}</span>}
        {output.outputString && <span className="text-green-500">{output.outputString}</span>}
      </pre>
    </div>
  )
}

