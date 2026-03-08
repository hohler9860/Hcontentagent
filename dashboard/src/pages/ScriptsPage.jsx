import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getScripts, createScript, updateScript, deleteScript, remixPost as apiRemixPost } from '../lib/api'
import { Instagram, Music2, BookOpen, Twitter, X, Copy, Sparkles, Plus, Loader2, Trash2, Check, ArrowRight } from 'lucide-react'

const PLATFORM_ICONS = { ig: Instagram, instagram: Instagram, tiktok: Music2, substack: BookOpen, x: Twitter }
const PLATFORM_LABELS = { ig: 'IG Reel', instagram: 'IG Reel', tiktok: 'TikTok', substack: 'Substack', x: 'X' }

function wordCount(text) {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0
}

function duration(words) {
  const secs = Math.round(words / 2.5)
  return secs < 60 ? `~${secs}s` : `~${Math.floor(secs / 60)}m ${secs % 60}s`
}

export default function ScriptsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [scripts, setScripts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  // Remix state
  const [remixCaption, setRemixCaption] = useState('')
  const [remixHandle, setRemixHandle] = useState('')
  const [remixResult, setRemixResult] = useState('')
  const [remixNotes, setRemixNotes] = useState('')
  const [remixing, setRemixing] = useState(false)
  const [remixError, setRemixError] = useState(null)
  const [copied, setCopied] = useState(false)
  const remixRef = useRef(null)

  // Load scripts from API
  useEffect(() => {
    loadScripts()
  }, [])

  async function loadScripts() {
    try {
      const data = await getScripts({ limit: 100 })
      setScripts(Array.isArray(data) ? data : data.scripts || [])
    } catch {
      setScripts([])
    }
    setLoading(false)
  }

  // Handle incoming remix from URL params (from Competitors page)
  useEffect(() => {
    const remixId = searchParams.get('remix')
    const handle = searchParams.get('handle')
    const caption = searchParams.get('caption')
    const likes = searchParams.get('likes')
    const views = searchParams.get('views')

    if (remixId && caption) {
      setRemixCaption(caption)
      setRemixHandle(handle ? `@${handle}` : '')
      setRemixResult('')
      setRemixError(null)
      setRemixing(true)

      // Scroll to remix section
      setTimeout(() => remixRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)

      // Auto-trigger remix
      apiRemixPost({
        post_id: remixId,
        caption,
        handle: handle || 'unknown',
        likes: Number(likes) || 0,
        views: Number(views) || 0,
        platform: 'instagram',
      })
        .then(data => {
          setRemixResult(data.script)
          setRemixing(false)
          loadScripts() // Refresh to show saved script
        })
        .catch(err => {
          setRemixError(err.message)
          setRemixing(false)
        })

      // Clear URL params
      setSearchParams({})
    }
  }, [searchParams])

  function handleManualRemix() {
    if (!remixCaption.trim()) return
    setRemixing(true)
    setRemixError(null)
    setRemixResult('')

    apiRemixPost({
      caption: remixCaption,
      handle: remixHandle.replace('@', '') || 'unknown',
      likes: 0,
      views: 0,
      platform: 'instagram',
    })
      .then(data => {
        setRemixResult(data.script)
        setRemixing(false)
        loadScripts()
      })
      .catch(err => {
        setRemixError(err.message)
        setRemixing(false)
      })
  }

  async function handleDeleteScript(id) {
    if (!confirm('Delete this script?')) return
    await deleteScript(id).catch(() => {})
    loadScripts()
  }

  function copyScript(text) {
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="fade-up d2 py-12 px-6">
      <div className="max-w-[1080px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-secondary mb-1">SCRIPT WORKSHOP</p>
            <h1 className="text-[22px] font-bold tracking-[-0.02em] text-primary">WRITE. REMIX. SHIP.</h1>
          </div>
          <span className="text-[12px] text-secondary">{scripts.length} scripts</span>
        </div>

        {/* Script Remixer */}
        <div ref={remixRef} className="card p-6 mb-8 border-primary/10">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary mb-1 flex items-center gap-2">
            <Sparkles size={14} /> SCRIPT REMIXER
          </h3>
          <p className="text-[12px] text-secondary mb-5">Paste a competitor's caption and remix it with viral hooks + humanization for Dialed by H</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Input */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary block mb-2">Competitor Post</label>
              <textarea
                value={remixCaption}
                onChange={e => setRemixCaption(e.target.value)}
                placeholder="Paste competitor caption or describe the concept..."
                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[13px] text-primary font-mono min-h-[180px] resize-y placeholder:text-black/20"
              />
              <input
                value={remixHandle}
                onChange={e => setRemixHandle(e.target.value)}
                placeholder="@handle (optional)"
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-[13px] text-primary mt-2 placeholder:text-black/20"
              />
              <button
                onClick={handleManualRemix}
                disabled={remixing || !remixCaption.trim()}
                className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-[13px] font-medium hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                {remixing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {remixing ? 'Remixing...' : 'Remix It'}
              </button>
            </div>

            {/* Right: Output */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary block mb-2">Dialed by H Script</label>
              <div className="relative">
                <textarea
                  value={remixResult}
                  onChange={e => setRemixResult(e.target.value)}
                  placeholder={remixing ? 'Generating with viral hooks...' : 'Your remixed script will appear here...'}
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[13px] text-primary font-mono min-h-[180px] resize-y placeholder:text-black/20"
                  disabled={remixing}
                />
                {remixing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                    <div className="flex items-center gap-2 text-[13px] text-secondary">
                      <Loader2 size={16} className="animate-spin" />
                      Remixing with viral hooks + humanization...
                    </div>
                  </div>
                )}
              </div>
              {remixError && (
                <p className="text-[12px] text-red-500 mt-2">{remixError}</p>
              )}
              {remixResult && (
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-[12px] text-secondary">{wordCount(remixResult)} words · {duration(wordCount(remixResult))}</span>
                  <button
                    onClick={() => copyScript(remixResult)}
                    className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg bg-black/[0.05] hover:bg-black/[0.08] text-primary transition-all ml-auto"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Script Library */}
        <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary mb-4">SCRIPT LIBRARY</h3>
        {loading ? (
          <p className="text-[13px] text-secondary">Loading scripts...</p>
        ) : scripts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-[13px] text-secondary mb-2">No scripts yet.</p>
            <p className="text-[12px] text-secondary/70">Go to Competitors, find a post you like, and hit "Remix" to generate your first script.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {scripts.map(s => {
              const Icon = PLATFORM_ICONS[s.platform] || Instagram
              const words = wordCount(s.body)
              return (
                <div key={s.id} className="card p-4 hover:border-primary/10 transition-all">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon size={13} className="text-secondary shrink-0" />
                        <span className="text-[11px] text-secondary">{PLATFORM_LABELS[s.platform] || s.platform}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          s.status === 'draft' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {s.status}
                        </span>
                        {s.source && <span className="text-[11px] text-secondary">via {s.source}</span>}
                      </div>
                      <h4
                        className="text-[14px] font-medium text-primary cursor-pointer hover:underline"
                        onClick={() => setEditing(editing === s.id ? null : s.id)}
                      >
                        {s.title}
                      </h4>

                      {/* Expandable body */}
                      {editing === s.id && (
                        <div className="mt-3">
                          <pre className="text-[12px] text-primary/80 font-mono whitespace-pre-wrap bg-bg-alt/50 rounded-lg p-4 max-h-[300px] overflow-y-auto leading-relaxed">
                            {s.body}
                          </pre>
                          <div className="flex items-center gap-3 mt-3">
                            <span className="text-[11px] text-secondary">{words} words · {duration(words)}</span>
                            <button
                              onClick={() => copyScript(s.body)}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-black/[0.05] hover:bg-black/[0.08] text-primary transition-all"
                            >
                              <Copy size={11} /> Copy
                            </button>
                            <button
                              onClick={() => handleDeleteScript(s.id)}
                              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg text-red-500 hover:bg-red-50 transition-all ml-auto"
                            >
                              <Trash2 size={11} /> Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="text-right shrink-0 text-[11px] text-secondary">
                      <div>{words} words</div>
                      <div>{duration(words)}</div>
                      {s.created_at && <div className="mt-1">{new Date(s.created_at).toLocaleDateString()}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
