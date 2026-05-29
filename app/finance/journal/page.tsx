'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Download, Trash2, BookOpen, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import AppLayout from '@/components/app-layout'
import { useJournal, type JournalCategory, type JournalType } from '@/lib/store/hooks'
import { useChartOfAccounts } from '@/lib/store/hooks'
import { exportToExcel } from '@/lib/utils/export-excel'

const KATEGORI_OPTIONS: JournalCategory[] = [
  'Penerimaan Kas/Bank',
  'Pengeluaran Kas/Bank',
  'Transaksi Umum',
]

const TIPE_DEFAULT: Record<JournalCategory, JournalType> = {
  'Penerimaan Kas/Bank': 'MASUK',
  'Pengeluaran Kas/Bank': 'KELUAR',
  'Transaksi Umum': 'MASUK',
}

const DEFAULT_KURS: Record<string, number> = { USD: 15500, KRW: 11, IDR: 1 }

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export default function JournalPage() {
  const { entries, createEntry, deleteEntry } = useJournal()
  const { accounts } = useChartOfAccounts()

  // map kode → nama for display
  const akunMap = useMemo(() =>
    Object.fromEntries(accounts.map(a => [a.kode, a.nama])),
    [accounts]
  )

  // accounts grouped by tipe for the select
  const akunGroups = useMemo(() => {
    const groups: Record<string, typeof accounts> = {}
    accounts.forEach(a => {
      if (!groups[a.tipe]) groups[a.tipe] = []
      groups[a.tipe].push(a)
    })
    return groups
  }, [accounts])

  const [showForm, setShowForm] = useState(false)
  const [filterTipe, setFilterTipe] = useState<string>('all')
  const [filterBulan, setFilterBulan] = useState<string>('all')

  // Form state
  const [fTanggal, setFTanggal] = useState('')
  const [fNoBukti, setFNoBukti] = useState('')
  const [fKeterangan, setFKeterangan] = useState('')
  const [fKategori, setFKategori] = useState<JournalCategory>('Pengeluaran Kas/Bank')
  const [fTipe, setFTipe] = useState<JournalType>('KELUAR')
  const [fKasBank, setFKasBank] = useState<'Kas' | 'Bank'>('Bank')
  const [fAkunLawan, setFAkunLawan] = useState<string>('')
  const [fCurrency, setFCurrency] = useState<'IDR' | 'USD' | 'KRW'>('IDR')
  const [fKurs, setFKurs] = useState<string>('')
  const [fNominalAsli, setFNominalAsli] = useState<string>('')
  const [fNominal, setFNominal] = useState<string>('')

  const bulanList = Array.from(new Set(entries.map(e => e.tanggal.slice(0, 7)))).sort().reverse()

  const filtered = entries.filter(e => {
    const matchTipe = filterTipe === 'all' || e.tipe === filterTipe
    const matchBulan = filterBulan === 'all' || e.tanggal.startsWith(filterBulan)
    return matchTipe && matchBulan
  })

  const totalMasuk = filtered.filter(e => e.tipe === 'MASUK').reduce((s, e) => s + e.nominal, 0)
  const totalKeluar = filtered.filter(e => e.tipe === 'KELUAR').reduce((s, e) => s + e.nominal, 0)

  function handleKategoriChange(val: JournalCategory) {
    setFKategori(val)
    setFTipe(TIPE_DEFAULT[val])
  }

  function handleCurrencyChange(val: 'IDR' | 'USD' | 'KRW') {
    setFCurrency(val)
    if (val !== 'IDR') {
      setFKurs(String(DEFAULT_KURS[val]))
    } else {
      setFKurs('')
      setFNominalAsli('')
    }
  }

  // auto-calc IDR nominal from nominalAsli × kurs
  function handleNominalAsliChange(val: string) {
    const clean = val.replace(/\D/g, '')
    setFNominalAsli(clean)
    const kursNum = parseInt(fKurs.replace(/\D/g, '')) || 0
    const asli = parseInt(clean) || 0
    if (kursNum && asli) {
      setFNominal(String(asli * kursNum))
    }
  }

  function handleKursChange(val: string) {
    const clean = val.replace(/\D/g, '')
    setFKurs(clean)
    const asli = parseInt(fNominalAsli.replace(/\D/g, '')) || 0
    const kursNum = parseInt(clean) || 0
    if (kursNum && asli) {
      setFNominal(String(asli * kursNum))
    }
  }

  function formatInput(val: string) {
    return val.replace(/\D/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  function resetForm() {
    setFTanggal(''); setFNoBukti(''); setFKeterangan('')
    setFKategori('Pengeluaran Kas/Bank'); setFTipe('KELUAR')
    setFKasBank('Bank'); setFAkunLawan('')
    setFCurrency('IDR'); setFKurs(''); setFNominalAsli(''); setFNominal('')
  }

  function handleSubmit() {
    const nominalNum = parseInt(fNominal.replace(/\D/g, '')) || 0
    if (!fTanggal || !fKeterangan || !nominalNum) return

    const entry: Omit<typeof entries[0], 'id'> = {
      tanggal: fTanggal,
      noBukti: fNoBukti || '-',
      keterangan: fKeterangan,
      kategori: fKategori,
      tipe: fTipe,
      akun: fKasBank,
      akunLawan: fAkunLawan || undefined,
      nominal: nominalNum,
    }

    if (fCurrency !== 'IDR') {
      entry.currency = fCurrency
      entry.kurs = parseInt(fKurs.replace(/\D/g, '')) || undefined
      entry.nominalAsli = parseInt(fNominalAsli.replace(/\D/g, '')) || undefined
    }

    createEntry(entry)
    setShowForm(false)
    resetForm()
  }

  const nominalIDRNum = parseInt(fNominal.replace(/\D/g, '')) || 0

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
              <p className="text-sm text-muted-foreground">Pencatatan transaksi penerimaan, pengeluaran, dan transaksi umum kas/bank</p>
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
                  <TableHead>Kas/Bank</TableHead>
                  <TableHead>Akun Lawan</TableHead>
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
                    <TableCell className="text-sm max-w-[180px] truncate">{e.keterangan}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">{e.kategori}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{e.akun}</TableCell>
                    <TableCell className="text-xs">
                      {e.akunLawan
                        ? <span className="font-mono text-muted-foreground">{e.akunLawan} <span className="text-foreground not-italic">{akunMap[e.akunLawan] ?? ''}</span></span>
                        : <span className="text-muted-foreground">—</span>
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs ${e.tipe === 'MASUK' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`} variant="outline">
                        {e.tipe === 'MASUK' ? '↑ Masuk' : '↓ Keluar'}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium whitespace-nowrap ${e.tipe === 'MASUK' ? 'text-green-700' : 'text-red-700'}`}>
                      {e.currency && e.currency !== 'IDR' && e.nominalAsli
                        ? <span className="text-xs text-muted-foreground mr-1">{e.currency} {e.nominalAsli.toLocaleString('id-ID')}</span>
                        : null
                      }
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
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">Belum ada transaksi</TableCell>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Input Transaksi Kas / Bank
            </DialogTitle>
            <DialogDescription>Catat transaksi penerimaan, pengeluaran, atau transaksi umum kas/bank</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">

            {/* Row 1: Tanggal + No Bukti */}
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

            {/* Row 2: Kategori */}
            <div className="space-y-1">
              <Label>Kategori <span className="text-red-500">*</span></Label>
              <Select value={fKategori} onValueChange={v => handleKategoriChange(v as JournalCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KATEGORI_OPTIONS.map(k => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row 3: Kas/Bank + Tipe */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Akun Kas/Bank <span className="text-red-500">*</span></Label>
                <Select value={fKasBank} onValueChange={v => setFKasBank(v as 'Kas' | 'Bank')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kas">Kas</SelectItem>
                    <SelectItem value="Bank">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Tipe <span className="text-red-500">*</span></Label>
                {fKategori === 'Transaksi Umum' ? (
                  <Select value={fTipe} onValueChange={v => setFTipe(v as JournalType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MASUK">↑ Masuk</SelectItem>
                      <SelectItem value="KELUAR">↓ Keluar</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-10 flex items-center px-3 rounded-md border bg-muted text-sm text-muted-foreground">
                    {fTipe === 'MASUK' ? '↑ Masuk (otomatis)' : '↓ Keluar (otomatis)'}
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Akun Lawan dari COA */}
            <div className="space-y-1">
              <Label>Akun Lawan <span className="text-xs text-muted-foreground">(dari Chart of Accounts)</span></Label>
              <Select value={fAkunLawan} onValueChange={setFAkunLawan}>
                <SelectTrigger>
                  <SelectValue placeholder="— Pilih akun lawan —" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {Object.entries(akunGroups).map(([tipe, akuns]) => (
                    <SelectGroup key={tipe}>
                      <SelectLabel>{tipe}</SelectLabel>
                      {akuns.map(a => (
                        <SelectItem key={a.id} value={a.kode}>
                          {a.kode} — {a.nama}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              {fAkunLawan && (
                <p className="text-xs text-muted-foreground">
                  Dipilih: <strong>{fAkunLawan} — {akunMap[fAkunLawan]}</strong>
                </p>
              )}
            </div>

            {/* Row 5: Currency + Kurs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Mata Uang</Label>
                <Select value={fCurrency} onValueChange={v => handleCurrencyChange(v as 'IDR' | 'USD' | 'KRW')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                    <SelectItem value="USD">USD (Dolar AS)</SelectItem>
                    <SelectItem value="KRW">KRW (Won Korea)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Kurs ke IDR {fCurrency !== 'IDR' && <span className="text-red-500">*</span>}</Label>
                <Input
                  placeholder={fCurrency !== 'IDR' ? `e.g. ${DEFAULT_KURS[fCurrency]}` : '—'}
                  value={fCurrency !== 'IDR' ? fKurs : ''}
                  onChange={e => handleKursChange(e.target.value)}
                  disabled={fCurrency === 'IDR'}
                  className={fCurrency === 'IDR' ? 'bg-muted' : ''}
                />
              </div>
            </div>

            {/* Row 6: Nominal */}
            {fCurrency !== 'IDR' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nominal ({fCurrency}) <span className="text-red-500">*</span></Label>
                  <Input
                    placeholder="0"
                    value={fNominalAsli ? parseInt(fNominalAsli).toLocaleString('id-ID') : ''}
                    onChange={e => handleNominalAsliChange(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Nominal IDR (otomatis)</Label>
                  <div className="h-10 flex items-center px-3 rounded-md border bg-muted text-sm font-medium">
                    {nominalIDRNum ? formatIDR(nominalIDRNum) : '—'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Label>Nominal (Rp) <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="0"
                  value={fNominal ? parseInt(fNominal).toLocaleString('id-ID') : ''}
                  onChange={e => setFNominal(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            )}

            {/* Row 7: Keterangan */}
            <div className="space-y-1">
              <Label>Keterangan <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Deskripsi transaksi..."
                value={fKeterangan}
                onChange={e => setFKeterangan(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm() }}>Batal</Button>
            <Button
              disabled={!fTanggal || !fKeterangan || !nominalIDRNum && !parseInt(fNominal || '0')}
              onClick={handleSubmit}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />Simpan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
