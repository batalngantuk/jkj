'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Download, PiggyBank, TrendingUp, BarChart2, CheckCircle, Clock, FileText } from 'lucide-react'
import AppLayout from '@/components/app-layout'
import Link from 'next/link'

const MOCK_PPN_ASSETS = [
  { id: '1', bc20: 'PIB-2026-001', grDate: '2026-03-10', period: '2026-03', amount: 108185000, used: 108185000, remaining: 0, status: 'FULLY_USED', creditedPeriod: '2026-03' },
  { id: '2', bc20: 'PIB-2026-002', grDate: '2026-03-11', period: '2026-03', amount: 136400000, used: 80000000, remaining: 56400000, status: 'PARTIALLY_USED', creditedPeriod: '2026-03' },
  { id: '3', bc20: 'PIB-2026-003', grDate: null,         period: '2026-03', amount: 96745000,  used: 0,         remaining: 96745000,  status: 'AVAILABLE',     creditedPeriod: null },
  { id: '4', bc20: 'PIB-2026-004', grDate: null,         period: '2026-03', amount: 81840000,  used: 0,         remaining: 81840000,  status: 'AVAILABLE',     creditedPeriod: null },
  { id: '5', bc20: 'PIB-2026-005', grDate: null,         period: '2026-03', amount: 60335000,  used: 0,         remaining: 60335000,  status: 'AVAILABLE',     creditedPeriod: null },
]

const MOCK_PPH22_ASSETS = [
  { id: '1', bc20: 'PIB-2026-001', grDate: '2026-03-10', fiscalYear: 2026, rate: 2.5, amount: 27312500,  used: 0, remaining: 27312500,  status: 'AVAILABLE' },
  { id: '2', bc20: 'PIB-2026-002', grDate: '2026-03-11', fiscalYear: 2026, rate: 2.5, amount: 34500000,  used: 0, remaining: 34500000,  status: 'AVAILABLE' },
  { id: '3', bc20: 'PIB-2026-003', grDate: null,         fiscalYear: 2026, rate: 2.5, amount: 24437500,  used: 0, remaining: 24437500,  status: 'AVAILABLE' },
  { id: '4', bc20: 'PIB-2026-004', grDate: null,         fiscalYear: 2026, rate: 2.5, amount: 20700000,  used: 0, remaining: 20700000,  status: 'AVAILABLE' },
  { id: '5', bc20: 'PIB-2026-005', grDate: null,         fiscalYear: 2026, rate: 2.5, amount: 15237500,  used: 0, remaining: 15237500,  status: 'AVAILABLE' },
]

// Monthly PPN reconciliation
const MOCK_PPN_MONTHLY = [
  { period: '2026-01', masukan: 95000000,  keluaran: 145000000, net: 50000000,  status: 'PAYABLE',    filed: true },
  { period: '2026-02', masukan: 187500000, keluaran: 120000000, net: -67500000, status: 'CREDITABLE', filed: true },
  { period: '2026-03', masukan: 483505000, keluaran: 320000000, net: -163505000,status: 'CREDITABLE', filed: false },
]

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v)
const formatM = (v: number) =>
  v >= 1e9 ? `Rp ${(v / 1e9).toFixed(2)}M` : `Rp ${(v / 1e6).toFixed(1)}jt`

const STATUS_CFG: Record<string, { label: string; color: string }> = {
  AVAILABLE:      { label: 'Tersedia', color: 'bg-green-100 text-green-700' },
  PARTIALLY_USED: { label: 'Sebagian Dipakai', color: 'bg-yellow-100 text-yellow-700' },
  FULLY_USED:     { label: 'Habis Terpakai', color: 'bg-gray-100 text-gray-600' },
  EXPIRED:        { label: 'Kadaluarsa', color: 'bg-red-100 text-red-600' },
}

export default function TaxAssetReportPage() {
  const [activeTab, setActiveTab] = useState<'ppn' | 'pph22' | 'reconciliation'>('ppn')
  const [period, setPeriod] = useState('2026-03')

  const totalPPN = MOCK_PPN_ASSETS.reduce((s, a) => s + a.amount, 0)
  const usedPPN = MOCK_PPN_ASSETS.reduce((s, a) => s + a.used, 0)
  const availPPN = MOCK_PPN_ASSETS.reduce((s, a) => s + a.remaining, 0)

  const totalPPH22 = MOCK_PPH22_ASSETS.reduce((s, a) => s + a.amount, 0)
  const availPPH22 = MOCK_PPH22_ASSETS.reduce((s, a) => s + a.remaining, 0)

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tax Asset Report</h1>
            <p className="text-muted-foreground mt-1">
              Laporan PPN Import & PPh 22 sebagai aset pajak dibayar di muka
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export Excel</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export PDF</Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">PPN Import Tersedia</p>
              <p className="text-2xl font-bold text-green-700">{formatM(availPPN)}</p>
              <Progress value={(availPPN / totalPPN) * 100} className="h-1 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">{((availPPN / totalPPN) * 100).toFixed(0)}% dari {formatM(totalPPN)}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">PPh 22 Prepaid</p>
              <p className="text-2xl font-bold text-blue-700">{formatM(availPPH22)}</p>
              <p className="text-xs text-muted-foreground mt-1">FY 2026 — belum dikreditkan</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Total Tax Assets</p>
              <p className="text-2xl font-bold text-purple-700">{formatM(availPPN + availPPH22)}</p>
              <p className="text-xs text-muted-foreground mt-1">PPN + PPh 22 gabungan</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">PPN Telah Dipakai</p>
              <p className="text-2xl font-bold text-yellow-700">{formatM(usedPPN)}</p>
              <p className="text-xs text-muted-foreground mt-1">Dikreditkan vs PPN Keluaran</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b">
          {[
            { key: 'ppn', label: 'PPN Import Credits' },
            { key: 'pph22', label: 'PPh 22 Prepaid' },
            { key: 'reconciliation', label: 'Rekonsiliasi Bulanan' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* PPN Tab */}
        {activeTab === 'ppn' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-green-600" />
                PPN Import Credits — Maret 2026
              </CardTitle>
              <CardDescription>
                PPN dibayar saat impor dicatat sebagai aset (PPN Masukan) dan dapat dikreditkan vs PPN Keluaran bulanan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">BC 2.0 Reference</th>
                    <th className="text-left p-3">GR Date</th>
                    <th className="text-left p-3">Period</th>
                    <th className="text-right p-3">Jumlah PPN</th>
                    <th className="text-right p-3">Terpakai</th>
                    <th className="text-right p-3">Sisa</th>
                    <th className="text-center p-3">Utilisasi</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PPN_ASSETS.map(a => {
                    const pct = a.amount > 0 ? (a.used / a.amount) * 100 : 0
                    const cfg = STATUS_CFG[a.status]
                    return (
                      <tr key={a.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-blue-600">
                          <Link href={`/purchasing/bc20/${a.id}`}>{a.bc20}</Link>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {a.grDate ? new Date(a.grDate).toLocaleDateString('id-ID') : 'Belum GR'}
                        </td>
                        <td className="p-3 text-xs">{a.period}</td>
                        <td className="p-3 text-right font-medium">{formatIDR(a.amount)}</td>
                        <td className="p-3 text-right text-yellow-600">{formatIDR(a.used)}</td>
                        <td className="p-3 text-right text-green-600 font-bold">{formatIDR(a.remaining)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Progress value={pct} className="h-1.5 flex-1" />
                            <span className="text-xs w-8 text-right">{pct.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-green-50 font-bold">
                    <td colSpan={3} className="p-3">TOTAL</td>
                    <td className="p-3 text-right">{formatIDR(totalPPN)}</td>
                    <td className="p-3 text-right text-yellow-700">{formatIDR(usedPPN)}</td>
                    <td className="p-3 text-right text-green-700">{formatIDR(availPPN)}</td>
                    <td colSpan={2} className="p-3 text-center text-sm">
                      Utilisasi: {((usedPPN / totalPPN) * 100).toFixed(0)}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </CardContent>
          </Card>
        )}

        {/* PPh 22 Tab */}
        {activeTab === 'pph22' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-600" />
                PPh 22 Prepaid — Fiscal Year 2026
              </CardTitle>
              <CardDescription>
                PPh 22 dibayar saat impor dicatat sebagai aset pajak dan dikreditkan saat SPT Tahunan PPh Badan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* FY Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total PPh 22 FY 2026</p>
                  <p className="text-2xl font-bold text-blue-700">{formatM(totalPPH22)}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Tersedia Dikreditkan</p>
                  <p className="text-2xl font-bold text-green-700">{formatM(availPPH22)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Telah Dikreditkan</p>
                  <p className="text-2xl font-bold text-gray-700">{formatM(totalPPH22 - availPPH22)}</p>
                </div>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3">BC 2.0 Reference</th>
                    <th className="text-left p-3">GR Date</th>
                    <th className="text-center p-3">Rate</th>
                    <th className="text-right p-3">Jumlah PPh 22</th>
                    <th className="text-right p-3">Tersedia</th>
                    <th className="text-center p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PPH22_ASSETS.map(a => {
                    const cfg = STATUS_CFG[a.status]
                    return (
                      <tr key={a.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium text-blue-600">{a.bc20}</td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {a.grDate ? new Date(a.grDate).toLocaleDateString('id-ID') : 'Belum GR'}
                        </td>
                        <td className="p-3 text-center">
                          <Badge className="bg-blue-100 text-blue-700 text-xs">{a.rate}% (API)</Badge>
                        </td>
                        <td className="p-3 text-right font-medium">{formatIDR(a.amount)}</td>
                        <td className="p-3 text-right font-bold text-green-600">{formatIDR(a.remaining)}</td>
                        <td className="p-3 text-center">
                          <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 bg-blue-50 font-bold">
                    <td colSpan={3} className="p-3">TOTAL FY 2026</td>
                    <td className="p-3 text-right">{formatIDR(totalPPH22)}</td>
                    <td className="p-3 text-right text-green-700">{formatIDR(availPPH22)}</td>
                    <td className="p-3" />
                  </tr>
                </tfoot>
              </table>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                <strong>Info:</strong> PPh 22 Import dapat dikreditkan terhadap PPh Badan terutang saat pengisian SPT Tahunan.
                Rate 2.5% berlaku untuk perusahaan dengan API (Angka Pengenal Importir).
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reconciliation Tab */}
        {activeTab === 'reconciliation' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                Rekonsiliasi PPN Bulanan
              </CardTitle>
              <CardDescription>PPN Masukan (dari impor + pembelian) vs PPN Keluaran (dari penjualan)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {MOCK_PPN_MONTHLY.map(rec => {
                const netPositive = rec.net > 0
                return (
                  <div key={rec.period} className={`p-4 rounded-lg border ${rec.status === 'PAYABLE' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">
                          {new Date(rec.period + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                        </h3>
                        <Badge className={rec.status === 'PAYABLE' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                          {rec.status === 'PAYABLE' ? 'KURANG BAYAR' : 'LEBIH BAYAR'}
                        </Badge>
                        {rec.filed ? (
                          <Badge className="bg-gray-100 text-gray-600 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />SPT Dilaporkan
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                            <Clock className="h-3 w-3 mr-1" />Belum Dilaporkan
                          </Badge>
                        )}
                      </div>
                      <p className={`text-lg font-bold ${netPositive ? 'text-red-700' : 'text-green-700'}`}>
                        {netPositive ? '+' : ''}{formatIDR(rec.net)}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">PPN Masukan (Input)</p>
                        <p className="font-semibold text-blue-700">{formatIDR(rec.masukan)}</p>
                        <p className="text-xs text-muted-foreground">Impor + Pembelian Lokal</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">PPN Keluaran (Output)</p>
                        <p className="font-semibold text-orange-700">{formatIDR(rec.keluaran)}</p>
                        <p className="text-xs text-muted-foreground">Penjualan Domestik (11%)</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {rec.status === 'PAYABLE' ? 'Harus Dibayar ke DJP' : 'Dikreditkan Bulan Depan'}
                        </p>
                        <p className={`font-bold text-lg ${rec.status === 'PAYABLE' ? 'text-red-700' : 'text-green-700'}`}>
                          {formatIDR(Math.abs(rec.net))}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="p-3 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
                <strong>Catatan:</strong> Ekspor (PEB) dikenakan PPN 0% (zero-rated), sehingga tidak ada PPN Keluaran dari penjualan ekspor.
                PPN Masukan dari impor material yang dipakai untuk produk ekspor dapat di-restitusi.
              </div>

              <div className="flex gap-2">
                <Link href="/finance/tax-assets/ppn">
                  <Button variant="outline" size="sm">Detail PPN Bulanan</Button>
                </Link>
                <Link href="/finance/tax-assets/pph22">
                  <Button variant="outline" size="sm">Detail PPh 22 Tahunan</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}
