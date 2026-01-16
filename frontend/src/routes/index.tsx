import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '../layout/AppLayout';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import TransactionsPage from '../pages/transacoes/TransactionsPage';
import CategoriesPage from '../pages/categorias/CategoriesPage';
import AccountsPage from '../pages/contas/AccountsPage';
import PlansPage from '../pages/planos/PlansPage';
import PlanDetailsPage from '../pages/planos/PlanDetailsPage';
import SettingsPage from '../pages/settings/SettingsPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/cadastro" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transacoes" element={<TransactionsPage />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/contas" element={<AccountsPage />} />
        <Route path="/planos" element={<PlansPage />} />
        <Route path="/planos/:id" element={<PlanDetailsPage />} />
        <Route path="/projecao" element={<Navigate to="/planos?tab=projecao" replace />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
