'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { ArrowUpFromLine, Package, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import AppLayout from '@/components/app-layout'
import { useTempStorage, type TempStorageItem } from '@/lib/store/useTempStorage'

function fmt(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }

export default function TempStoragePage() {
  const { items, releaseItem, refresh } = useTempStorage()

  const inStorage  = useMemo(() => items.filter(i => i.status === 'IN_STORAGE'), [items])
  const released   = useMemo(() => items.filter(i => i.status === 'RELEASED'), [items])

  const totalValue = useMemo(() => inStorage.reduce((s, i) => s + i.totalValue, 0), [inStorage])

  // Release dialog
  const [releaseTarget, setReleaseTarget] = useState<TempStorageItem | null>(null)
  const [releaseRef, setReleaseRef] = useState('')
  const [releaseQty, setReleaseQty] = useState('')
  const [releaseNote, setReleaseNote] = useState('')

  function openRelease(item: TempStorageItem) {
    setReleaseTarget(item)
    setReleaseRef('')
    setReleaseQty(String(item.qty))
    setReleaseNote('')
  }

  function handleRelease() {
    if (!releaseTarget || !releaseRef) return
    releaseItem(releaseTarget.id, releaseRef, Number(releaseQty))
    setReleaseTarget(null)
    refresh()
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Stok Sementara</h1>
          <p className="text-muted-foreground mt-1">Barang dari PO yang dibatalkan setelah barang diterima — tersimpan sampai ada permintaan ekspor serupa</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Dalam Penyimpanan</p>
              <p className="text-2xl font-bold">{inStorage.length}</p>
              <p className="text-xs text-muted-foreground">item</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Nilai Tersimpan</p>
              <p className="text-2xl font-bold">{fmt(totalValue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Sudah Dirilis</p>
              <p className="text-2xl font-bold">{released.length}</p>
              <p className="text-xs text-muted-foreground">item</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="in-storage">
          <TabsList>
            <TabsTrigger value="in-storage" className="gap-2">
              <Clock className="h-4 w-4" />Dalam Penyimpanan
              {inStorage.length > 0 && <Badge className="ml-1 h-4 min-w-4 text-xs px-1">{inStorage.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="released" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />Sudah Dirilis
            </TabsTrigger>
          </TabsList>

          {/* ── Tab IN STORAGE ── */}
          <TabsContent value="in-storage" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Barang Dalam Stok Sementara</CardTitle>
                <CardDescription>Klik "Rilis untuk Ekspor" untuk mengeluarkan barang ke order ekspor atau SO baru</CardDescription>
              </CardHeader>
              <CardContent>
                {inStorage.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Belum ada barang dalam stok sementara.</p>
                    <p className="text-xs mt-1">Barang akan masuk sini saat PO di-cancel dan opsi "simpan ke stok sementara" dipilih.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Material</TableHead>
                        <TableHead>Kode</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Nilai</TableHead>
                        <TableHead>Lokasi</TableHead>
                        <TableHead>Asal PO</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Tgl Cancel</TableHead>
                        <TableHead>Alasan</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inStorage.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.materialName}</TableCell>
                          <TableCell className="font-mono text-xs">{item.materialCode}</TableCell>
                          <TableCell className="text-right">{item.qty.toLocaleString('id-ID')} {item.unit}</TableCell>
                          <TableCell className="text-right">{fmt(item.totalValue)}</TableCell>
                          <TableCell className="text-sm">{item.location}</TableCell>
                          <TableCell className="font-mono text-xs">{item.sourcePoId}</TableCell>
                          <TableCell className="text-sm">{item.supplier}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.cancelledDate}</TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-32 truncate">{item.cancelReason || '-'}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" className="gap-1 text-xs h-7" onClick={() => openRelease(item)}>
                              <ArrowUpFromLine className="h-3 w-3" />Rilis
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab RELEASED ── */}
          <TabsContent value="released" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Barang yang Sudah Dirilis</CardTitle>
              </CardHeader>
              <CardContent>
                {released.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Belum ada barang yang dirilis</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Qty Dirilis</TableHead>
                        <TableHead className="text-right">Nilai</TableHead>
                        <TableHead>Asal PO</TableHead>
                        <TableHead>Dirilis ke</TableHead>
                        <TableHead>Tgl Rilis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {released.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.materialName}</TableCell>
                          <TableCell className="text-right">{(item.releasedQty ?? item.qty).toLocaleString('id-ID')} {item.unit}</TableCell>
                          <TableCell className="text-right">{fmt(item.totalValue)}</TableCell>
                          <TableCell className="font-mono text-xs">{item.sourcePoId}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
                              {item.releaseRef}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{item.releaseDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Dialog Release ── */}
      <Dialog open={!!releaseTarget} onOpenChange={open => { if (!open) setReleaseTarget(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5" />Rilis untuk Ekspor / Order Baru
            </DialogTitle>
          </DialogHeader>

          {releaseTarget && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Material</span>
                  <span className="font-medium">{releaseTarget.materialName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Qty Tersedia</span>
                  <span>{releaseTarget.qty.toLocaleString('id-ID')} {releaseTarget.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lokasi</span>
                  <span>{releaseTarget.location}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>No. SO / PEB Tujuan <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="cth: SO-2026-007 atau PEB-2026-005"
                  value={releaseRef}
                  onChange={e => setReleaseRef(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Qty yang Dirilis</Label>
                <Input
                  type="number"
                  value={releaseQty}
                  onChange={e => setReleaseQty(e.target.value)}
                />
                {Number(releaseQty) > releaseTarget.qty && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />Melebihi qty tersedia
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Catatan</Label>
                <Textarea rows={2} placeholder="Catatan pengeluaran..." value={releaseNote} onChange={e => setReleaseNote(e.target.value)} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseTarget(null)}>Batal</Button>
            <Button
              onClick={handleRelease}
              disabled={!releaseRef || !releaseQty || (releaseTarget ? Number(releaseQty) > releaseTarget.qty : false)}
            >
              <ArrowUpFromLine className="h-4 w-4 mr-2" />Konfirmasi Rilis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
