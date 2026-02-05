'use client'

import React, { useState } from 'react'
import Sidebar from './sidebar'
import TopNav from './top-nav'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5">
          {children}
        </main>
      </div>
    </div>
  )
}
