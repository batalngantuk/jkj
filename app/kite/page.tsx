'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Shield, FileText, Trash2, Building2, BarChart3,
  CheckCircle2, Clock, AlertTriangle, ArrowRight, Package
} from 'lucide-react'
import AppLayout from '@/components/app-layout'
import { MOCK_WASTE_RECORDS } from '@/lib/mock-data/waste-management'
import { MOCK_SUBKON_RECORDS } from '@/lib/mock-data/subkontrak'
import { MOCK_PEMASUKAN_BB, MOCK_MUTASI_BB, MOCK_MUTASI_HP } from '@/lib/mock-data/kite-inventory'

export default function KiteDashboardPage() {
  // Ringkasan waste
  const wastePending = MOCK_WASTE_RECORDS.filter(r => r.status !== 'Selesai').length
  const wasteSelesai = MOCK_WASTE_RECORDS.filter(r => r.status === 'Selesai').length
  const wasteOverLimit = MOCK_WASTE_RECORDS.filter(r => r.wasteRatioAktual > r.wasteRatioBCLKT).length

  // Ringkasan subkon
  const subkonAktif = MOCK_SUBKON_RECORDS.filter(r => ['BB Dikirim', 'Dalam Proses', 'Hasil Diterima'].includes(r.status)).length
  const subkonSelesai = MOCK_SUBKON_RECORDS.filter(r => r.status === 'Selesai').length
  const subkonFeeBelumBayar = MOCK_SUBKON_RECORDS.filter(r => r.feeJasa.status === 'Belum Dibayar' && r.feeJasa.nilaiJasa > 0).length

  // Ringkasan BB (mutasi)
  const totalBBItems = MOCK_MUTASI_BB.length
  const totalHPItems = MOCK_MUTASI_HP.length
  const totalPemasukanBB = MOCK_PEMASUKAN_BB.reduce((s, r) => s + r.jumlah, 0)

  const fiturKITE = [
    {
      title: 'IT Inventory (8 Laporan)',
      description: 'Laporan wajib real-time sesuai Lampiran XXII PER-5/BC/2023. Dapat diakses Kanwil/DJBC.',
      href: '/reports/kite-inventory',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      badge: 'Wajib',
      badgeVariant: 'default' as const,
      stats: [
        { label: 'Total BB tercatat', value: `${totalBBItems} item` },
        { label: 'Total HP tercatat', value: `${totalHPItems} item` },
      ]
    },
    {
      title: 'Waste / Scrap (BC 2.4)',
      description: 'Pengelolaan sisa bahan baku. Wajib verifikasi Bea Cukai sebelum keluar kawasan.',
      href: '/warehouse/waste',
      icon: Trash2,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      badge: wasteOverLimit > 0 ? 'Ada Peringatan' : 'Normal',
      badgeVariant: wasteOverLimit > 0 ? 'destructive' as const : 'secondary' as const,
      stats: [
        { label: 'Proses berjalan', value: `${wastePending} record` },
        { label: 'Selesai', value: `${wasteSelesai} record` },
        { label: 'Melebihi BCLKT', value: `${wasteOverLimit} record` },
      ]
    },
    {
      title: 'Subkontrak KITE',
      description: 'Pengelolaan pekerjaan subkontrak — SUBK KITE 1.1/1.2 (Pembebasan) dan 2.1/2.2 (Pengembalian).',
      href: '/production/subkontrak',
      icon: Building2,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      badge: subkonFeeBelumBayar > 0 ? `${subkonFeeBelumBayar} fee belum bayar` : 'Lunas',
      badgeVariant: subkonFeeBelumBayar > 0 ? 'destructive' as const : 'secondary' as const,
      stats: [
        { label: 'Job aktif', value: `${subkonAktif} job` },
        { label: 'Selesai', value: `${subkonSelesai} job` },
        { label: 'Fee belum dibayar', value: `${subkonFeeBelumBayar} invoice` },
      ]
    },
  ]

  return (
    <AppLayout>
      <div className="p-6 space-y-6">

        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-foreground">KITE Dashboard</h1>
            <Badge variant="outline" className="gap-1.5 border-blue-400 text-blue-700 bg-blue-50">
              <Shield className="h-3 w-3" />
              Kemudahan Impor Tujuan Ekspor
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Pusat monitor fasilitas KITE — subkontrak, waste, dan laporan IT Inventory sesuai PER-5/BC/2023
          </p>
        </div>

        {/* Status ringkasan */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-muted-foreground">BB Masuk (KITE)</p>
              </div>
              <p className="text-2xl font-bold text-blue-700">{totalPemasukanBB.toLocaleString('id-ID')}</p>
              <p className="text-xs text-muted-foreground">unit tercatat</p>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-orange-600" />
                <p className="text-xs text-muted-foreground">Job Subkon Aktif</p>
              </div>
              <p className="text-2xl font-bold text-orange-700">{subkonAktif}</p>
              <p className="text-xs text-muted-foreground">sedang berjalan</p>
            </CardContent>
          </Card>
          <Card className={wasteOverLimit > 0 ? 'border-red-300 bg-red-50/30' : 'border-green-200 bg-green-50/30'}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                {wasteOverLimit > 0
                  ? <AlertTriangle className="h-4 w-4 text-red-600" />
                  : <CheckCircle2 className="h-4 w-4 text-green-600" />
                }
                <p className="text-xs text-muted-foreground">Waste BCLKT</p>
              </div>
              <p className={`text-2xl font-bold ${wasteOverLimit > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {wasteOverLimit > 0 ? `${wasteOverLimit} peringatan` : 'Normal'}
              </p>
              <p className="text-xs text-muted-foreground">rasio waste</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50/30">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="h-4 w-4 text-purple-600" />
                <p className="text-xs text-muted-foreground">IT Inventory</p>
              </div>
              <p className="text-2xl font-bold text-purple-700">8</p>
              <p className="text-xs text-muted-foreground">laporan aktif</p>
            </CardContent>
          </Card>
        </div>

        {/* Fitur Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fiturKITE.map((fitur) => {
            const Icon = fitur.icon
            return (
              <Card key={fitur.href} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-lg ${fitur.bgColor} flex items-center justify-center mb-3`}>
                      <Icon className={`h-6 w-6 ${fitur.color}`} />
                    </div>
                    <Badge variant={fitur.badgeVariant} className="text-xs">{fitur.badge}</Badge>
                  </div>
                  <CardTitle className="text-lg">{fitur.title}</CardTitle>
                  <CardDescription className="text-xs">{fitur.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    {fitur.stats.map((stat, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{stat.label}</span>
                        <span className="font-medium">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={fitur.href}>
                    <Button variant="outline" size="sm" className="w-full gap-2 mt-2">
                      Buka Modul
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info regulasi */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <Shield className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">Dasar Hukum Fasilitas KITE</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  PER-5/BC/2023 — Peraturan Direktur Jenderal Bea dan Cukai tentang Tata Laksana
                  Kemudahan Impor Tujuan Ekspor dan Tata Laksana Pengawasan. Kanwil/DJBC memiliki
                  hak akses e-Monitoring via SKP ke seluruh data IT Inventory secara real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
