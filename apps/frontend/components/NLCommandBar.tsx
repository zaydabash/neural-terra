'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGlobeStore } from '@/lib/store'
import { Sparkles, ArrowUp, X, Loader2, CornerDownLeft } from 'lucide-react'

const EXAMPLES = [
  'Simulate 30% slowdown in Panama Canal for 7 days',
  'What happens if LA port shuts down for 24 hours?',
  'Next critical choke point if shipping slows 20%',
  'Simulate a heatwave in Europe with +3°C',
]

export default function NLCommandBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const runNLQuery = useGlobeStore((s) => s.runNLQuery)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((v) => !v)
      }
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const submit = async () => {
    if (!query.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      await runNLQuery(query)
      setQuery('')
      setIsOpen(false)
    } catch (err) {
      console.error('NL query failed:', err)
      setError('Failed to process query. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void submit()
  }

  return (
    <>
      {/* Launcher (sits above the timeline) */}
      <div className="absolute bottom-[6.25rem] left-1/2 z-20 -translate-x-1/2">
        <button
          onClick={() => setIsOpen(true)}
          className="glass group flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-ink-800/70"
        >
          <Sparkles className="h-4 w-4 text-neural-cyan" />
          <span className="text-sm text-slate-300">Ask Neural Terra…</span>
          <kbd className="rounded-md border border-white/10 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Command palette */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/70 p-4 pt-[18vh] backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-xl overflow-hidden"
            >
              {/* header */}
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-neural-cyan" />
                  <span className="text-sm font-semibold text-white">
                    Natural Language Simulation
                  </span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4">
                {error && (
                  <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                    {error}
                  </div>
                )}

                <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-ink-800/60 p-2 focus-within:border-sky-400/50">
                  <textarea
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value)
                      if (error) setError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        void submit()
                      }
                    }}
                    placeholder="e.g. Simulate 40% slowdown in the Suez Canal for 7 days"
                    rows={2}
                    className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!query.trim() || isLoading}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 text-ink-950 transition-transform hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUp className="h-4 w-4" strokeWidth={2.5} />
                    )}
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-1.5 px-1 text-[11px] text-slate-500">
                  <CornerDownLeft className="h-3 w-3" /> to run
                  <span className="text-slate-700">·</span>
                  Shift+Enter for newline
                </div>

                <div className="mt-4">
                  <div className="panel-label mb-2">Try one</div>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => setQuery(ex)}
                        className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-left text-[11px] text-slate-300 transition-colors hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-200"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
