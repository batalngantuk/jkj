'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'
import { useStock } from '@/lib/store/hooks'

export default function StockAdjustmentPage() {
  const { stock, adjustStock, movements } = useStock()

  const [selectedCode, setSelectedCode] = useState('')
  const [newQty, setNewQty] = useState('')
  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const selectedItem = stock.find(s => s.materialCode === selectedCode)
  const delta = selectedItem ? (parseFloat(newQty) || 0) - selectedItem.qtyOnHand : 0

  function handleSubmit() {
    if (!selectedItem || !newQty || !reason) return
    adjustStock(selectedCode, parseFloat(newQty), reason)
    setSubmitted(true)
  }

  function reset() {
    setSelectedCode('')
    setNewQty('')
    setReason('')
    setSubmitted(false)
  }

  const recentAdjustments = movements
    .filter(m => m.transactionType === 'ADJUSTMENT')
    .slice().reverse().slice(0, 10)

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-4xl mx-auto">

        <div className="flex items-center gap-4">
          <Link href="/warehouse">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-6 w-6 text-blue-600" />
              Penyesuaian Stok
            </h1>
            <p className="text-sm text-muted-foreground">Koreksi manual qty stok — untuk selisih fisik, kerusakan, atau audit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Form Penyesuaian</CardTitle>
              <CardDescription>Masukkan qty aktual setelah perhitungan fisik</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                  <p className="font-semibold">Penyesuaian Berhasil Dicatat</p>
                  <p className="text-sm text-muted-foreground">Stok telah diperbarui</p>
                  <Button onClick={reset} className="mt-2">Buat Penyesuaian Baru</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Material <span className="text-red-500">*</span></Label>
                    <Select value={selectedCode} onValueChange={v => { setSelectedCode(v); setNewQty('') }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih material..." />
                      </SelectTrigger>
                      <SelectContent>
                        {stock.map(s => (
                          <SelectItem key={s.materialCode} value={s.materialCode}>
                            {s.materialCode} — {s.materialName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedItem && (
                    <div className="bg-muted/40 rounded-lg p-3 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Stok Sistem (Qty On Hand)</span>
                        <span className="font-bold">{selectedItem.qtyOnHand.toLocaleString('id-ID')} {selectedItem.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lokasi</span>
                        <span>{selectedItem.location}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label>Qty Aktual (Hasil Hitung Fisik) <span className="text-red-500">*</span></Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        value={newQty}
                        onChange={e => setNewQty(e.target.value)}
                        min={0}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{selectedItem?.unit || 'unit'}</span>
                    </div>
                    {selectedItem && newQty !== '' && (
                      <p className={`text-xs font-medium mt-1 ${delta > 0 ? 'text-green-700' : delta < 0 ? 'text-red-700' : 'text-muted-foreground'}`}>
                        {delta > 0 ? `▲ Tambah ${delta.toLocaleString('id-ID')} ${selectedItem.unit}` :
                         delta < 0 ? `▼ Kurang ${Math.abs(delta).toLocaleString('id-ID')} ${selectedItem.unit}` :
                         'Tidak ada perubahan'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Alasan / Keterangan <span className="text-red-500">*</span></Label>
                    <Textarea
                      placeholder="Contoh: Selisih fisik audit Q2 2026, kerusakan penyimpanan, dll."
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      rows={2}
                    />
                  </div>

                  <Button
                    className="w-full"
                    disabled={!selectedCode || !newQty || !reason || parseFloat(newQty) < 0}
                    onClick={handleSubmit}
                  >
                    Simpan Penyesuaian
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent adjustments */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Penyesuaian</CardTitle>
              <CardDescription>10 penyesuaian terakhir</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAdjustments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada penyesuaian</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs">Material</TableHead>
                      <TableHead className="text-xs">Selisih</TableHead>
                      <TableHead className="text-xs">Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentAdjustments.map(m => {
                      const diff = m.quantityIn > 0 ? m.quantityIn : -m.quantityOut
                      return (
                        <TableRow key={m.id}>
                          <TableCell className="text-xs">{m.date}</TableCell>
                          <TableCell className="text-xs font-mono">{m.materialCode}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`text-xs ${diff > 0 ? 'text-green-700 border-green-300' : diff < 0 ? 'text-red-700 border-red-300' : ''}`}>
                              {diff > 0 ? '+' : ''}{diff.toLocaleString('id-ID')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-32 truncate">{m.notes}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
