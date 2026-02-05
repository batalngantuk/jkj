'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MOCK_CUSTOMERS, MOCK_PRODUCTS } from "@/lib/mock-data/sales"
import { FileUpload } from "@/components/shared/file-upload"
import { AlertBadge } from "@/components/shared/alert-badge"
import TopNav from '@/components/top-nav'
import Sidebar from '@/components/sidebar'

export default function NewSalesOrderPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    customerId: '',
    poNumber: '',
    productId: '',
    quantity: '',
    deliveryDate: '',
    notes: ''
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Simulation of stock check
  const selectedProduct = MOCK_PRODUCTS.find(p => p.id === formData.productId)
  const orderQty = parseInt(formData.quantity) || 0
  const isStockAvailable = selectedProduct ? selectedProduct.stock >= orderQty : true

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    router.push('/sales')
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />

        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex items-center gap-4">
              <Link href="/sales">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">New Sales Order</h1>
                <p className="text-sm text-muted-foreground">Create a new order from customer PO</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>Enter the details from the customer PO</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Customer</Label>
                        <Select 
                          value={formData.customerId} 
                          onValueChange={(v) => setFormData({...formData, customerId: v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Customer" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_CUSTOMERS.map(c => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>PO Number</Label>
                        <Input 
                          placeholder="e.g. PO/ABC/2026/001"
                          value={formData.poNumber}
                          onChange={e => setFormData({...formData, poNumber: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Product</Label>
                        <Select 
                          value={formData.productId} 
                          onValueChange={(v) => setFormData({...formData, productId: v})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_PRODUCTS.map(p => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name} ({p.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Quantity (Cartons)</Label>
                        <Input 
                          type="number"
                          placeholder="0"
                          value={formData.quantity}
                          onChange={e => setFormData({...formData, quantity: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Expected Delivery Date</Label>
                      <Input 
                        type="date"
                        value={formData.deliveryDate}
                        onChange={e => setFormData({...formData, deliveryDate: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea 
                        placeholder="Any special instructions..."
                        value={formData.notes}
                        onChange={e => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>

                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>PO Document</CardTitle>
                    <CardDescription>Upload the scanned PO from customer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FileUpload 
                      onFileSelect={setFile}
                      label="Customer PO (PDF/Image)"
                      maxSizeMB={5}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                
                {/* Auto Triggers Preview */}
                <Card className={isStockAvailable ? "bg-green-50/50 border-green-200" : "bg-yellow-50/50 border-yellow-200"}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Auto-Trigger Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    
                    <div>
                      <span className="font-semibold block mb-1">Finished Goods Stock:</span>
                      {selectedProduct ? (
                        <div className="flex items-center justify-between">
                          <span>Available: {selectedProduct.stock}</span>
                          {isStockAvailable ? (
                            <AlertBadge type="success" message="In Stock" />
                          ) : (
                            <AlertBadge type="warning" message="Production Needed" />
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">- Select product first -</span>
                      )}
                    </div>

                    <div className="pt-2 border-t border-border/50">
                      <span className="font-semibold block mb-1">System Action:</span>
                      {selectedProduct ? (
                        isStockAvailable ? (
                          <div className="flex gap-2 items-start text-green-700">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>Will reserve stock and notify Logistics immediately upon approval.</span>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-start text-yellow-700">
                            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>Will create <strong>Work Order</strong> for Production upon approval.</span>
                          </div>
                        )
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>

                  </CardContent>
                </Card>

                <div className="flex flex-col gap-3">
                   <Button size="lg" type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? 'Creating Order...' : 'Create Sales Order'}
                    {!isSubmitting && <Save className="ml-2 h-4 w-4" />}
                   </Button>
                   <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
                    Cancel
                   </Button>
                </div>

              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
