import { useState, useEffect } from 'react'
import { getAccounts, createAccount, updateAccount, deleteAccount, getSettings, updateSettings, getScrapeRuns, triggerScrape, runScoring } from '../lib/api'
import { Plus, Trash2, Edit3, Save, X, RefreshCw, CheckCircle, XCircle, Loader2, Settings, TrendingUp } from 'lucide-react'

const TABS = ['Accounts', 'Scrape Config', 'Scoring Weights', 'API Keys', 'Scrape Health']
const TIERS = ['core', 'primary', 'ecosystem', 'discovered']
const PLATFORMS = ['instagram', 'tiktok', 'youtube']

export default function SettingsPage() {
  const [tab, setTab] = useState('Accounts')

  return (
    <section className="fade-up d2 py-12 px-6">
      <div className="max-w-[1080px] mx-auto">
        <h1 className="text-[20px] font-semibold text-primary mb-6 flex items-center gap-2">
          <Settings size={20} /> Settings
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-[13px] border-b-2 transition-colors ${
                tab === t ? 'border-primary text-primary font-medium' : 'border-transparent text-secondary hover:text-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Accounts' && <AccountsTab />}
        {tab === 'Scrape Config' && <ScrapeConfigTab />}
        {tab === 'Scoring Weights' && <ScoringWeightsTab />}
        {tab === 'API Keys' && <ApiKeysTab />}
        {tab === 'Scrape Health' && <ScrapeHealthTab />}
      </div>
    </section>
  )
}

function AccountsTab() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ handle: '', platform: 'instagram', tier: 'ecosystem', display_name: '', style_notes: '', why_tracking: '' })

  useEffect(() => { loadAccounts() }, [])

  async function loadAccounts() {
    try {
      const data = await getAccounts()
      setAccounts(data)
    } catch { /* API not available */ }
    setLoading(false)
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateAccount(editing, form)
        setEditing(null)
      } else {
        await createAccount(form)
        setAdding(false)
      }
      setForm({ handle: '', platform: 'instagram', tier: 'ecosystem', display_name: '', style_notes: '', why_tracking: '' })
      loadAccounts()
    } catch (e) {
      alert(e.message)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this account?')) return
    await deleteAccount(id)
    loadAccounts()
  }

  function startEdit(account) {
    setEditing(account.id)
    setAdding(false)
    setForm({
      handle: account.handle,
      platform: account.platform,
      tier: account.tier,
      display_name: account.display_name || '',
      style_notes: account.style_notes || '',
      why_tracking: account.why_tracking || '',
    })
  }

  if (loading) return <p className="text-[13px] text-secondary">Loading...</p>

  const grouped = {}
  for (const a of accounts) {
    if (!grouped[a.tier]) grouped[a.tier] = []
    grouped[a.tier].push(a)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] text-secondary">{accounts.length} accounts tracked</p>
        <button onClick={() => { setAdding(true); setEditing(null); setForm({ handle: '', platform: 'instagram', tier: 'ecosystem', display_name: '', style_notes: '', why_tracking: '' }) }}
          className="flex items-center gap-1 text-[13px] text-primary hover:underline">
          <Plus size={14} /> Add Account
        </button>
      </div>

      {/* Add/Edit Form */}
      {(adding || editing) && (
        <div className="card p-4 mb-6">
          <h3 className="text-[14px] font-medium text-primary mb-3">{editing ? 'Edit Account' : 'Add Account'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <input placeholder="Handle (no @)" value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })}
              className="text-[13px] border border-border rounded-lg px-3 py-2" disabled={!!editing} />
            <select value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
              className="text-[13px] border border-border rounded-lg px-3 py-2">
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={form.tier} onChange={e => setForm({ ...form, tier: e.target.value })}
              className="text-[13px] border border-border rounded-lg px-3 py-2">
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <input placeholder="Display Name" value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })}
              className="text-[13px] border border-border rounded-lg px-3 py-2" />
            <input placeholder="Style Notes" value={form.style_notes} onChange={e => setForm({ ...form, style_notes: e.target.value })}
              className="text-[13px] border border-border rounded-lg px-3 py-2 col-span-2" />
            <input placeholder="Why Tracking" value={form.why_tracking} onChange={e => setForm({ ...form, why_tracking: e.target.value })}
              className="text-[13px] border border-border rounded-lg px-3 py-2 col-span-2" />
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={handleSave} className="flex items-center gap-1 text-[13px] bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90">
              <Save size={14} /> Save
            </button>
            <button onClick={() => { setAdding(false); setEditing(null) }} className="flex items-center gap-1 text-[13px] text-secondary px-4 py-2">
              <X size={14} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grouped by tier */}
      {TIERS.map(tier => grouped[tier]?.length > 0 && (
        <div key={tier} className="mb-6">
          <h3 className="text-[13px] font-medium text-secondary uppercase tracking-wider mb-2">{tier} ({grouped[tier].length})</h3>
          <div className="card divide-y divide-border">
            {grouped[tier].map(account => (
              <div key={account.id} className="px-4 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-primary">@{account.handle}</span>
                  <span className="text-[11px] text-secondary ml-2">{account.platform}</span>
                  {account.style_notes && <p className="text-[11px] text-secondary truncate mt-0.5">{account.style_notes}</p>}
                </div>
                <button onClick={() => startEdit(account)} className="text-secondary hover:text-primary"><Edit3 size={14} /></button>
                <button onClick={() => handleDelete(account.id)} className="text-secondary hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ScrapeConfigTab() {
  const [settings, setSettings] = useState({})
  const [hashtags, setHashtags] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s)
      setHashtags(Array.isArray(s.hashtags) ? s.hashtags.join(', ') : '')
    }).catch(() => {})
  }, [])

  async function save() {
    setSaving(true)
    const hashtagArr = hashtags.split(',').map(h => h.trim()).filter(Boolean)
    await updateSettings({
      scrape_interval_core: String(settings.scrape_interval_core || 7200),
      scrape_interval_primary: String(settings.scrape_interval_primary || 14400),
      scrape_interval_ecosystem: String(settings.scrape_interval_ecosystem || 21600),
      scrape_interval_discovered: String(settings.scrape_interval_discovered || 43200),
      hashtags: JSON.stringify(hashtagArr),
    })
    setSaving(false)
  }

  return (
    <div className="max-w-lg space-y-6">
      <h3 className="text-[14px] font-medium text-primary">Scrape Intervals</h3>
      {[
        { key: 'scrape_interval_core', label: 'Core', default: 7200 },
        { key: 'scrape_interval_primary', label: 'Primary', default: 14400 },
        { key: 'scrape_interval_ecosystem', label: 'Ecosystem', default: 21600 },
        { key: 'scrape_interval_discovered', label: 'Discovered', default: 43200 },
      ].map(({ key, label, default: def }) => (
        <div key={key} className="flex items-center gap-4">
          <label className="text-[13px] text-primary w-28">{label}</label>
          <input
            type="number"
            value={settings[key] || def}
            onChange={e => setSettings({ ...settings, [key]: Number(e.target.value) })}
            className="text-[13px] border border-border rounded-lg px-3 py-2 w-28"
          />
          <span className="text-[11px] text-secondary">seconds ({Math.round((settings[key] || def) / 3600)}h)</span>
        </div>
      ))}

      <div>
        <h3 className="text-[14px] font-medium text-primary mb-2">Tracked Hashtags</h3>
        <textarea
          value={hashtags}
          onChange={e => setHashtags(e.target.value)}
          placeholder="watches, luxurywatches, rolex..."
          className="w-full text-[13px] border border-border rounded-lg px-3 py-2 h-24 resize-none"
        />
        <p className="text-[11px] text-secondary mt-1">Comma-separated hashtags (no # symbol)</p>
      </div>

      <button onClick={save} disabled={saving}
        className="flex items-center gap-1 text-[13px] bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50">
        <Save size={14} /> {saving ? 'Saving...' : 'Save Config'}
      </button>
    </div>
  )
}

function ScoringWeightsTab() {
  const [weights, setWeights] = useState({ er: 0.30, volume: 0.20, velocity: 0.25, crossplatform: 0.10, comment_ratio: 0.15 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings().then(s => {
      setWeights({
        er: Number(s.scoring_weight_er) || 0.30,
        volume: Number(s.scoring_weight_volume) || 0.20,
        velocity: Number(s.scoring_weight_velocity) || 0.25,
        crossplatform: Number(s.scoring_weight_crossplatform) || 0.10,
        comment_ratio: Number(s.scoring_weight_comment_ratio) || 0.15,
      })
    }).catch(() => {})
  }, [])

  const total = Object.values(weights).reduce((a, b) => a + b, 0)

  async function save() {
    setSaving(true)
    await updateSettings({
      scoring_weight_er: String(weights.er),
      scoring_weight_volume: String(weights.volume),
      scoring_weight_velocity: String(weights.velocity),
      scoring_weight_crossplatform: String(weights.crossplatform),
      scoring_weight_comment_ratio: String(weights.comment_ratio),
    })
    setSaving(false)
  }

  return (
    <div className="max-w-lg space-y-4">
      <p className={`text-[12px] ${Math.abs(total - 1.0) < 0.01 ? 'text-green-600' : 'text-red-500'}`}>
        Total: {total.toFixed(2)} {Math.abs(total - 1.0) < 0.01 ? '(valid)' : '(should sum to 1.0)'}
      </p>

      {[
        { key: 'er', label: 'ER Percentile' },
        { key: 'volume', label: 'Absolute Volume' },
        { key: 'velocity', label: 'Velocity' },
        { key: 'crossplatform', label: 'Cross-Platform' },
        { key: 'comment_ratio', label: 'Comment Ratio' },
      ].map(({ key, label }) => (
        <div key={key} className="flex items-center gap-4">
          <label className="text-[13px] text-primary w-36">{label}</label>
          <input
            type="range"
            min="0" max="1" step="0.05"
            value={weights[key]}
            onChange={e => setWeights({ ...weights, [key]: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="text-[13px] text-primary w-12 text-right">{weights[key].toFixed(2)}</span>
        </div>
      ))}

      <button onClick={save} disabled={saving}
        className="flex items-center gap-1 text-[13px] bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 mt-4">
        <Save size={14} /> {saving ? 'Saving...' : 'Save Weights'}
      </button>
    </div>
  )
}

function ApiKeysTab() {
  const [apify, setApify] = useState('')
  const [anthropic, setAnthropic] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings().then(s => {
      setApify(s.apify_api_token ? '••••••••' + String(s.apify_api_token).slice(-4) : '')
      setAnthropic(s.anthropic_api_key ? '••••••••' + String(s.anthropic_api_key).slice(-4) : '')
    }).catch(() => {})
  }, [])

  async function save() {
    setSaving(true)
    const updates = {}
    if (apify && !apify.startsWith('••')) updates.apify_api_token = apify
    if (anthropic && !anthropic.startsWith('••')) updates.anthropic_api_key = anthropic
    if (Object.keys(updates).length > 0) await updateSettings(updates)
    setSaving(false)
    // Re-mask
    if (updates.apify_api_token) setApify('••••••••' + apify.slice(-4))
    if (updates.anthropic_api_key) setAnthropic('••••••••' + anthropic.slice(-4))
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <label className="text-[13px] text-primary block mb-1">Apify API Token</label>
        <input
          type="password"
          value={apify}
          onChange={e => setApify(e.target.value)}
          placeholder="Enter Apify token"
          className="w-full text-[13px] border border-border rounded-lg px-3 py-2"
        />
      </div>
      <div>
        <label className="text-[13px] text-primary block mb-1">Anthropic API Key</label>
        <input
          type="password"
          value={anthropic}
          onChange={e => setAnthropic(e.target.value)}
          placeholder="Enter Anthropic key"
          className="w-full text-[13px] border border-border rounded-lg px-3 py-2"
        />
      </div>
      <button onClick={save} disabled={saving}
        className="flex items-center gap-1 text-[13px] bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50">
        <Save size={14} /> {saving ? 'Saving...' : 'Save Keys'}
      </button>
    </div>
  )
}

function ScrapeHealthTab() {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [scraping, setScraping] = useState(false)
  const [scoring, setScoring] = useState(false)

  useEffect(() => { loadRuns() }, [])

  async function loadRuns() {
    try { setRuns(await getScrapeRuns(20)) } catch {}
    setLoading(false)
  }

  async function handleTrigger(tier) {
    setScraping(true)
    try {
      await triggerScrape(tier ? { tier } : {})
      await loadRuns()
    } catch (e) { alert(e.message) }
    setScraping(false)
  }

  async function handleScore() {
    setScoring(true)
    try {
      const result = await runScoring()
      alert(`Scored ${result.scored} posts, found ${result.winners} winners`)
    } catch (e) { alert(e.message) }
    setScoring(false)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => handleTrigger(null)} disabled={scraping}
          className="flex items-center gap-1 text-[13px] bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50">
          {scraping ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Scrape All
        </button>
        {TIERS.map(tier => (
          <button key={tier} onClick={() => handleTrigger(tier)} disabled={scraping}
            className="text-[13px] border border-border px-3 py-2 rounded-lg hover:bg-bg-alt disabled:opacity-50 capitalize">
            {tier}
          </button>
        ))}
        <button onClick={handleScore} disabled={scoring}
          className="flex items-center gap-1 text-[13px] border border-amber-200 text-amber-700 px-4 py-2 rounded-lg hover:bg-amber-50 disabled:opacity-50 ml-auto">
          {scoring ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
          Run Scoring
        </button>
      </div>

      {loading ? <p className="text-[13px] text-secondary">Loading runs...</p> : (
        <div className="card divide-y divide-border">
          <div className="px-4 py-2 grid grid-cols-7 gap-2 text-[11px] text-secondary font-medium">
            <span>Tier</span><span>Type</span><span>Accounts</span><span>Posts Found</span><span>New</span><span>Status</span><span>Time</span>
          </div>
          {runs.length === 0 && <div className="px-4 py-6 text-center text-[13px] text-secondary">No scrape runs yet</div>}
          {runs.map(run => (
            <div key={run.id} className="px-4 py-2 grid grid-cols-7 gap-2 text-[12px] items-center">
              <span className="text-primary capitalize">{run.tier}</span>
              <span className="text-secondary">{run.type}</span>
              <span className="text-primary">{run.accounts_scraped}</span>
              <span className="text-primary">{run.posts_found}</span>
              <span className="text-primary">{run.new_posts}</span>
              <span className="flex items-center gap-1">
                {run.status === 'completed' && <><CheckCircle size={12} className="text-green-500" /> <span className="text-green-600">Done</span></>}
                {run.status === 'failed' && <><XCircle size={12} className="text-red-500" /> <span className="text-red-600">Failed</span></>}
                {run.status === 'running' && <><Loader2 size={12} className="text-blue-500 animate-spin" /> <span className="text-blue-600">Running</span></>}
                {run.status === 'pending' && <span className="text-secondary">Pending</span>}
              </span>
              <span className="text-secondary text-[11px]">{run.completed_at ? new Date(run.completed_at).toLocaleString() : '-'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
