// src/components/Layout.tsx
import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import '../../styles/components/_layout.scss'

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="layout">
      <Sidebar />
      
      <div className="layout__main">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          sidebarOpen={sidebarOpen}
        />
        
        <main className="layout__content">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="layout__overlay" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar menú"
        />
      )}
    </div>
  )
}