import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { INITIAL_PIPELINE, INITIAL_SCRIPTS } from './data/mock-data'
import competitorData from './data/competitor-posts.json'
import Header from './components/Header'
import HeroStatus from './components/HeroStatus'
import Pipeline from './components/Pipeline'
import CompetitorHub from './components/CompetitorHub'
import ScriptWorkshop from './components/ScriptWorkshop'
import Accountability from './components/Accountability'
import Calendar from './components/Calendar'

export default function App() {
  const [pipeline, setPipeline] = useLocalStorage('hca-pipeline', INITIAL_PIPELINE)
  const [scripts, setScripts] = useLocalStorage('hca-scripts', INITIAL_SCRIPTS)
  const [checklist, setChecklist] = useLocalStorage('hca-checklist-' + new Date().toDateString(), {})
  const [competitorPosts] = useState(competitorData)
  const [remixSource, setRemixSource] = useState(null)

  function handleRemix(post) {
    setRemixSource(post)
    document.getElementById('scripts')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen">
      <Header />
      <HeroStatus pipeline={pipeline} competitorPostCount={competitorPosts.length} checklist={checklist} />
      <Pipeline pipeline={pipeline} setPipeline={setPipeline} />
      <CompetitorHub competitorPosts={competitorPosts} onRemix={handleRemix} />
      <ScriptWorkshop scripts={scripts} setScripts={setScripts} remixSource={remixSource} pipeline={pipeline} setPipeline={setPipeline} />
      <Accountability checklist={checklist} setChecklist={setChecklist} />
      <Calendar />
      <footer className="py-10 text-center">
        <p className="text-[11px] text-black/15">Dialed by H &middot; Content Agent</p>
      </footer>
    </div>
  )
}
