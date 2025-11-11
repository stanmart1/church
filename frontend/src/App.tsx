import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import { ErrorBoundary } from './components/ErrorBoundary'
import LandingPage from './pages/landing/LandingPage'
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'))
const MemberDashboard = lazy(() => import('./pages/member-dashboard/MemberDashboard'))
const MembershipPage = lazy(() => import('./pages/membership/MembershipPage'))
const SermonsPage = lazy(() => import('./pages/sermons/SermonsPage'))
const EventsPage = lazy(() => import('./pages/events/EventsPage'))
const LiveStreamPage = lazy(() => import('./pages/live/LiveStreamPage'))
const AnnouncementsPage = lazy(() => import('./pages/announcements/AnnouncementsPage'))
const FormsPage = lazy(() => import('./pages/forms/FormsPage'))
const PlaylistsPage = lazy(() => import('./pages/playlists/PlaylistsPage'))
const UserManagementPage = lazy(() => import('./pages/users/UserManagementPage'))
const ContentManagementPage = lazy(() => import('./pages/content/ContentManagementPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const PublicFormPage = lazy(() => import('./pages/forms/PublicFormPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AboutPage = lazy(() => import('./pages/public/AboutPage'))
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'))
const ContactPage = lazy(() => import('./pages/public/ContactPage'))

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-sm text-gray-600">Loading...</p>
    </div>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<Navigate to="/" replace />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/forms/:id" element={<PublicFormPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'pastor', 'minister', 'staff']}><Dashboard /></ProtectedRoute>} />
        <Route path="/member-dashboard" element={<ProtectedRoute><MemberDashboard /></ProtectedRoute>} />
        <Route path="/membership" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'pastor', 'minister', 'staff']}><MembershipPage /></ProtectedRoute>} />
        <Route path="/sermons" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'pastor', 'minister', 'staff']}><SermonsPage /></ProtectedRoute>} />
        <Route path="/events" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'pastor', 'minister', 'staff']}><EventsPage /></ProtectedRoute>} />
        <Route path="/live" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'pastor', 'minister', 'staff']}><LiveStreamPage /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'pastor', 'minister', 'staff']}><AnnouncementsPage /></ProtectedRoute>} />
        <Route path="/forms" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'pastor', 'minister', 'staff']}><FormsPage /></ProtectedRoute>} />
        <Route path="/playlists" element={<ProtectedRoute><PlaylistsPage /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><UserManagementPage /></ProtectedRoute>} />
        <Route path="/content" element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'pastor']}><ContentManagementPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><SettingsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
