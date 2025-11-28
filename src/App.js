import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- IMPORTACIONES CORRECTAS PARA EL CALENDARIO ---
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es'; // Opcional: para poner el calendario en español

// --- Importaciones de Páginas ---
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// Inventario
import ProductsPage from './pages/inventory/ProductsPage';
import ProductCreatePage from './pages/inventory/ProductCreatePage';
import ProductEditPage from './pages/inventory/ProductEditPage';
import InventoryEntryPage from './pages/inventory/InventoryEntryPage';
import InventoryExitPage from './pages/inventory/InventoryExitPage';
// Ventas
import ClientsPage from './pages/sales/ClientsPage';
import ClientCreatePage from './pages/sales/ClientCreatePage';
import ClientEditPage from './pages/sales/ClientEditPage';
import OrderCreatePage from './pages/sales/OrderCreatePage';
import OrdersListPage from './pages/sales/OrdersListPage';
import OrderDetailPage from './pages/sales/OrderDetailPage';
import SalesDashboardPage from './pages/sales/SalesDashboardPage';
// Producción
import ProductionOrdersPage from './pages/production/ProductionOrdersPage';
import ProductionOrderCreatePage from './pages/production/ProductionOrderCreatePage';
import ProductionOrderDetailPage from './pages/production/ProductionOrderDetailPage';
import WasteReportPage from './pages/production/WasteReportPage';

// Finanzas
import IncomesPage from './pages/finances/IncomesPage'; 
import ExpensesPage from './pages/finances/ExpensesPage';
import ProfitReportPage from './pages/finances/ProfitReportPage';
import ProductCostingPage from './pages/finances/ProductCostingPage';

// HHRR
import EmployeesPage from './pages/hhrr/EmployeesPage';
import EmployeeCreatePage from './pages/hhrr/EmployeeCreatePage';
import EmployeeEditPage from './pages/hhrr/EmployeeEditPage';
import UsersPage from './pages/hhrr/UsersPage';
import UserCreatePage from './pages/hhrr/UserCreatePage';
import UserEditPage from './pages/hhrr/UserEditPage';
import AttendancePage from './pages/hhrr/AttendancePage';
import PayrollReportPage from './pages/hhrr/PayrollReportPage';
import ShiftsPage from './pages/hhrr/ShiftsPage';
import AuditLogPage from './pages/hhrr/AuditLogPage';

// --- Componentes Comunes ---
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/common/Layout';


function App() {
  return (
    // --- EL PROVIDER DEBE ENVOLVER TODO ---
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    {/* Inventario */}
                    <Route path="/inventory/products" element={<ProductsPage />} />
                    <Route path="/inventory/products/new" element={<ProductCreatePage />} />
                    <Route path="/inventory/products/edit/:productId" element={<ProductEditPage />} />
                    <Route path="/inventory/movements/entry" element={<InventoryEntryPage />} />
                    <Route path="/inventory/movements/exit" element={<InventoryExitPage />} />
                    {/* Ventas */}
                    <Route path="/sales/clients" element={<ClientsPage />} />
                    <Route path="/sales/clients/new" element={<ClientCreatePage />} />
                    <Route path="/sales/clients/edit/:clientId" element={<ClientEditPage />} />
                    <Route path="/sales/orders/new" element={<OrderCreatePage />} />
                    <Route path="/sales/orders" element={<OrdersListPage />} />
                    <Route path="/sales/orders/:orderId" element={<OrderDetailPage />} />
                    <Route path="/sales/reports/dashboard" element={<SalesDashboardPage />} />
                    {/* Producción */}
                    <Route path="/production/orders" element={<ProductionOrdersPage />} />
                    <Route path="/production/orders/new" element={<ProductionOrderCreatePage />} />
                    <Route path="/production/orders/:orderId" element={<ProductionOrderDetailPage />} />
                    <Route path="/production/reports/wastes" element={<WasteReportPage />} />
                    <Route path="/production" element={<Navigate to="/production/orders" />} />
                    {/* Finanzas */}
                    <Route path="/finances/incomes" element={<IncomesPage />} />
                    <Route path="/finances/expenses" element={<ExpensesPage />} />
                    <Route path="/finances/reports/profit-by-client" element={<ProfitReportPage />} />
                    <Route path="/finances/costing" element={<ProductCostingPage />} />
                    {/* RRHH */}
                    <Route path="/hhrr/employees" element={<EmployeesPage />} />
                    <Route path="/hhrr/employees/new" element={<EmployeeCreatePage />} />
                    <Route path="/hhrr/employees/edit/:employeeId" element={<EmployeeEditPage />} />
                    {/* --- NUEVAS RUTAS (HU043) --- */}
                    <Route path="/hhrr/users" element={<UsersPage />} />
                    <Route path="/hhrr/users/new" element={<UserCreatePage />} />
                    <Route path="/hhrr/users/edit/:userId" element={<UserEditPage />} />
                    <Route path="/hhrr/attendance" element={<AttendancePage />} />
                    <Route path="/hhrr/payroll" element={<PayrollReportPage />} />
                    <Route path="/hhrr/shifts" element={<ShiftsPage />} />
                    <Route path="/hhrr/audit" element={<AuditLogPage />} />
                    {/* Default */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </LocalizationProvider>
  );
}

export default App;