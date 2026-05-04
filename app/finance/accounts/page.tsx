'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Building2, Package, Landmark, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import AppLayout from '@/components/app-layout'
import { useAccounts, type AccountBalances, DEFAULT_BALANCES } from '@/lib/store/useAccounts'

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

export default function AccountsPage() {
  const { balances, saveBalances } = useAccounts()
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

  return (
    <AppLayout>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Link href="/finance">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Landmark className="h-6 w-6 text-indigo-600" />
                Saldo Akun
              </h1>
              <p className="text-sm text-muted-foreground">Input saldo awal akun-akun yang tidak tercatat otomatis oleh sistem</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {saved ? 'Tersimpan ✓' : 'Simpan'}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Aktiva Lancar Tambahan */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                Aktiva Lancar (Tambahan)
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

          {/* Aktiva Tetap */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-orange-600" />
                Aktiva Tetap
              </CardTitle>
              <CardDescription className="text-xs">Input nilai buku (nilai perolehan dan akumulasi penyusutan)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <NumInput label="Tanah" value={form.tanah} onChange={v => set('tanah', v)} />
                <div /> {/* spacer */}
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

          {/* Hutang */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-red-600" />
                Hutang
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

          {/* Modal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Landmark className="h-4 w-4 text-green-600" />
                Modal & Ekuitas
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
                <Input
                  type="date"
                  className="h-8 text-sm w-48"
                  value={form.periodeAwal}
                  onChange={e => set('periodeAwal', e.target.value)}
                />
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg text-xs text-blue-700">
                Laba Tahun Berjalan dihitung otomatis dari laporan Laba Rugi.
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" className="gap-2">
            <Save className="h-4 w-4" />
            {saved ? 'Tersimpan ✓' : 'Simpan Semua Saldo'}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
