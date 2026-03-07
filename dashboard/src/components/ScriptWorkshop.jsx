import { useState, useEffect, useRef } from 'react'
import { Instagram, Music2, BookOpen, Twitter, X, Copy, ArrowRight, Plus, Loader2 } from 'lucide-react'
import { remixPost } from '../lib/remix'

const PLATFORM_ICONS = { ig: Instagram, tiktok: Music2, substack: BookOpen, x: Twitter }
const PLATFORM_LABELS = { ig: 'IG Reel', tiktok: 'TikTok', substack: 'Substack', x: 'X' }

function wordCount(text) {
  return text?.trim().split(/\s+/).filter(Boolean).length || 0
}

function duration(words) {
  const secs = Math.round(words / 2.5)
  return secs < 60 ? `~${secs}s` : `~${Math.floor(secs / 60)}m ${secs % 60}s`
}

function ScriptCard({ script, onClick }) {
  const Icon = PLATFORM_ICONS[script.platform] || Instagram
  const words = wordCount(script.body)

  return (
    <div onClick={onClick} className="card p-4 cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} className="text-secondary" />
        <span className="text-[11px] text-secondary">{PLATFORM_LABELS[script.platform]}</span>
        <span className={`text-[10px] px-2 py-0.5 rounded-full ml-auto ${script.status === 'Remixed' ? 'bg-black/[0.06] text-secondary' : 'bg-black/[0.03] text-black/40'}`}>
          {script.status}
        </span>
      </div>
      <p className="text-[14px] font-medium leading-snug text-primary">{script.title}</p>
      {script.source && <p className="text-[11px] text-secondary mt-1">via {script.source}</p>}
      <p className="text-[11px] text-black/30 mt-2">{words} words · {duration(words)} · {script.createdAt}</p>
    </div>
  )
}

function ScriptEditor({ script, onClose, onUpdate }) {
  if (!script) return null
  const words = wordCount(script.body)

  function copy() {
    navigator.clipboard?.writeText(script.body)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-8">
          <button onClick={onClose} className="absolute top-6 right-6 text-secondary hover:text-primary bg-transparent border-0 cursor-pointer"><X size={18} /></button>

          <div className="flex items-center gap-2 mb-1">
            {(() => { const Icon = PLATFORM_ICONS[script.platform] || Instagram; return <Icon size={14} className="text-secondary" /> })()}
            <span className="text-[11px] text-secondary">{PLATFORM_LABELS[script.platform]}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${script.status === 'Remixed' ? 'bg-black/[0.06] text-secondary' : 'bg-black/[0.03] text-black/40'}`}>{script.status}</span>
          </div>

          <input
            value={script.title}
            onChange={e => onUpdate(script.id, { title: e.target.value })}
            className="text-[22px] font-semibold tracking-tight w-full bg-transparent border-0 text-primary mt-2 outline-none"
          />

          {script.source && <p className="text-[12px] text-secondary mt-1">Remixed from {script.source}</p>}

          <textarea
            value={script.body}
            onChange={e => onUpdate(script.id, { body: e.target.value })}
            className="w-full bg-white border border-border rounded-xl px-5 py-4 mt-6 text-[13px] text-primary font-mono leading-relaxed min-h-[300px] resize-y placeholder:text-black/20"
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-[12px] text-secondary">{words} words · {duration(words)}</span>
            <button onClick={copy} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black/[0.05] hover:bg-black/[0.08] text-[13px] font-medium text-primary border-0 cursor-pointer transition-all duration-300">
              <Copy size={13} /> Copy Script
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ScriptWorkshop({ scripts, setScripts, remixSource, pipeline, setPipeline }) {
  const [editing, setEditing] = useState(null)
  const [leftPanel, setLeftPanel] = useState('')
  const [leftMeta, setLeftMeta] = useState('')
  const [rightPanel, setRightPanel] = useState('')
  const [rightNotes, setRightNotes] = useState('')
  const [remixing, setRemixing] = useState(false)
  const [remixError, setRemixError] = useState(null)
  const remixCounter = useRef(0)

  // When a new remixSource arrives, auto-generate the remix
  useEffect(() => {
    if (!remixSource) return
    remixCounter.current += 1
    const thisRun = remixCounter.current

    setLeftPanel(remixSource.caption || remixSource.desc || '')
    setLeftMeta(`@${remixSource.ownerUsername || remixSource.handle}`)
    setRightPanel('')
    setRightNotes('')
    setRemixError(null)
    setRemixing(true)

    remixPost(remixSource)
      .then(script => {
        if (remixCounter.current !== thisRun) return
        setRightPanel(script)
        setRemixing(false)
      })
      .catch(err => {
        if (remixCounter.current !== thisRun) return
        setRemixError(err.message)
        setRemixing(false)
      })
  }, [remixSource])

  function updateScript(id, updates) {
    setScripts(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s))
  }

  function saveRemix() {
    if (!rightPanel.trim()) return
    const newScript = {
      id: 's' + Date.now(),
      title: 'Remixed Script',
      platform: 'ig',
      status: 'Remixed',
      source: leftMeta || null,
      body: rightPanel,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
    setScripts(prev => [newScript, ...prev])
    setRightPanel('')
    setRightNotes('')
    setLeftPanel('')
  }

  function sendToPipeline() {
    if (!rightPanel.trim()) return
    const newCard = {
      id: 'p' + Date.now(),
      title: 'Remixed Script',
      platform: 'ig',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      source: leftMeta || null,
      notes: rightNotes,
      script: rightPanel,
    }
    setPipeline(prev => ({ ...prev, writing: [...prev.writing, newCard] }))
    setRightPanel('')
    setRightNotes('')
  }

  return (
    <section id="scripts" className="fade-up d4 bg-bg-alt py-16 px-6">
      <div className="max-w-[1080px] mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-2">Script Workshop</p>
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] mb-8 text-primary">Write. Remix. Ship.</h2>

        {/* Script Library */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {scripts.map(s => (
            <ScriptCard key={s.id} script={s} onClick={() => setEditing(s)} />
          ))}
        </div>

        {/* Script Remixer */}
        <div className="border-t border-border pt-10">
          <h3 className="text-[15px] font-semibold text-primary mb-6">Script Remixer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary block mb-2">Competitor Script</label>
              <textarea
                value={leftPanel}
                onChange={e => setLeftPanel(e.target.value)}
                placeholder="Paste the original competitor script here..."
                className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[13px] text-primary font-mono min-h-[200px] resize-y placeholder:text-black/20"
              />
              <input
                value={leftMeta}
                onChange={e => setLeftMeta(e.target.value)}
                placeholder="@handle — source"
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-[13px] text-primary mt-2 placeholder:text-black/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary block mb-2">Your Version</label>
              <div className="relative">
                <textarea
                  value={rightPanel}
                  onChange={e => setRightPanel(e.target.value)}
                  placeholder="Write your remixed version here..."
                  className="w-full bg-white border border-border rounded-xl px-4 py-3 text-[13px] text-primary font-mono min-h-[200px] resize-y placeholder:text-black/20"
                  disabled={remixing}
                />
                {remixing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                    <div className="flex items-center gap-2 text-[13px] text-secondary">
                      <Loader2 size={16} className="animate-spin" />
                      Remixing with viral hooks...
                    </div>
                  </div>
                )}
              </div>
              {remixError && (
                <p className="text-[12px] text-[#FF3B30] mt-2">{remixError}</p>
              )}
              <textarea
                value={rightNotes}
                onChange={e => setRightNotes(e.target.value)}
                placeholder="How I'm making it mine — angle, hook, CTA changes..."
                className="w-full bg-white border border-border rounded-lg px-3 py-2 text-[13px] text-primary mt-2 min-h-[50px] resize-y placeholder:text-black/20"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={saveRemix} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black/[0.05] hover:bg-black/[0.08] text-[13px] font-medium text-primary border-0 cursor-pointer transition-all duration-300">
              <Plus size={14} /> Save to Library
            </button>
            <button onClick={sendToPipeline} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-black/[0.05] hover:bg-black/[0.08] text-[13px] font-medium text-primary border-0 cursor-pointer transition-all duration-300">
              Send to Pipeline <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <ScriptEditor script={editing} onClose={() => setEditing(null)} onUpdate={updateScript} />
    </section>
  )
}
