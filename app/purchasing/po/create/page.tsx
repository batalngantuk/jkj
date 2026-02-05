'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'
import { MOCK_SUPPLIERS } from "@/lib/mock-data/purchasing"

export default function CreatePOPage() {
  const router = useRouter()
  const [items, setItems] = useState([{ id: 1, name: '', qty: 0, unit: '', price: 0 }])
  const [loading, setLoading] = useState(false)

  const addItem = () => {
    setItems([...items, { id: items.length + 1, name: '', qty: 0, unit: '', price: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items]
    // @ts-ignore
    newItems[index][field] = value
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((acc, item) => acc + (item.qty * item.price), 0)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
        setLoading(false)
        router.push('/purchasing/po')
    }, 1000)
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="flex items-center gap-4">
              <Link href="/purchasing/po">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Draft Purchase Order</h1>
                <p className="text-sm text-muted-foreground">Create a new order for approval</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Order Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <Label>Supplier</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Supplier" />
                                </SelectTrigger>
                                <SelectContent>
                                     {MOCK_SUPPLIERS.map(s => (
                                         <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                     ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Expected Delivery Date</Label>
                            <Input type="date" />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>Notes</Label>
                            <Input placeholder="Additional instructions..." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                        <CardTitle>Line Items</CardTitle>
                        <Button type="button" size="sm" onClick={addItem} className="gap-2">
                            <Plus className="h-4 w-4" /> Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                         <Table>
                             <TableHeader>
                                 <TableRow>
                                     <TableHead className="w-[40%]">Item Name</TableHead>
                                     <TableHead>Quantity</TableHead>
                                     <TableHead>Unit</TableHead>
                                     <TableHead>Unit Price (Rp)</TableHead>
                                     <TableHead className="text-right">Total (Rp)</TableHead>
                                     <TableHead className="w-[50px]"></TableHead>
                                 </TableRow>
                             </TableHeader>
                             <TableBody>
                                 {items.map((item, index) => (
                                     <TableRow key={index}>
                                         <TableCell>
                                             <Input 
                                                 placeholder="Item Name" 
                                                 value={item.name}
                                                 onChange={(e) => updateItem(index, 'name', e.target.value)}
                                             />
                                         </TableCell>
                                         <TableCell>
                                             <Input 
                                                 type="number" 
                                                 placeholder="0" 
                                                 value={item.qty}
                                                 onChange={(e) => updateItem(index, 'qty', parseInt(e.target.value))}
                                             />
                                         </TableCell>
                                         <TableCell>
                                             <Select onValueChange={(v) => updateItem(index, 'unit', v)}>
                                                 <SelectTrigger><SelectValue placeholder="Unit" /></SelectTrigger>
                                                 <SelectContent>
                                                     <SelectItem value="kg">kg</SelectItem>
                                                     <SelectItem value="pcs">pcs</SelectItem>
                                                     <SelectItem value="ctn">ctn</SelectItem>
                                                     <SelectItem value="liter">liter</SelectItem>
                                                 </SelectContent>
                                             </Select>
                                         </TableCell>
                                         <TableCell>
                                              <Input 
                                                 type="number" 
                                                 placeholder="0" 
                                                 value={item.price}
                                                 onChange={(e) => updateItem(index, 'price', parseInt(e.target.value))}
                                             />
                                         </TableCell>
                                         <TableCell className="text-right font-medium">
                                             {(item.qty * item.price).toLocaleString()}
                                         </TableCell>
                                         <TableCell>
                                             <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => removeItem(index)}
                                             >
                                                 <Trash2 className="h-4 w-4" />
                                             </Button>
                                         </TableCell>
                                     </TableRow>
                                 ))}
                             </TableBody>
                         </Table>
                         <div className="p-4 flex justify-end bg-secondary/10">
                             <div className="text-right">
                                 <p className="text-sm text-muted-foreground mr-2">Grand Total</p>
                                 <p className="text-2xl font-bold">Rp {calculateTotal().toLocaleString()}</p>
                             </div>
                         </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                     <Link href="/purchasing/po">
                        <Button type="button" variant="outline">Discard Draft</Button>
                     </Link>
                     <Button type="submit" disabled={loading} className="bg-primary min-w-[150px]">
                         {loading ? 'Submitting...' : 'Submit for Approval'}
                     </Button>
                </div>
            </form>

          </div>
        </main>
      </div>
    </div>
  )
}
