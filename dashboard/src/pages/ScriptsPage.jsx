import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { INITIAL_PIPELINE, INITIAL_SCRIPTS } from '../data/mock-data'
import ScriptWorkshop from '../components/ScriptWorkshop'

export default function ScriptsPage() {
  const [scripts, setScripts] = useLocalStorage('hca-scripts', INITIAL_SCRIPTS)
  const [pipeline, setPipeline] = useLocalStorage('hca-pipeline', INITIAL_PIPELINE)
  const [remixSource] = useState(null)

  return <ScriptWorkshop scripts={scripts} setScripts={setScripts} remixSource={remixSource} pipeline={pipeline} setPipeline={setPipeline} />
}
