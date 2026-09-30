import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MyOpportunitiesPage } from './pages/MyOpportunitiesPage';
import { AiAssistantPage } from './pages/AiAssistantPage';
import { SettingsPage } from './pages/SettingsPage';
import RoadmapPage from './pages/RoadmapPage';
import { AdminDashboard } from './pages/AdminDashboard';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading session...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function AppContent() {
  const location = useLocation();

  // Landing & Auth pages use Top Navbar; all other workspace routes use Left Sidebar
  const isLandingOrAuth = ['/', '/login', '/register'].includes(location.pathname);

  if (!isLandingOrAuth) {
    return (
      <div className="app-layout-sidebar">
        <Sidebar />
        <div className="sidebar-main-content">
          <main className="main-content">
            <Routes>
              <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/tracker" element={<ProtectedRoute><MyOpportunitiesPage /></ProtectedRoute>} />
              <Route path="/ai-copilot" element={<AiAssistantPage />} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
