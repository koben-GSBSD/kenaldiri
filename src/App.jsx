import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/s/:token" element={<SurveyPublicPage />} />
        <Route path="/s/:token/done" element={<SurveyDonePage />} />
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
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
