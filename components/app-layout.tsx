'use client'

import React, { useState } from 'react'
import Sidebar from './sidebar'
import TopNav from './top-nav'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Responsive init: Close on mobile by default
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    
    // Set initial state
    handleResize()

    // Optional: Listen to resize if dynamic switching is needed
    // window.addEventListener('resize', handleResize)
    // return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(prev => !prev)} />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5">
          {children}
        </main>
      </div>
    </div>
  )
}
