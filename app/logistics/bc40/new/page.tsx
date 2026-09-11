'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Plus, Trash2, Save, Send, Building2, Package, Truck, FileText } from 'lucide-react'
import AppLayout from '@/components/app-layout'
import { useBC40, type BC40Item } from '@/lib/store/useBC40'

const SATUAN_OPTIONS = ['KG', 'MTR', 'PCS', 'LITER', 'ROLL', 'CTN', 'YARD', 'SF', 'SHT', 'TNE', 'PCE', 'ST', 'FTK', 'KGM', 'SET', 'TON']
const MATA_UANG = ['IDR', 'USD', 'KRW']
const DEFAULT_KURS: Record<string, number> = { IDR: 1, USD: 15500, KRW: 11 }

let _itemCounter = 1
function newItem(): BC40Item & { _key: string } {
  return {
    _key: `item-${_itemCounter++}`,
    id: '',
    kodeBarang: '',
    namaBarang: '',
    posTarif: '',
    satuan: 'KG',
    qty: 0,
    beratBersih: 0,
    hargaSatuan: 0,
    mataUang: 'IDR',
    nilaiIDR: 0,
  }
}

export default function BC40NewPage() {
  const router = useRouter()
  const { createDocument } = useBC40()

  // Header
  const [nomorBC40, setNomorBC40] = useState('')
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0])
  const [kantorPabean, setKantorPabean] = useState('KPPBC TMP B Surakarta')
  const [jenisTranaksi, setJenisTranaksi] = useState('PENYERAHAN BKP')

  // Penjual
  const [penjualNama, setPenjualNama] = useState('')
  const [penjualNPWP, setPenjualNPWP] = useState('')
  const [penjualAlamat, setPenjualAlamat] = useState('')

  // Dokumen
  const [noFakturPajak, setNoFakturPajak] = useState('')
  const [noPackingList, setNoPackingList] = useState('')
  const [noKontrak, setNoKontrak] = useState('')

  // Pengangkutan
  const [jenisKendaraan, setJenisKendaraan] = useState('Truk')
  const [noKendaraan, setNoKendaraan] = useState('')
  const [noSuratJalan, setNoSuratJalan] = useState('')

  // Barang
  const [items, setItems] = useState<(BC40Item & { _key: string })[]>([newItem()])
  const [kurs, setKurs] = useState(1)
  const [mataUang, setMataUang] = useState('IDR')

  const [catatan, setCatatan] = useState('')

  function addItem() {
    setItems(prev => [...prev, newItem()])
  }

  function removeItem(key: string) {
    setItems(prev => prev.filter(i => i._key !== key))
  }

  function updateItem(key: string, field: keyof BC40Item, value: string | number) {
    setItems(prev => prev.map(item => {
      if (item._key !== key) return item
      const updated = { ...item, [field]: value }
      if (field === 'qty' || field === 'hargaSatuan') {
        const q = field === 'qty' ? Number(value) : item.qty
        const h = field === 'hargaSatuan' ? Number(value) : item.hargaSatuan
        const kursVal = mataUang === 'IDR' ? 1 : (kurs || DEFAULT_KURS[mataUang] || 1)
        updated.nilaiIDR = Math.round(q * h * kursVal)
      }
      return updated
    }))
  }

  const totalNilaiIDR = items.reduce((sum, i) => sum + (i.nilaiIDR || 0), 0)

  function handleSave(status: 'Draft' | 'Submitted') {
    if (!nomorBC40 || !penjualNama || items.every(i => !i.namaBarang)) return
    const { _key: _k, ...rest } = items[0]
    createDocument({
      nomorBC40,
      tanggal,
      kantorPabean,
      jenisTranaksi,
      penjualNama,
      penjualNPWP,
      penjualAlamat,
      noFakturPajak,
      noPackingList,
      noKontrak,
      jenisKendaraan,
      noKendaraan,
      noSuratJalan,
      items: items.map(({ _key, ...i }) => ({ ...i, id: _key })),
      totalNilaiIDR,
      kurs,
      mataUang,
      status,
      catatan,
    })
    router.push('/logistics/bc40')
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/logistics/bc40">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Buat BC 4.0 Baru</h1>
            <p className="text-sm text-muted-foreground">Pemberitahuan Pemasukan Barang Asal Tempat Lain ke TPB</p>
          </div>
        </div>

        {/* Section 1: Header Dokumen */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              1. Informasi Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nomor BC 4.0 <span className="text-red-500">*</span></Label>
              <Input placeholder="BC40-2026-001" value={nomorBC40} onChange={e => setNomorBC40(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Tanggal</Label>
              <Input type="date" value={tanggal} onChange={e => setTanggal(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Kantor Pabean</Label>
              <Select value={kantorPabean} onValueChange={setKantorPabean}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="KPPBC TMP B Surakarta">KPPBC TMP B Surakarta</SelectItem>
                  <SelectItem value="KPPBC TMP A Jakarta">KPPBC TMP A Jakarta</SelectItem>
                  <SelectItem value="KPPBC Tanjung Priok">KPPBC Tanjung Priok</SelectItem>
                  <SelectItem value="KPPBC Semarang">KPPBC Semarang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Jenis Transaksi</Label>
              <Select value={jenisTranaksi} onValueChange={setJenisTranaksi}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENYERAHAN BKP">PENYERAHAN BKP</SelectItem>
                  <SelectItem value="PENYERAHAN JASA">PENYERAHAN JASA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Data Penjual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              2. Data Penjual (Pengusaha di Luar TPB)
            </CardTitle>
            <CardDescription>Pihak yang menyerahkan barang ke TPB JKJ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Nama Penjual / Perusahaan <span className="text-red-500">*</span></Label>
                <Input placeholder="PT. / CV. ..." value={penjualNama} onChange={e => setPenjualNama(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>NPWP Penjual</Label>
                <Input placeholder="00.000.000.0-000.000" value={penjualNPWP} onChange={e => setPenjualNPWP(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Alamat Penjual</Label>
              <Textarea placeholder="Jl. ..." value={penjualAlamat} onChange={e => setPenjualAlamat(e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Dokumen Pendukung */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              3. Dokumen Pendukung
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>No. Faktur Pajak</Label>
              <Input placeholder="010.000-26.00000001" value={noFakturPajak} onChange={e => setNoFakturPajak(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>No. Packing List</Label>
              <Input placeholder="PL-2026-001" value={noPackingList} onChange={e => setNoPackingList(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>No. Kontrak</Label>
              <Input placeholder="KONT-2026-001" value={noKontrak} onChange={e => setNoKontrak(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Pengangkutan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              4. Data Pengangkutan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Jenis Kendaraan</Label>
              <Select value={jenisKendaraan} onValueChange={setJenisKendaraan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Truk">Truk</SelectItem>
                  <SelectItem value="Pickup">Pickup</SelectItem>
                  <SelectItem value="Fuso">Fuso</SelectItem>
                  <SelectItem value="Container">Container</SelectItem>
                  <SelectItem value="Ekspedisi">Ekspedisi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>No. Polisi Kendaraan</Label>
              <Input placeholder="AB 1234 CD" value={noKendaraan} onChange={e => setNoKendaraan(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>No. Surat Jalan</Label>
              <Input placeholder="SJ-2026-001" value={noSuratJalan} onChange={e => setNoSuratJalan(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Data Barang */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                5. Data Barang
              </CardTitle>
              <CardDescription>Detail item material yang masuk ke TPB</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs whitespace-nowrap">Mata Uang</Label>
                <Select value={mataUang} onValueChange={v => { setMataUang(v); setKurs(DEFAULT_KURS[v] || 1) }}>
                  <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MATA_UANG.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {mataUang !== 'IDR' && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs whitespace-nowrap">Kurs ({mataUang}/IDR)</Label>
                  <Input
                    type="number"
                    value={kurs}
                    onChange={e => setKurs(Number(e.target.value))}
                    className="w-28"
                  />
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">No</TableHead>
                    <TableHead>Pos Tarif/HS</TableHead>
                    <TableHead>Kode Barang</TableHead>
                    <TableHead className="min-w-[180px]">Nama / Merek Barang</TableHead>
                    <TableHead className="w-20">Satuan</TableHead>
                    <TableHead className="w-24 text-right">Qty</TableHead>
                    <TableHead className="w-28 text-right">Berat Bersih (Kg)</TableHead>
                    <TableHead className="w-28 text-right">Harga Satuan</TableHead>
                    <TableHead className="w-32 text-right">Nilai IDR</TableHead>
                    <TableHead className="w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={item._key}>
                      <TableCell className="text-muted-foreground text-center">{idx + 1}</TableCell>
                      <TableCell>
                        <Input
                          placeholder="58061090"
                          value={item.posTarif}
                          onChange={e => updateItem(item._key, 'posTarif', e.target.value)}
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="110-002-0206"
                          value={item.kodeBarang}
                          onChange={e => updateItem(item._key, 'kodeBarang', e.target.value)}
                          className="w-32"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Nama barang / merek"
                          value={item.namaBarang}
                          onChange={e => updateItem(item._key, 'namaBarang', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Select value={item.satuan} onValueChange={v => updateItem(item._key, 'satuan', v)}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SATUAN_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={item.qty === 0 ? '' : item.qty}
                          onChange={e => updateItem(item._key, 'qty', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          className="text-right w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={item.beratBersih === 0 ? '' : item.beratBersih}
                          onChange={e => updateItem(item._key, 'beratBersih', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          className="text-right w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="0"
                          value={item.hargaSatuan === 0 ? '' : item.hargaSatuan}
                          onChange={e => updateItem(item._key, 'hargaSatuan', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                          className="text-right w-28"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">
                        {item.nilaiIDR ? `Rp ${item.nilaiIDR.toLocaleString('id-ID')}` : '—'}
                      </TableCell>
                      <TableCell>
                        {items.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => removeItem(item._key)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Button variant="outline" size="sm" className="gap-2" onClick={addItem}>
              <Plus className="h-4 w-4" />Tambah Baris
            </Button>

            {/* Total */}
            <div className="flex justify-end mt-2">
              <div className="text-right bg-muted/30 border rounded-md px-4 py-2">
                <p className="text-xs text-muted-foreground">Total Nilai</p>
                <p className="text-xl font-bold text-primary">Rp {totalNilaiIDR.toLocaleString('id-ID')}</p>
                {mataUang !== 'IDR' && (
                  <p className="text-xs text-blue-600">{mataUang} {(totalNilaiIDR / (kurs || 1)).toFixed(2)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Catatan */}
        <Card>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <Label>Catatan Tambahan</Label>
              <Textarea placeholder="Keterangan tambahan (opsional)..." value={catatan} onChange={e => setCatatan(e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link href="/logistics/bc40">
            <Button variant="outline">Batal</Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2"
            disabled={!nomorBC40 || !penjualNama}
            onClick={() => handleSave('Draft')}
          >
            <Save className="h-4 w-4" />
            Simpan Draft
          </Button>
          <Button
            className="gap-2"
            disabled={!nomorBC40 || !penjualNama || items.every(i => !i.namaBarang)}
            onClick={() => handleSave('Submitted')}
          >
            <Send className="h-4 w-4" />
            Submit BC 4.0
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
