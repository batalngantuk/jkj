'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Package, Truck, ArrowDownLeft, ArrowUpRight, Search, AlertTriangle, Layers, PackageOpen, Factory, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'

import { DataTable } from '@/components/shared/data-table'
import { MOCK_INVENTORY, MOCK_TRANSACTIONS, type InventoryItem } from "@/lib/mock-data/warehouse"
import { AlertBadge } from "@/components/shared/alert-badge"
import { useStock, useSubkontrak } from '@/lib/store/hooks'

export default function WarehouseDashboard() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterFasilitas, setFilterFasilitas] = useState('all')

  const { stock } = useStock()
  const { records: subkonRecords } = useSubkontrak()

  // WIP stock dari live store
  const wipStock = stock.filter(s => s.category === 'WIP')

  // Hasil subkon yang sudah masuk kembali (status Hasil Diterima atau Selesai)
  const subkonDiterima = subkonRecords.filter(r =>
    r.status === 'Hasil Diterima' || r.status === 'Selesai'
  )

  // F3: gabung MOCK_INVENTORY dengan live stock dari GR (yang belum ada di MOCK)
  const liveInventoryExtra: InventoryItem[] = stock
    .filter(s => s.category !== 'WIP' && !MOCK_INVENTORY.find(m => m.code === s.materialCode))
    .map((s, i) => {
      const catMap: Record<string, InventoryItem['category']> = {
        BB: 'Raw Material', FG: 'Finished Goods', Packaging: 'Raw Material',
      }
      const qty = s.qtyOnHand
      const status: InventoryItem['status'] = qty === 0 ? 'Critical' : qty < 50 ? 'Low Stock' : 'In Stock'
      return {
        id: `LIVE-${i}`,
        code: s.materialCode,
        name: s.materialName,
        category: catMap[s.category] || 'Raw Material',
        quantity: qty,
        unit: s.unit,
        location: s.location,
        minStock: 0,
        maxStock: Math.max(qty * 2, 1),
        status,
        value: 0,
        lastUpdated: s.lastUpdated,
        fasilitas: (s.fasilitas as 'KITE' | 'Non-KITE') || 'KITE',
      }
    })
  const allInventory: InventoryItem[] = [...MOCK_INVENTORY, ...liveInventoryExtra]

  const lowStockCount = allInventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length
  const totalValue = MOCK_INVENTORY.reduce((acc, curr) => acc + curr.value, 0)

  const filteredInventory = allInventory.filter(item => {
    const matchSearch = search === '' ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.location.toLowerCase().includes(search.toLowerCase())
    const matchCategory = filterCategory === 'all' || item.category === filterCategory
    const matchStatus = filterStatus === 'all' || item.status === filterStatus
    const matchFasilitas = filterFasilitas === 'all' || item.fasilitas === filterFasilitas
    return matchSearch && matchCategory && matchStatus && matchFasilitas
  })

  const inventoryColumns = [
    {
       header: "Code",
       accessorKey: "code" as keyof typeof MOCK_INVENTORY[0],
       cell: (item: typeof MOCK_INVENTORY[0]) => <span className="font-mono text-xs font-medium">{item.code}</span>
    },
    { header: "Item Name", accessorKey: "name" as keyof typeof MOCK_INVENTORY[0] },
    { header: "Category", accessorKey: "category" as keyof typeof MOCK_INVENTORY[0] },
    {
       header: "Stock Level",
       cell: (item: typeof MOCK_INVENTORY[0]) => (
           <div className="w-32">
               <div className="flex justify-between text-xs mb-1">
                   <span>{item.quantity.toLocaleString()} {item.unit}</span>
                   <span className="text-muted-foreground">{Math.round((item.quantity / item.maxStock) * 100)}%</span>
               </div>
               <Progress 
                  value={(item.quantity / item.maxStock) * 100} 
                  className={`h-1.5 ${item.status === 'Critical' ? 'bg-red-100' : ''}`} 
                  // Note: creating custom colored progress requires more complex setup or inline styles/classes on the indicator itself if using shadcn default.
                  // For now reliance on the Badge for status is sufficient visual cue.
               />
           </div>
       )
    },
    {
       header: "Fasilitas",
       accessorKey: "fasilitas" as keyof typeof MOCK_INVENTORY[0],
       cell: (item: typeof MOCK_INVENTORY[0]) => (
           <span className={`text-xs px-2 py-1 rounded-full font-medium ${
             item.fasilitas === 'KITE' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700'
           }`}>
             {item.fasilitas}
           </span>
       )
    },
    { header: "Location", accessorKey: "location" as keyof typeof MOCK_INVENTORY[0] },
    {
       header: "Status",
       accessorKey: "status" as keyof typeof MOCK_INVENTORY[0],
       cell: (item: typeof MOCK_INVENTORY[0]) => {
           let type: 'success' | 'warning' | 'critical' | 'info' = 'success'
           if (item.status === 'Low Stock') type = 'warning'
           if (item.status === 'Critical') type = 'critical'
           if (item.status === 'Overstock') type = 'info'
           return <AlertBadge type={type} message={item.status} />
       }
    }
  ]

  return (
    <AppLayout><div className="p-6">
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Warehouse Overview</h1>
                <p className="text-sm text-muted-foreground">Inventory management and stock movements</p>
              </div>
              <div className="flex gap-3">
                 <Link href="/warehouse/inbound">
                    <Button variant="outline" className="gap-2">
                        <ArrowDownLeft className="h-4 w-4" />
                        Inbound (Receiving)
                    </Button>
                 </Link>
                 <Link href="/warehouse/outbound">
                    <Button variant="outline" className="gap-2">
                        <ArrowUpRight className="h-4 w-4" />
                        Outbound (Shipping)
                    </Button>
                 </Link>
                 <Link href="/warehouse/issue">
                    <Button variant="outline" className="gap-2">
                        <PackageOpen className="h-4 w-4" />
                        Pengeluaran BB
                    </Button>
                 </Link>
                 <Link href="/warehouse/stock-adjustment">
                   <Button className="bg-primary hover:bg-primary/90 gap-2">
                     <Layers className="h-4 w-4" />
                     Stock Adjustment
                   </Button>
                 </Link>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                           <p className="text-2xl font-bold">Rp {(totalValue / 1000000).toFixed(0)} M</p>
                       </div>
                       <Package className="h-8 w-8 text-blue-500" />
                   </CardContent>
               </Card>
               <Card className={lowStockCount > 0 ? "border-red-200 bg-red-50/30" : ""}>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Low Stock Alerts</p>
                           <p className={`text-2xl font-bold ${lowStockCount > 0 ? "text-red-600" : ""}`}>{lowStockCount} Items</p>
                       </div>
                       <AlertTriangle className={`h-8 w-8 ${lowStockCount > 0 ? "text-red-500" : "text-gray-400"}`} />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Pending Inbound</p>
                           <p className="text-2xl font-bold">5 POs</p>
                       </div>
                       <ArrowDownLeft className="h-8 w-8 text-green-500" />
                   </CardContent>
               </Card>
               <Card>
                   <CardContent className="p-6 flex items-center justify-between">
                       <div className="space-y-1">
                           <p className="text-sm text-muted-foreground">Pending Outbound</p>
                           <p className="text-2xl font-bold">3 SOs</p>
                       </div>
                       <Truck className="h-8 w-8 text-orange-500" />
                   </CardContent>
               </Card>
            </div>

            {/* Main Inventory Table */}
            <Card className="flex-1">
                <CardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <CardTitle>Current Inventory</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama, kode, lokasi..."
                                    className="pl-8 w-56"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Kategori</SelectItem>
                                    <SelectItem value="Raw Material">Raw Material</SelectItem>
                                    <SelectItem value="Work in Progress">Work in Progress</SelectItem>
                                    <SelectItem value="Finished Goods">Finished Goods</SelectItem>
                                    <SelectItem value="Spare Part">Spare Part</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="In Stock">In Stock</SelectItem>
                                    <SelectItem value="Low Stock">Low Stock</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                    <SelectItem value="Overstock">Overstock</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterFasilitas} onValueChange={setFilterFasilitas}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="Fasilitas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="KITE">KITE</SelectItem>
                                    <SelectItem value="Non-KITE">Non-KITE</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {(search || filterCategory !== 'all' || filterStatus !== 'all') && (
                        <p className="text-xs text-muted-foreground mt-1">
                            Menampilkan {filteredInventory.length} dari {MOCK_INVENTORY.length} item
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={filteredInventory}
                        columns={inventoryColumns}
                    />
                </CardContent>
            </Card>

            {/* Gudang WIP */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Factory className="h-5 w-5 text-orange-500" />
                        <CardTitle>Gudang WIP (Work in Progress)</CardTitle>
                        <Badge variant="outline" className="ml-auto text-xs">{wipStock.length} item</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {wipStock.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Tidak ada stok WIP saat ini</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Kode Material</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead className="text-right">Qty On Hand</TableHead>
                                    <TableHead className="text-right">Qty Reserved</TableHead>
                                    <TableHead className="text-right">Qty Available</TableHead>
                                    <TableHead>Satuan</TableHead>
                                    <TableHead>Lokasi</TableHead>
                                    <TableHead>Last Update</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {wipStock.map(s => (
                                    <TableRow key={s.materialCode}>
                                        <TableCell className="font-mono text-xs font-medium">{s.materialCode}</TableCell>
                                        <TableCell className="text-sm">{s.materialName}</TableCell>
                                        <TableCell className="text-right font-medium">{s.qtyOnHand.toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="text-right text-orange-600">{s.qtyReserved.toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="text-right text-green-700 font-semibold">{s.qtyAvailable.toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="text-sm">{s.unit}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground">{s.location}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{s.lastUpdated}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Gudang Hasil Subkon */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-purple-500" />
                        <CardTitle>Gudang Hasil Subkon</CardTitle>
                        <Badge variant="outline" className="ml-auto text-xs">{subkonDiterima.length} job selesai</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {subkonDiterima.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-6">Belum ada hasil subkon yang diterima</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Job No</TableHead>
                                    <TableHead>Subkontraktor</TableHead>
                                    <TableHead>Deskripsi Pekerjaan</TableHead>
                                    <TableHead>Tgl Selesai</TableHead>
                                    <TableHead>Material Dikirim</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subkonDiterima.map(r => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono text-xs font-medium">{r.id}</TableCell>
                                        <TableCell className="text-sm font-medium">{r.namaSubkon}</TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{r.deskripsiPekerjaan}</TableCell>
                                        <TableCell className="text-sm whitespace-nowrap">{r.tglSelesaiAktual !== '-' ? r.tglSelesaiAktual : r.targetSelesai}</TableCell>
                                        <TableCell>
                                            <div className="space-y-0.5">
                                                {r.items.slice(0, 2).map((item, i) => (
                                                    <p key={i} className="text-xs text-muted-foreground">
                                                        {item.kodeBB} — {item.qtyKirim.toLocaleString('id-ID')} {item.satuanBB}
                                                    </p>
                                                ))}
                                                {r.items.length > 2 && (
                                                    <p className="text-xs text-muted-foreground">+{r.items.length - 2} item lagi</p>
                                                )}
                                                {r.items.length === 0 && <p className="text-xs text-muted-foreground">—</p>}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                                                r.status === 'Selesai'
                                                    ? 'bg-green-50 text-green-700 border-green-300'
                                                    : 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                            }`}>
                                                {r.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Recent Movements */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Movements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {MOCK_TRANSACTIONS.map(trx => (
                            <div key={trx.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        h-10 w-10 rounded-full flex items-center justify-center
                                        ${trx.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}
                                    `}>
                                        {trx.type === 'IN' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium">{trx.itemId} <span className="text-muted-foreground">• {trx.refNumber}</span></p>
                                        <p className="text-xs text-muted-foreground">{trx.date} • {trx.notes}</p>
                                    </div>
                                </div>
                                <div className="font-bold">
                                    {trx.type === 'IN' ? '+' : '-'}{trx.quantity.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

          </div>
        </div></AppLayout>)
}
