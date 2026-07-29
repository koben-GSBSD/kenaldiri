import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AgentLoginPage from './pages/agent/AgentLoginPage'
import AgentGuard from './components/agent/AgentGuard'
import AgentDashboardPage from './pages/agent/AgentDashboardPage'
import AgentProspekPage from './pages/agent/AgentProspekPage'
import AgentPipelinePage from './pages/agent/AgentPipelinePage'
import AgentReminderPage from './pages/agent/AgentReminderPage'
import AgentRekapPage from './pages/agent/AgentRekapPage'
import AgentKenaldiriPage from './pages/agent/AgentKenaldiriPage'
import SurveyPublicPage from './pages/SurveyPublicPage'
import SurveyDonePage from './pages/SurveyDonePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public survey routes */}
        <Route path="/s/:token" element={<SurveyPublicPage />} />
        <Route path="/s/:token/done" element={<SurveyDonePage />} />

        {/* PRUActive — single portal */}
        <Route path="/agent/login" element={<AgentLoginPage />} />
        <Route path="/agent" element={<AgentGuard />}>
          <Route index element={<Navigate to="/agent/dashboard" replace />} />
          <Route path="dashboard"  element={<AgentDashboardPage />} />
          <Route path="prospek"    element={<AgentProspekPage />} />
          <Route path="pipeline"   element={<AgentPipelinePage />} />
          <Route path="reminder"   element={<AgentReminderPage />} />
          <Route path="rekap"      element={<AgentRekapPage />} />
          <Route path="kenaldiri"  element={<AgentKenaldiriPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/agent/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
