import { useLocalStorage } from '../hooks/useLocalStorage'
import Accountability from '../components/Accountability'

export default function AccountabilityPage() {
  const [checklist, setChecklist] = useLocalStorage('hca-checklist-' + new Date().toDateString(), {})

  return <Accountability checklist={checklist} setChecklist={setChecklist} />
}
