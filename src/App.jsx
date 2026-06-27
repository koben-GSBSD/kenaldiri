import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// ── KenalDiri (existing) ──
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SurveyTypePage from './pages/SurveyTypePage'
import NewSurveyPage from './pages/NewSurveyPage'
import ResultDetailPage from './pages/ResultDetailPage'
import ProductsPage from './pages/ProductsPage'
import ProfilesPage from './pages/ProfilesPage'
import AdminPage from './pages/AdminPage'
import SurveyPublicPage from './pages/SurveyPublicPage'
import SurveyDonePage from './pages/SurveyDonePage'
import AuthGuard from './components/AuthGuard'

// ── PRUActive Agent (new) ──
import AgentLoginPage from './pages/agent/AgentLoginPage'
import AgentGuard from './components/agent/AgentGuard'
import AgentDashboardPage from './pages/agent/AgentDashboardPage'
import AgentProspekPage from './pages/agent/AgentProspekPage'
import AgentPipelinePage from './pages/agent/AgentPipelinePage'
import AgentReminderPage from './pages/agent/AgentReminderPage'
import AgentRekapPage from './pages/agent/AgentRekapPage'
import AgentProdukPage from './pages/agent/AgentProdukPage'
import AgentKenaldiriPage from './pages/agent/AgentKenaldiriPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public survey routes (KenalDiri) ── */}
        <Route path="/s/:token" element={<SurveyPublicPage />} />
        <Route path="/s/:token/done" element={<SurveyDonePage />} />

        {/* ── KenalDiri Agent Portal ── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<AuthGuard />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="survey/new" element={<SurveyTypePage />} />
          <Route path="survey/new/form" element={<NewSurveyPage />} />
          <Route path="survey/:id" element={<ResultDetailPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="profiles" element={<ProfilesPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>

        {/* ── PRUActive Agent Portal ── */}
        {/* Login page: oneforlife.id/agent/login */}
        <Route path="/agent/login" element={<AgentLoginPage />} />
        <Route path="/agent" element={<AgentGuard />}>
          <Route index element={<Navigate to="/agent/dashboard" replace />} />
          <Route path="dashboard"  element={<AgentDashboardPage />} />
          <Route path="prospek"    element={<AgentProspekPage />} />
          <Route path="pipeline"   element={<AgentPipelinePage />} />
          <Route path="reminder"   element={<AgentReminderPage />} />
          <Route path="rekap"      element={<AgentRekapPage />} />
          <Route path="produk"     element={<AgentProdukPage />} />
          <Route path="kenaldiri"  element={<AgentKenaldiriPage />} />
        </Route>

        {/* ── Root redirects ── */}
        <Route path="/" element={<Navigate to="/agent/login" replace />} />
        <Route path="*" element={<Navigate to="/agent/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
