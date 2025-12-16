'use client'

import { useState, useEffect } from 'react'
import { useGlobeStore } from '@/lib/store'
import { Command, Send, X } from 'lucide-react'

export default function NLCommandBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { runNLQuery } = useGlobeStore()

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    try {
      await runNLQuery(query)
      setQuery('')
      setIsOpen(false)
    } catch (error: any) {
      console.error('NL query failed:', error)
      setError('Failed to process query. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const exampleQueries = [
    "Simulate 30% slowdown in Panama Canal for 7 days",
    "What happens if LA port shuts down for 24 hours?",
    "Show me the next critical choke point if shipping slows by 20%",
    "Simulate a heatwave in Europe with +3°C temperature"
  ]

  return (
    <>
      {/* Command Bar Toggle */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg hover:bg-gray-700 transition-colors"
        >
          <Command className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">Natural Language Query</span>
          <kbd className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded">⌘K</kbd>
        </button>
      </div>

      {/* Command Bar Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Natural Language Query</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-700 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">
                    {error}
                  </div>
                )}
                <div className="relative">
                  <textarea
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="Ask Neural Terra anything... e.g., 'Simulate 30% slowdown in Panama Canal for 7 days'"
                    className="w-full h-24 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-neural-blue resize-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="absolute bottom-3 right-3 p-2 bg-neural-blue hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-sm text-gray-400">
                  <p className="mb-2">Example queries:</p>
                  <div className="space-y-1">
                    {exampleQueries.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => setQuery(example)}
                        className="block w-full text-left px-2 py-1 hover:bg-gray-700 rounded text-gray-300"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
