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
  DollarSign, AlertCircle, Building2, ExternalLink
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import {
  MOCK_SUBKON_RECORDS,
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

export default function SubkontrakPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedRecord, setSelectedRecord] = useState<SubkonRecord | null>(null)
  const [showFormDialog, setShowFormDialog] = useState(false)

  // Form state
  const [formSubkon, setFormSubkon] = useState('')
  const [formDeskripsi, setFormDeskripsi] = useState('')
  const [formTarget, setFormTarget] = useState('')
  const [formFasilitas, setFormFasilitas] = useState('')
  const [formCatatan, setFormCatatan] = useState('')

  const filtered = MOCK_SUBKON_RECORDS.filter(r =>
    filterStatus === 'all' ? true : r.status === filterStatus
  )

  const counts = {
    total: MOCK_SUBKON_RECORDS.length,
    draft: MOCK_SUBKON_RECORDS.filter(r => r.status === 'Draft').length,
    berjalan: MOCK_SUBKON_RECORDS.filter(r => ['BB Dikirim', 'Dalam Proses', 'Hasil Diterima'].includes(r.status)).length,
    selesai: MOCK_SUBKON_RECORDS.filter(r => r.status === 'Selesai').length,
  }

  function resetForm() {
    setFormSubkon(''); setFormDeskripsi(''); setFormTarget('')
    setFormFasilitas(''); setFormCatatan('')
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
              <Button variant="outline" className="gap-2">
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
                  SUBK KITE 1.1/1.2 untuk fasilitas Pembebasan — SUBK KITE 2.1/2.2 untuk fasilitas Pengembalian.
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
                <Button className="gap-2">
                  <Truck className="h-4 w-4" />
                  Kirim BB ke Subkon
                </Button>
              )}
              {selectedRecord.status === 'Dalam Proses' && (
                <Button className="gap-2">
                  <Package className="h-4 w-4" />
                  Terima Hasil dari Subkon
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

      {/* ── Form: Buat Job Subkon Baru ── */}
      <Dialog open={showFormDialog} onOpenChange={(v) => { if (!v) { setShowFormDialog(false); resetForm() } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Buat Job Subkontrak Baru
            </DialogTitle>
            <DialogDescription>
              Isi data dasar job. Dokumen SUBK KITE dibuat setelah job disimpan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <Label>Subkontraktor <span className="text-red-500">*</span></Label>
              <Select value={formSubkon} onValueChange={setFormSubkon}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih subkontraktor..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_SUBKON_MASTER.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Deskripsi Pekerjaan <span className="text-red-500">*</span></Label>
              <Textarea
                placeholder="Jelaskan pekerjaan yang akan disubkonkan..."
                value={formDeskripsi}
                onChange={e => setFormDeskripsi(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Target Selesai <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formTarget}
                  onChange={e => setFormTarget(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Fasilitas KITE</Label>
                <Select value={formFasilitas} onValueChange={setFormFasilitas}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pembebasan">Pembebasan (SUBK 1.1/1.2)</SelectItem>
                    <SelectItem value="pengembalian">Pengembalian (SUBK 2.1/2.2)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Catatan</Label>
              <Textarea
                placeholder="Catatan tambahan (opsional)"
                value={formCatatan}
                onChange={e => setFormCatatan(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => { setShowFormDialog(false); resetForm() }}>
              Batal
            </Button>
            <Button
              disabled={!formSubkon || !formDeskripsi || !formTarget}
              onClick={() => { setShowFormDialog(false); resetForm() }}
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
