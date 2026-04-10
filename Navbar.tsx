import { Bell, User, Search } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  const { user } = useAuthStore()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-white border-b border-gray-200 lg:pl-72">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
              placeholder="Search invoices, payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 text-gray-400 hover:text-gray-500"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger-500 ring-2 ring-white" />
          </Link>

          {/* User menu */}
          <Link
            to="/profile"
            className="flex items-center gap-2 p-2 text-gray-700 hover:text-gray-900"
          >
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-medium text-gray-900">{user?.businessName || 'User'}</p>
              <p className="text-gray-500 text-xs">{user?.role || 'SELLER'}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
