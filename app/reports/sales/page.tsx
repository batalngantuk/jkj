'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import AppLayout from '@/components/app-layout'


export default function SalesReportPage() {
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
                <h1 className="text-2xl font-bold text-foreground">Sales Analysis</h1>
                <p className="text-sm text-muted-foreground">Detailed sales performance reports</p>
              </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Sales data placeholder</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Detailed sales charts and tables will go here.</p>
                </CardContent>
            </Card>
          </div>
        </div></AppLayout>)
}
