'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'

export default function InventoryReportPage() {
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
                <h1 className="text-2xl font-bold text-foreground">Inventory Valuation</h1>
                <p className="text-sm text-muted-foreground">Stock value and movement reports</p>
              </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Inventory data placeholder</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Inventory audit and valuation reports will go here.</p>
                </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
