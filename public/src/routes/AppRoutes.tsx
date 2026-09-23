// src/routes/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import NavigationLoader from './NavigationLoader';
import { Suspense, lazy } from 'react';
import Loader from '../components/Loader';

// Auth Pages (keep small auth pages eager)
import SignIn from '../pages/AuthPages/SignIn';
import SignUp from '../pages/AuthPages/SignUp';

// Lazy-loaded Dashboard & Modules to reduce initial bundle size
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const PartsPage = lazy(() => import('../pages/Dashboard/PartsPage'));
const PartsListPage = lazy(() => import('../pages/Dashboard/PartsListPage'));
const MyPartsPage = lazy(() => import('../pages/Dashboard/MyPartsPage'));
const PartUploadPage = lazy(() => import('../pages/Dashboard/PartUploadPage'));
const EditPartPage = lazy(() => import('../pages/Dashboard/EditPartPage'));
const SalesPage = lazy(() => import('../pages/Dashboard/SalesPage'));
const ExpensesListPage = lazy(() => import('../pages/Dashboard/ExpensesListPage'));
const ExpenseFormPage = lazy(() => import('../pages/Dashboard/ExpenseFormPage'));
const InventoryPage = lazy(() => import('../pages/Dashboard/InventoryPage'));
const ReportsPage = lazy(() => import('../pages/Dashboard/ReportsPage'));
const AgentsPage = lazy(() => import('../pages/agents/AgentsPage'));
const BrandsPage = lazy(() => import('../pages/brands/BrandsPage'));
const CategoriesPage = lazy(() => import('../pages/categories/CategoriesPage'));
const SparePartShopsList = lazy(() => import('../pages/SparePartShopsList'));
const SparePartShopForm = lazy(() => import('../pages/SparePartShopForm'));
const UsersPage = lazy(() => import('../pages/users/UsersPage'));

// Small helper left eager
import BrandsForm from '../components/brands/BrandsForm';

const AppRoutes = () => {
  return (
    <>
      <NavigationLoader />
      <Suspense fallback={<Loader />}>
        <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/te" element={<BrandsForm />} />
        

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parts"
          element={
            <ProtectedRoute adminOnly>
              <PartsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parts/list"
          element={
            <ProtectedRoute>
              <PartsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parts/mine"
          element={
            <ProtectedRoute>
              <MyPartsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parts/upload"
          element={
            <ProtectedRoute>
              <PartUploadPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/parts/edit/:id"
          element={
            <ProtectedRoute adminOnly>
              <EditPartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/sales"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/expenses"
          element={
            <ProtectedRoute adminOnly>
              <ExpensesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/expenses/new"
          element={
            <ProtectedRoute adminOnly>
              <ExpenseFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/expenses/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <ExpenseFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/agents"
          element={
            <ProtectedRoute adminOnly>
              <AgentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/brands"
          element={
            <ProtectedRoute adminOnly>
              <BrandsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/categories"
          element={
            <ProtectedRoute adminOnly>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/spare-part-shops"
          element={
            <ProtectedRoute adminOnly>
              <SparePartShopsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/spare-part-shops/new"
          element={
            <ProtectedRoute adminOnly>
              <SparePartShopForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/spare-part-shops/:id/edit"
          element={
            <ProtectedRoute adminOnly>
              <SparePartShopForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute adminOnly>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<SignIn />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRoutes;
