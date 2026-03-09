'use client'

import React from 'react'
import Link from 'next/link'
import { ShoppingCart, Users, FileText, TrendingUp, AlertCircle, Plus, DollarSign, Ship, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'

import { MOCK_PURCHASE_ORDERS, MOCK_SUPPLIERS } from "@/lib/mock-data/purchasing"

export default function PurchasingDashboard() {
  const pendingApproval = MOCK_PURCHASE_ORDERS.filter(po => po.status === 'DRAFT').length
  const totalSpend = MOCK_PURCHASE_ORDERS.reduce((acc, curr) => acc + curr.totalAmount, 0)
  
  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Purchasing</h1>
                <p className="text-sm text-muted-foreground">Procurement and Supplier Management</p>
              </div>
              <div className="flex gap-3">
                 <Link href="/purchasing/suppliers">
                    <Button variant="outline" className="gap-2">
                        <Users className="h-4 w-4" />
                        Suppliers
                    </Button>
                 </Link>
                 <Link href="/purchasing/po">
                    <Button variant="outline" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Purchase Orders
                    </Button>
                 </Link>
                 <Link href="/purchasing/po/create">
                    <Button className="bg-primary hover:bg-primary/90 gap-2">
                        <Plus className="h-4 w-4" />
                        New Purchase Order
                    </Button>
                 </Link>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Monthly Spend</p>
                           <p className="text-2xl font-bold">Rp {(totalSpend / 1000000).toFixed(0)} M</p>
                       </div>
                       <DollarSign className="h-8 w-8 text-blue-500" />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Pending Approval</p>
                           <p className="text-2xl font-bold">{pendingApproval} POs</p>
                       </div>
                       <AlertCircle className={`h-8 w-8 ${pendingApproval > 0 ? "text-orange-500" : "text-gray-400"}`} />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Active Suppliers</p>
                           <p className="text-2xl font-bold">{MOCK_SUPPLIERS.length}</p>
                       </div>
                       <Users className="h-8 w-8 text-green-500" />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Open Orders</p>
                           <p className="text-2xl font-bold">{MOCK_PURCHASE_ORDERS.filter(p => p.status === 'APPROVED').length}</p>
                       </div>
                       <ShoppingCart className="h-8 w-8 text-purple-500" />
                   </CardContent>
               </Card>
            </div>

            {/* Import & Compliance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/purchasing/bc20">
                <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-lg">
                          <Ship className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">BC 2.0 - Regular Import</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">Import declarations with dual billing</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-600 text-white">New!</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Tax Pending</p>
                        <p className="text-2xl font-bold text-orange-600">1</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Cleared</p>
                        <p className="text-2xl font-bold text-green-600">1</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      ✓ Dual Billing • ✓ Upfront Tax Payment • ✓ Landed Cost
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/purchasing/po">
                <Card className="hover:shadow-lg transition-all cursor-pointer border-2">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-600 rounded-lg">
                        <Package className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Purchase Orders</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Manage all purchase orders</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold text-orange-600">{pendingApproval}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Approved</p>
                        <p className="text-2xl font-bold text-green-600">{MOCK_PURCHASE_ORDERS.filter(p => p.status === 'APPROVED').length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>

            {/* Quick Actions / Recent */}
            <h2 className="text-lg font-semibold">Active Suppliers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MOCK_SUPPLIERS.slice(0, 4).map(supplier => (
                    <Card key={supplier.id} className="hover:bg-secondary/10 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {supplier.name}
                            </CardTitle>
                            <div className={`h-2 w-2 rounded-full ${supplier.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground mb-2">{supplier.contactPerson}</div>
                            <div className="flex items-center text-xs gap-1">
                                <span className="font-bold text-yellow-600">★ {supplier.rating}</span>
                                <span className="text-muted-foreground">Rating</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

          </div>
        </div></AppLayout>)
}
