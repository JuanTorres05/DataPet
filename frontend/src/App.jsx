import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegistrarPage from './pages/RegistrarPage';
import AgendaPage from './pages/AgendaPage';
import PacientesPage from './pages/PacientesPage';
import FichaMascotaPage from './pages/FichaMascotaPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ReportesPage from './pages/ReportesPage';
import MonitoreoPage from './pages/MonitoreoPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Pública */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protegidas (envueltas por el Layout global) */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/monitoreo" element={<MonitoreoPage />} />
            <Route path="/mascotas/:id" element={<FichaMascotaPage />} />
            <Route
              path="/registrar"
              element={
                <PrivateRoute roles={['admin', 'recepcionista']}>
                  <RegistrarPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/reportes"
              element={
                <PrivateRoute roles={['admin', 'veterinario']}>
                  <ReportesPage />
                </PrivateRoute>
              }
            />
          </Route>



          {/* Redirect raíz */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
