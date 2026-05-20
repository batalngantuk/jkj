'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Save, Building2, Package, Landmark, Users,
  Plus, Trash2, BookOpen, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import AppLayout from '@/components/app-layout'
import { useAccounts, type AccountBalances } from '@/lib/store/useAccounts'
import { useChartOfAccounts, type AkunTipe } from '@/lib/store/hooks'
import { useStock } from '@/lib/store/hooks'

// ------- Saldo Awal helpers -------
function formatIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        className="h-8 text-sm"
        value={value === 0 ? '' : value.toLocaleString('id-ID')}
        onChange={e => onChange(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
        placeholder="0"
      />
    </div>
  )
}

// ------- Valuasi helpers -------
const HARGA_SATUAN: Record<string, number> = {
  'RM-LATEX':            15000,
  'RM-NITRILE':          18000,
  'RM-SULFUR':           25000,
  'RM-ZINC':             45000,
  'PKG-BOX':              1200,
  'PKG-CARTON':           2000,
  'FG-LATEX-M':          85000,
  'FG-NITRILE-S':        95000,
  'WIP-COMPOUND-LATEX':  12000,
  'WIP-DIPPED-M':       150000,
  'WIP-COMPOUND-NITRILE':14000,
}

const TIPE_COLOR: Record<AkunTipe, string> = {
  Aset:       'bg-blue-100 text-blue-800',
  Kewajiban:  'bg-red-100 text-red-800',
  Ekuitas:    'bg-purple-100 text-purple-800',
  Pendapatan: 'bg-green-100 text-green-800',
  Beban:      'bg-orange-100 text-orange-800',
}

export default function AccountsPage() {
  const { balances, saveBalances } = useAccounts()
  const { accounts, addAccount, removeAccount } = useChartOfAccounts()
  const { stock } = useStock()

  // ---- Saldo Awal state ----
  const [form, setForm] = useState<AccountBalances>(balances)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof AccountBalances, val: number | string) => {
    setForm(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  function handleSave() {
    saveBalances(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // ---- Bagan Akun state ----
  const [coaFilter, setCoaFilter] = useState<string>('ALL')
  const [coaSearch, setCoaSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAkun, setNewAkun] = useState({ kode: '', nama: '', tipe: 'Aset' as AkunTipe, subTipe: '', keterangan: '' })

  const filteredCOA = accounts.filter(a => {
    const matchTipe = coaFilter === 'ALL' || a.tipe === coaFilter
    const matchSearch = a.kode.toLowerCase().includes(coaSearch.toLowerCase()) ||
      a.nama.toLowerCase().includes(coaSearch.toLowerCase())
    return matchTipe && matchSearch
  })

  function handleAddAccount() {
    if (!newAkun.kode || !newAkun.nama) return
    addAccount({ kode: newAkun.kode, nama: newAkun.nama, tipe: newAkun.tipe, subTipe: newAkun.subTipe || undefined, keterangan: newAkun.keterangan || undefined })
    setNewAkun({ kode: '', nama: '', tipe: 'Aset', subTipe: '', keterangan: '' })
    setShowAddForm(false)
  }

  // ---- Valuasi Stok ----
  const stockWithValue = stock.map(item => ({
    ...item,
    hargaSatuan: HARGA_SATUAN[item.materialCode] ?? 0,
    totalNilai: (HARGA_SATUAN[item.materialCode] ?? 0) * item.qtyOnHand,
  }))

  const categorySummary = (['BB', 'FG', 'WIP', 'Packaging'] as const).map(cat => ({
    kategori: cat,
    items: stockWithValue.filter(s => s.category === cat),
    total: stockWithValue.filter(s => s.category === cat).reduce((sum, s) => sum + s.totalNilai, 0),
  }))

  const grandTotal = stockWithValue.reduce((sum, s) => sum + s.totalNilai, 0)

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/finance">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Landmark className="h-6 w-6 text-indigo-600" />
              Akunting
            </h1>
            <p className="text-sm text-muted-foreground">Saldo Akun, Bagan Akun, dan Valuasi Stok</p>
          </div>
        </div>

        <Tabs defaultValue="saldo-awal">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="saldo-awal" className="gap-1.5">
              <Landmark className="h-4 w-4" />Saldo Awal
            </TabsTrigger>
            <TabsTrigger value="bagan-akun" className="gap-1.5">
              <BookOpen className="h-4 w-4" />Bagan Akun
            </TabsTrigger>
            <TabsTrigger value="valuasi" className="gap-1.5">
              <BarChart3 className="h-4 w-4" />Valuasi Stok
            </TabsTrigger>
          </TabsList>

          {/* ---- TAB 1: Saldo Awal ---- */}
          <TabsContent value="saldo-awal" className="mt-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleSave} className="gap-2">
                <Save className="h-4 w-4" />
                {saved ? 'Tersimpan ✓' : 'Simpan'}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />Aktiva Lancar (Tambahan)
                  </CardTitle>
                  <CardDescription className="text-xs">Akun yang tidak ter-generate otomatis dari transaksi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput label="Kas" value={form.kas} onChange={v => set('kas', v)} />
                    <NumInput label="Bank" value={form.bank} onChange={v => set('bank', v)} />
                    <NumInput label="Piutang Pemegang Saham" value={form.piutangPemegangSaham} onChange={v => set('piutangPemegangSaham', v)} />
                    <NumInput label="Piutang Lain-lain" value={form.piutangLainLain} onChange={v => set('piutangLainLain', v)} />
                    <NumInput label="Perlengkapan Pabrik" value={form.perlengkapanPabrik} onChange={v => set('perlengkapanPabrik', v)} />
                    <NumInput label="Biaya Dibayar Dimuka" value={form.biayaDibayarDimuka} onChange={v => set('biayaDibayarDimuka', v)} />
                    <NumInput label="PPN Pembelian" value={form.ppnPembelian} onChange={v => set('ppnPembelian', v)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-orange-600" />Aktiva Tetap
                  </CardTitle>
                  <CardDescription className="text-xs">Input nilai buku (nilai perolehan dan akumulasi penyusutan)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput label="Tanah" value={form.tanah} onChange={v => set('tanah', v)} />
                    <div />
                    <NumInput label="Bangunan" value={form.bangunan} onChange={v => set('bangunan', v)} />
                    <NumInput label="Akum. Penyusutan Bangunan" value={form.akumPenyusutanBangunan} onChange={v => set('akumPenyusutanBangunan', v)} />
                    <NumInput label="Peralatan Pabrik" value={form.peralatanPabrik} onChange={v => set('peralatanPabrik', v)} />
                    <NumInput label="Akum. Penyusutan Per. Pabrik" value={form.akumPenyusutanPeralatanPabrik} onChange={v => set('akumPenyusutanPeralatanPabrik', v)} />
                    <NumInput label="Peralatan & Perlengkapan Kantor" value={form.peralatanKantor} onChange={v => set('peralatanKantor', v)} />
                    <NumInput label="Akum. Penyusutan Per. Kantor" value={form.akumPenyusutanPeralatanKantor} onChange={v => set('akumPenyusutanPeralatanKantor', v)} />
                    <NumInput label="Kendaraan" value={form.kendaraan} onChange={v => set('kendaraan', v)} />
                    <NumInput label="Akum. Penyusutan Kendaraan" value={form.akumPenyusutanKendaraan} onChange={v => set('akumPenyusutanKendaraan', v)} />
                    <NumInput label="Mesin" value={form.mesin} onChange={v => set('mesin', v)} />
                    <NumInput label="Akum. Penyusutan Mesin" value={form.akumPenyusutanMesin} onChange={v => set('akumPenyusutanMesin', v)} />
                    <NumInput label="Perlengkapan Kantor (Asset Deklarasi TA)" value={form.perlengkapanKantorAssetTA} onChange={v => set('perlengkapanKantorAssetTA', v)} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-red-600" />Hutang
                  </CardTitle>
                  <CardDescription className="text-xs">Hutang yang tidak ter-generate otomatis dari AP Invoices</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Hutang Lancar</p>
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput label="Hutang Gaji" value={form.hutangGaji} onChange={v => set('hutangGaji', v)} />
                      <NumInput label="Uang Muka Penjualan" value={form.uangMukaPenjualan} onChange={v => set('uangMukaPenjualan', v)} />
                      <NumInput label="Hutang Usaha Lainnya" value={form.hutangUsahaLainnya} onChange={v => set('hutangUsahaLainnya', v)} />
                      <NumInput label="Hutang PPN (Penjualan Lokal)" value={form.hutangPPNPenjualan} onChange={v => set('hutangPPNPenjualan', v)} />
                      <NumInput label="Hutang PPh Psl 25" value={form.hutangPPh25} onChange={v => set('hutangPPh25', v)} />
                      <NumInput label="Hutang PPh Psl 21" value={form.hutangPPh21} onChange={v => set('hutangPPh21', v)} />
                      <NumInput label="Hutang PPh Badan" value={form.hutangPPhBadan} onChange={v => set('hutangPPhBadan', v)} />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Hutang Jangka Panjang</p>
                    <div className="grid grid-cols-2 gap-3">
                      <NumInput label="Hutang Mobil Rush" value={form.hutangMobilRush} onChange={v => set('hutangMobilRush', v)} />
                      <NumInput label="Hutang Pemegang Saham" value={form.hutangPemegangSaham} onChange={v => set('hutangPemegangSaham', v)} />
                      <NumInput label="Hutang Mobil Pajero" value={form.hutangMobilPajero} onChange={v => set('hutangMobilPajero', v)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Landmark className="h-4 w-4 text-green-600" />Modal & Ekuitas
                  </CardTitle>
                  <CardDescription className="text-xs">Saldo modal awal, laba ditahan, dan laba tahun lalu</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <NumInput label="Modal Saham" value={form.modalSaham} onChange={v => set('modalSaham', v)} />
                    <NumInput label="Laba Ditahan (Deklarasi TA)" value={form.labaDitahan} onChange={v => set('labaDitahan', v)} />
                    <NumInput label="Laba Tahun Lalu" value={form.labaTahunLalu} onChange={v => set('labaTahunLalu', v)} />
                  </div>
                  <div className="pt-2 space-y-1">
                    <Label className="text-xs text-muted-foreground">Periode Awal (tanggal mulai perhitungan)</Label>
                    <Input type="date" className="h-8 text-sm w-48" value={form.periodeAwal} onChange={e => set('periodeAwal', e.target.value)} />
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                    Laba Tahun Berjalan dihitung otomatis dari laporan Laba Rugi.
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSave} size="lg" className="gap-2">
                <Save className="h-4 w-4" />
                {saved ? 'Tersimpan ✓' : 'Simpan Semua Saldo'}
              </Button>
            </div>
          </TabsContent>

          {/* ---- TAB 2: Bagan Akun ---- */}
          <TabsContent value="bagan-akun" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-indigo-600" />
                      Bagan Akun (Chart of Accounts)
                    </CardTitle>
                    <CardDescription>{accounts.length} akun terdaftar</CardDescription>
                  </div>
                  <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Akun
                  </Button>
                </div>
              </CardHeader>

              {showAddForm && (
                <CardContent className="border-t pt-4">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <p className="text-sm font-medium">Akun Baru</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Kode Akun <span className="text-red-500">*</span></Label>
                        <Input
                          className="h-8 text-sm"
                          placeholder="mis. 1-0010"
                          value={newAkun.kode}
                          onChange={e => setNewAkun(p => ({ ...p, kode: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Nama Akun <span className="text-red-500">*</span></Label>
                        <Input
                          className="h-8 text-sm"
                          placeholder="Nama akun"
                          value={newAkun.nama}
                          onChange={e => setNewAkun(p => ({ ...p, nama: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tipe</Label>
                        <Select value={newAkun.tipe} onValueChange={v => setNewAkun(p => ({ ...p, tipe: v as AkunTipe }))}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aset">Aset</SelectItem>
                            <SelectItem value="Kewajiban">Kewajiban</SelectItem>
                            <SelectItem value="Ekuitas">Ekuitas</SelectItem>
                            <SelectItem value="Pendapatan">Pendapatan</SelectItem>
                            <SelectItem value="Beban">Beban</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Sub-Tipe</Label>
                        <Input
                          className="h-8 text-sm"
                          placeholder="mis. Aset Lancar"
                          value={newAkun.subTipe}
                          onChange={e => setNewAkun(p => ({ ...p, subTipe: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs">Keterangan</Label>
                        <Input
                          className="h-8 text-sm"
                          placeholder="Keterangan opsional"
                          value={newAkun.keterangan}
                          onChange={e => setNewAkun(p => ({ ...p, keterangan: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setShowAddForm(false)}>Batal</Button>
                      <Button size="sm" disabled={!newAkun.kode || !newAkun.nama} onClick={handleAddAccount} className="gap-1">
                        <Plus className="h-3.5 w-3.5" />Simpan Akun
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}

              <CardContent className={showAddForm ? 'pt-0' : ''}>
                <div className="flex gap-3 mb-4">
                  <Input
                    className="max-w-xs"
                    placeholder="Cari kode atau nama akun..."
                    value={coaSearch}
                    onChange={e => setCoaSearch(e.target.value)}
                  />
                  <Select value={coaFilter} onValueChange={setCoaFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Semua Tipe</SelectItem>
                      <SelectItem value="Aset">Aset</SelectItem>
                      <SelectItem value="Kewajiban">Kewajiban</SelectItem>
                      <SelectItem value="Ekuitas">Ekuitas</SelectItem>
                      <SelectItem value="Pendapatan">Pendapatan</SelectItem>
                      <SelectItem value="Beban">Beban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Kode</TableHead>
                      <TableHead>Nama Akun</TableHead>
                      <TableHead className="w-28">Tipe</TableHead>
                      <TableHead>Sub-Tipe</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCOA.map(akun => (
                      <TableRow key={akun.id}>
                        <TableCell className="font-mono text-xs font-semibold">{akun.kode}</TableCell>
                        <TableCell className="text-sm">{akun.nama}</TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${TIPE_COLOR[akun.tipe]}`} variant="outline">
                            {akun.tipe}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{akun.subTipe ?? '—'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => removeAccount(akun.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---- TAB 3: Valuasi Stok ---- */}
          <TabsContent value="valuasi" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                      Valuasi Stok
                    </CardTitle>
                    <CardDescription>Nilai persediaan berdasarkan harga beli terakhir</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total Nilai Persediaan</p>
                    <p className="text-2xl font-bold text-emerald-700">
                      {formatIDR(grandTotal)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {categorySummary.map(cat => (
                  <div key={cat.kategori}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        {cat.kategori === 'BB' ? 'Bahan Baku' : cat.kategori === 'FG' ? 'Barang Jadi' : cat.kategori === 'WIP' ? 'Work In Progress' : 'Packaging'}
                      </p>
                      <p className="text-sm font-bold">{formatIDR(cat.total)}</p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/30">
                          <TableHead>Kode</TableHead>
                          <TableHead>Nama Material</TableHead>
                          <TableHead>Fasilitas</TableHead>
                          <TableHead className="text-right">Qty On Hand</TableHead>
                          <TableHead>Satuan</TableHead>
                          <TableHead className="text-right">Harga Satuan</TableHead>
                          <TableHead className="text-right">Total Nilai</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cat.items.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground text-sm py-4">
                              Tidak ada stok
                            </TableCell>
                          </TableRow>
                        ) : cat.items.map(item => (
                          <TableRow key={item.materialCode}>
                            <TableCell className="font-mono text-xs font-semibold">{item.materialCode}</TableCell>
                            <TableCell className="text-sm">{item.materialName}</TableCell>
                            <TableCell>
                              {item.fasilitas && (
                                <Badge variant="outline" className={`text-xs ${item.fasilitas === 'KITE' ? 'border-blue-400 text-blue-700' : 'border-gray-400 text-gray-600'}`}>
                                  {item.fasilitas}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">{item.qtyOnHand.toLocaleString('id-ID')}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{item.unit}</TableCell>
                            <TableCell className="text-right text-sm">
                              {item.hargaSatuan > 0 ? formatIDR(item.hargaSatuan) : <span className="text-muted-foreground text-xs">—</span>}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-emerald-700">
                              {item.totalNilai > 0 ? formatIDR(item.totalNilai) : <span className="text-muted-foreground font-normal text-xs">—</span>}
                            </TableCell>
                          </TableRow>
                        ))}
                        {cat.items.length > 0 && (
                          <TableRow className="bg-muted/20 font-semibold">
                            <TableCell colSpan={6} className="text-right text-sm">Subtotal {cat.kategori === 'BB' ? 'Bahan Baku' : cat.kategori}:</TableCell>
                            <TableCell className="text-right text-emerald-700">{formatIDR(cat.total)}</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                ))}

                <div className="flex justify-end pt-2 border-t">
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Grand Total Persediaan</p>
                    <p className="text-xl font-bold text-emerald-700">{formatIDR(grandTotal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  )
}
