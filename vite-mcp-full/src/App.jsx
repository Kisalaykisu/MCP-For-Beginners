import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="app">
      <h1>Vite + MCP: GitHub CI Demo</h1>
      <p>
        This is a minimal Vite React app. Use the MCP server to trigger and monitor
        GitHub Actions builds for this repository.
      </p>
      <button onClick={() => setCount(c => c + 1)}>
        Clicks: {count}
      </button>
      <p className="hint">Try running CI via MCP: ci/dispatch, ci/runs, ci/run, ci/cancel</p>
    </div>
  )
}
