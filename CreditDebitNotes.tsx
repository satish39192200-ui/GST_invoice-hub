import { useEffect, useState } from 'react'
import { Plus, Receipt, Loader2, ArrowRight, Calendar, FileText } from 'lucide-react'
import { api } from '../../utils/api'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

interface CreditDebitNote {
  id: string
  noteNumber: string
  noteType: 'CREDIT' | 'DEBIT'
  invoiceId: string
  invoiceNumber: string
  reason: string
  taxableAmount: number
  cgstAmount: number
  sgstAmount: number
  igstAmount: number
  totalAmount: number
  createdAt: string
  status: string
}

export default function CreditDebitNotes() {
  const [notes, setNotes] = useState<CreditDebitNote[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL')

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes')
      setNotes(res.data.notes || [])
    } catch (error) {
      console.error('Failed to fetch notes', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNotes = notes.filter(note => 
    filter === 'ALL' || note.noteType === filter
  )

  const creditTotal = notes.filter(n => n.noteType === 'CREDIT').reduce((sum, n) => sum + n.totalAmount, 0)
  const debitTotal = notes.filter(n => n.noteType === 'DEBIT').reduce((sum, n) => sum + n.totalAmount, 0)

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
          <h2 className="text-2xl font-bold text-gray-900">Credit/Debit Notes</h2>
          <p className="mt-1 text-sm text-gray-500">
            {notes.length} notes • Credit: ₹{creditTotal.toLocaleString()} • Debit: ₹{debitTotal.toLocaleString()}
          </p>
        </div>
        <Link
          to="/invoices"
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create from Invoice
        </Link>
      </div>

      <div className="flex space-x-2">
        {(['ALL', 'CREDIT', 'DEBIT'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === type
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {type === 'ALL' ? 'All Notes' : `${type} Notes`}
          </button>
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No notes found</h3>
          <p className="text-gray-500 mt-1">
            Create credit/debit notes from invoice detail page
          </p>
          <Link
            to="/invoices"
            className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            Go to Invoices
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div key={note.id} className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    note.noteType === 'CREDIT' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {note.noteType} NOTE
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-gray-900">{note.noteNumber}</h3>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{note.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>Against: {note.invoiceNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(new Date(note.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <p className="text-gray-600 mt-2">{note.reason}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <p className="text-gray-500">CGST</p>
                    <p className="font-medium">₹{note.cgstAmount.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">SGST</p>
                    <p className="font-medium">₹{note.sgstAmount.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">IGST</p>
                    <p className="font-medium">₹{note.igstAmount.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <Link
                to={`/invoices/${note.invoiceId}`}
                className="mt-4 w-full inline-flex items-center justify-center text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View Invoice
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
