'use client'

import { Bell, Menu, User, TrendingUp, Package, Zap, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import TopNav from '@/components/top-nav'
import Sidebar from '@/components/sidebar'
import KPICards from '@/components/kpi-cards'
import ChartSection from '@/components/chart-section'
import AlertsSection from '@/components/alerts-section'
import QuickActions from '@/components/quick-actions'

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <TopNav />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Executive Dashboard
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  JKJ Manufacturing - Glove Production ERP
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                System Online
              </div>
            </div>

            {/* KPI Cards */}
            <KPICards />

            {/* Charts Section */}
            <ChartSection />

            {/* Alerts and Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-3">
              <AlertsSection />
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
