import { useState } from 'react'
import { Calculator, Download, FileText, Loader2 } from 'lucide-react'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'

export default function GstReturns() {
  const [period, setPeriod] = useState(() => {
    const now = new Date()
    return `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`
  })
  const [loading, setLoading] = useState(false)
  const [gstr1Data, setGstr1Data] = useState(null)
  const [gstr3bData, setGstr3bData] = useState(null)

  const generateGSTR1 = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/gst-returns/gstr1?period=${period}`)
      setGstr1Data(res.data)
      toast.success('GSTR-1 generated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate GSTR-1')
    } finally {
      setLoading(false)
    }
  }

  const generateGSTR3B = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/gst-returns/gstr3b?period=${period}`)
      setGstr3bData(res.data)
      toast.success('GSTR-3B generated successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate GSTR-3B')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    window.open(`/api/gst-returns/gstr1/export?period=${period}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">GST Returns</h2>
          <p className="mt-1 text-sm text-gray-500">Generate and download GST returns</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-end space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Period (MM-YYYY)</label>
            <input
              type="text"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="01-2024"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          <button
            onClick={generateGSTR1}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
            Generate GSTR-1
          </button>
          <button
            onClick={generateGSTR3B}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Calculator className="h-4 w-4 mr-2" />}
            Generate GSTR-3B
          </button>
        </div>
      </div>

      {gstr1Data && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">GSTR-1 Summary</h3>
            <button
              onClick={exportCSV}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{(gstr1Data as any).totalInvoices}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Taxable Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{(gstr1Data as any).totalTaxableValue?.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">CGST</p>
              <p className="text-2xl font-bold text-gray-900">₹{(gstr1Data as any).totalCgst?.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{(gstr1Data as any).totalInvoiceValue?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {gstr3bData && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">GSTR-3B Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Outward Taxable</p>
              <p className="text-2xl font-bold text-gray-900">₹{(gstr3bData as any).outwardTaxableSupplies?.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">ITC Available</p>
              <p className="text-2xl font-bold text-gray-900">₹{((gstr3bData as any).itcAvailableCgst + (gstr3bData as any).itcAvailableSgst)?.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Tax Payable</p>
              <p className="text-2xl font-bold text-gray-900">₹{((gstr3bData as any).taxPayableCgst + (gstr3bData as any).taxPayableSgst)?.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Net Tax</p>
              <p className="text-2xl font-bold text-gray-900">₹{((gstr3bData as any).taxPaidCgst + (gstr3bData as any).taxPaidSgst)?.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
