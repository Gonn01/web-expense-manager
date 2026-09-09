import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalFeedback from '@/components/GlobalFeedback';
import Login from './pages/auth/Login/Login';
import AppLayout from './layouts/AppLayout';
import EntidadesFinancieras from './pages/entidades_financieras/EntidadesFinancieras';
import EntidadDetalle from './pages/detalle_entidad/DetalleEntidad';
import ProtectedRoute from './guards/ProtectedRoute';
import DetalleGasto from './pages/detalle_gasto/DetalleGasto';
import Configuracion from './pages/configuracion/Configuracion';
import Register from './pages/auth/Register/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Compartidos from './pages/compartidos/Compartidos';
import Cuentas from './pages/cuentas/Cuentas';
import CuentaDetalle from './pages/cuentas/CuentaDetalle';

export default function App() {
    return (
        <>
            <GlobalFeedback />
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/app/*"
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="cuentas" element={<Cuentas />} />
                    <Route path="cuentas/:id" element={<CuentaDetalle />} />
                    <Route path="entidades" element={<EntidadesFinancieras />} />
                    <Route path="entidades/:id" element={<EntidadDetalle />} />
                    <Route path="gastos/:id" element={<DetalleGasto />} />
                    <Route path="compartidos" element={<Compartidos />} />
                    <Route path="configuracion" element={<Configuracion />} />
                </Route>
            </Routes>
        </>
    );
}
