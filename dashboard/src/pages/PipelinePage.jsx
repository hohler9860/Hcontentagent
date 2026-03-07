import { useLocalStorage } from '../hooks/useLocalStorage'
import { INITIAL_PIPELINE } from '../data/mock-data'
import Pipeline from '../components/Pipeline'

export default function PipelinePage() {
  const [pipeline, setPipeline] = useLocalStorage('hca-pipeline', INITIAL_PIPELINE)

  return <Pipeline pipeline={pipeline} setPipeline={setPipeline} />
}
