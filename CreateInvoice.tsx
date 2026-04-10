import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Loader2, Wand2 } from 'lucide-react'
import { useForm, useFieldArray } from 'react-hook-form'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'
import { HSN_CODES, UNITS } from '../../utils/constants'

interface InvoiceForm {
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  buyerGstin: string
  buyerName: string
  buyerAddress: string
  placeOfSupply: string
  items: {
    description: string
    hsnCode: string
    quantity: number
    unit: string
    unitPrice: number
    discount: number
    cgstRate: number
    sgstRate: number
    igstRate: number
  }[]
}

export default function CreateInvoice() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { register, control, handleSubmit, watch, setValue } = useForm<InvoiceForm>({
    defaultValues: {
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      buyerGstin: '29AABCU9603R1Z2',
      buyerName: 'Test Buyer Pvt Ltd',
      buyerAddress: '123 Test Street, Bangalore, Karnataka',
      placeOfSupply: 'Karnataka',
      items: [{ description: 'Laptop Computer', hsnCode: '8471', quantity: 2, unit: 'PCS', unitPrice: 50000, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 18 }]
    }
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const onSubmit = async (data: InvoiceForm) => {
    try {
      setIsSubmitting(true)
      // Convert numeric strings to numbers
      const formattedData = {
        ...data,
        items: data.items.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          discount: Number(item.discount || 0),
          cgstRate: Number(item.cgstRate || 0),
          sgstRate: Number(item.sgstRate || 0),
          igstRate: Number(item.igstRate || 0),
        }))
      }
      await api.post('/invoices', formattedData)
      toast.success('Invoice created successfully')
      navigate('/invoices')
    } catch (error: any) {
      const errorMsg = error.response?.data?.errors 
        ? error.response.data.errors.map((e: any) => e.msg || e.message).join(', ')
        : error.response?.data?.error || 'Failed to create invoice'
      toast.error(errorMsg)
      console.error('Invoice creation error:', error.response?.data)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Create Invoice</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            setValue('invoiceNumber', `INV-${Date.now().toString().slice(-6)}`)
            setValue('buyerGstin', '29AABCU9603R1Z2')
            setValue('buyerName', 'Corporate Services Ltd')
            setValue('buyerAddress', '123 Business Park, Bangalore - 560001')
            setValue('placeOfSupply', 'Karnataka')
            setValue('items', [{ description: 'Canon Printer LBP2900B', hsnCode: '8443', quantity: 3, unit: 'PCS', unitPrice: 550000, discount: 0, cgstRate: 0, sgstRate: 0, igstRate: 18 }])
            toast.success('Demo data filled!')
          }}
          className="inline-flex items-center px-3 py-2 border border-dashed border-primary-400 text-sm font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100"
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Demo Fill
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
              <input {...register('invoiceNumber', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Invoice Date</label>
              <input type="date" {...register('invoiceDate', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" {...register('dueDate')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Buyer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">GSTIN</label>
              <input {...register('buyerGstin', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm uppercase" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Business Name</label>
              <input {...register('buyerName', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea {...register('buyerAddress')} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Place of Supply</label>
              <input {...register('placeOfSupply', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Items</h3>
            <button
              type="button"
              onClick={() => append({ description: '', hsnCode: '', quantity: 1, unit: 'PCS', unitPrice: 0, discount: 0, cgstRate: 9, sgstRate: 9, igstRate: 18 })}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500">Description</label>
                  <input {...register(`items.${index}.description`)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">HSN</label>
                  <select {...register(`items.${index}.hsnCode`)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    <option value="">Select</option>
                    {HSN_CODES.map(hsn => (
                      <option key={hsn.code} value={hsn.code}>{hsn.code}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Qty</label>
                  <input type="number" {...register(`items.${index}.quantity`)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Unit</label>
                  <select {...register(`items.${index}.unit`)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
                    {UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500">Price</label>
                  <input type="number" {...register(`items.${index}.unitPrice`)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" />
                </div>
                <div>
                  <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Create Invoice
          </button>
        </div>
      </form>
    </div>
  )
}
