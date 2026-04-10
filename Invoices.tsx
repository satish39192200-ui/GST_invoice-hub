import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, Filter, FileText, Loader2 } from 'lucide-react'
import { api } from '../../utils/api'
import { format } from 'date-fns'

export default function Invoices() {
  const [searchParams] = useSearchParams()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const type = searchParams.get('type') || 'all'

  useEffect(() => {
    fetchInvoices()
  }, [type])

  const fetchInvoices = async () => {
    try {
      const res = await api.get(`/invoices?type=${type}`)
      setInvoices(res.data.invoices || [])
    } catch (error) {
      console.error('Failed to fetch invoices', error)
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

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your B2B invoices</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/invoices/create"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
          </Link>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
            <p className="text-gray-500 mt-1">Get started by creating your first invoice</p>
            <Link
              to="/invoices/create"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Create Invoice
            </Link>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice: any) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                    <Link to={`/invoices/${invoice.id}`}>{invoice.invoiceNumber}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(invoice.invoiceDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{invoice.buyerName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{Number(invoice.totalAmount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
