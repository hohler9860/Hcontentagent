import { useState } from 'react'
import { Instagram, Music2, BookOpen, Twitter, ArrowRight, X } from 'lucide-react'
import { PIPELINE_COLUMNS } from '../data/mock-data'

const PLATFORM_ICONS = { ig: Instagram, tiktok: Music2, substack: BookOpen, x: Twitter }
const PLATFORM_LABELS = { ig: 'IG Reel', tiktok: 'TikTok', substack: 'Substack', x: 'X' }

function PlatformBadge({ platform, size = 12 }) {
  const Icon = PLATFORM_ICONS[platform] || Instagram
  return (
    <div className="flex items-center gap-1.5">
      <Icon size={size} className="text-secondary" />
      <span className="text-[11px] text-secondary">{PLATFORM_LABELS[platform]}</span>
    </div>
  )
}

function SlideOver({ item, column, onClose, onMove, onUpdate }) {
  if (!item) return null
  const colIdx = PIPELINE_COLUMNS.findIndex(c => c.key === column)

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-white border-l border-border h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-8">
          <button onClick={onClose} className="absolute top-6 right-6 text-secondary hover:text-primary transition-colors cursor-pointer bg-transparent border-0">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <PlatformBadge platform={item.platform} />
            {item.source && <span className="text-[11px] text-secondary bg-black/[0.04] px-2 py-0.5 rounded-full">via {item.source}</span>}
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight mt-3 leading-snug pr-8 text-primary">{item.title}</h2>
          <p className="text-[13px] text-secondary mt-1">{item.date}</p>

          <div className="mt-6">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary block mb-2">Status</label>
            <select
              value={column}
              onChange={e => { onMove(item.id, column, e.target.value); onClose() }}
              className="w-full bg-white border border-border rounded-lg px-3 py-2 text-[14px] text-primary appearance-none cursor-pointer"
            >
              {PIPELINE_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>

          <div className="mt-5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary block mb-2">Script / Draft</label>
            <textarea
              value={item.script || ''}
              onChange={e => onUpdate(item.id, column, { script: e.target.value })}
              placeholder="Write your script here..."
              className="w-full bg-white border border-border rounded-lg px-4 py-3 text-[13px] text-primary font-mono min-h-[200px] resize-y placeholder:text-black/20"
            />
          </div>

          <div className="mt-5">
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary block mb-2">Notes</label>
            <textarea
              value={item.notes || ''}
              onChange={e => onUpdate(item.id, column, { notes: e.target.value })}
              placeholder="Production notes, ideas, reminders..."
              className="w-full bg-white border border-border rounded-lg px-4 py-3 text-[14px] text-primary min-h-[80px] resize-y placeholder:text-black/20"
            />
          </div>

          {colIdx < PIPELINE_COLUMNS.length - 1 && (
            <button
              onClick={() => { onMove(item.id, column, PIPELINE_COLUMNS[colIdx + 1].key); onClose() }}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-black/[0.05] hover:bg-black/[0.08] text-[14px] font-medium transition-all duration-300 cursor-pointer border-0 text-primary"
            >
              Move to {PIPELINE_COLUMNS[colIdx + 1].label} <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Pipeline({ pipeline, setPipeline }) {
  const [selected, setSelected] = useState(null)
  const [selectedCol, setSelectedCol] = useState(null)

  function moveCard(id, fromCol, toCol) {
    if (fromCol === toCol) return
    setPipeline(prev => {
      const card = prev[fromCol].find(c => c.id === id)
      if (!card) return prev
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(c => c.id !== id),
        [toCol]: [...prev[toCol], card],
      }
    })
  }

  function updateCard(id, col, updates) {
    setPipeline(prev => ({
      ...prev,
      [col]: prev[col].map(c => c.id === id ? { ...c, ...updates } : c),
    }))
  }

  return (
    <section id="pipeline" className="fade-up d2 bg-bg-alt py-16 px-6">
      <div className="max-w-[1080px] mx-auto">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-secondary mb-2">Content Pipeline</p>
        <h2 className="text-[24px] font-semibold tracking-[-0.02em] mb-8 text-primary">Where everything stands.</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {PIPELINE_COLUMNS.map(({ key, label }) => (
            <div key={key} className="min-w-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[12px] font-medium text-secondary">{label}</span>
                <span className="text-[11px] text-secondary bg-black/[0.04] px-2 py-0.5 rounded-full">{pipeline[key].length}</span>
              </div>
              <div className="flex flex-col gap-2 min-h-[100px]">
                {pipeline[key].map(item => (
                  <div
                    key={item.id}
                    onClick={() => { setSelected(item); setSelectedCol(key) }}
                    className="card p-3.5 cursor-pointer group"
                  >
                    <p className="text-[13px] font-medium leading-snug text-primary pr-4">{item.title}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <PlatformBadge platform={item.platform} />
                      <span className="text-[11px] text-black/25">{item.date}</span>
                    </div>
                    {item.source && (
                      <span className="inline-block mt-2 text-[10px] text-secondary bg-black/[0.03] px-2 py-0.5 rounded-full">
                        via {item.source}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <SlideOver
        item={selected}
        column={selectedCol}
        onClose={() => setSelected(null)}
        onMove={moveCard}
        onUpdate={updateCard}
      />
    </section>
  )
}
