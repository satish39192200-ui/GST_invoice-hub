import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Plus, Loader2, CheckCircle, ArrowRight, Calendar, FileText } from 'lucide-react'
import { api } from '../../utils/api'
import { format } from 'date-fns'

interface Payment {
  id: string
  paymentNumber: string
  invoiceId: string
  invoiceNumber: string
  amount: number
  paymentMode: string
  paymentDate: string
  referenceNumber: string
  status: string
  buyerName: string
  sellerName: string
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'RECEIVED' | 'MADE'>('ALL')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const res = await api.get('/payments')
      setPayments(res.data.payments || [])
    } catch (error) {
      console.error('Failed to fetch payments', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    if (filter === 'ALL') return true
    return payment.status === filter
  })

  const totalReceived = payments
    .filter(p => p.status === 'RECEIVED')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalMade = payments
    .filter(p => p.status === 'MADE')
    .reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payments</h2>
          <p className="mt-1 text-sm text-gray-500">
            {payments.length} payments • Received: ₹{totalReceived.toLocaleString()} • Made: ₹{totalMade.toLocaleString()}
          </p>
        </div>
        <Link
          to="/invoices"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Record Payment
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Received</p>
          <p className="text-2xl font-bold text-green-600">₹{totalReceived.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Made</p>
          <p className="text-2xl font-bold text-red-600">₹{totalMade.toLocaleString()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-sm text-gray-500">Net Balance</p>
          <p className={`text-2xl font-bold ${totalReceived - totalMade >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{(totalReceived - totalMade).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex space-x-2">
        {(['ALL', 'RECEIVED', 'MADE'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === type
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {type === 'ALL' ? 'All Payments' : type === 'RECEIVED' ? 'Received' : 'Made'}
          </button>
        ))}
      </div>

      {filteredPayments.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No payments recorded</h3>
          <p className="text-gray-500 mt-1">Record payments against invoices from invoice detail page</p>
          <Link
            to="/invoices"
            className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            Go to Invoices
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {payment.paymentNumber}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/invoices/${payment.invoiceId}`}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {payment.invoiceNumber}
                    </Link>
                    <p className="text-xs text-gray-500">
                      {payment.status === 'RECEIVED' ? `From: ${payment.buyerName}` : `To: ${payment.sellerName}`}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                    ₹{payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {payment.paymentMode}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(payment.paymentDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'RECEIVED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
