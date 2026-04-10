import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Package,
  Receipt,
  Calculator,
  Bell,
  User,
  Settings,
  Shield,
  Menu,
  X,
  LogOut,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

interface SidebarProps {
  collapsed?: boolean
  hideHeader?: boolean
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Invoices', href: '/invoices', icon: FileText },
  { name: 'Payments', href: '/payments', icon: CreditCard },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Credit/Debit Notes', href: '/notes', icon: Receipt },
  { name: 'GST Returns', href: '/gst-returns', icon: Calculator },
  { name: 'Notifications', href: '/notifications', icon: Bell },
]

const adminNavigation = [
  { name: 'Admin Panel', href: '/admin', icon: Shield },
]

const userNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar({ collapsed = false, hideHeader = false }: SidebarProps) {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
  }

  const isActive = (href: string) => {
    return location.pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button
          type="button"
          className="-m-2.5 p-2.5 text-gray-700"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-gray-900/50" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">GIH</span>
                </div>
                {!hideHeader && <span className="text-lg font-semibold text-gray-900">GST Invoice Hub</span>}
              </Link>
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col px-6 py-4">
              <SidebarContent
                navigation={navigation}
                adminNavigation={user?.role === 'ADMIN' ? adminNavigation : []}
                userNavigation={userNavigation}
                isActive={isActive}
                onNavigate={() => setMobileMenuOpen(false)}
                collapsed={false}
              />
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className={`hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300 ${collapsed ? 'lg:w-20' : 'lg:w-72'}`}>
        <div className={`flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white pb-4 ${collapsed ? 'px-2' : 'px-6'}`}>
          {!hideHeader && (
            <div className={`flex h-16 items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">GIH</span>
              </div>
              {!collapsed && <span className="text-lg font-semibold text-gray-900">GST Invoice Hub</span>}
            </div>
          )}
          <nav className="flex flex-1 flex-col">
            <SidebarContent
              navigation={navigation}
              adminNavigation={user?.role === 'ADMIN' ? adminNavigation : []}
              userNavigation={userNavigation}
              isActive={isActive}
              onNavigate={() => {}}
              collapsed={collapsed}
            />
          </nav>
          <div className={`pt-4 border-t ${collapsed ? 'px-2' : 'px-3'}`}>
            <button
              onClick={handleLogout}
              className={`flex w-full items-center rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${collapsed ? 'justify-center px-2' : 'gap-x-3 px-3'}`}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="h-5 w-5 text-gray-400 flex-shrink-0" />
              {!collapsed && 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

interface SidebarContentProps {
  navigation: { name: string; href: string; icon: React.ElementType }[]
  adminNavigation: { name: string; href: string; icon: React.ElementType }[]
  userNavigation: { name: string; href: string; icon: React.ElementType }[]
  isActive: (href: string) => boolean
  onNavigate: () => void
  collapsed?: boolean
}

function SidebarContent({ navigation, adminNavigation, userNavigation, isActive, onNavigate, collapsed = false }: SidebarContentProps) {
  return (
    <ul className="flex flex-1 flex-col gap-y-1">
      <li>
        <ul className={`space-y-1 ${collapsed ? '' : '-mx-2'}`}>
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                onClick={onNavigate}
                className={`
                  group flex rounded-md p-2 text-sm font-semibold leading-6
                  ${collapsed ? 'justify-center' : 'gap-x-3'}
                  ${isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }
                `}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={`h-6 w-6 shrink-0 ${
                    isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                  }`}
                  aria-hidden="true"
                />
                {!collapsed && item.name}
              </Link>
            </li>
          ))}
        </ul>
      </li>

      {adminNavigation.length > 0 && !collapsed && (
        <li className="mt-auto">
          <div className="text-xs font-semibold leading-6 text-gray-400 mb-2">Administration</div>
          <ul className="-mx-2 space-y-1">
            {adminNavigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={onNavigate}
                  className={`
                    group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6
                    ${isActive(item.href)
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                    }
                  `}
                >
                  <item.icon
                    className={`h-6 w-6 shrink-0 ${
                      isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </li>
      )}

      <li className={`${collapsed ? '' : 'mt-4'}`}>
        {!collapsed && <div className="text-xs font-semibold leading-6 text-gray-400 mb-2">Account</div>}
        <ul className={`space-y-1 ${collapsed ? '' : '-mx-2'}`}>
          {userNavigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                onClick={onNavigate}
                className={`
                  group flex rounded-md p-2 text-sm font-semibold leading-6
                  ${collapsed ? 'justify-center' : 'gap-x-3'}
                  ${isActive(item.href)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-primary-600'
                  }
                `}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={`h-6 w-6 shrink-0 ${
                    isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'
                  }`}
                  aria-hidden="true"
                />
                {!collapsed && item.name}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    </ul>
  )
}
