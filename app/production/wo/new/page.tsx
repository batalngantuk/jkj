'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import AppLayout from '@/components/app-layout'
import { MOCK_SALES_ORDERS, MOCK_PRODUCTS } from "@/lib/mock-data/sales"
import { MOCK_PRODUCTION_LINES, MOCK_BOMS } from "@/lib/mock-data/production"

function LOInput({ soId }: { soId: string | null }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedSo, setSelectedSo] = useState(soId || '')
    const [selectedProduct, setSelectedProduct] = useState('')

    // Auto-fill if SO is selected
    React.useEffect(() => {
        if (selectedSo) {
            const so = MOCK_SALES_ORDERS.find(s => s.id === selectedSo)
            if (so) {
                // Infer product ID from name map (mock logic)
                const prod = MOCK_PRODUCTS.find(p => p.name === so.product)
                if (prod) setSelectedProduct(prod.id)
            }
        }
    }, [selectedSo])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            router.push('/production')
        }, 1000)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                
                {/* Source Info */}
                <div className="space-y-2">
                    <Label>Source Document</Label>
                    <Select value={selectedSo} onValueChange={setSelectedSo}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Sales Order" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="manual">Manual (No SO)</SelectItem>
                             {MOCK_SALES_ORDERS.filter(s => s.status === 'APPROVED').map(so => (
                                 <SelectItem key={so.id} value={so.id}>{so.id} - {so.customer}</SelectItem>
                             ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Linked Sales Order (Optional)</p>
                </div>

                 <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select defaultValue="Normal">
                        <SelectTrigger>
                            <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="Normal">Normal</SelectItem>
                             <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                    <Label>Product</Label>
                     <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent>
                             {MOCK_PRODUCTS.map(p => (
                                 <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                             ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>BOM Version</Label>
                     <Select defaultValue="v1">
                        <SelectTrigger>
                            <SelectValue placeholder="Select BOM" />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="v1">Standard BOM v1.0</SelectItem>
                             <SelectItem value="v2">Eco BOM v2.0</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Production Info */}
                 <div className="space-y-2">
                    <Label>Target Quantity (Cartons)</Label>
                    <Input type="number" placeholder="e.g. 5000" />
                </div>

                <div className="space-y-2">
                    <Label>Target Line</Label>
                     <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Line" />
                        </SelectTrigger>
                        <SelectContent>
                             {MOCK_PRODUCTION_LINES.map(l => (
                                 <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                             ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" />
                </div>

                <div className="space-y-2">
                    <Label>End Date (Est.)</Label>
                    <Input type="date" />
                </div>

            </div>

             <div className="flex justify-end gap-3 pt-4 border-t">
                <Link href="/production">
                    <Button variant="outline" type="button">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isLoading} className="bg-primary">
                    {isLoading ? 'Creating...' : 'Create Work Order'}
                </Button>
            </div>
        </form>
    )
}

function SuspenseWrapper() {
    const searchParams = useSearchParams()
    const soId = searchParams.get('so')
    return <LOInput soId={soId} />
}

export default function NewWorkOrderPage() {
  return (
    <AppLayout><div className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="flex items-center gap-4">
              <Link href="/production">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Create Work Order</h1>
                <p className="text-sm text-muted-foreground">Initiate new production run</p>
              </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Work Order Details</CardTitle>
                    <CardDescription>Fill in the production parameters below</CardDescription>
                </CardHeader>
                <CardContent>
                    <Suspense fallback={<div>Loading form...</div>}>
                        <SuspenseWrapper />
                    </Suspense>
                </CardContent>
            </Card>

          </div>
        </div></AppLayout>)
}
