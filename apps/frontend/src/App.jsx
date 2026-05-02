import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';
import { DashboardShell } from './components/layout/DashboardShell.jsx';
import { brand } from './theme/brand.js';
import Landing from './pages/Landing.jsx';
import Login from './pages/auth/Login.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminOwners from './pages/admin/AdminOwners.jsx';
import AdminBusinesses from './pages/admin/AdminBusinesses.jsx';
import AdminFeedback from './pages/admin/AdminFeedback.jsx';
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import BusinessDetail from './pages/owner/BusinessDetail.jsx';
import CustomerReviewPage from './pages/customer/CustomerReviewPage.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3200,
          style: { background: '#363636', color: '#fff' },
          success: { style: { background: brand.toast.successBg } },
          error: { style: { background: brand.toast.errorBg } },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/r/:slug" element={<CustomerReviewPage />} />

        <Route
          element={
            <ProtectedRoute roles={['admin', 'superadmin']}>
              <DashboardShell variant="admin" />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/admin/overview" element={<AdminOverview />} />
          <Route path="/admin/owners" element={<AdminOwners />} />
          <Route path="/admin/businesses" element={<AdminBusinesses />} />
          <Route path="/admin/businesses/:id" element={<BusinessDetail />} />
          <Route path="/admin/feedback" element={<AdminFeedback />} />
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['owner']}>
              <DashboardShell variant="owner" />
            </ProtectedRoute>
          }
        >
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/:id" element={<BusinessDetail />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
