export default function About() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">About [PROJECT_NAME]</h1>
      
      <div className="prose prose-lg">
        <p className="text-lg text-gray-600 mb-6">
          This is a React application built with modern tools and best practices.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Tech Stack</h2>
            <ul className="space-y-2">
              <li>⚛️ React 18 with TypeScript</li>
              <li>⚡ Vite for fast development</li>
              <li>🧭 React Router for navigation</li>
              <li>🧪 Vitest for testing</li>
              <li>📏 ESLint for code quality</li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <ul className="space-y-2">
              <li>🎨 Modern UI components</li>
              <li>📱 Responsive design</li>
              <li>🔥 Hot module replacement</li>
              <li>🔍 Type safety</li>
              <li>✅ Ready for production</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <code className="text-sm">
              npm run dev
            </code>
          </div>
          <p className="mt-2 text-gray-600">
            Start the development server and begin building your application!
          </p>
        </div>
      </div>
    </div>
  )
}