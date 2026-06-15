import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Clases from './pages/Clases';
import Usuarios from './pages/Usuarios';
import Premios from './pages/Premios';
import LandingPage from './pages/LandingPage';
import Integracion from './pages/Integracion';
import Buffet from './pages/Buffet';
import Cursos from './pages/Cursos';
import Noticias from './pages/Noticias';
import Gamificacion from './pages/Gamificacion';
import SiteConfig from './pages/SiteConfig';
import NotFound from './pages/NotFound';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="reservas" element={<Reservas />} />
        <Route path="clases" element={<Clases />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="premios" element={<Premios />} />
        <Route path="landing" element={<LandingPage />} />
        <Route path="integracion" element={<Integracion />} />
        <Route path="buffet" element={<Buffet />} />
        <Route path="cursos" element={<Cursos />} />
        <Route path="noticias" element={<Noticias />} />
        <Route path="gamificacion" element={<Gamificacion />} />
        <Route path="site-config" element={<SiteConfig />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
