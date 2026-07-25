import { useEffect, useRef, useState } from 'react'

// Point this at wherever api.py is running.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/research'

const STAGES = [
  { key: 'search', label: 'Search', note: 'finding recent, reliable sources' },
  { key: 'reader', label: 'Read', note: 'scraping the most relevant page' },
  { key: 'writer', label: 'Write', note: 'drafting the report' },
  { key: 'critic', label: 'Critique', note: 'reviewing it for gaps' },
]

export default function App() {
  const [topic, setTopic] = useState('')
  const [status, setStatus] = useState('idle') // idle | running | done | error
  const [stageIndex, setStageIndex] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [showSources, setShowSources] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  async function runPipeline(e) {
    e.preventDefault()
    const trimmed = topic.trim()
    if (!trimmed || status === 'running') return

    setStatus('running')
    setStageIndex(0)
    setResult(null)
    setError('')
    setShowSources(false)

    // The pipeline runs its four stages in order but only reports back once
    // it's finished, so we advance the rail on a timer and let the response
    // resolve whichever stage we've reached.
    timerRef.current = setInterval(() => {
      setStageIndex((i) => (i < STAGES.length - 1 ? i + 1 : i))
    }, 2600)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: trimmed }),
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      const data = await res.json()
      clearInterval(timerRef.current)
      setStageIndex(STAGES.length - 1)
      setResult(data)
      setStatus('done')
    } catch (err) {
      clearInterval(timerRef.current)
      setError(
        err.message === 'Failed to fetch'
          ? "Can't reach the pipeline server. Is api.py running?"
          : err.message
      )
      setStatus('error')
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="wordmark">Inquira</p>
        <p className="eyebrow">agentic research pipeline</p>
        <h1>Ask something. Watch it get researched.</h1>
        <p className="subhead">
          One topic goes in — a search agent, a reader, a writer and a critic
          take it from there.
        </p>
      </header>

      <form className="topic-form" onSubmit={runPipeline}>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. the state of solid-state batteries in 2026"
          disabled={status === 'running'}
          aria-label="Research topic"
        />
        <button type="submit" disabled={status === 'running' || !topic.trim()}>
          {status === 'running' ? 'Running…' : 'Run'}
        </button>
      </form>

      {status !== 'idle' && (
        <div className="rail" role="list">
          {STAGES.map((stage, i) => {
            const state =
              status === 'error' && i === stageIndex
                ? 'error'
                : i < stageIndex || status === 'done'
                ? 'done'
                : i === stageIndex
                ? 'active'
                : 'pending'
            return (
              <div className="rail-stage" key={stage.key} role="listitem">
                <div className={`rail-node rail-node--${state}`}>
                  <span className="rail-index">{i + 1}</span>
                </div>
                <div className="rail-text">
                  <span className="rail-label">{stage.label}</span>
                  <span className="rail-note">{stage.note}</span>
                </div>
                {i < STAGES.length - 1 && (
                  <div className={`rail-line ${i < stageIndex || status === 'done' ? 'rail-line--done' : ''}`} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {status === 'error' && (
        <div className="error-box">
          <strong>Something went wrong.</strong> {error}
        </div>
      )}

      {status === 'done' && result && (
        <section className="results">
          <div className="desk">
            <article className="report">
              <p className="report-eyebrow">report — {topic}</p>
              <div className="report-body">
                {(result.report || '').split('\n').map((para, idx) =>
                  para.trim() ? <p key={idx}>{para}</p> : null
                )}
              </div>
            </article>

            {result.feedback && (
              <aside className="note">
                <p className="note-eyebrow">critic's note</p>
                <div className="note-body">
                  {(result.feedback || '').split('\n').map((line, idx) =>
                    line.trim() ? <p key={idx}>{line}</p> : null
                  )}
                </div>
              </aside>
            )}
          </div>

          {(result.search_results || result.scraped_content) && (
            <div className="sources">
              <button
                type="button"
                className="sources-toggle"
                onClick={() => setShowSources((s) => !s)}
              >
                {showSources ? 'Hide research trail' : 'Show research trail'}
              </button>
              {showSources && (
                <div className="sources-body">
                  {result.search_results && (
                    <div>
                      <h3>Search results</h3>
                      <pre>{result.search_results}</pre>
                    </div>
                  )}
                  {result.scraped_content && (
                    <div>
                      <h3>Scraped content</h3>
                      <pre>{result.scraped_content}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
