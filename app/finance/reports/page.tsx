'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, TrendingUp, Scale, ArrowUpDown, Users, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import AppLayout from '@/components/app-layout'
import { useARInvoices, useAPInvoices, useStock, useJournal, useAccounts } from '@/lib/store/hooks'
import { exportToExcelMultiSheet } from '@/lib/utils/export-excel'

const BULAN_LABEL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function fmt(n: number) {
  if (n === 0) return 'Rp -'
  return `Rp ${Math.abs(n).toLocaleString('id-ID')}`
}

function Row({ label, value, bold, indent, subtotal, minus }: {
  label: string; value: number; bold?: boolean; indent?: number; subtotal?: boolean; minus?: boolean
}) {
  const indentClass = indent === 2 ? 'pl-8' : indent === 1 ? 'pl-4' : ''
  return (
    <div className={`flex justify-between items-center py-1 ${subtotal ? 'border-t border-b border-foreground/20 my-1' : ''}`}>
      <span className={`text-sm ${bold ? 'font-bold' : ''} ${subtotal ? 'font-semibold' : ''} ${indentClass}`}>{label}</span>
      <span className={`text-sm font-mono ${bold ? 'font-bold' : ''} ${minus && value > 0 ? 'text-red-700' : value < 0 ? 'text-red-700' : ''}`}>
        {value === 0 ? 'Rp -' : `Rp ${Math.abs(value).toLocaleString('id-ID')}`}
      </span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-4 mb-1">{children}</p>
}

export default function FinanceReportsPage() {
  const { invoices: arInvoices } = useARInvoices()
  const { invoices: apInvoices } = useAPInvoices()
  const { stock } = useStock()
  const { entries: journal } = useJournal()
  const { balances } = useAccounts()

  const currentYear = new Date().getFullYear()
  const [filterPeriode, setFilterPeriode] = useState<string>('2026')
  const [filterBulan, setFilterBulan] = useState<string>('all')

  // ── Helper: filter by periode ──────────────────────────────
  const inPeriode = (tgl: string) => {
    if (filterBulan !== 'all') return tgl.startsWith(`${filterPeriode}-${filterBulan}`)
    return tgl.startsWith(filterPeriode)
  }

  // ── Revenue: dari AR invoices (totalAmount - taxAmount = nilai sebelum PPN) ──
  const revenue = useMemo(() => {
    return arInvoices
      .filter(i => ['APPROVED', 'SENT', 'PARTIALLY_PAID', 'PAID'].includes(i.status) && inPeriode(i.invoiceDate))
      .reduce((s, i) => s + (i.totalAmount - i.taxAmount), 0)
  }, [arInvoices, filterPeriode, filterBulan])

  // ── HPP: dari AP invoices (pembelian bahan baku) ──
  const hpp = useMemo(() => {
    return apInvoices
      .filter(i => ['APPROVED', 'SCHEDULED', 'PAID'].includes(i.status) && inPeriode(i.invoiceDate))
      .reduce((s, i) => s + (i.totalAmount - i.taxAmount), 0)
  }, [apInvoices, filterPeriode, filterBulan])

  // ── Beban operasional dari jurnal ──
  const bebanJurnal = useMemo(() => {
    const filtered = journal.filter(e => e.tipe === 'KELUAR' && inPeriode(e.tanggal))
    const gaji = filtered.filter(e => e.kategori === 'Beban Gaji').reduce((s, e) => s + e.nominal, 0)
    const utilitas = filtered.filter(e => e.kategori === 'Beban Listrik & Utilitas').reduce((s, e) => s + e.nominal, 0)
    const sewa = filtered.filter(e => e.kategori === 'Beban Sewa').reduce((s, e) => s + e.nominal, 0)
    const angkut = filtered.filter(e => e.kategori === 'Beban Angkut').reduce((s, e) => s + e.nominal, 0)
    const lainlain = filtered.filter(e => e.kategori === 'Beban Lain-lain').reduce((s, e) => s + e.nominal, 0)
    const total = gaji + utilitas + sewa + angkut + lainlain
    return { gaji, utilitas, sewa, angkut, lainlain, total }
  }, [journal, filterPeriode, filterBulan])

  const labaKotor = revenue - hpp
  const labaOperasi = labaKotor - bebanJurnal.total
  const labaBersih = labaOperasi  // simplified (no tax/interest in this model)

  // ── Arus Kas ──────────────────────────────────────────────
  const arusKas = useMemo(() => {
    const jFiltered = journal.filter(e => inPeriode(e.tanggal))
    // Operasi: penerimaan dari customer, beban operasional
    const penerimaanCustomer = jFiltered.filter(e => e.tipe === 'MASUK').reduce((s, e) => s + e.nominal, 0)
    const pembayaranBeban = jFiltered.filter(e => e.tipe === 'KELUAR').reduce((s, e) => s + e.nominal, 0)
    const pembayaranSupplier = apInvoices
      .filter(i => i.status === 'PAID' && inPeriode(i.invoiceDate))
      .reduce((s, i) => s + i.paidAmount, 0)

    const netOperasi = penerimaanCustomer - pembayaranBeban - pembayaranSupplier
    // Investasi & Pendanaan: belum ada data — tampilkan 0
    return { penerimaanCustomer, pembayaranBeban, pembayaranSupplier, netOperasi }
  }, [journal, apInvoices, filterPeriode, filterBulan])

  // ── Neraca ────────────────────────────────────────────────
  const neraca = useMemo(() => {
    // Aktiva Lancar
    const kas = balances.kas
    const bank = balances.bank
    const piutangUsaha = arInvoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.balance, 0)
    const piutangPemegangSaham = balances.piutangPemegangSaham
    const piutangLainLain = balances.piutangLainLain
    const persediaanBB = stock.filter(s => s.category === 'BB').reduce((s, i) => s + i.qtyAvailable * 10000, 0)
    const persediaanPenolong = stock.filter(s => s.category === 'Packaging').reduce((s, i) => s + i.qtyAvailable * 500, 0)
    const persediaanWIP = stock.filter(s => s.category === 'WIP').reduce((s, i) => s + i.qtyAvailable * 50000, 0)
    const persediaanBJ = stock.filter(s => s.category === 'FG').reduce((s, i) => s + i.qtyAvailable * 150000, 0)
    const perlengkapanPabrik = balances.perlengkapanPabrik
    const biayaDibayarDimuka = balances.biayaDibayarDimuka
    const ppnPembelian = balances.ppnPembelian

    const totalAktivaLancar = kas + bank + piutangUsaha + piutangPemegangSaham + piutangLainLain +
      persediaanBB + persediaanPenolong + persediaanWIP + persediaanBJ +
      perlengkapanPabrik + biayaDibayarDimuka + ppnPembelian

    // Aktiva Tetap
    const bangunanNet = balances.bangunan - balances.akumPenyusutanBangunan
    const peralatanPabrikNet = balances.peralatanPabrik - balances.akumPenyusutanPeralatanPabrik
    const peralatanKantorNet = balances.peralatanKantor - balances.akumPenyusutanPeralatanKantor
    const kendaraanNet = balances.kendaraan - balances.akumPenyusutanKendaraan
    const mesinNet = balances.mesin - balances.akumPenyusutanMesin

    const totalAktivaTetap = balances.tanah + bangunanNet + peralatanPabrikNet +
      peralatanKantorNet + kendaraanNet + mesinNet + balances.perlengkapanKantorAssetTA

    const totalAktiva = totalAktivaLancar + totalAktivaTetap

    // Pasiva — Hutang Lancar
    const hutangUsaha = apInvoices.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.balance, 0)
    const hutangGaji = balances.hutangGaji
    const uangMukaPenjualan = balances.uangMukaPenjualan
    const hutangUsahaLainnya = balances.hutangUsahaLainnya
    const hutangPPN = balances.hutangPPNPenjualan
    const hutangPPh25 = balances.hutangPPh25
    const hutangPPh21 = balances.hutangPPh21
    const hutangPPhBadan = balances.hutangPPhBadan

    const totalHutangLancar = hutangUsaha + hutangGaji + uangMukaPenjualan +
      hutangUsahaLainnya + hutangPPN + hutangPPh25 + hutangPPh21 + hutangPPhBadan

    const totalHutangJangkaPanjang = balances.hutangMobilRush + balances.hutangPemegangSaham + balances.hutangMobilPajero

    // Modal
    const modalSaham = balances.modalSaham
    const labaDitahan = balances.labaDitahan
    const labaTahunLalu = balances.labaTahunLalu
    const labaTahunBerjalan = labaBersih

    const totalModal = modalSaham + labaDitahan + labaTahunLalu + labaTahunBerjalan
    const totalPasiva = totalHutangLancar + totalHutangJangkaPanjang + totalModal

    return {
      kas, bank, piutangUsaha, piutangPemegangSaham, piutangLainLain,
      persediaanBB, persediaanPenolong, persediaanWIP, persediaanBJ,
      perlengkapanPabrik, biayaDibayarDimuka, ppnPembelian,
      totalAktivaLancar,
      bangunanNet, peralatanPabrikNet, peralatanKantorNet, kendaraanNet, mesinNet,
      totalAktivaTetap, totalAktiva,
      hutangUsaha, hutangGaji, uangMukaPenjualan, hutangUsahaLainnya,
      hutangPPN, hutangPPh25, hutangPPh21, hutangPPhBadan,
      totalHutangLancar, totalHutangJangkaPanjang,
      modalSaham, labaDitahan, labaTahunLalu, labaTahunBerjalan,
      totalModal, totalPasiva,
    }
  }, [arInvoices, apInvoices, stock, balances, labaBersih])

  // ── Perubahan Ekuitas ─────────────────────────────────────
  const modalAwal = balances.modalSaham
  const saham = balances.modalSaham
  const labaDitahanDeklarasi = balances.labaDitahan
  const labaTahunLalu = balances.labaTahunLalu
  const saldoLabaDitahan = labaDitahanDeklarasi + labaTahunLalu + labaBersih
  const modalAkhir = modalAwal + saldoLabaDitahan

  function handleExport() {
    exportToExcelMultiSheet([
      {
        name: 'Laba Rugi',
        data: [
          { Akun: 'Pendapatan Usaha', Nominal: revenue },
          { Akun: 'Harga Pokok Penjualan', Nominal: hpp },
          { Akun: 'Laba Kotor', Nominal: labaKotor },
          { Akun: 'Beban Gaji', Nominal: bebanJurnal.gaji },
          { Akun: 'Beban Listrik & Utilitas', Nominal: bebanJurnal.utilitas },
          { Akun: 'Beban Sewa', Nominal: bebanJurnal.sewa },
          { Akun: 'Beban Angkut', Nominal: bebanJurnal.angkut },
          { Akun: 'Beban Lain-lain', Nominal: bebanJurnal.lainlain },
          { Akun: 'Total Beban Operasional', Nominal: bebanJurnal.total },
          { Akun: 'Laba Operasi', Nominal: labaOperasi },
          { Akun: 'Laba Bersih', Nominal: labaBersih },
        ]
      },
      {
        name: 'Neraca',
        data: [
          { Pos: 'AKTIVA LANCAR', Nominal: '' },
          { Pos: 'Kas', Nominal: neraca.kas },
          { Pos: 'Bank', Nominal: neraca.bank },
          { Pos: 'Piutang Usaha', Nominal: neraca.piutangUsaha },
          { Pos: 'Persediaan Bahan Baku', Nominal: neraca.persediaanBB },
          { Pos: 'Persediaan Barang Jadi', Nominal: neraca.persediaanBJ },
          { Pos: 'Total Aktiva Lancar', Nominal: neraca.totalAktivaLancar },
          { Pos: 'AKTIVA TETAP', Nominal: '' },
          { Pos: 'Total Aktiva Tetap (Net)', Nominal: neraca.totalAktivaTetap },
          { Pos: 'TOTAL AKTIVA', Nominal: neraca.totalAktiva },
          { Pos: 'HUTANG LANCAR', Nominal: '' },
          { Pos: 'Hutang Usaha', Nominal: neraca.hutangUsaha },
          { Pos: 'Total Hutang Lancar', Nominal: neraca.totalHutangLancar },
          { Pos: 'Total Hutang Jangka Panjang', Nominal: neraca.totalHutangJangkaPanjang },
          { Pos: 'MODAL', Nominal: '' },
          { Pos: 'Modal Saham', Nominal: neraca.modalSaham },
          { Pos: 'Laba Ditahan', Nominal: neraca.labaDitahan },
          { Pos: 'Laba Tahun Berjalan', Nominal: neraca.labaTahunBerjalan },
          { Pos: 'Total Modal', Nominal: neraca.totalModal },
          { Pos: 'TOTAL PASIVA', Nominal: neraca.totalPasiva },
        ]
      },
      {
        name: 'Arus Kas',
        data: [
          { Pos: 'Penerimaan dari Customer', Nominal: arusKas.penerimaanCustomer },
          { Pos: 'Pembayaran Beban Operasional', Nominal: arusKas.pembayaranBeban },
          { Pos: 'Pembayaran Supplier', Nominal: arusKas.pembayaranSupplier },
          { Pos: 'Net Arus Kas Operasi', Nominal: arusKas.netOperasi },
        ]
      },
      {
        name: 'Perubahan Ekuitas',
        data: [
          { Pos: 'Modal Disetor', Nominal: modalAwal },
          { Pos: 'Saham', Nominal: saham },
          { Pos: 'Laba Ditahan (Deklarasi TA)', Nominal: labaDitahanDeklarasi },
          { Pos: 'Laba Tahun Lalu', Nominal: labaTahunLalu },
          { Pos: 'Laba Tahun Berjalan', Nominal: labaBersih },
          { Pos: 'Saldo Laba Ditahan', Nominal: saldoLabaDitahan },
          { Pos: 'Modal Akhir', Nominal: modalAkhir },
        ]
      },
    ], `Laporan_Keuangan_JKJ_${filterPeriode}${filterBulan !== 'all' ? `-${filterBulan}` : ''}`)
  }

  const periodeLabel = filterBulan !== 'all'
    ? `${BULAN_LABEL[parseInt(filterBulan) - 1]} ${filterPeriode}`
    : `Tahun ${filterPeriode}`

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
                <FileText className="h-6 w-6 text-purple-600" />
                Laporan Keuangan
              </h1>
              <p className="text-sm text-muted-foreground">PT JKJ Indonesia — {periodeLabel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterPeriode} onValueChange={setFilterPeriode}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterBulan} onValueChange={setFilterBulan}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Semua Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Bulan</SelectItem>
                {BULAN_LABEL.map((b, i) => (
                  <SelectItem key={i} value={String(i + 1).padStart(2, '0')}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />Export Semua
            </Button>
          </div>
        </div>

        <Tabs defaultValue="laba-rugi">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="laba-rugi" className="gap-1.5 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />Laba Rugi
            </TabsTrigger>
            <TabsTrigger value="neraca" className="gap-1.5 text-xs">
              <Scale className="h-3.5 w-3.5" />Neraca
            </TabsTrigger>
            <TabsTrigger value="arus-kas" className="gap-1.5 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5" />Arus Kas
            </TabsTrigger>
            <TabsTrigger value="ekuitas" className="gap-1.5 text-xs">
              <Users className="h-3.5 w-3.5" />Perubahan Ekuitas
            </TabsTrigger>
          </TabsList>

          {/* ── Laporan Laba Rugi ── */}
          <TabsContent value="laba-rugi">
            <Card>
              <CardHeader className="text-center pb-2">
                <p className="font-bold text-lg">PT JKJ INDONESIA</p>
                <p className="font-semibold">LAPORAN LABA RUGI</p>
                <p className="text-sm text-muted-foreground">Periode: {periodeLabel}</p>
              </CardHeader>
              <CardContent className="max-w-lg mx-auto">
                <SectionTitle>Pendapatan</SectionTitle>
                <Row label="Pendapatan Usaha" value={revenue} indent={1} />
                <Row label="Total Pendapatan" value={revenue} bold subtotal />

                <SectionTitle>Harga Pokok Penjualan</SectionTitle>
                <Row label="Pembelian Bahan Baku (AP)" value={hpp} indent={1} minus />
                <Row label="Total HPP" value={hpp} bold subtotal minus />

                <Row label="LABA KOTOR" value={labaKotor} bold subtotal />

                <SectionTitle>Beban Operasional</SectionTitle>
                <Row label="Beban Gaji" value={bebanJurnal.gaji} indent={1} minus />
                <Row label="Beban Listrik & Utilitas" value={bebanJurnal.utilitas} indent={1} minus />
                <Row label="Beban Sewa" value={bebanJurnal.sewa} indent={1} minus />
                <Row label="Beban Angkut" value={bebanJurnal.angkut} indent={1} minus />
                <Row label="Beban Lain-lain" value={bebanJurnal.lainlain} indent={1} minus />
                <Row label="Total Beban Operasional" value={bebanJurnal.total} bold subtotal minus />

                <Separator className="my-3" />
                <Row label="LABA OPERASI (BERSIH)" value={labaOperasi} bold />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Neraca ── */}
          <TabsContent value="neraca">
            <Card>
              <CardHeader className="text-center pb-2">
                <p className="font-bold text-lg">PT JKJ INDONESIA</p>
                <p className="font-semibold">LAPORAN NERACA</p>
                <p className="text-sm text-muted-foreground">Per {periodeLabel}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* AKTIVA */}
                  <div>
                    <p className="font-bold text-center border-b pb-2 mb-2">AKTIVA</p>
                    <SectionTitle>Aktiva Lancar</SectionTitle>
                    <Row label="Kas" value={neraca.kas} indent={2} />
                    <Row label="Bank" value={neraca.bank} indent={2} />
                    <Row label="Piutang Usaha" value={neraca.piutangUsaha} indent={2} />
                    <Row label="Piutang Pemegang Saham" value={neraca.piutangPemegangSaham} indent={2} />
                    <Row label="Piutang Lain-lain" value={neraca.piutangLainLain} indent={2} />
                    <Row label="Persediaan Bahan Baku" value={neraca.persediaanBB} indent={2} />
                    <Row label="Persediaan Bahan Penolong" value={neraca.persediaanPenolong} indent={2} />
                    <Row label="Persediaan Barang Dalam Proses" value={neraca.persediaanWIP} indent={2} />
                    <Row label="Persediaan Barang Jadi" value={neraca.persediaanBJ} indent={2} />
                    <Row label="Perlengkapan Pabrik" value={neraca.perlengkapanPabrik} indent={2} />
                    <Row label="Biaya Dibayar Dimuka" value={neraca.biayaDibayarDimuka} indent={2} />
                    <Row label="PPN Pembelian" value={neraca.ppnPembelian} indent={2} />
                    <Row label="Total Aktiva Lancar" value={neraca.totalAktivaLancar} bold subtotal />

                    <SectionTitle>Aktiva Tetap</SectionTitle>
                    <Row label="Tanah" value={balances.tanah} indent={2} />
                    <Row label="Bangunan (Net)" value={neraca.bangunanNet} indent={2} />
                    <Row label="Peralatan Pabrik (Net)" value={neraca.peralatanPabrikNet} indent={2} />
                    <Row label="Peralatan & Perlengkapan Kantor (Net)" value={neraca.peralatanKantorNet} indent={2} />
                    <Row label="Kendaraan (Net)" value={neraca.kendaraanNet} indent={2} />
                    <Row label="Mesin (Net)" value={neraca.mesinNet} indent={2} />
                    <Row label="Perlengkapan Kantor (Asset Deklarasi TA)" value={balances.perlengkapanKantorAssetTA} indent={2} />
                    <Row label="Total Aktiva Tetap" value={neraca.totalAktivaTetap} bold subtotal />

                    <Separator className="my-3" />
                    <Row label="TOTAL AKTIVA" value={neraca.totalAktiva} bold />
                  </div>

                  {/* PASIVA */}
                  <div>
                    <p className="font-bold text-center border-b pb-2 mb-2">PASIVA</p>
                    <SectionTitle>Hutang Lancar</SectionTitle>
                    <Row label="Hutang Usaha" value={neraca.hutangUsaha} indent={2} />
                    <Row label="Hutang Gaji" value={neraca.hutangGaji} indent={2} />
                    <Row label="Uang Muka Penjualan" value={neraca.uangMukaPenjualan} indent={2} />
                    <Row label="Hutang Usaha Lainnya" value={neraca.hutangUsahaLainnya} indent={2} />
                    <Row label="Hutang PPN (Penjualan Lokal)" value={neraca.hutangPPN} indent={2} />
                    <Row label="Hutang PPh Psl 25" value={neraca.hutangPPh25} indent={2} />
                    <Row label="Hutang PPh Psl 21" value={neraca.hutangPPh21} indent={2} />
                    <Row label="Hutang PPh Badan" value={neraca.hutangPPhBadan} indent={2} />
                    <Row label="Total Hutang Lancar" value={neraca.totalHutangLancar} bold subtotal />

                    <SectionTitle>Hutang Jangka Panjang</SectionTitle>
                    <Row label="Hutang Mobil Rush" value={balances.hutangMobilRush} indent={2} />
                    <Row label="Hutang Pemegang Saham" value={balances.hutangPemegangSaham} indent={2} />
                    <Row label="Hutang Mobil Pajero" value={balances.hutangMobilPajero} indent={2} />
                    <Row label="Total Hutang Jangka Panjang" value={neraca.totalHutangJangkaPanjang} bold subtotal />

                    <SectionTitle>Modal</SectionTitle>
                    <Row label="Modal Saham" value={neraca.modalSaham} indent={2} />
                    <Row label="Laba Ditahan (Deklarasi TA)" value={neraca.labaDitahan} indent={2} />
                    <Row label="Laba Tahun Lalu" value={neraca.labaTahunLalu} indent={2} />
                    <Row label="Laba Tahun Berjalan" value={neraca.labaTahunBerjalan} indent={2} />
                    <Row label="Total Modal" value={neraca.totalModal} bold subtotal />

                    <Separator className="my-3" />
                    <Row label="TOTAL PASIVA" value={neraca.totalPasiva} bold />

                    {Math.abs(neraca.totalAktiva - neraca.totalPasiva) > 1000 && (
                      <p className="text-xs text-orange-600 mt-2">
                        * Selisih Aktiva vs Pasiva: Rp {Math.abs(neraca.totalAktiva - neraca.totalPasiva).toLocaleString('id-ID')} — perlu penyesuaian saldo akun.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Arus Kas ── */}
          <TabsContent value="arus-kas">
            <Card>
              <CardHeader className="text-center pb-2">
                <p className="font-bold text-lg">PT JKJ INDONESIA</p>
                <p className="font-semibold">LAPORAN ARUS KAS</p>
                <p className="text-sm text-muted-foreground">Periode: {periodeLabel}</p>
              </CardHeader>
              <CardContent className="max-w-lg mx-auto">
                <SectionTitle>Arus Kas dari Aktivitas Operasi</SectionTitle>
                <Row label="Penerimaan dari customer & transaksi kas masuk" value={arusKas.penerimaanCustomer} indent={1} />
                <Row label="Pembayaran beban operasional (gaji, utilitas, dll)" value={arusKas.pembayaranBeban} indent={1} minus />
                <Row label="Pembayaran ke supplier (AP Invoices Paid)" value={arusKas.pembayaranSupplier} indent={1} minus />
                <Row label="Net Arus Kas Operasi" value={arusKas.netOperasi} bold subtotal />

                <SectionTitle>Arus Kas dari Aktivitas Investasi</SectionTitle>
                <Row label="Pembelian aset tetap" value={0} indent={1} />
                <Row label="Net Arus Kas Investasi" value={0} bold subtotal />

                <SectionTitle>Arus Kas dari Aktivitas Pendanaan</SectionTitle>
                <Row label="Penerimaan pinjaman / modal" value={0} indent={1} />
                <Row label="Pembayaran pinjaman" value={0} indent={1} />
                <Row label="Net Arus Kas Pendanaan" value={0} bold subtotal />

                <Separator className="my-3" />
                <Row label="KENAIKAN / (PENURUNAN) KAS BERSIH" value={arusKas.netOperasi} bold />
                <Row label="Saldo Kas Awal Periode" value={balances.kas + balances.bank} indent={1} />
                <Row label="Saldo Kas Akhir Periode" value={balances.kas + balances.bank + arusKas.netOperasi} bold subtotal />

                <p className="text-xs text-muted-foreground mt-4">
                  * Arus kas investasi & pendanaan akan terisi setelah modul aset tetap dan pinjaman ditambahkan.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Perubahan Ekuitas ── */}
          <TabsContent value="ekuitas">
            <Card>
              <CardHeader className="text-center pb-2">
                <p className="font-bold text-lg">PT JKJ INDONESIA</p>
                <p className="font-semibold">LAPORAN PERUBAHAN EKUITAS</p>
                <p className="text-sm text-muted-foreground">Per {periodeLabel}</p>
              </CardHeader>
              <CardContent className="max-w-lg mx-auto">
                <SectionTitle>Modal (Awal) per 1 Januari {filterPeriode}</SectionTitle>
                <Row label="Modal Disetor" value={modalAwal} indent={1} />
                <Row label="Saham" value={saham} indent={1} />

                <SectionTitle>Modal (Tambahan) s.d {periodeLabel}</SectionTitle>
                <Row label="Saldo Laba Ditahan (Deklarasi TA)" value={labaDitahanDeklarasi} indent={1} />
                <Row label="Saldo Laba Tahun Lalu" value={labaTahunLalu} indent={1} />
                <Row label="Laba Tahun Berjalan" value={labaBersih} indent={1} />

                <Separator className="my-3" />
                <Row label={`Saldo Laba Ditahan per ${periodeLabel}`} value={saldoLabaDitahan} bold subtotal />
                <Row label={`Modal (Akhir) per ${periodeLabel}`} value={modalAkhir} bold />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info sumber data */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />Sumber Data Laporan
            </p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-blue-700">
              <span>• Pendapatan: AR Invoices (status Approved/Sent/Paid)</span>
              <span>• HPP: AP Invoices (status Approved/Paid)</span>
              <span>• Beban operasional: Jurnal Kas & Bank</span>
              <span>• Piutang usaha: AR Invoices (belum lunas)</span>
              <span>• Hutang usaha: AP Invoices (belum lunas)</span>
              <span>• Persediaan: Stock (BB, Packaging, WIP, FG)</span>
              <span>• Aset tetap & modal: Saldo Akun (input manual)</span>
              <span>• Kas/Bank: Saldo Akun + Jurnal Kas</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
