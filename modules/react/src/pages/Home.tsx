import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '/vite.svg'

export default function Home() {
  const [count, setCount] = useState(0)

  return (
    <div className="text-center">
      <div className="flex justify-center gap-8 mb-8">
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      
      <h1 className="text-4xl font-bold mb-8">Vite + React</h1>
      
      <div className="card">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="mb-4"
        >
          count is {count}
        </button>
        <p className="text-gray-600">
          Edit <code className="bg-gray-100 px-2 py-1 rounded">src/pages/Home.tsx</code> and save to test HMR
        </p>
      </div>
      
      <p className="read-the-docs mt-8">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}