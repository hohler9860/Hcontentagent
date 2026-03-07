import { Routes, Route } from 'react-router-dom'
import Layout from './pages/Layout'
import DashboardPage from './pages/DashboardPage'
import PipelinePage from './pages/PipelinePage'
import InsightsPage from './pages/InsightsPage'
import CompetitorsPage from './pages/CompetitorsPage'
import CompetitorDetailPage from './pages/CompetitorDetailPage'
import DiscoverPage from './pages/DiscoverPage'
import ScriptsPage from './pages/ScriptsPage'
import AccountabilityPage from './pages/AccountabilityPage'
import CalendarPage from './pages/CalendarPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/pipeline" element={<PipelinePage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/competitors" element={<CompetitorsPage />} />
        <Route path="/competitors/:handle" element={<CompetitorDetailPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/scripts" element={<ScriptsPage />} />
        <Route path="/accountability" element={<AccountabilityPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
