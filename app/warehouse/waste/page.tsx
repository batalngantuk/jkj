'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import {
  Trash2, Download, AlertTriangle, CheckCircle2,
  Clock, FileText, ChevronRight, Info, Plus
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import { exportToExcel } from '@/lib/utils/export-excel'
import {
  MOCK_WASTE_RECORDS,
  STATUS_CONFIG,
  WASTE_STATUS_STEPS,
  type WasteRecord,
  type WasteStatus
} from '@/lib/mock-data/waste-management'

// Mock WO data untuk dropdown
const MOCK_WO_OPTIONS = [
  { woNumber: 'WO-2026-006', woDate: '2026-03-10', kodeBB: 'BB-HRC-001', namaBB: 'Hot Rolled Coil (HRC)', satuan: 'KG', bbMasuk: 60000, bbTerpakai: 57200, wasteRatioBCLKT: 5.0 },
  { woNumber: 'WO-2026-007', woDate: '2026-03-15', kodeBB: 'BB-HDPE-001', namaBB: 'Polyethylene Resin - HDPE Grade', satuan: 'KG', bbMasuk: 5000, bbTerpakai: 4300, wasteRatioBCLKT: 15.0 },
  { woNumber: 'WO-2026-008', woDate: '2026-03-20', kodeBB: 'BB-CRC-001', namaBB: 'Cold Rolled Coil (CRC)', satuan: 'KG', bbMasuk: 30000, bbTerpakai: 28900, wasteRatioBCLKT: 2.0 },
]

function formatNumber(n: number) {
  return n.toLocaleString('id-ID')
}

function StatusBadge({ status }: { status: WasteStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      {status === 'Draft' && <Clock className="h-3 w-3" />}
      {status === 'Diajukan BC 2.4' && <FileText className="h-3 w-3" />}
      {status === 'Diverifikasi BC' && <AlertTriangle className="h-3 w-3" />}
      {status === 'Selesai' && <CheckCircle2 className="h-3 w-3" />}
      {status}
    </span>
  )
}

function StatusStepper({ status }: { status: WasteStatus }) {
  const currentIdx = WASTE_STATUS_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-1">
      {WASTE_STATUS_STEPS.map((step, idx) => {
        const done = idx < currentIdx
        const active = idx === currentIdx
        const cfg = STATUS_CONFIG[step]
        return (
          <React.Fragment key={step}>
            <div className={`text-xs px-2 py-0.5 rounded-full border font-medium whitespace-nowrap
              ${active ? `${cfg.color} ${cfg.bg} ${cfg.border}` : done ? 'text-green-700 bg-green-50 border-green-300' : 'text-gray-400 bg-gray-50 border-gray-200'}`}>
              {done ? '✓' : idx + 1}. {step}
            </div>
            {idx < WASTE_STATUS_STEPS.length - 1 && (
              <ChevronRight className={`h-3 w-3 shrink-0 ${done ? 'text-green-500' : 'text-gray-300'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default function WasteManagementPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedRecord, setSelectedRecord] = useState<WasteRecord | null>(null)
  const [showFormDialog, setShowFormDialog] = useState(false)

  // Form state
  const [formWO, setFormWO] = useState('')
  const [formBBTerpakai, setFormBBTerpakai] = useState('')
  const [formDisposisi, setFormDisposisi] = useState('')
  const [formPembeli, setFormPembeli] = useState('')
  const [formNilai, setFormNilai] = useState('')
  const [formCatatan, setFormCatatan] = useState('')
  const [formSubmitted, setFormSubmitted] = useState(false)

  const selectedWO = MOCK_WO_OPTIONS.find(w => w.woNumber === formWO)
  const bbTerpakaiNum = parseFloat(formBBTerpakai) || 0
  const wasteQty = selectedWO ? selectedWO.bbMasuk - bbTerpakaiNum : 0
  const wasteRatioAktual = selectedWO && selectedWO.bbMasuk > 0 ? (wasteQty / selectedWO.bbMasuk) * 100 : 0
  const overLimit = selectedWO ? wasteRatioAktual > selectedWO.wasteRatioBCLKT : false

  function resetForm() {
    setFormWO('')
    setFormBBTerpakai('')
    setFormDisposisi('')
    setFormPembeli('')
    setFormNilai('')
    setFormCatatan('')
    setFormSubmitted(false)
  }

  function handleSubmitForm() {
    setFormSubmitted(true)
    // Tutup dialog, tampilkan sukses (mock)
    setShowFormDialog(false)
    resetForm()
  }

  const filtered = MOCK_WASTE_RECORDS.filter(r =>
    filterStatus === 'all' ? true : r.status === filterStatus
  )

  // Summary counts
  const counts = {
    total: MOCK_WASTE_RECORDS.length,
    draft: MOCK_WASTE_RECORDS.filter(r => r.status === 'Draft').length,
    diajukan: MOCK_WASTE_RECORDS.filter(r => r.status === 'Diajukan BC 2.4').length,
    diverifikasi: MOCK_WASTE_RECORDS.filter(r => r.status === 'Diverifikasi BC').length,
    selesai: MOCK_WASTE_RECORDS.filter(r => r.status === 'Selesai').length,
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Trash2 className="h-8 w-8 text-red-500" />
              Pengelolaan Waste / Scrap
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sisa bahan baku KITE — wajib dipertanggungjawabkan via BC 2.4 sebelum keluar kawasan
            </p>
          </div>
          <Button className="gap-2" onClick={() => { resetForm(); setShowFormDialog(true) }}>
            <Plus className="h-4 w-4" />
            Ajukan Waste Baru
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-gray-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold text-gray-700">{counts.draft}</p>
              <p className="text-xs text-muted-foreground">belum diajukan</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Diajukan BC 2.4</p>
              <p className="text-2xl font-bold text-blue-700">{counts.diajukan}</p>
              <p className="text-xs text-muted-foreground">menunggu verifikasi</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Diverifikasi BC</p>
              <p className="text-2xl font-bold text-orange-700">{counts.diverifikasi}</p>
              <p className="text-xs text-muted-foreground">proses pengeluaran</p>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground">Selesai</p>
              <p className="text-2xl font-bold text-green-700">{counts.selesai}</p>
              <p className="text-xs text-muted-foreground">sudah keluar</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter + Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Daftar Waste</CardTitle>
              <CardDescription>Klik baris untuk melihat detail dan alur proses</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Diajukan BC 2.4">Diajukan BC 2.4</SelectItem>
                  <SelectItem value="Diverifikasi BC">Diverifikasi BC</SelectItem>
                  <SelectItem value="Selesai">Selesai</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2" onClick={() => exportToExcel(filtered as unknown as Record<string,unknown>[], 'Waste_Management_Report', 'Waste Records')}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>ID</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Bahan Baku</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Qty Waste</TableHead>
                  <TableHead className="text-center">Ratio Aktual</TableHead>
                  <TableHead className="text-center">Batas BCLKT</TableHead>
                  <TableHead>No BC 2.4</TableHead>
                  <TableHead>Disposisi</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(row => {
                  const overLimit = row.wasteRatioAktual > row.wasteRatioBCLKT
                  return (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelectedRecord(row)}
                    >
                      <TableCell className="font-mono text-xs">{row.id}</TableCell>
                      <TableCell className="font-mono text-xs">{row.woNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{row.namaBB}</p>
                          <p className="text-xs text-muted-foreground">{row.kodeBB}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{row.satuan}</TableCell>
                      <TableCell className="text-right font-medium">{formatNumber(row.wasteQty)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium text-sm ${overLimit ? 'text-red-600' : 'text-green-600'}`}>
                          {row.wasteRatioAktual.toFixed(2)}%
                          {overLimit && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-muted-foreground">
                        {row.wasteRatioBCLKT.toFixed(1)}%
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {row.bc24No === '-' ? <span className="text-muted-foreground">—</span> : row.bc24No}
                      </TableCell>
                      <TableCell>
                        {row.disposisi === '-'
                          ? <span className="text-muted-foreground text-xs">Belum ditentukan</span>
                          : <Badge variant={row.disposisi === 'Dijual' ? 'default' : 'destructive'} className="text-xs">
                              {row.disposisi}
                            </Badge>
                        }
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3">{filtered.length} record ditemukan</p>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-800">Ketentuan Waste KITE</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Semua sisa bahan baku impor KITE wajib dipertanggungjawabkan. Waste tidak boleh keluar kawasan
                  tanpa persetujuan Bea Cukai via BC 2.4. Rasio waste aktual yang melebihi batas BCLKT harus
                  disertai penjelasan tertulis kepada Kanwil DJBC.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form: Ajukan Waste Baru */}
      <Dialog open={showFormDialog} onOpenChange={(v) => { if (!v) { setShowFormDialog(false); resetForm() } }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Ajukan Waste Baru
            </DialogTitle>
            <DialogDescription>
              Catat sisa bahan baku dari Work Order untuk diproses via BC 2.4
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Pilih Work Order */}
            <div className="space-y-1">
              <Label>Work Order <span className="text-red-500">*</span></Label>
              <Select value={formWO} onValueChange={v => { setFormWO(v); setFormBBTerpakai('') }}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Work Order..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_WO_OPTIONS.map(wo => (
                    <SelectItem key={wo.woNumber} value={wo.woNumber}>
                      {wo.woNumber} — {wo.namaBB}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Info BB otomatis dari WO */}
            {selectedWO && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Bahan Baku</p>
                    <p className="font-medium">{selectedWO.namaBB}</p>
                    <p className="text-xs text-muted-foreground">{selectedWO.kodeBB}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal WO</p>
                    <p className="font-medium">{selectedWO.woDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">BB Masuk (GR)</p>
                    <p className="font-medium">{selectedWO.bbMasuk.toLocaleString('id-ID')} {selectedWO.satuan}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Batas Waste BCLKT</p>
                    <p className="font-medium">{selectedWO.wasteRatioBCLKT}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* BB Terpakai */}
            {selectedWO && (
              <div className="space-y-1">
                <Label>BB Terpakai ({selectedWO.satuan}) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  placeholder={`Maks. ${selectedWO.bbMasuk.toLocaleString('id-ID')}`}
                  value={formBBTerpakai}
                  onChange={e => setFormBBTerpakai(e.target.value)}
                  max={selectedWO.bbMasuk}
                />
              </div>
            )}

            {/* Kalkulasi waste otomatis */}
            {selectedWO && formBBTerpakai && wasteQty >= 0 && (
              <div className={`rounded-lg border p-3 space-y-1 text-sm ${overLimit ? 'border-red-300 bg-red-50' : 'border-green-300 bg-green-50'}`}>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Qty Waste</span>
                  <span className="font-semibold">{wasteQty.toLocaleString('id-ID')} {selectedWO.satuan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rasio Aktual</span>
                  <span className={`font-semibold ${overLimit ? 'text-red-600' : 'text-green-700'}`}>
                    {wasteRatioAktual.toFixed(3)}%
                  </span>
                </div>
                {overLimit && (
                  <div className="flex items-start gap-1 mt-1 text-red-700">
                    <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                    <span className="text-xs">Melebihi batas BCLKT ({selectedWO.wasteRatioBCLKT}%). Wajib disertai penjelasan tertulis ke Kanwil DJBC.</span>
                  </div>
                )}
              </div>
            )}

            <Separator />

            {/* Disposisi */}
            <div className="space-y-1">
              <Label>Disposisi Waste <span className="text-red-500">*</span></Label>
              <Select value={formDisposisi} onValueChange={setFormDisposisi}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih disposisi..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dijual">Dijual (Scrap Sale)</SelectItem>
                  <SelectItem value="Dimusnahkan">Dimusnahkan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formDisposisi === 'Dijual' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nama Pembeli</Label>
                  <Input
                    placeholder="PT. ..."
                    value={formPembeli}
                    onChange={e => setFormPembeli(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Nilai Waste (USD)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={formNilai}
                    onChange={e => setFormNilai(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Catatan */}
            <div className="space-y-1">
              <Label>Catatan</Label>
              <Textarea
                placeholder="Keterangan tambahan (opsional)"
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
              onClick={handleSubmitForm}
              disabled={!formWO || !formBBTerpakai || !formDisposisi || wasteQty < 0}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Simpan sebagai Draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      {selectedRecord && (
        <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Detail Waste — {selectedRecord.id}
              </DialogTitle>
              <DialogDescription>{selectedRecord.namaBB} dari {selectedRecord.woNumber}</DialogDescription>
            </DialogHeader>

            {/* Status Stepper */}
            <div className="py-2">
              <p className="text-xs text-muted-foreground mb-2">Alur Proses</p>
              <StatusStepper status={selectedRecord.status} />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Work Order</p>
                  <p className="font-medium">{selectedRecord.woNumber} ({selectedRecord.woDate})</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Bahan Baku</p>
                  <p className="font-medium">{selectedRecord.namaBB}</p>
                  <p className="text-xs text-muted-foreground">{selectedRecord.kodeBB}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kuantitas</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BB Masuk (GR)</span>
                      <span>{formatNumber(selectedRecord.bbMasuk)} {selectedRecord.satuan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">BB Terpakai</span>
                      <span>{formatNumber(selectedRecord.bbTerpakai)} {selectedRecord.satuan}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-1">
                      <span>Waste</span>
                      <span className="text-red-600">{formatNumber(selectedRecord.wasteQty)} {selectedRecord.satuan}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Rasio Waste</p>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Aktual</span>
                      <span className={`font-semibold ${selectedRecord.wasteRatioAktual > selectedRecord.wasteRatioBCLKT ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedRecord.wasteRatioAktual.toFixed(3)}%
                        {selectedRecord.wasteRatioAktual > selectedRecord.wasteRatioBCLKT && ' ⚠ Melebihi BCLKT'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Batas BCLKT</span>
                      <span>{selectedRecord.wasteRatioBCLKT.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Dokumen BC 2.4</p>
                  <p className="font-medium">{selectedRecord.bc24No === '-' ? 'Belum dibuat' : selectedRecord.bc24No}</p>
                  {selectedRecord.bc24Tgl !== '-' && <p className="text-xs text-muted-foreground">{selectedRecord.bc24Tgl}</p>}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Disposisi</p>
                  {selectedRecord.disposisi === '-'
                    ? <p className="text-muted-foreground">Belum ditentukan</p>
                    : <>
                        <Badge variant={selectedRecord.disposisi === 'Dijual' ? 'default' : 'destructive'} className="text-xs mb-1">
                          {selectedRecord.disposisi}
                        </Badge>
                        {selectedRecord.disposisi === 'Dijual' && selectedRecord.pembeli !== '-' && (
                          <p className="text-sm">{selectedRecord.pembeli}</p>
                        )}
                        {selectedRecord.nilaiWaste > 0 && (
                          <p className="text-sm font-medium">{selectedRecord.matauang} {formatNumber(selectedRecord.nilaiWaste)}</p>
                        )}
                      </>
                  }
                </div>
                {selectedRecord.tglVerifikasi !== '-' && (
                  <div>
                    <p className="text-xs text-muted-foreground">Verifikasi BC</p>
                    <p className="font-medium">{selectedRecord.tglVerifikasi}</p>
                    <p className="text-xs text-muted-foreground">{selectedRecord.petugasBC}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedRecord.catatan && selectedRecord.catatan !== '-' && (
              <>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Catatan</p>
                  <p className="text-sm">{selectedRecord.catatan}</p>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSelectedRecord(null)}>Tutup</Button>
              {selectedRecord.status === 'Draft' && (
                <Button className="gap-2">
                  <FileText className="h-4 w-4" />
                  Ajukan BC 2.4
                </Button>
              )}
              {selectedRecord.status === 'Diverifikasi BC' && (
                <Button variant="default" className="gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Konfirmasi Selesai
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  )
}
