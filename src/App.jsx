import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalFeedback from '@/components/GlobalFeedback';
import Loader from '@/components/Loader';
import { useThemeSync } from '@/hooks/use-theme-sync';
import Login from './pages/auth/Login/Login';
import Register from './pages/auth/Register/Register';
import ProtectedRoute from './guards/ProtectedRoute';

const AppLayout = lazy(() => import('./layouts/AppLayout'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const EntidadesFinancieras = lazy(
    () => import('./pages/entidades_financieras/EntidadesFinancieras'),
);
const EntidadDetalle = lazy(() => import('./pages/detalle_entidad/DetalleEntidad'));
const DetalleGasto = lazy(() => import('./pages/detalle_gasto/DetalleGasto'));
const Configuracion = lazy(() => import('./pages/configuracion/Configuracion'));
const Compartidos = lazy(() => import('./pages/compartidos/Compartidos'));
const SettlementHistory = lazy(() => import('./pages/cuentas/SettlementHistory'));
const SettlementDetail = lazy(() => import('./pages/cuentas/SettlementDetail'));

export default function App() {
    useThemeSync();

    return (
        <>
            <GlobalFeedback />
            <Suspense fallback={<Loader />}>
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
                        <Route path="settlement" element={<SettlementHistory />} />
                        <Route path="settlement/:id" element={<SettlementDetail />} />
                        <Route path="entidades" element={<EntidadesFinancieras />} />
                        <Route path="entidades/:id" element={<EntidadDetalle />} />
                        <Route path="gastos/:id" element={<DetalleGasto />} />
                        <Route path="notificaciones" element={<Compartidos />} />
                        <Route path="configuracion" element={<Configuracion />} />
                    </Route>
                </Routes>
            </Suspense>
        </>
    );
}
