import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Layout() {
  const location = useLocation()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  
  // Pages where we want full width (no sidebar header)
  const fullWidthPages = ['/invoices', '/payments', '/inventory', '/notes', '/gst-returns']
  const isFullWidth = fullWidthPages.some(page => location.pathname.startsWith(page))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar - collapsible */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} flex-shrink-0 transition-all duration-300`}>
          <Sidebar collapsed={sidebarCollapsed} hideHeader={isFullWidth} />
        </div>
        
        {/* Main content - takes remaining space */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Sidebar toggle button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute left-0 top-20 z-50 bg-white border border-gray-200 rounded-r-lg p-1.5 shadow-md hover:bg-gray-50 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            )}
          </button>
          
          <Navbar />
          
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className="max-w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
