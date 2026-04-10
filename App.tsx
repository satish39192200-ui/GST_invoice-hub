import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore'
import { useSocketStore } from './store/socketStore'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Invoices from './pages/invoices/Invoices'
import InvoiceDetail from './pages/invoices/InvoiceDetail'
import CreateInvoice from './pages/invoices/CreateInvoice'
import EditInvoice from './pages/invoices/EditInvoice'
import Payments from './pages/payments/Payments'
import Inventory from './pages/inventory/Inventory'
import CreditDebitNotes from './pages/notes/CreditDebitNotes'
import GstReturns from './pages/gst/GstReturns'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import NotFound from './pages/NotFound'

function App() {
  const { checkAuth, isAuthenticated, user } = useAuthStore()
  const { connect, disconnect } = useSocketStore()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      connect(user.id)
    } else {
      disconnect()
    }
    
    return () => {
      disconnect()
    }
  }, [isAuthenticated, user])

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
      } />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/invoices/create" element={<CreateInvoice />} />
          <Route path="/invoices/:id" element={<InvoiceDetail />} />
          <Route path="/invoices/:id/edit" element={<EditInvoice />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/notes" element={<CreditDebitNotes />} />
          <Route path="/gst-returns" element={<GstReturns />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin routes */}
          <Route path="/admin/*" element={<AdminDashboard />} />
        </Route>
      </Route>
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
