import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Download, CheckCircle, XCircle, Edit, Loader2 } from 'lucide-react'
import { api } from '../../utils/api'
import { format } from 'date-fns'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/invoices/${id}`)
      setInvoice(res.data)
    } catch (error) {
      console.error('Failed to fetch invoice', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/invoices/${id}/status`, { status })
      toast.success(`Invoice ${status.toLowerCase()} successfully`)
      fetchInvoice()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update status')
      console.error('Failed to update status', error)
    }
  }

  const downloadPDF = () => {
    window.print()
  }

  const editInvoice = () => {
    navigate(`/invoices/${id}/edit`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Invoice not found</h2>
        <Link to="/invoices" className="text-primary-600 hover:text-primary-500 mt-4 inline-block">
          Back to invoices
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h2>
            <p className="text-sm text-gray-500">{format(new Date(invoice.invoiceDate), 'MMMM d, yyyy')}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={downloadPDF}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
          <button 
            onClick={editInvoice}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>
                <p className="text-sm text-gray-500 mt-1">IRN: {invoice.irn || 'N/A'}</p>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                invoice.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                invoice.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {invoice.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Seller</h4>
                <p className="mt-1 text-sm font-medium text-gray-900">{invoice.sellerName}</p>
                <p className="text-sm text-gray-500">{invoice.sellerGstin}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Buyer</h4>
                <p className="mt-1 text-sm font-medium text-gray-900">{invoice.buyerName}</p>
                <p className="text-sm text-gray-500">{invoice.buyerGstin}</p>
              </div>
            </div>

            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 text-right">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 text-right">₹{Number(item.unitPrice).toFixed(2)}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 text-right">₹{Number(item.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              {/* Accept/Reject buttons - show to buyer OR in demo mode */}
              {invoice.status === 'PENDING' && (user?.id === invoice.buyerId || user?.id === invoice.sellerId) && (
                <>
                  {user?.id === invoice.sellerId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2 mb-3">
                      <p className="text-xs text-blue-800">
                        <strong>Demo Mode:</strong> You can accept as seller for demonstration
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => updateStatus('ACCEPTED')}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Invoice
                  </button>
                  <button
                    onClick={() => updateStatus('REJECTED')}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Invoice
                  </button>
                </>
              )}
              
              {/* Show ITC Claim button when accepted (buyer normally, seller for demo) */}
              {invoice.status === 'ACCEPTED' && (user?.id === invoice.buyerId || user?.id === invoice.sellerId) && !invoice.itcClaimed && (
                <button
                  onClick={async () => {
                    try {
                      await api.post(`/invoices/${id}/claim-itc`)
                      toast.success('ITC claimed successfully')
                      fetchInvoice()
                    } catch (error: any) {
                      toast.error(error.response?.data?.error || 'Failed to claim ITC')
                    }
                  }}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Claim ITC
                </button>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Taxable Amount</span>
                <span className="font-medium">₹{Number(invoice.taxableAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CGST</span>
                <span className="font-medium">₹{Number(invoice.cgstAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SGST</span>
                <span className="font-medium">₹{Number(invoice.sgstAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IGST</span>
                <span className="font-medium">₹{Number(invoice.igstAmount).toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{Number(invoice.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
