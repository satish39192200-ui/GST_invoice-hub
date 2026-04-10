import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  CreditCard, 
  Package, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { api } from '../utils/api'
import { useAuthStore } from '../store/authStore'
import { format } from 'date-fns'

interface DashboardStats {
  issuedInvoices: number
  receivedInvoices: number
  pendingInvoices: number
  totalAmount: number
  recentInvoices: any[]
  pendingPayments: number
  inventoryItems: number
  lowStockItems: number
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Fetch issued invoices summary
      const issuedRes = await api.get('/invoices?type=issued&limit=5')
      // Fetch received invoices summary
      const receivedRes = await api.get('/invoices?type=received&limit=5')
      // Fetch inventory summary
      const inventoryRes = await api.get('/inventory?limit=1')

      setStats({
        issuedInvoices: issuedRes.data.summary?.totalInvoices || 0,
        receivedInvoices: receivedRes.data.summary?.totalInvoices || 0,
        pendingInvoices: issuedRes.data.summary?.pendingCount || 0,
        totalAmount: issuedRes.data.summary?.totalAmount || 0,
        recentInvoices: [...(issuedRes.data.invoices || []), ...(receivedRes.data.invoices || [])]
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5),
        pendingPayments: 0, // Calculate from invoices
        inventoryItems: inventoryRes.data.summary?.totalItems || 0,
        lowStockItems: inventoryRes.data.summary?.lowStockItems || 0,
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const statCards = [
    {
      name: 'Issued Invoices',
      value: stats?.issuedInvoices || 0,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/invoices?type=issued',
      trend: '+12%',
    },
    {
      name: 'Received Invoices',
      value: stats?.receivedInvoices || 0,
      icon: Receipt,
      color: 'bg-green-500',
      link: '/invoices?type=received',
      trend: '+8%',
    },
    {
      name: 'Pending',
      value: stats?.pendingInvoices || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      link: '/invoices?status=PENDING',
      trend: '-5%',
    },
    {
      name: 'Total Value',
      value: `₹${(stats?.totalAmount || 0).toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-purple-500',
      link: '/invoices',
      trend: '+15%',
    },
  ]

  return (
    <div className="space-y-4 max-w-7xl">
      {/* Page header - aligned left */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.businessName || 'User'}! Here's what's happening with your business.
          </p>
        </div>
        <Link
          to="/invoices/create"
          className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-primary-700 hover:shadow-lg transition-all w-fit"
        >
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
        </Link>
      </div>

      {/* Stats grid - compact and left-aligned */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <div className={`${stat.color} p-3 rounded-lg mr-4 flex-shrink-0`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 truncate">{stat.name}</p>
              <div className="flex items-center mt-1">
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <span className={`ml-2 text-xs font-medium ${
                  stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.trend}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main content - single column layout for full visibility */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Invoices - takes 2 columns */}
        <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Invoices</h3>
            <Link
              to="/invoices"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {stats?.recentInvoices?.length ? (
              stats.recentInvoices.slice(0, 5).map((invoice: any) => (
                <li key={invoice.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <Link to={`/invoices/${invoice.id}`} className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className={`h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        invoice.status === 'ACCEPTED' ? 'bg-green-100' :
                        invoice.status === 'REJECTED' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                        {invoice.status === 'ACCEPTED' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : invoice.status === 'REJECTED' ? (
                          <XCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {invoice.sellerId === user?.id ? 'To: ' : 'From: '}
                          {invoice.sellerId === user?.id ? invoice.buyerName : invoice.sellerName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹{Number(invoice.totalAmount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(invoice.createdAt), 'MMM d')}
                      </p>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-8 text-center text-gray-500">
                <FileText className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                <p>No invoices yet</p>
                <Link to="/invoices/create" className="text-primary-600 text-sm font-medium mt-1 inline-block">
                  Create your first invoice
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Quick Actions & Alerts - takes 1 column */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-3 grid grid-cols-2 gap-2">
              <Link
                to="/invoices/create"
                className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FileText className="h-6 w-6 text-blue-600 mb-1.5" />
                <span className="text-xs font-medium text-gray-900">Create Invoice</span>
              </Link>
              <Link
                to="/payments"
                className="flex flex-col items-center justify-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <CreditCard className="h-6 w-6 text-green-600 mb-1.5" />
                <span className="text-xs font-medium text-gray-900">Record Payment</span>
              </Link>
              <Link
                to="/inventory"
                className="flex flex-col items-center justify-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <Package className="h-6 w-6 text-indigo-600 mb-1.5" />
                <span className="text-xs font-medium text-gray-900">Update Stock</span>
              </Link>
              <Link
                to="/gst-returns"
                className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Receipt className="h-6 w-6 text-purple-600 mb-1.5" />
                <span className="text-xs font-medium text-gray-900">GST Returns</span>
              </Link>
            </div>
          </div>

          {/* Alerts */}
          {(stats?.pendingInvoices || 0) > 0 || (stats?.lowStockItems || 0) > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center">
                <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                <h3 className="font-semibold text-gray-900">Alerts</h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {(stats?.pendingInvoices || 0) > 0 && (
                  <li className="px-4 py-2.5">
                    <Link to="/invoices?status=PENDING" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                      <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                      <span>{stats?.pendingInvoices} invoices awaiting action</span>
                    </Link>
                  </li>
                )}
                {(stats?.lowStockItems || 0) > 0 && (
                  <li className="px-4 py-2.5">
                    <Link to="/inventory?lowStock=true" className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                      <Package className="h-4 w-4 text-red-500 mr-2" />
                      <span>{stats?.lowStockItems} items low on stock</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          ) : (
            <div className="bg-green-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center">
                <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm text-green-800 font-medium">All caught up!</span>
              </div>
              <p className="text-xs text-green-600 mt-1">No pending actions</p>
            </div>
          )}

          {/* Mini Inventory Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Inventory Summary</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Total Products</span>
                <span className="font-semibold">{stats?.inventoryItems || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Low Stock</span>
                <span className={`font-semibold ${(stats?.lowStockItems || 0) > 0 ? 'text-red-600' : ''}`}>
                  {stats?.lowStockItems || 0}
                </span>
              </div>
              <Link to="/inventory" className="mt-3 block text-center text-sm text-primary-600 font-medium hover:text-primary-700">
                Manage Inventory →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
