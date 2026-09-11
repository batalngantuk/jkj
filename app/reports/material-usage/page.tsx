'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, ArrowRight, Layers } from 'lucide-react'
import AppLayout from '@/components/app-layout'
import { MOCK_TRACEABILITY, getAllMaterials, getTracesByMaterial } from '@/lib/mock-data/traceability'

function fmt(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID')
}

function PayBadge({ status }: { status: 'UNPAID' | 'PARTIAL' | 'PAID' }) {
  const map = {
    PAID:    { label: 'Lunas',   cls: 'bg-green-100 text-green-800 border-green-200' },
    PARTIAL: { label: 'Partial', cls: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    UNPAID:  { label: 'Belum',   cls: 'bg-red-100 text-red-800 border-red-200' },
  }
  const { label, cls } = map[status]
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>
}

export default function MaterialUsagePage() {
  // Tab 1 — Trace FG
  const [fgSearch, setFgSearch] = useState('')
  const [selectedTrace, setSelectedTrace] = useState<string>('')

  // Tab 2 — Pemakaian Bahan Baku
  const [selectedMaterial, setSelectedMaterial] = useState<string>('')

  const allMaterials = useMemo(() => getAllMaterials(), [])

  const filteredTraces = useMemo(() => {
    const q = fgSearch.toLowerCase()
    return MOCK_TRACEABILITY.filter(t =>
      t.productName.toLowerCase().includes(q) ||
      t.woNumber.toLowerCase().includes(q) ||
      t.fgLotNumber.toLowerCase().includes(q)
    )
  }, [fgSearch])

  const trace = useMemo(() =>
    MOCK_TRACEABILITY.find(t => t.id === selectedTrace) ?? null,
    [selectedTrace]
  )

  const totalNilai = useMemo(() =>
    trace ? trace.materialsUsed.reduce((s, m) => s + m.totalCost, 0) : 0,
    [trace]
  )

  const materialTraces = useMemo(() =>
    selectedMaterial ? getTracesByMaterial(selectedMaterial) : [],
    [selectedMaterial]
  )

  const selectedMaterialName = useMemo(() =>
    allMaterials.find(m => m.code === selectedMaterial)?.name ?? '',
    [allMaterials, selectedMaterial]
  )

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Traceability Bahan Baku</h1>
          <p className="text-muted-foreground mt-1">Lacak asal bahan baku per produk jadi, atau lihat pemakaian suatu bahan ke seluruh produksi</p>
        </div>

        <Tabs defaultValue="trace-fg">
          <TabsList>
            <TabsTrigger value="trace-fg" className="gap-2">
              <Package className="h-4 w-4" />Trace Produk Jadi
            </TabsTrigger>
            <TabsTrigger value="usage-rm" className="gap-2">
              <Layers className="h-4 w-4" />Pemakaian Bahan Baku
            </TabsTrigger>
          </TabsList>

          {/* ── TAB 1: FG → RM → PO → Status Bayar ── */}
          <TabsContent value="trace-fg" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pilih Produk Jadi</CardTitle>
                <CardDescription>Cari berdasarkan nama produk, nomor WO, atau lot FG</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Cari produk..."
                    value={fgSearch}
                    onChange={e => { setFgSearch(e.target.value); setSelectedTrace('') }}
                  />
                </div>
                <div className="grid gap-2">
                  {filteredTraces.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTrace(t.id)}
                      className={`w-full text-left rounded-lg border p-3 transition-colors hover:bg-accent ${selectedTrace === t.id ? 'border-primary bg-accent' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{t.productName}</p>
                          <p className="text-xs text-muted-foreground">{t.woNumber} · Lot {t.fgLotNumber} · {t.fgQuantity.toLocaleString('id-ID')} {t.fgUnit}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{t.productionDate}</p>
                      </div>
                    </button>
                  ))}
                  {filteredTraces.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ditemukan</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {trace && (
              <>
                {/* Chain header */}
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="rounded bg-blue-100 text-blue-800 px-2 py-1 font-medium">BC 2.0: {trace.bc20Number}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="rounded bg-slate-100 px-2 py-1">{trace.grNumber}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="rounded bg-slate-100 px-2 py-1">{trace.woNumber}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="rounded bg-green-100 text-green-800 px-2 py-1 font-medium">Lot {trace.fgLotNumber}</span>
                      {trace.pebNumber && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="rounded bg-purple-100 text-purple-800 px-2 py-1">{trace.pebNumber}</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Materials table */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Bahan Baku yang Digunakan</CardTitle>
                        <CardDescription>{trace.productName} · {trace.fgQuantity.toLocaleString('id-ID')} {trace.fgUnit} · Produksi {trace.productionDate}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Total Nilai Bahan Baku</p>
                        <p className="text-lg font-bold">{fmt(totalNilai)}</p>
                        <p className="text-xs text-muted-foreground">
                          {fmt(Math.round(totalNilai / trace.fgQuantity))} / {trace.fgUnit}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Bahan Baku</TableHead>
                          <TableHead>Kode</TableHead>
                          <TableHead className="text-right">Qty Pakai</TableHead>
                          <TableHead className="text-right">Harga Satuan</TableHead>
                          <TableHead className="text-right">Total Nilai</TableHead>
                          <TableHead>No. PO</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Status Bayar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trace.materialsUsed.map((m, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{m.materialName}</TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">{m.materialCode}</TableCell>
                            <TableCell className="text-right">{m.qtyUsed.toLocaleString('id-ID')} {m.unit}</TableCell>
                            <TableCell className="text-right">{fmt(m.unitCost)}</TableCell>
                            <TableCell className="text-right font-medium">{fmt(m.totalCost)}</TableCell>
                            <TableCell className="text-sm font-mono">{m.poNumber}</TableCell>
                            <TableCell className="text-sm">{m.supplier}</TableCell>
                            <TableCell><PayBadge status={m.paymentStatus} /></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Payment summary */}
                    {(() => {
                      const unpaid = trace.materialsUsed.filter(m => m.paymentStatus !== 'PAID').reduce((s, m) => s + m.totalCost, 0)
                      const paid   = trace.materialsUsed.filter(m => m.paymentStatus === 'PAID').reduce((s, m) => s + m.totalCost, 0)
                      return (
                        <div className="mt-4 flex gap-4 text-sm border-t pt-4">
                          <div className="flex-1 rounded-lg bg-green-50 border border-green-200 p-3">
                            <p className="text-xs text-green-700 font-medium">Sudah Dibayar</p>
                            <p className="text-base font-bold text-green-800">{fmt(paid)}</p>
                          </div>
                          <div className="flex-1 rounded-lg bg-red-50 border border-red-200 p-3">
                            <p className="text-xs text-red-700 font-medium">Belum / Partial</p>
                            <p className="text-base font-bold text-red-800">{fmt(unpaid)}</p>
                          </div>
                          <div className="flex-1 rounded-lg bg-slate-50 border p-3">
                            <p className="text-xs text-muted-foreground font-medium">Total</p>
                            <p className="text-base font-bold">{fmt(totalNilai)}</p>
                          </div>
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ── TAB 2: RM → FG ── */}
          <TabsContent value="usage-rm" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Pilih Bahan Baku</CardTitle>
                <CardDescription>Lihat bahan baku ini digunakan untuk produk jadi apa saja</CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                  <SelectTrigger>
                    <SelectValue placeholder="— Pilih bahan baku —" />
                  </SelectTrigger>
                  <SelectContent>
                    {allMaterials.map(m => (
                      <SelectItem key={m.code} value={m.code}>{m.name} ({m.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {selectedMaterial && materialTraces.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Pemakaian: {selectedMaterialName}</CardTitle>
                      <CardDescription>{materialTraces.length} Work Order menggunakan bahan ini</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Total Nilai Terpakai</p>
                      <p className="text-lg font-bold">
                        {fmt(materialTraces.reduce((s, t) => {
                          const m = t.materialsUsed.find(x => x.materialCode === selectedMaterial)
                          return s + (m?.totalCost ?? 0)
                        }, 0))}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Produk Jadi</TableHead>
                        <TableHead>Work Order</TableHead>
                        <TableHead>Lot FG</TableHead>
                        <TableHead className="text-right">Qty FG</TableHead>
                        <TableHead className="text-right">Qty Bahan Pakai</TableHead>
                        <TableHead className="text-right">Nilai Bahan</TableHead>
                        <TableHead>Tanggal Produksi</TableHead>
                        <TableHead>PEB</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {materialTraces.map(t => {
                        const m = t.materialsUsed.find(x => x.materialCode === selectedMaterial)!
                        return (
                          <TableRow key={t.id}>
                            <TableCell className="font-medium">{t.productName}</TableCell>
                            <TableCell className="font-mono text-sm">{t.woNumber}</TableCell>
                            <TableCell className="font-mono text-sm">{t.fgLotNumber}</TableCell>
                            <TableCell className="text-right">{t.fgQuantity.toLocaleString('id-ID')} {t.fgUnit}</TableCell>
                            <TableCell className="text-right font-medium">{m.qtyUsed.toLocaleString('id-ID')} {m.unit}</TableCell>
                            <TableCell className="text-right">{fmt(m.totalCost)}</TableCell>
                            <TableCell className="text-sm">{t.productionDate}</TableCell>
                            <TableCell className="text-sm">
                              {t.pebNumber
                                ? <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">{t.pebNumber}</Badge>
                                : <span className="text-muted-foreground text-xs">Domestik</span>
                              }
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* Aggregated total per unit */}
                  <div className="mt-4 border-t pt-4">
                    {(() => {
                      const totalQtyRM = materialTraces.reduce((s, t) => {
                        const m = t.materialsUsed.find(x => x.materialCode === selectedMaterial)
                        return s + (m?.qtyUsed ?? 0)
                      }, 0)
                      const totalQtyFG = materialTraces.reduce((s, t) => s + t.fgQuantity, 0)
                      const totalVal   = materialTraces.reduce((s, t) => {
                        const m = t.materialsUsed.find(x => x.materialCode === selectedMaterial)
                        return s + (m?.totalCost ?? 0)
                      }, 0)
                      const unit = materialTraces[0].materialsUsed.find(x => x.materialCode === selectedMaterial)!.unit
                      const fgUnit = materialTraces[0].fgUnit
                      return (
                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground">Total Qty Terpakai</p>
                            <p className="font-bold">{totalQtyRM.toLocaleString('id-ID')} {unit}</p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground">Total FG Diproduksi</p>
                            <p className="font-bold">{totalQtyFG.toLocaleString('id-ID')} {fgUnit}</p>
                          </div>
                          <div className="rounded-lg bg-muted/50 p-3">
                            <p className="text-xs text-muted-foreground">Total Nilai Terpakai</p>
                            <p className="font-bold">{fmt(totalVal)}</p>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {selectedMaterial && materialTraces.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  Tidak ada data produksi untuk bahan baku ini
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
