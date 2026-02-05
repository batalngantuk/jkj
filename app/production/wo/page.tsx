'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Plus, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Sidebar from '@/components/sidebar'
import TopNav from '@/components/top-nav'

const PRODUCTS = [
  { id: 1, name: 'Latex Examination Gloves - Size S', code: 'LAT-S' },
  { id: 2, name: 'Latex Examination Gloves - Size M', code: 'LAT-M' },
  { id: 3, name: 'Nitrile Examination Gloves - Size L', code: 'NIT-L' },
]

const BOM_DATA = [
  {
    code: 'LAT-001',
    description: 'Natural Latex',
    perCarton: 2.5,
    unit: 'kg',
    available: 25000,
    status: 'OK',
  },
  {
    code: 'CHEM-101',
    description: 'Sulfur',
    perCarton: 0.05,
    unit: 'kg',
    available: 800,
    status: 'OK',
  },
  {
    code: 'CHEM-102',
    description: 'Zinc Oxide',
    perCarton: 0.03,
    unit: 'kg',
    available: 150,
    status: 'OK',
  },
  {
    code: 'PKG-001',
    description: 'Carton Box',
    perCarton: 1,
    unit: 'pc',
    available: 5000,
    status: 'OK',
  },
]

const SUPERVISORS = [
  { id: 1, name: 'Budi Santoso' },
  { id: 2, name: 'Ahmad Wijaya' },
  { id: 3, name: 'Siti Nurhaliza' },
]

const OPERATORS = [
  { id: 1, name: 'Andi Pratama' },
  { id: 2, name: 'Rini Kusuma' },
  { id: 3, name: 'Doni Setiawan' },
  { id: 4, name: 'Lina Maryanti' },
]

export default function CreateWorkOrderPage() {
  const [soReference, setsoReference] = useState('SO-2026-001')
  const [product, setProduct] = useState('LAT-M')
  const [quantity, setQuantity] = useState('1000')
  const [priority, setPriority] = useState('Normal')
  const [productionLine, setProductionLine] = useState('Line 1')
  const [shift, setShift] = useState('Shift 1')
  const [supervisor, setSupervisor] = useState('')
  const [reserveMaterials, setReserveMaterials] = useState(true)

  const quantityNum = parseInt(quantity) || 1000
  const materialCost = 15750000
  const laborCost = 2400000
  const totalCost = materialCost + laborCost

  const bomData = BOM_DATA.map((item) => ({
    ...item,
    totalRequired: item.perCarton * quantityNum,
  }))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-background to-secondary/5 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Link href="/production">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ChevronLeft className="h-4 w-4" />
                  Back to Production
                </Button>
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Form */}
              <div className="space-y-6 lg:col-span-2">
                {/* Title */}
                <div className="space-y-2 border-b border-border pb-4">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-foreground">
                      Create Work Order
                    </h1>
                    <div className="px-3 py-1 text-xs font-semibold rounded-full bg-secondary text-foreground">
                      WO-2026-NEW
                    </div>
                    <div className="ml-auto px-3 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                      Draft
                    </div>
                  </div>
                </div>

                {/* Section 1: Order Information */}
                <div className="space-y-4 bg-card rounded-lg p-5 border border-border shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <h2 className="font-semibold text-foreground">
                      Order Information
                    </h2>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <Label className="text-sm font-medium">SO Reference</Label>
                      <Select value={soReference} onValueChange={setsoReference}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SO-2026-001">
                            SO-2026-001 - ABC Corporation
                          </SelectItem>
                          <SelectItem value="SO-2026-002">
                            SO-2026-002 - XYZ Global Ltd
                          </SelectItem>
                          <SelectItem value="SO-2026-003">
                            SO-2026-003 - MediSupply Inc
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Product</Label>
                      <Select value={product} onValueChange={setProduct}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCTS.map((p) => (
                            <SelectItem key={p.id} value={p.code}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Target Quantity (cartons)
                        </Label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">
                          Priority
                        </Label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Normal">Normal</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">
                        Scheduled Production Date
                      </Label>
                      <Input type="date" className="mt-1" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Bill of Materials */}
                <div className="space-y-4 bg-card rounded-lg p-5 border border-border shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <h2 className="font-semibold text-foreground">
                      Bill of Material (BOM)
                    </h2>
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-secondary">
                        <TableRow>
                          <TableHead className="text-xs font-semibold">
                            Material Code
                          </TableHead>
                          <TableHead className="text-xs font-semibold">
                            Description
                          </TableHead>
                          <TableHead className="text-right text-xs font-semibold">
                            Per Carton
                          </TableHead>
                          <TableHead className="text-right text-xs font-semibold">
                            Total Required
                          </TableHead>
                          <TableHead className="text-right text-xs font-semibold">
                            Available
                          </TableHead>
                          <TableHead className="text-center text-xs font-semibold">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bomData.map((item) => (
                          <TableRow key={item.code}>
                            <TableCell className="font-mono text-sm font-medium">
                              {item.code}
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.description}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {item.perCarton} {item.unit}
                            </TableCell>
                            <TableCell className="text-right text-sm font-semibold">
                              {item.totalRequired} {item.unit}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {item.available} {item.unit}
                            </TableCell>
                            <TableCell className="text-center">
                              {item.status === 'OK' ? (
                                <div className="flex items-center justify-center gap-1">
                                  <Check className="h-4 w-4 text-green-600" />
                                  <span className="text-xs font-medium text-green-600">
                                    OK
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1">
                                  <AlertCircle className="h-4 w-4 text-red-600" />
                                  <span className="text-xs font-medium text-red-600">
                                    Low
                                  </span>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-end border-t border-border pt-3">
                    <div className="space-y-1 text-right">
                      <div className="text-sm text-muted-foreground">
                        Total Material Cost:
                      </div>
                      <div className="text-lg font-bold text-foreground">
                        Rp {materialCost.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Production Assignment */}
                <div className="space-y-4 bg-card rounded-lg p-5 border border-border shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <h2 className="font-semibold text-foreground">
                      Production Assignment
                    </h2>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Production Line
                      </Label>
                      <Select
                        value={productionLine}
                        onValueChange={setProductionLine}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Line 1">Line 1</SelectItem>
                          <SelectItem value="Line 2">Line 2</SelectItem>
                          <SelectItem value="Line 3">Line 3</SelectItem>
                          <SelectItem value="Line 4">Line 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Shift</Label>
                      <div className="mt-2 space-y-2">
                        {[
                          { value: 'Shift 1', time: '06:00 - 14:00' },
                          { value: 'Shift 2', time: '14:00 - 22:00' },
                          { value: 'Shift 3', time: '22:00 - 06:00' },
                        ].map((s) => (
                          <label
                            key={s.value}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="shift"
                              value={s.value}
                              checked={shift === s.value}
                              onChange={(e) => setShift(e.target.value)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">
                              {s.value} ({s.time})
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Supervisor</Label>
                      <Select value={supervisor} onValueChange={setSupervisor}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUPERVISORS.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Operators</Label>
                      <div className="mt-2 space-y-2">
                        {OPERATORS.map((op) => (
                          <label
                            key={op.id}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              defaultChecked={op.id <= 2}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{op.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 4: Material Reservation */}
                <div className="space-y-4 bg-card rounded-lg p-5 border border-border shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      4
                    </div>
                    <h2 className="font-semibold text-foreground">
                      Material Reservation
                    </h2>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reserveMaterials}
                        onChange={(e) => setReserveMaterials(e.target.checked)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">
                        Reserve materials now
                      </span>
                    </label>

                    {reserveMaterials && (
                      <div>
                        <Label className="text-sm font-medium">
                          Storage Location for Finished Goods
                        </Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="warehouse-a">
                              Warehouse A - Zone FG-01
                            </SelectItem>
                            <SelectItem value="warehouse-b">
                              Warehouse B - Zone FG-02
                            </SelectItem>
                            <SelectItem value="warehouse-c">
                              Warehouse C - Zone FG-03
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link href="/production">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                  <Button variant="outline">Save as Draft</Button>
                  <Button className="bg-primary hover:bg-primary/90 gap-2">
                    <Plus className="h-4 w-4" />
                    Reserve Materials & Create WO
                  </Button>
                </div>
              </div>

              {/* Preview Summary Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6 border-border shadow-md">
                  <div className="p-5 space-y-4">
                    <h3 className="font-semibold text-foreground">
                      Order Summary
                    </h3>

                    <div className="space-y-3 border-t border-border pt-4">
                      <div>
                        <div className="text-xs text-muted-foreground">
                          WO Number
                        </div>
                        <div className="font-mono text-sm font-bold">
                          WO-2026-NEW
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">
                          Product
                        </div>
                        <div className="text-sm font-medium">
                          {PRODUCTS.find((p) => p.code === product)?.name ||
                            'Select product'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">
                          Quantity
                        </div>
                        <div className="text-sm font-medium">
                          {quantityNum.toLocaleString()} cartons
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">
                          Est. Duration
                        </div>
                        <div className="text-sm font-medium">8 hours</div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground">
                          Est. Completion
                        </div>
                        <div className="text-sm font-medium">
                          06 Feb 2026 14:00
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-border pt-4">
                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          Material Cost
                        </span>
                        <span className="text-xs font-medium">
                          Rp {materialCost.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-xs text-muted-foreground">
                          Labor Cost
                        </span>
                        <span className="text-xs font-medium">
                          Rp {laborCost.toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-border pt-3">
                        <span className="text-sm font-semibold">
                          Total Cost
                        </span>
                        <span className="text-lg font-bold text-primary">
                          Rp {totalCost.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
