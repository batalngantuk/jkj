'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Factory, Plus, Download, FileText, Package,
  ChevronRight, CheckCircle2, Clock, Truck,
  DollarSign, AlertCircle, Building2, ExternalLink, Send, Trash2
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import { exportToExcel } from '@/lib/utils/export-excel'
import { useSubkontrak } from '@/lib/store/hooks'
import {
  MOCK_SUBKON_MASTER,
  SUBKON_STATUS_STEPS,
  SUBKON_STATUS_CONFIG,
  type SubkonRecord,
  type SubkonStatus
} from '@/lib/mock-data/subkontrak'

function formatIDR(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function formatNumber(n: number) {
  return n.toLocaleString('id-ID')
}

function StatusBadge({ status }: { status: SubkonStatus }) {
  const cfg = SUBKON_STATUS_CONFIG[status]
  const icons: Record<SubkonStatus, React.ReactNode> = {
    'Draft':          <Clock className="h-3 w-3" />,
    'BB Dikirim':     <Truck className="h-3 w-3" />,
    'Dalam Proses':   <Factory className="h-3 w-3" />,
    'Hasil Diterima': <Package className="h-3 w-3" />,
    'Selesai':        <CheckCircle2 className="h-3 w-3" />,
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {icons[status]}
      {status}
    </span>
  )
}

function StatusStepper({ status }: { status: SubkonStatus }) {
  const currentIdx = SUBKON_STATUS_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {SUBKON_STATUS_STEPS.map((step, idx) => {
        const done = idx < currentIdx
        const active = idx === currentIdx
        const cfg = SUBKON_STATUS_CONFIG[step]
        return (
          <React.Fragment key={step}>
            <div className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap
              ${active ? `${cfg.color} ${cfg.bg} ${cfg.border}` : done ? 'text-green-700 bg-green-50 border-green-300' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>
              {done ? '✓' : idx + 1}. {step}
            </div>
            {idx < SUBKON_STATUS_STEPS.length - 1 && (
              <ChevronRight className={`h-3 w-3 shrink-0 ${done ? 'text-green-500' : 'text-gray-300'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

interface BBItem { kodeBB: string; namaBB: string; qty: number; satuan: string; isKITE: boolean }

export default function SubkontrakPage() {
  const { records, createSubkon, updateSubkon } = useSubkontrak()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedRecord, setSelectedRecord] = useState<SubkonRecord | null>(null)
  const [showFormDialog, setShowFormDialog] = useState(false)

  // Form state
  const [formSubkon, setFormSubkon] = useState('')
  const [formSubkonText, setFormSubkonText] = useState('') // manual entry if not in master
  const [formNoSO, setFormNoSO] = useState('')
  const [formQtyCMT, setFormQtyCMT] = useState('')
  const [formSatuanCMT, setFormSatuanCMT] = useState('carton')
  const [formDeskripsi, setFormDeskripsi] = useState('')
  const [formTarget, setFormTarget] = useState('')
  const [formCatatan, setFormCatatan] = useState('')
  const [formBBItems, setFormBBItems] = useState<BBItem[]>([{ kodeBB: '', namaBB: '', qty: 0, satuan: 'KG', isKITE: true }])

  // S2: Kirim BB dialog state
  const [showKirimBB, setShowKirimBB] = useState(false)
  const [kirimTarget, setKirimTarget] = useState<SubkonRecord | null>(null)
  const [kirimSJNo, setKirimSJNo] = useState('')
  const [kirimSubkNo, setKirimSubkNo] = useState('')
  const [kirimTgl, setKirimTgl] = useState(new Date().toISOString().slice(0, 10))

  // Terima Hasil CMT dialog state
  const [showTerima, setShowTerima] = useState(false)
  const [terimaTarget, setTerimaTarget] = useState<SubkonRecord | null>(null)
  const [terimaKiteNo, setTerimaKiteNo] = useState('')
  const [terimaTgl, setTerimaTgl] = useState(new Date().toISOString().slice(0, 10))
  const [terimaQtys, setTerimaQtys] = useState<Record<number, string>>({})
  const [terimaNoSJ, setTerimaNoSJ] = useState('')
  const [terimaCatatan, setTerimaCatatan] = useState('')

  const filtered = records.filter(r =>
    filterStatus === 'all' ? true : r.status === filterStatus
  )

  const counts = {
    total: records.length,
    draft: records.filter(r => r.status === 'Draft').length,
    berjalan: records.filter(r => ['BB Dikirim', 'Dalam Proses', 'Hasil Diterima'].includes(r.status)).length,
    selesai: records.filter(r => r.status === 'Selesai').length,
  }

  function resetForm() {
    setFormSubkon(''); setFormSubkonText(''); setFormNoSO('')
    setFormQtyCMT(''); setFormSatuanCMT('carton')
    setFormDeskripsi(''); setFormTarget('')
    setFormCatatan('')
    setFormBBItems([{ kodeBB: '', namaBB: '', qty: 0, satuan: 'KG', isKITE: true }])
  }

  function addBBItem() {
    setFormBBItems(prev => [...prev, { kodeBB: '', namaBB: '', qty: 0, satuan: 'KG', isKITE: true }])
  }

  function updateBBItem(i: number, field: keyof BBItem, val: string | number | boolean) {
    setFormBBItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item))
  }

  function removeBBItem(i: number) {
    if (formBBItems.length === 1) return
    setFormBBItems(prev => prev.filter((_, idx) => idx !== i))
  }

  function openKirimBB(rec: SubkonRecord) {
    setKirimTarget(rec)
    const year = new Date().getFullYear()
    const nums = records.map(r => { const m = r.subkKiteKirimNo.match(/(\d+)$/); return m ? parseInt(m[1]) : 0 })
    const next = Math.max(0, ...nums) + 1
    setKirimSubkNo(`SUBK-1.1-${year}-${String(next).padStart(3, '0')}`)
    setKirimSJNo(`SJ-${year}-${String(next).padStart(3, '0')}`)
    setKirimTgl(new Date().toISOString().slice(0, 10))
    setShowKirimBB(true)
  }

  function openTerima(rec: SubkonRecord) {
    setTerimaTarget(rec)
    const year = new Date().getFullYear()
    const next = Math.max(0, ...records.map(r => { const m = r.subkKiteTerimaNo.match(/(\d+)$/); return m ? parseInt(m[1]) : 0 })) + 1
    setTerimaKiteNo(`SUBK-1.2-${year}-${String(next).padStart(3, '0')}`)
    setTerimaNoSJ(`SJ-IN-${year}-${String(next).padStart(3, '0')}`)
    setTerimaTgl(new Date().toISOString().slice(0, 10))
    setTerimaQtys(Object.fromEntries(rec.items.map((item, i) => [i, String(item.qtyKirim)])))
    setTerimaCatatan('')
    setShowTerima(true)
  }

  function handleConfirmTerima() {
    if (!terimaTarget) return
    const updatedItems = terimaTarget.items.map((item, i) => ({
      ...item,
      qtyKembali: parseFloat(terimaQtys[i] ?? item.qtyKirim) || 0,
    }))
    updateSubkon(terimaTarget.id, {
      status: 'Hasil Diterima',
      subkKiteTerimaNo: terimaKiteNo,
      subkKiteTerimaTgl: terimaTgl,
      items: updatedItems,
    })
    setShowTerima(false)
    setTerimaTarget(null)
    setSelectedRecord(null)
  }

  function handleConfirmKirim() {
    if (!kirimTarget) return
    updateSubkon(kirimTarget.id, {
      status: 'BB Dikirim',
      subkKiteKirimNo: kirimSubkNo,
      subkKiteKirimTgl: kirimTgl,
      suratJalanNo: kirimSJNo,
      suratJalanTgl: kirimTgl,
    })
    setShowKirimBB(false)
    setKirimTarget(null)
    setSelectedRecord(null)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Building2 className="h-8 w-8 text-orange-500" />
              Subkontrak KITE
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pengelolaan pekerjaan subkontrak — pengiriman BB, penerimaan hasil, dokumen SUBK KITE
            </p>
          </div>
          <Button className="gap-2" onClick={() => { resetForm(); setShowFormDialog(true) }}>
            <Plus className="h-4 w-4" />
            Buat Job Subkon Baru
          </Button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-blue-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Berjalan</p>
              <p className="text-2xl font-bold text-blue-700">{counts.berjalan}</p>
              <p className="text-xs text-muted-foreground">job aktif</p>
            </CardContent>
          </Card>
          <Card className="border-gray-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold text-gray-700">{counts.draft}</p>
              <p className="text-xs text-muted-foreground">belum dikirim</p>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Selesai</p>
              <p className="text-2xl font-bold text-green-700">{counts.selesai}</p>
              <p className="text-xs text-muted-foreground">job selesai</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Daftar Job Subkontrak</CardTitle>
              <CardDescription>Klik baris untuk melihat detail, dokumen SUBK KITE, dan fee jasa</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {SUBKON_STATUS_STEPS.map(s => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={() => exportToExcel(filtered as unknown as Record<string,unknown>[], 'Subkontrak_Report', 'Subkontrak')}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID Job</TableHead>
                  <TableHead>Subkontraktor</TableHead>
                  <TableHead>Pekerjaan</TableHead>
                  <TableHead>Tgl Job</TableHead>
                  <TableHead>Target Selesai</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>SUBK KITE Kirim</TableHead>
                  <TableHead>SUBK KITE Terima</TableHead>
                  <TableHead>Fee Jasa</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(row => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={() => setSelectedRecord(row)}
                  >
                    <TableCell className="font-mono text-xs">{row.id}</TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{row.namaSubkon}</p>
                    </TableCell>
                    <TableCell className="text-sm max-w-48 truncate">{row.deskripsiPekerjaan}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{row.jobTgl}</TableCell>
                    <TableCell className="whitespace-nowrap text-sm">{row.targetSelesai}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {row.items.map((item, i) => (
                          <Badge key={i} variant={item.isKITE ? 'default' : 'secondary'} className="text-xs">
                            {item.isKITE ? 'KITE' : 'Non-KITE'}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.subkKiteKirimNo === '-'
                        ? <span className="text-muted-foreground">—</span>
                        : <span>{row.subkKiteKirimJenis}<br />{row.subkKiteKirimNo}</span>
                      }
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {row.subkKiteTerimaNo === '-'
                        ? <span className="text-muted-foreground">—</span>
                        : <span>{row.subkKiteTerimaJenis}<br />{row.subkKiteTerimaNo}</span>
                      }
                    </TableCell>
                    <TableCell>
                      {row.feeJasa.nilaiJasa > 0 ? (
                        <div>
                          <p className="text-sm font-medium">{formatIDR(row.feeJasa.nilaiJasa)}</p>
                          <Badge variant={row.feeJasa.status === 'Sudah Dibayar' ? 'default' : 'destructive'} className="text-xs mt-0.5">
                            {row.feeJasa.status}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Belum ada invoice</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={row.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">{filtered.length} job ditemukan</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Detail Dialog ── */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-orange-500" />
                {selectedRecord.id} — {selectedRecord.namaSubkon}
              </DialogTitle>
              <DialogDescription>{selectedRecord.deskripsiPekerjaan}</DialogDescription>
            </DialogHeader>

            {/* Status Stepper */}
            <div className="py-1">
              <p className="text-xs text-muted-foreground mb-2">Alur Proses</p>
              <StatusStepper status={selectedRecord.status} />
            </div>

            <Separator />

            <Tabs defaultValue="detail">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="detail">Info Job</TabsTrigger>
                <TabsTrigger value="material">Material</TabsTrigger>
                <TabsTrigger value="dokumen">Dokumen SUBK</TabsTrigger>
                <TabsTrigger value="fee">Fee Jasa</TabsTrigger>
              </TabsList>

              {/* Tab 1: Info Job */}
              <TabsContent value="detail" className="space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Subkontraktor</p>
                      <p className="font-medium">{selectedRecord.namaSubkon}</p>
                      <p className="text-xs text-muted-foreground">{selectedRecord.alamatSubkon}</p>
                      <p className="text-xs text-muted-foreground">NPWP: {selectedRecord.npwpSubkon}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Nomor Job</p>
                      <p className="font-medium font-mono">{selectedRecord.jobNo}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Job</p>
                      <p className="font-medium">{selectedRecord.jobTgl}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Target Selesai</p>
                      <p className="font-medium">{selectedRecord.targetSelesai}</p>
                    </div>
                    {selectedRecord.qtyCMT && (
                      <div>
                        <p className="text-xs text-muted-foreground">Qty Barang Jadi CMT</p>
                        <p className="font-medium text-blue-700">{selectedRecord.qtyCMT.toLocaleString('id-ID')} {selectedRecord.satuanCMT}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-muted-foreground">Tanggal Selesai Aktual</p>
                      <p className={`font-medium ${selectedRecord.tglSelesaiAktual === '-' ? 'text-muted-foreground' : ''}`}>
                        {selectedRecord.tglSelesaiAktual === '-' ? 'Belum selesai' : selectedRecord.tglSelesaiAktual}
                      </p>
                    </div>
                  </div>
                </div>
                {selectedRecord.catatan && (
                  <div>
                    <p className="text-xs text-muted-foreground">Catatan</p>
                    <p className="text-sm">{selectedRecord.catatan}</p>
                  </div>
                )}
              </TabsContent>

              {/* Tab 2: Material */}
              <TabsContent value="material" className="mt-3">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Kode BB</TableHead>
                      <TableHead>Nama Bahan</TableHead>
                      <TableHead>Fasilitas</TableHead>
                      <TableHead className="text-right">Qty Kirim</TableHead>
                      <TableHead className="text-right">Qty Kembali</TableHead>
                      <TableHead>Satuan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedRecord.items.map((item, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{item.kodeBB}</TableCell>
                        <TableCell>{item.namaBB}</TableCell>
                        <TableCell>
                          <Badge variant={item.isKITE ? 'default' : 'secondary'} className="text-xs">
                            {item.isKITE ? 'KITE' : 'Non-KITE'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatNumber(item.qtyKirim)}</TableCell>
                        <TableCell className="text-right">
                          {item.qtyKembali !== undefined
                            ? <span className="font-medium text-green-700">{formatNumber(item.qtyKembali)}</span>
                            : <span className="text-muted-foreground">—</span>
                          }
                        </TableCell>
                        <TableCell>{item.satuanBB}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-3 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Material berlabel KITE wajib tercatat di Laporan 3 IT Inventory (Pemakaian BB Subkontrak)
                </div>
              </TabsContent>

              {/* Tab 3: Dokumen SUBK KITE */}
              <TabsContent value="dokumen" className="space-y-4 mt-3">
                <div className="grid grid-cols-2 gap-4">
                  {/* Pengeluaran BB ke Subkon */}
                  <div className={`border rounded-lg p-4 ${selectedRecord.subkKiteKirimNo !== '-' ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className={`h-4 w-4 ${selectedRecord.subkKiteKirimNo !== '-' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <p className="font-medium text-sm">{selectedRecord.subkKiteKirimJenis}</p>
                      <Badge variant="outline" className="text-xs ml-auto">Pengeluaran BB</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nomor</span>
                        <span className="font-mono text-xs">{selectedRecord.subkKiteKirimNo === '-' ? '—' : selectedRecord.subkKiteKirimNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tanggal</span>
                        <span>{selectedRecord.subkKiteKirimTgl === '-' ? '—' : selectedRecord.subkKiteKirimTgl}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Surat Jalan</span>
                        <span className="font-mono text-xs">{selectedRecord.suratJalanNo === '-' ? '—' : selectedRecord.suratJalanNo}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pemasukan Hasil dari Subkon */}
                  <div className={`border rounded-lg p-4 ${selectedRecord.subkKiteTerimaNo !== '-' ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className={`h-4 w-4 ${selectedRecord.subkKiteTerimaNo !== '-' ? 'text-green-600' : 'text-gray-400'}`} />
                      <p className="font-medium text-sm">{selectedRecord.subkKiteTerimaJenis}</p>
                      <Badge variant="outline" className="text-xs ml-auto">Pemasukan Hasil</Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nomor</span>
                        <span className="font-mono text-xs">{selectedRecord.subkKiteTerimaNo === '-' ? '—' : selectedRecord.subkKiteTerimaNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tanggal</span>
                        <span>{selectedRecord.subkKiteTerimaTgl === '-' ? '—' : selectedRecord.subkKiteTerimaTgl}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  SUBK KITE 1.1 = pengeluaran BB ke subkon | SUBK KITE 1.2 = pemasukan hasil dari subkon.
                  Dokumen ini wajib ada sebelum BB keluar kawasan JKJ menuju subkontraktor.
                </div>
              </TabsContent>

              {/* Tab 4: Fee Jasa */}
              <TabsContent value="fee" className="mt-3">
                <div className={`border rounded-lg p-4 ${selectedRecord.feeJasa.nilaiJasa > 0 ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="h-4 w-4 text-blue-600" />
                    <p className="font-medium">Invoice Fee Jasa Subkontraktor</p>
                  </div>
                  {selectedRecord.feeJasa.nilaiJasa > 0 ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">No Invoice</span>
                        <span className="font-mono text-xs">{selectedRecord.feeJasa.invoiceNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Tanggal</span>
                        <span>{selectedRecord.feeJasa.invoiceTgl}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="font-medium">Nilai Jasa</span>
                        <span className="font-bold text-lg">{formatIDR(selectedRecord.feeJasa.nilaiJasa)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status Pembayaran</span>
                        <Badge variant={selectedRecord.feeJasa.status === 'Sudah Dibayar' ? 'default' : 'destructive'}>
                          {selectedRecord.feeJasa.status}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Invoice belum diterima dari subkontraktor.</p>
                  )}
                </div>
                <div className="mt-3 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  Fee jasa subkon dicatat sebagai biaya produksi dan diproses melalui modul Finance (AP/Invoices).
                </div>
                <Link href="/finance/invoices" className="block mt-2">
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Lihat di Finance → Invoices & Bills
                  </Button>
                </Link>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>Tutup</Button>
              {selectedRecord.status === 'Draft' && (
                <Button className="gap-2" onClick={() => openKirimBB(selectedRecord)}>
                  <Truck className="h-4 w-4" />
                  Kirim BB ke Subkon
                </Button>
              )}
              {(selectedRecord.status === 'BB Dikirim' || selectedRecord.status === 'Dalam Proses') && (
                <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={() => { openTerima(selectedRecord); setSelectedRecord(null) }}>
                  <Package className="h-4 w-4" />
                  Terima Hasil dari CMT
                </Button>
              )}
              {selectedRecord.status === 'Hasil Diterima' && (
                <Button className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Selesaikan Job
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── S2: Dialog Kirim BB ke Subkon ── */}
      <Dialog open={showKirimBB} onOpenChange={v => { if (!v) { setShowKirimBB(false); setKirimTarget(null) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Kirim BB ke Subkon
            </DialogTitle>
          </DialogHeader>
          {kirimTarget && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm space-y-1">
                <p className="font-medium">{kirimTarget.namaSubkon}</p>
                <p className="text-muted-foreground text-xs">{kirimTarget.deskripsiPekerjaan}</p>
                {kirimTarget.items.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {kirimTarget.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span>{item.namaBB}</span>
                        <span className="text-muted-foreground">{item.qtyKirim.toLocaleString('id-ID')} {item.satuanBB}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal Pengiriman</Label>
                <Input type="date" value={kirimTgl} onChange={e => setKirimTgl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>No. Surat Jalan</Label>
                <Input placeholder="SJ-2026-001" value={kirimSJNo} onChange={e => setKirimSJNo(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>No. SUBK KITE 1.1</Label>
                <Input placeholder="SUBK-1.1-2026-001" value={kirimSubkNo} onChange={e => setKirimSubkNo(e.target.value)} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowKirimBB(false); setKirimTarget(null) }}>Batal</Button>
            <Button
              disabled={!kirimSJNo || !kirimSubkNo || !kirimTgl}
              onClick={handleConfirmKirim}
              className="gap-2"
            >
              <Send className="h-4 w-4" />Konfirmasi Kirim BB
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Terima Hasil dari CMT ── */}
      <Dialog open={showTerima} onOpenChange={v => { if (!v) { setShowTerima(false); setTerimaTarget(null) } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-700">
              <Package className="h-5 w-5" />
              Terima Hasil dari CMT — {terimaTarget?.namaSubkon}
            </DialogTitle>
            <DialogDescription>
              Input qty barang jadi yang diterima kembali dari subkontraktor/CMT
            </DialogDescription>
          </DialogHeader>
          {terimaTarget && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tanggal Terima</Label>
                  <Input type="date" value={terimaTgl} onChange={e => setTerimaTgl(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>No. Surat Jalan Masuk</Label>
                  <Input placeholder="SJ-IN-2026-001" value={terimaNoSJ} onChange={e => setTerimaNoSJ(e.target.value)} />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <Label>No. SUBK KITE 1.2</Label>
                  <Input placeholder="SUBK-1.2-2026-001" value={terimaKiteNo} onChange={e => setTerimaKiteNo(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase">Qty Hasil Diterima per BB/Item</Label>
                {terimaTarget.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-3 items-center rounded border px-3 py-2">
                    <div className="col-span-2">
                      <p className="text-sm font-medium">{item.namaBB}</p>
                      <p className="text-xs text-muted-foreground">{item.kodeBB} · Dikirim: {item.qtyKirim.toLocaleString('id-ID')} {item.satuanBB}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Qty kembali</Label>
                      <Input
                        type="number"
                        value={terimaQtys[i] ?? item.qtyKirim}
                        onChange={e => setTerimaQtys(prev => ({ ...prev, [i]: e.target.value }))}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {terimaTarget.qtyCMT && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-3 text-sm">
                  <p className="text-blue-700">Target BJ: <strong>{terimaTarget.qtyCMT.toLocaleString('id-ID')} {terimaTarget.satuanCMT}</strong></p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Catatan</Label>
                <Input placeholder="Kondisi barang, catatan QC, dll..." value={terimaCatatan} onChange={e => setTerimaCatatan(e.target.value)} />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowTerima(false)}>Batal</Button>
            <Button
              className="gap-2 bg-green-600 hover:bg-green-700"
              disabled={!terimaTgl || !terimaKiteNo}
              onClick={handleConfirmTerima}
            >
              <Package className="h-4 w-4" />Konfirmasi Terima Hasil CMT
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Form: Buat Job Subkon Baru ── */}
      <Dialog open={showFormDialog} onOpenChange={(v) => { if (!v) { setShowFormDialog(false); resetForm() } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Buat Job Subkontrak Baru
            </DialogTitle>
            <DialogDescription>
              Isi data job dan bahan baku yang akan dikirim ke subkontraktor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-1">

            {/* Section: Info Job */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Info Job</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label>Subkontraktor / CMT <span className="text-red-500">*</span></Label>
                  <Select value={formSubkon} onValueChange={v => { setFormSubkon(v); if (v !== 'custom') setFormSubkonText('') }}>
                    <SelectTrigger><SelectValue placeholder="Pilih subkontraktor..." /></SelectTrigger>
                    <SelectContent>
                      {MOCK_SUBKON_MASTER.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                      ))}
                      <SelectItem value="custom">+ Input nama baru (manual)...</SelectItem>
                    </SelectContent>
                  </Select>
                  {formSubkon === 'custom' && (
                    <Input
                      placeholder="Ketik nama subkontraktor / CMT baru"
                      value={formSubkonText}
                      onChange={e => setFormSubkonText(e.target.value)}
                      className="mt-1.5"
                      autoFocus
                    />
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>No. Sales Order <span className="text-muted-foreground text-xs">(opsional)</span></Label>
                    <Input placeholder="SO-2026-001" value={formNoSO} onChange={e => setFormNoSO(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Target Selesai <span className="text-red-500">*</span></Label>
                    <Input type="date" value={formTarget} onChange={e => setFormTarget(e.target.value)} />
                  </div>
                </div>

                {/* Qty Total CMT */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Qty Barang Jadi CMT</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={formQtyCMT}
                      onChange={e => setFormQtyCMT(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Total qty BJ yang akan diproduksi CMT</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Satuan BJ CMT</Label>
                    <Select value={formSatuanCMT} onValueChange={setFormSatuanCMT}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['carton', 'pcs', 'prs', 'box', 'kg', 'mtr', 'yard', 'roll'].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Deskripsi Pekerjaan <span className="text-red-500">*</span></Label>
                  <Textarea
                    placeholder="Jelaskan pekerjaan yang akan disubkonkan..."
                    value={formDeskripsi}
                    onChange={e => setFormDeskripsi(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Section: Bahan Baku */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bahan Baku yang Dikirim</p>
                <Button type="button" variant="outline" size="sm" onClick={addBBItem} className="gap-1.5 h-8">
                  <Plus className="h-3.5 w-3.5" />Tambah BB
                </Button>
              </div>

              <div className="space-y-2">
                {formBBItems.map((bb, i) => (
                  <div key={i} className="rounded-lg border bg-muted/20 p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">BB #{i + 1}</span>
                      {formBBItems.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeBBItem(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Kode BB</Label>
                        <Input className="h-8" placeholder="BB-001" value={bb.kodeBB} onChange={e => updateBBItem(i, 'kodeBB', e.target.value)} />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Label className="text-xs">Nama Bahan <span className="text-red-500">*</span></Label>
                        <Input className="h-8" placeholder="Nama bahan baku" value={bb.namaBB} onChange={e => updateBBItem(i, 'namaBB', e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input type="number" className="h-8" placeholder="0" value={bb.qty || ''} onChange={e => updateBBItem(i, 'qty', parseFloat(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Satuan</Label>
                        <Select value={bb.satuan} onValueChange={v => updateBBItem(i, 'satuan', v)}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['KG', 'MTR', 'LITER', 'PCS', 'ROLL', 'CTN', 'YARD', 'SF'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Fasilitas</Label>
                        <Select value={bb.isKITE ? 'yes' : 'no'} onValueChange={v => updateBBItem(i, 'isKITE', v === 'yes')}>
                          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">KITE</SelectItem>
                            <SelectItem value="no">Non-KITE</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Catatan */}
            <div className="space-y-1.5">
              <Label>Catatan <span className="text-muted-foreground text-xs">(opsional)</span></Label>
              <Textarea placeholder="Catatan tambahan..." value={formCatatan} onChange={e => setFormCatatan(e.target.value)} rows={2} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowFormDialog(false); resetForm() }}>
              Batal
            </Button>
            <Button
              disabled={!formSubkon || (formSubkon === 'custom' && !formSubkonText) || !formDeskripsi || !formTarget}
              onClick={() => {
                const master = MOCK_SUBKON_MASTER.find(s => s.id === formSubkon)
                const namaFinal = formSubkon === 'custom' ? formSubkonText : (master?.nama ?? formSubkon)
                createSubkon({
                  namaSubkon: namaFinal,
                  alamatSubkon: '-',
                  npwpSubkon: master?.npwp ?? '-',
                  jobNo: '-',
                  jobTgl: new Date().toISOString().slice(0, 10),
                  noSO: formNoSO || undefined,
                  qtyCMT: formQtyCMT ? parseFloat(formQtyCMT) : undefined,
                  satuanCMT: formQtyCMT ? formSatuanCMT : undefined,
                  deskripsiPekerjaan: formDeskripsi,
                  targetSelesai: formTarget,
                  tglSelesaiAktual: '-',
                  subkKiteKirimNo: '-',
                  subkKiteKirimTgl: '-',
                  subkKiteKirimJenis: 'SUBK KITE 1.1',
                  subkKiteTerimaNo: '-',
                  subkKiteTerimaTgl: '-',
                  subkKiteTerimaJenis: 'SUBK KITE 1.2',
                  suratJalanNo: '-',
                  suratJalanTgl: '-',
                  items: formBBItems
                    .filter(bb => bb.namaBB)
                    .map(bb => ({
                      kodeBB: bb.kodeBB || '-',
                      namaBB: bb.namaBB,
                      satuanBB: bb.satuan,
                      qtyKirim: bb.qty,
                      isKITE: bb.isKITE,
                    })),
                  feeJasa: { invoiceNo: '-', invoiceTgl: '-', nilaiJasa: 0, matauang: 'IDR', status: 'Belum Dibayar' },
                  status: 'Draft',
                  catatan: formCatatan,
                })
                setShowFormDialog(false)
                resetForm()
              }}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Simpan sebagai Draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}
