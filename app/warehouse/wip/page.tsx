'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ArrowDownToLine, ArrowUpFromLine, PackageSearch, AlertTriangle } from 'lucide-react'
import AppLayout from '@/components/app-layout'
import { useStock } from '@/lib/store/useStock'
import { MOCK_WORK_ORDERS } from '@/lib/mock-data/production'

const TAHAP_PROSES = [
  'Post-Mixing',
  'Post-Dipping',
  'Post-Leaching',
  'Post-Vulcanizing',
  'Post-Stripping',
  'Post-QC',
  'Lainnya',
]

const LOKASI_WIP = ['Gudang WIP-1', 'Gudang WIP-2', 'Gudang WIP-3', 'Mixing Room A', 'Mixing Room B', 'Line A WIP', 'Line B WIP']

const SATUAN_WIP = ['kg', 'mtr', 'batch', 'liter', 'pcs', 'ctn', 'roll', 'sf', 'yard', 'tne', 'pce', 'st', 'ftk', 'kgm']

function fmt(n: number) { return n.toLocaleString('id-ID') }

export default function WIPWarehousePage() {
  const { stock, movements, addStock, deductStock, refresh } = useStock()

  const wipStock = useMemo(() => stock.filter(s => s.category === 'WIP'), [stock])
  const wipMovements = useMemo(() =>
    movements.filter(m => m.transactionType === 'WIP_IN' || m.transactionType === 'WIP_OUT')
      .slice().reverse().slice(0, 30),
    [movements]
  )

  // Terima WIP dialog
  const [showTerima, setShowTerima] = useState(false)
  const [terimaForm, setTerimaForm] = useState({
    kode: '', nama: '', qty: '', satuan: 'kg',
    woRef: '', tahap: '', lokasi: 'Gudang WIP-1', catatan: '',
  })

  // Keluarkan WIP dialog
  const [showKeluar, setShowKeluar] = useState(false)
  const [keluarForm, setKeluarForm] = useState({
    kode: '', qty: '', woTujuan: '', supplier: '', catatan: '',
  })

  function handleTerima() {
    const qty = Number(terimaForm.qty)
    if (!terimaForm.nama || !qty || !terimaForm.tahap) return
    const kode = terimaForm.kode || `WIP-${Date.now()}`
    addStock(kode, terimaForm.nama, qty, terimaForm.woRef || '-', 'WO', 'WIP', terimaForm.satuan, terimaForm.lokasi)
    setShowTerima(false)
    setTerimaForm({ kode: '', nama: '', qty: '', satuan: 'kg', woRef: '', tahap: '', lokasi: 'Gudang WIP-1', catatan: '' })
    refresh()
  }

  function handleKeluar() {
    const qty = Number(keluarForm.qty)
    if (!keluarForm.kode || !qty) return
    deductStock(keluarForm.kode, qty, keluarForm.woTujuan || '-', 'WO', 'WIP_OUT')
    setShowKeluar(false)
    setKeluarForm({ kode: '', qty: '', woTujuan: '', supplier: '', catatan: '' })
    refresh()
  }

  const selectedWIPItem = useMemo(() =>
    wipStock.find(s => s.materialCode === keluarForm.kode) ?? null,
    [wipStock, keluarForm.kode]
  )

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gudang WIP</h1>
            <p className="text-muted-foreground mt-1">Penyimpanan bahan setengah jadi — terpisah dari bahan baku dan produk jadi</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowTerima(true)} className="gap-2">
              <ArrowDownToLine className="h-4 w-4" />Terima dari Produksi
            </Button>
            <Button variant="outline" onClick={() => setShowKeluar(true)} className="gap-2">
              <ArrowUpFromLine className="h-4 w-4" />Keluarkan ke Proses
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Item WIP</p>
              <p className="text-2xl font-bold">{wipStock.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Qty Tersedia</p>
              <p className="text-2xl font-bold">{fmt(wipStock.reduce((s, i) => s + i.qtyAvailable, 0))}</p>
              <p className="text-xs text-muted-foreground">unit (multi-satuan)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Qty Direservasi</p>
              <p className="text-2xl font-bold">{fmt(wipStock.reduce((s, i) => s + i.qtyReserved, 0))}</p>
              <p className="text-xs text-muted-foreground">untuk proses berikutnya</p>
            </CardContent>
          </Card>
        </div>

        {/* Stock table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <PackageSearch className="h-4 w-4" />Stok Bahan Setengah Jadi
            </CardTitle>
            <CardDescription>Semua item WIP yang sedang tersimpan — terpisah dari Gudang BB dan Gudang FG</CardDescription>
          </CardHeader>
          <CardContent>
            {wipStock.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada item WIP. Terima hasil produksi untuk mulai.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Bahan Setengah Jadi</TableHead>
                    <TableHead className="text-right">Qty On Hand</TableHead>
                    <TableHead className="text-right">Qty Direservasi</TableHead>
                    <TableHead className="text-right">Qty Tersedia</TableHead>
                    <TableHead>Lokasi</TableHead>
                    <TableHead>Fasilitas</TableHead>
                    <TableHead>Update</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wipStock.map(item => {
                    const low = item.qtyAvailable === 0
                    return (
                      <TableRow key={item.materialCode}>
                        <TableCell className="font-mono text-xs">{item.materialCode}</TableCell>
                        <TableCell className="font-medium">{item.materialName}</TableCell>
                        <TableCell className="text-right">{fmt(item.qtyOnHand)} {item.unit}</TableCell>
                        <TableCell className="text-right text-yellow-600">{fmt(item.qtyReserved)} {item.unit}</TableCell>
                        <TableCell className="text-right font-medium">{fmt(item.qtyAvailable)} {item.unit}</TableCell>
                        <TableCell className="text-sm">{item.location}</TableCell>
                        <TableCell>
                          {item.fasilitas && (
                            <Badge variant="outline" className={item.fasilitas === 'KITE' ? 'border-blue-300 text-blue-700' : ''}>
                              {item.fasilitas}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.lastUpdated}</TableCell>
                        <TableCell>
                          {low
                            ? <span className="inline-flex items-center gap-1 text-xs text-red-600"><AlertTriangle className="h-3 w-3" />Habis</span>
                            : <span className="text-xs text-green-600">Tersedia</span>
                          }
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Riwayat Transaksi WIP</CardTitle>
          </CardHeader>
          <CardContent>
            {wipMovements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada transaksi WIP</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Referensi</TableHead>
                    <TableHead className="text-right">Masuk</TableHead>
                    <TableHead className="text-right">Keluar</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wipMovements.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{m.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={m.transactionType === 'WIP_IN' ? 'border-green-300 text-green-700 bg-green-50' : 'border-orange-300 text-orange-700 bg-orange-50'}>
                          {m.transactionType === 'WIP_IN' ? 'WIP IN' : 'WIP OUT'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{m.materialName}</TableCell>
                      <TableCell className="font-mono text-xs">{m.referenceNumber}</TableCell>
                      <TableCell className="text-right text-green-700">{m.quantityIn > 0 ? `+${fmt(m.quantityIn)}` : '-'}</TableCell>
                      <TableCell className="text-right text-red-700">{m.quantityOut > 0 ? `-${fmt(m.quantityOut)}` : '-'}</TableCell>
                      <TableCell className="text-right font-medium">{fmt(m.runningBalance)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Dialog Terima WIP ── */}
      <Dialog open={showTerima} onOpenChange={setShowTerima}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Terima Bahan Setengah Jadi dari Produksi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kode WIP <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                <Input placeholder="WIP-COMPOUND-LATEX" value={terimaForm.kode} onChange={e => setTerimaForm(p => ({ ...p, kode: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Referensi WO <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                <Select value={terimaForm.woRef} onValueChange={v => setTerimaForm(p => ({ ...p, woRef: v }))}>
                  <SelectTrigger><SelectValue placeholder="— Pilih WO —" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="-">— Tanpa WO —</SelectItem>
                    {MOCK_WORK_ORDERS.map(wo => (
                      <SelectItem key={wo.id} value={wo.id}>{wo.id} — {wo.product}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Nama Bahan Setengah Jadi <span className="text-red-500">*</span></Label>
              <Input placeholder="cth: Latex Compound (Post-Mixing)" value={terimaForm.nama} onChange={e => setTerimaForm(p => ({ ...p, nama: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tahap Proses <span className="text-red-500">*</span></Label>
                <Select value={terimaForm.tahap} onValueChange={v => setTerimaForm(p => ({ ...p, tahap: v }))}>
                  <SelectTrigger><SelectValue placeholder="— Pilih tahap —" /></SelectTrigger>
                  <SelectContent>
                    {TAHAP_PROSES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Lokasi Penyimpanan</Label>
                <Select value={terimaForm.lokasi} onValueChange={v => setTerimaForm(p => ({ ...p, lokasi: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LOKASI_WIP.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Quantity <span className="text-red-500">*</span></Label>
                <Input type="number" placeholder="0" value={terimaForm.qty} onChange={e => setTerimaForm(p => ({ ...p, qty: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Satuan</Label>
                <Select value={terimaForm.satuan} onValueChange={v => setTerimaForm(p => ({ ...p, satuan: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SATUAN_WIP.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea placeholder="Catatan kondisi, kualitas, dll..." rows={2} value={terimaForm.catatan} onChange={e => setTerimaForm(p => ({ ...p, catatan: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTerima(false)}>Batal</Button>
            <Button onClick={handleTerima} disabled={!terimaForm.nama || !terimaForm.qty || !terimaForm.tahap}>
              <ArrowDownToLine className="h-4 w-4 mr-2" />Simpan Penerimaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Keluarkan WIP ── */}
      <Dialog open={showKeluar} onOpenChange={setShowKeluar}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Keluarkan WIP ke Proses Berikutnya</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Pilih Item WIP <span className="text-red-500">*</span></Label>
              <Select value={keluarForm.kode} onValueChange={v => setKeluarForm(p => ({ ...p, kode: v, qty: '' }))}>
                <SelectTrigger><SelectValue placeholder="— Pilih bahan setengah jadi —" /></SelectTrigger>
                <SelectContent>
                  {wipStock.map(s => (
                    <SelectItem key={s.materialCode} value={s.materialCode}>
                      {s.materialName} — tersedia: {fmt(s.qtyAvailable)} {s.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedWIPItem && (
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lokasi</span>
                  <span>{selectedWIPItem.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">On Hand</span>
                  <span>{fmt(selectedWIPItem.qtyOnHand)} {selectedWIPItem.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tersedia</span>
                  <span className="font-medium text-green-700">{fmt(selectedWIPItem.qtyAvailable)} {selectedWIPItem.unit}</span>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Quantity Dikeluarkan <span className="text-red-500">*</span></Label>
              <Input
                type="number"
                placeholder="0"
                value={keluarForm.qty}
                onChange={e => setKeluarForm(p => ({ ...p, qty: e.target.value }))}
              />
              {selectedWIPItem && Number(keluarForm.qty) > selectedWIPItem.qtyAvailable && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />Melebihi qty tersedia ({fmt(selectedWIPItem.qtyAvailable)} {selectedWIPItem.unit})
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>WO / Proses Tujuan</Label>
              <Select value={keluarForm.woTujuan} onValueChange={v => setKeluarForm(p => ({ ...p, woTujuan: v }))}>
                <SelectTrigger><SelectValue placeholder="— Pilih WO tujuan —" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">— Tanpa WO —</SelectItem>
                  {MOCK_WORK_ORDERS.map(wo => (
                    <SelectItem key={wo.id} value={wo.id}>{wo.id} — {wo.product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* S3: Nama Supplier / Subkon */}
            <div className="space-y-1.5">
              <Label>Nama Supplier / Subkon Tujuan <span className="text-muted-foreground text-xs">(opsional)</span></Label>
              <Input
                placeholder="cth: PT. Presisi Komponen Indonesia"
                value={keluarForm.supplier}
                onChange={e => setKeluarForm(p => ({ ...p, supplier: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Isi jika WIP dikirim ke subkontraktor</p>
            </div>

            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea placeholder="Tujuan pengeluaran, proses selanjutnya, dll..." rows={2} value={keluarForm.catatan} onChange={e => setKeluarForm(p => ({ ...p, catatan: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowKeluar(false)}>Batal</Button>
            <Button
              onClick={handleKeluar}
              disabled={!keluarForm.kode || !keluarForm.qty || (selectedWIPItem ? Number(keluarForm.qty) > selectedWIPItem.qtyAvailable : false)}
            >
              <ArrowUpFromLine className="h-4 w-4 mr-2" />Keluarkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
