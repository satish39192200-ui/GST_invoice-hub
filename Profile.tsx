import { useState } from 'react'
import { User, Building2, Mail, Phone, MapPin, Edit2, Save, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    address: '',
  })

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await api.patch('/auth/me', formData)
      updateUser(res.data)
      toast.success('Profile updated successfully')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your account settings</p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isEditing ? (
            <Save className="h-4 w-4 mr-2" />
          ) : (
            <Edit2 className="h-4 w-4 mr-2" />
          )}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-10 w-10 text-primary-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{user?.businessName}</h3>
              <p className="text-sm text-gray-500">{user?.role}</p>
              <p className="text-sm text-gray-500">GSTIN: {user?.gstin}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                Business Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user?.businessName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Mail className="h-4 w-4 mr-2 text-gray-400" />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <Phone className="h-4 w-4 mr-2 text-gray-400" />
                Mobile
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              ) : (
                <p className="mt-1 text-sm text-gray-900">{user?.mobile}</p>
              )}
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                GSTIN
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.gstin}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
