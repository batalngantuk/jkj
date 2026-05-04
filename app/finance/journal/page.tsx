'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Download, Trash2, BookOpen, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import AppLayout from '@/components/app-layout'
import { useJournal, type JournalCategory, type JournalType } from '@/lib/store/hooks'
import { exportToExcel } from '@/lib/utils/export-excel'

const KATEGORI_OPTIONS: JournalCategory[] = [
  'Penerimaan Kas',
  'Penerimaan Bank',
  'Pengeluaran Kas',
  'Pengeluaran Bank',
  'Beban Gaji',
  'Beban Listrik & Utilitas',
  'Beban Sewa',
  'Beban Angkut',
  'Beban Lain-lain',
]

const TIPE_MAP: Record<JournalCategory, JournalType> = {
  'Penerimaan Kas': 'MASUK',
  'Penerimaan Bank': 'MASUK',
  'Pengeluaran Kas': 'KELUAR',
  'Pengeluaran Bank': 'KELUAR',
  'Beban Gaji': 'KELUAR',
  'Beban Listrik & Utilitas': 'KELUAR',
  'Beban Sewa': 'KELUAR',
  'Beban Angkut': 'KELUAR',
  'Beban Lain-lain': 'KELUAR',
}

const AKUN_MAP: Record<JournalCategory, 'Kas' | 'Bank'> = {
  'Penerimaan Kas': 'Kas',
  'Penerimaan Bank': 'Bank',
  'Pengeluaran Kas': 'Kas',
  'Pengeluaran Bank': 'Bank',
  'Beban Gaji': 'Bank',
  'Beban Listrik & Utilitas': 'Bank',
  'Beban Sewa': 'Bank',
  'Beban Angkut': 'Bank',
  'Beban Lain-lain': 'Bank',
}

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export default function JournalPage() {
  const { entries, createEntry, deleteEntry } = useJournal()

  const [showForm, setShowForm] = useState(false)
  const [filterTipe, setFilterTipe] = useState<string>('all')
  const [filterBulan, setFilterBulan] = useState<string>('all')

  // Form state
  const [fTanggal, setFTanggal] = useState('')
  const [fNoBukti, setFNoBukti] = useState('')
  const [fKeterangan, setFKeterangan] = useState('')
  const [fKategori, setFKategori] = useState<JournalCategory>('Beban Gaji')
  const [fNominal, setFNominal] = useState('')

  const bulanList = Array.from(new Set(entries.map(e => e.tanggal.slice(0, 7)))).sort().reverse()

  const filtered = entries.filter(e => {
    const matchTipe = filterTipe === 'all' || e.tipe === filterTipe
    const matchBulan = filterBulan === 'all' || e.tanggal.startsWith(filterBulan)
    return matchTipe && matchBulan
  })

  const totalMasuk = filtered.filter(e => e.tipe === 'MASUK').reduce((s, e) => s + e.nominal, 0)
  const totalKeluar = filtered.filter(e => e.tipe === 'KELUAR').reduce((s, e) => s + e.nominal, 0)

  function resetForm() {
    setFTanggal(''); setFNoBukti(''); setFKeterangan('')
    setFKategori('Beban Gaji'); setFNominal('')
  }

  function handleSubmit() {
    if (!fTanggal || !fKeterangan || !fNominal) return
    createEntry({
      tanggal: fTanggal,
      noBukti: fNoBukti || '-',
      keterangan: fKeterangan,
      kategori: fKategori,
      tipe: TIPE_MAP[fKategori],
      akun: AKUN_MAP[fKategori],
      nominal: parseInt(fNominal.replace(/\D/g, '')) || 0,
    })
    setShowForm(false)
    resetForm()
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/finance">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Jurnal Kas & Bank
              </h1>
              <p className="text-sm text-muted-foreground">Pencatatan transaksi kas/bank umum — gaji, utilitas, sewa, dll</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => exportToExcel(filtered as unknown as Record<string, unknown>[], 'Jurnal_Kas_Bank', 'Jurnal')}>
              <Download className="h-4 w-4" />Export
            </Button>
            <Button className="gap-2" onClick={() => { resetForm(); setShowForm(true) }}>
              <Plus className="h-4 w-4" />Input Transaksi
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-green-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground">Total Masuk</p>
              </div>
              <p className="text-xl font-bold text-green-700">{formatIDR(totalMasuk)}</p>
            </CardContent>
          </Card>
          <Card className="border-red-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-xs text-muted-foreground">Total Keluar</p>
              </div>
              <p className="text-xl font-bold text-red-700">{formatIDR(totalKeluar)}</p>
            </CardContent>
          </Card>
          <Card className={totalMasuk - totalKeluar >= 0 ? 'border-blue-200' : 'border-orange-200'}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground mb-1">Selisih (Net)</p>
              <p className={`text-xl font-bold ${totalMasuk - totalKeluar >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {formatIDR(totalMasuk - totalKeluar)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Daftar Transaksi</CardTitle>
              <CardDescription>Semua transaksi kas & bank yang diinput manual</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterBulan} onValueChange={setFilterBulan}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Semua Bulan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Bulan</SelectItem>
                  {bulanList.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTipe} onValueChange={setFilterTipe}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="MASUK">Masuk</SelectItem>
                  <SelectItem value="KELUAR">Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No Bukti</TableHead>
                  <TableHead>Keterangan</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Akun</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead className="text-right">Nominal</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="whitespace-nowrap text-sm">{e.tanggal}</TableCell>
                    <TableCell className="font-mono text-xs">{e.noBukti}</TableCell>
                    <TableCell className="text-sm">{e.keterangan}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{e.kategori}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{e.akun}</TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${e.tipe === 'MASUK' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`} variant="outline">
                        {e.tipe === 'MASUK' ? '↑ Masuk' : '↓ Keluar'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${e.tipe === 'MASUK' ? 'text-green-700' : 'text-red-700'}`}>
                      {e.tipe === 'MASUK' ? '+' : '-'}{formatIDR(e.nominal)}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-600" onClick={() => deleteEntry(e.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Belum ada transaksi</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">{filtered.length} transaksi ditemukan</p>
          </CardContent>
        </Card>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); resetForm() } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Input Transaksi Kas / Bank
            </DialogTitle>
            <DialogDescription>Catat transaksi penerimaan atau pengeluaran kas/bank</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tanggal <span className="text-red-500">*</span></Label>
                <Input type="date" value={fTanggal} onChange={e => setFTanggal(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>No Bukti</Label>
                <Input placeholder="BKK-001 / BKM-001" value={fNoBukti} onChange={e => setFNoBukti(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Kategori <span className="text-red-500">*</span></Label>
              <Select value={fKategori} onValueChange={v => setFKategori(v as JournalCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map(k => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Akun: <strong>{AKUN_MAP[fKategori]}</strong> · Tipe: <strong>{TIPE_MAP[fKategori] === 'MASUK' ? '↑ Masuk' : '↓ Keluar'}</strong>
              </p>
            </div>

            <div className="space-y-1">
              <Label>Keterangan <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Deskripsi transaksi..."
                value={fKeterangan}
                onChange={e => setFKeterangan(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <Label>Nominal (Rp) <span className="text-red-500">*</span></Label>
              <Input
                placeholder="0"
                value={fNominal}
                onChange={e => setFNominal(e.target.value.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.'))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }}>Batal</Button>
            <Button disabled={!fTanggal || !fKeterangan || !fNominal} onClick={handleSubmit} className="gap-2">
              <Plus className="h-4 w-4" />Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
