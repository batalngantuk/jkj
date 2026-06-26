'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, Trash2, Save, Send, Package, FileText,
  Building2, Truck, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AppLayout from '@/components/app-layout'
import { usePenjualanLokal, PLItem } from '@/lib/store/usePenjualanLokal'

const SATUAN_OPTIONS = ['KG', 'MTR', 'PCS', 'CTN', 'TNE', 'PCE', 'ST', 'FTK', 'KGM', 'SHT', 'ROLL', 'YARD', 'LITER', 'SET']

let _keyCounter = 0
const newKey = () => `item-${++_keyCounter}-${Date.now()}`

const emptyItem = (): PLItem => ({
  _key: newKey(),
  kodeBarang: '',
  namaBarang: '',
  posTarif: '',
  satuan: 'KG',
  qty: 0,
  beratBersih: 0,
  hargaSatuan: 0,
  nilaiIDR: 0,
})

function fmt(n: number) {
  return n === 0 ? '' : n.toLocaleString('id-ID')
}

export default function PenjualanLokalNewPage() {
  const router = useRouter()
  const { createDocument, documents } = usePenjualanLokal()

  // Header
  const today = new Date().toISOString().slice(0, 10)
  const autoNo = `PL-${new Date().getFullYear()}-${String(documents.length + 1).padStart(3, '0')}`

  const [nomorPL, setNomorPL] = useState(autoNo)
  const [tanggal, setTanggal] = useState(today)

  // Pembeli
  const [pembeliNama, setPembeliNama] = useState('')
  const [pembeliNPWP, setPembeliNPWP] = useState('')
  const [pembeliAlamat, setPembeliAlamat] = useState('')

  // Referensi dokumen
  const [noSORef, setNoSORef] = useState('')
  const [noInvoice, setNoInvoice] = useState('')
  const [noPL, setNoPL] = useState('')
  const [noKontrak, setNoKontrak] = useState('')

  // Pengangkutan
  const [jenisKendaraan, setJenisKendaraan] = useState('')
  const [noKendaraan, setNoKendaraan] = useState('')
  const [noSuratJalan, setNoSuratJalan] = useState('')

  // Items
  const [items, setItems] = useState<PLItem[]>([emptyItem()])
  const [catatan, setCatatan] = useState('')

  const addItem = () => setItems(p => [...p, emptyItem()])
  const removeItem = (key: string) => setItems(p => p.filter(i => i._key !== key))

  const updateItem = useCallback((key: string, field: keyof PLItem, raw: string | number) => {
    setItems(prev => prev.map(item => {
      if (item._key !== key) return item
      const updated = { ...item, [field]: raw }
      if (field === 'qty' || field === 'hargaSatuan') {
        updated.nilaiIDR = updated.qty * updated.hargaSatuan
      }
      if (field === 'nilaiIDR') {
        // manual override — keep as is
      }
      return updated
    }))
  }, [])

  const totalNilaiIDR = items.reduce((s, i) => s + (i.nilaiIDR || 0), 0)
  const totalBeratBersih = items.reduce((s, i) => s + (i.beratBersih || 0), 0)

  const isValid = pembeliNama && items.some(i => i.namaBarang && i.qty > 0)

  const handleSave = (status: 'Draft' | 'Submitted') => {
    createDocument({
      nomorPL,
      tanggal,
      pembeliNama,
      pembeliNPWP,
      pembeliAlamat,
      noSORef,
      noInvoice,
      noPL,
      noKontrak,
      jenisKendaraan,
      noKendaraan,
      noSuratJalan,
      items,
      totalNilaiIDR,
      catatan,
      status,
    })
    router.push('/logistics/penjualan-lokal')
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/logistics/penjualan-lokal">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Buat Dokumen Penjualan Material Lokal</h1>
            <p className="text-sm text-muted-foreground">Pengeluaran barang dari TPB ke pembeli domestik</p>
          </div>
        </div>

        {/* Header Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Informasi Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label>No. Dokumen PL</Label>
                <Input value={nomorPL} onChange={e => setNomorPL(e.target.value)} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal <span className="text-red-500">*</span></Label>
                <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>No. Invoice</Label>
                <Input placeholder="INV-2026-..." value={noInvoice} onChange={e => setNoInvoice(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>No. SO Referensi</Label>
                <Input placeholder="SO-2026-..." value={noSORef} onChange={e => setNoSORef(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>No. Packing List</Label>
                <Input placeholder="PK-2026-..." value={noPL} onChange={e => setNoPL(e.target.value)} />
              </div>
              <div className="space-y-1.5 col-span-2 md:col-span-3">
                <Label>No. Kontrak</Label>
                <Input placeholder="Nomor kontrak (opsional)" value={noKontrak} onChange={e => setNoKontrak(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pembeli */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Data Pembeli
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Nama Pembeli <span className="text-red-500">*</span></Label>
              <Input placeholder="PT. Nama Perusahaan" value={pembeliNama} onChange={e => setPembeliNama(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>NPWP Pembeli</Label>
              <Input placeholder="00.000.000.0-000.000" value={pembeliNPWP} onChange={e => setPembeliNPWP(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Alamat Pembeli</Label>
              <Input placeholder="Jl. ..." value={pembeliAlamat} onChange={e => setPembeliAlamat(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Pengangkutan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-600" />
              Data Pengangkutan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Jenis Kendaraan</Label>
              <Input placeholder="Truk, Engkel, dll" value={jenisKendaraan} onChange={e => setJenisKendaraan(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>No. Polisi Kendaraan</Label>
              <Input placeholder="B 1234 XX" value={noKendaraan} onChange={e => setNoKendaraan(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>No. Surat Jalan</Label>
              <Input placeholder="SJ-OUT-2026-..." value={noSuratJalan} onChange={e => setNoSuratJalan(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Data Barang */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-green-600" />
                Data Barang
              </CardTitle>
              <Button size="sm" variant="outline" onClick={addItem} className="gap-1">
                <Plus className="h-3.5 w-3.5" />
                Tambah Item
              </Button>
            </div>
            <CardDescription>Detail material/barang yang dijual ke pembeli lokal</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs">
                  <TableHead className="w-[120px]">Kode Barang</TableHead>
                  <TableHead className="min-w-[160px]">Nama / Merek Barang</TableHead>
                  <TableHead className="w-[110px]">Pos Tarif / HS</TableHead>
                  <TableHead className="w-[90px]">Satuan</TableHead>
                  <TableHead className="w-[90px] text-right">Qty</TableHead>
                  <TableHead className="w-[100px] text-right">Berat Bersih (Kg)</TableHead>
                  <TableHead className="w-[130px] text-right">Harga Satuan (Rp)</TableHead>
                  <TableHead className="w-[140px] text-right">Nilai IDR</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
                  <TableRow key={item._key}>
                    <TableCell>
                      <Input
                        className="h-8 text-xs font-mono"
                        placeholder="110-002-..."
                        value={item.kodeBarang}
                        onChange={e => updateItem(item._key, 'kodeBarang', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-xs"
                        placeholder="Nama barang"
                        value={item.namaBarang}
                        onChange={e => updateItem(item._key, 'namaBarang', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        className="h-8 text-xs font-mono"
                        placeholder="5806.10.90"
                        value={item.posTarif}
                        onChange={e => updateItem(item._key, 'posTarif', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={item.satuan} onValueChange={v => updateItem(item._key, 'satuan', v)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {SATUAN_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-8 text-xs text-right"
                        value={item.qty === 0 ? '' : item.qty}
                        onChange={e => updateItem(item._key, 'qty', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-8 text-xs text-right"
                        value={item.beratBersih === 0 ? '' : item.beratBersih}
                        onChange={e => updateItem(item._key, 'beratBersih', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-8 text-xs text-right"
                        value={item.hargaSatuan === 0 ? '' : item.hargaSatuan}
                        onChange={e => updateItem(item._key, 'hargaSatuan', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        className="h-8 text-xs text-right font-medium"
                        value={item.nilaiIDR === 0 ? '' : item.nilaiIDR}
                        onChange={e => updateItem(item._key, 'nilaiIDR', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item._key)}
                        disabled={items.length === 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Total */}
            <div className="mt-4 flex justify-end">
              <div className="bg-muted/40 rounded-lg px-6 py-3 text-sm space-y-1 min-w-[280px]">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Berat Bersih</span>
                  <span className="font-medium">{totalBeratBersih.toLocaleString('id-ID')} Kg</span>
                </div>
                <div className="flex justify-between border-t pt-1 mt-1">
                  <span className="font-semibold">Total Nilai IDR</span>
                  <span className="font-bold text-primary text-base">
                    Rp {totalNilaiIDR.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Catatan */}
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1.5">
              <Label>Catatan</Label>
              <Textarea
                placeholder="Keterangan tambahan (opsional)"
                rows={2}
                value={catatan}
                onChange={e => setCatatan(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {!isValid && (
          <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Lengkapi Nama Pembeli dan minimal 1 item barang (nama + qty) sebelum menyimpan.
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/logistics/penjualan-lokal">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button
            variant="outline"
            disabled={!isValid}
            onClick={() => handleSave('Draft')}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Simpan Draft
          </Button>
          <Button
            disabled={!isValid}
            onClick={() => handleSave('Submitted')}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Submit Dokumen
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
