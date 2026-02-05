'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import AppLayout from '@/components/app-layout'


export default function InventoryReportPage() {
  return (
    <AppLayout><div className="p-6">
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
        </div></AppLayout>)
}
