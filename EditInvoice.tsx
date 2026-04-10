import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'

export default function EditInvoice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [invoice, setInvoice] = useState<any>(null)
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerAddress: '',
    placeOfSupply: '',
    dueDate: '',
  })

  useEffect(() => {
    fetchInvoice()
  }, [id])

  const fetchInvoice = async () => {
    try {
      const res = await api.get(`/invoices/${id}`)
      setInvoice(res.data)
      setFormData({
        buyerName: res.data.buyerName || '',
        buyerAddress: res.data.buyerAddress || '',
        placeOfSupply: res.data.placeOfSupply || '',
        dueDate: res.data.dueDate ? res.data.dueDate.split('T')[0] : '',
      })
    } catch (error) {
      toast.error('Failed to fetch invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await api.patch(`/invoices/${id}`, formData)
      toast.success('Invoice updated successfully')
      navigate(`/invoices/${id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update invoice')
    } finally {
      setSaving(false)
    }
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
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Edit Invoice</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
          <input 
            type="text" 
            value={invoice.invoiceNumber} 
            disabled 
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Invoice number cannot be changed</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
            <input 
              type="text" 
              value={formData.buyerName}
              onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input 
              type="date" 
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Place of Supply</label>
          <input 
            type="text" 
            value={formData.placeOfSupply}
            onChange={(e) => setFormData({...formData, placeOfSupply: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Buyer Address</label>
          <textarea 
            value={formData.buyerAddress}
            onChange={(e) => setFormData({...formData, buyerAddress: e.target.value})}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  )
}
