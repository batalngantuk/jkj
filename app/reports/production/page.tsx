'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'

export default function ProductionReportPage() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Link href="/reports">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Production Efficiency</h1>
                <p className="text-sm text-muted-foreground">Yield and output analysis</p>
              </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Production data placeholder</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Production efficiency metrics will go here.</p>
                </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
