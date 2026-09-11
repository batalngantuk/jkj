'use client'

import { useState, useEffect, useCallback } from 'react'
import { getStore, setStore } from './index'

export type AkunTipe = 'Aset' | 'Kewajiban' | 'Ekuitas' | 'Pendapatan' | 'Beban'

export interface AkunCOA {
  id: string
  kode: string
  nama: string
  tipe: AkunTipe
  subTipe?: string
  keterangan?: string
}

const COA_STORE_KEY = 'jkj_chart_of_accounts'

const SEED_COA: AkunCOA[] = [
  // Aset Lancar
  { id: 'coa-001', kode: '1-0001', nama: 'Kas', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-002', kode: '1-0002', nama: 'Bank', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-003', kode: '1-1000', nama: 'Piutang Usaha', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-004', kode: '1-1100', nama: 'Piutang Pemegang Saham', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-005', kode: '1-1200', nama: 'Piutang Lain-lain', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-006', kode: '1-2000', nama: 'Persediaan Bahan Baku', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-007', kode: '1-2100', nama: 'Persediaan WIP', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-008', kode: '1-2200', nama: 'Persediaan Barang Jadi', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-009', kode: '1-2300', nama: 'Persediaan Packaging', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-010', kode: '1-3000', nama: 'Perlengkapan Pabrik', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-011', kode: '1-3100', nama: 'Biaya Dibayar Dimuka', tipe: 'Aset', subTipe: 'Aset Lancar' },
  { id: 'coa-012', kode: '1-4000', nama: 'PPN Pembelian (Pajak Masukan)', tipe: 'Aset', subTipe: 'Aset Lancar' },
  // Aset Tetap
  { id: 'coa-013', kode: '1-5000', nama: 'Tanah', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-014', kode: '1-5100', nama: 'Bangunan', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-015', kode: '1-5101', nama: 'Akumulasi Penyusutan Bangunan', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-016', kode: '1-5200', nama: 'Peralatan Pabrik', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-017', kode: '1-5201', nama: 'Akumulasi Penyusutan Peralatan Pabrik', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-018', kode: '1-5300', nama: 'Peralatan & Perlengkapan Kantor', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-019', kode: '1-5301', nama: 'Akumulasi Penyusutan Peralatan Kantor', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-020', kode: '1-5400', nama: 'Kendaraan', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-021', kode: '1-5401', nama: 'Akumulasi Penyusutan Kendaraan', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-022', kode: '1-5500', nama: 'Mesin', tipe: 'Aset', subTipe: 'Aset Tetap' },
  { id: 'coa-023', kode: '1-5501', nama: 'Akumulasi Penyusutan Mesin', tipe: 'Aset', subTipe: 'Aset Tetap' },
  // Kewajiban Lancar
  { id: 'coa-024', kode: '2-0001', nama: 'Hutang Usaha', tipe: 'Kewajiban', subTipe: 'Kewajiban Lancar' },
  { id: 'coa-025', kode: '2-1000', nama: 'Hutang Gaji', tipe: 'Kewajiban', subTipe: 'Kewajiban Lancar' },
  { id: 'coa-026', kode: '2-1100', nama: 'Uang Muka Penjualan', tipe: 'Kewajiban', subTipe: 'Kewajiban Lancar' },
  { id: 'coa-027', kode: '2-1200', nama: 'Hutang Usaha Lainnya', tipe: 'Kewajiban', subTipe: 'Kewajiban Lancar' },
  { id: 'coa-028', kode: '2-2000', nama: 'Hutang PPN Penjualan', tipe: 'Kewajiban', subTipe: 'Kewajiban Lancar' },
  { id: 'coa-029', kode: '2-2100', nama: 'Hutang PPh Pasal 25', tipe: 'Kewajiban', subTipe: 'Kewajiban Lancar' },
  { id: 'coa-030', kode: '2-2200', nama: 'Hutang PPh Pasal 21', tipe: 'Kewajiban', subTipe: 'Kewajiban Lancar' },
  { id: 'coa-031', kode: '2-2300', nama: 'Hutang PPh Badan', tipe: 'Kewajiban', subTipe: 'Kewajiban Lancar' },
  // Kewajiban Jangka Panjang
  { id: 'coa-032', kode: '2-3000', nama: 'Hutang Jangka Panjang — Kendaraan', tipe: 'Kewajiban', subTipe: 'Kewajiban Jangka Panjang' },
  { id: 'coa-033', kode: '2-3100', nama: 'Hutang Pemegang Saham', tipe: 'Kewajiban', subTipe: 'Kewajiban Jangka Panjang' },
  // Ekuitas
  { id: 'coa-034', kode: '3-0001', nama: 'Modal Saham', tipe: 'Ekuitas' },
  { id: 'coa-035', kode: '3-1000', nama: 'Laba Ditahan', tipe: 'Ekuitas' },
  { id: 'coa-036', kode: '3-1100', nama: 'Laba Tahun Lalu', tipe: 'Ekuitas' },
  { id: 'coa-037', kode: '3-1200', nama: 'Laba Tahun Berjalan', tipe: 'Ekuitas' },
  // Pendapatan
  { id: 'coa-038', kode: '4-0001', nama: 'Pendapatan Penjualan Ekspor', tipe: 'Pendapatan' },
  { id: 'coa-039', kode: '4-0002', nama: 'Pendapatan Penjualan Lokal', tipe: 'Pendapatan' },
  { id: 'coa-040', kode: '4-0100', nama: 'Pendapatan Lain-lain', tipe: 'Pendapatan' },
  // Beban
  { id: 'coa-041', kode: '5-0001', nama: 'HPP — Bahan Baku', tipe: 'Beban', subTipe: 'Beban Pokok' },
  { id: 'coa-042', kode: '5-0002', nama: 'HPP — Tenaga Kerja Langsung', tipe: 'Beban', subTipe: 'Beban Pokok' },
  { id: 'coa-043', kode: '5-0003', nama: 'HPP — Overhead Pabrik', tipe: 'Beban', subTipe: 'Beban Pokok' },
  { id: 'coa-044', kode: '5-0100', nama: 'Beban Gaji & Tunjangan', tipe: 'Beban', subTipe: 'Beban Operasional' },
  { id: 'coa-045', kode: '5-0200', nama: 'Beban Penyusutan', tipe: 'Beban', subTipe: 'Beban Operasional' },
  { id: 'coa-046', kode: '5-0300', nama: 'Beban Bea Masuk & Cukai', tipe: 'Beban', subTipe: 'Beban Operasional' },
  { id: 'coa-047', kode: '5-0400', nama: 'Beban Freight & Asuransi', tipe: 'Beban', subTipe: 'Beban Operasional' },
  { id: 'coa-048', kode: '5-0500', nama: 'Beban Subkontrak', tipe: 'Beban', subTipe: 'Beban Operasional' },
  { id: 'coa-049', kode: '5-9000', nama: 'Beban Lain-lain', tipe: 'Beban', subTipe: 'Beban Lainnya' },
]

export function useChartOfAccounts() {
  const [accounts, setAccounts] = useState<AkunCOA[]>(() =>
    getStore(COA_STORE_KEY, SEED_COA)
  )

  useEffect(() => {
    setAccounts(getStore(COA_STORE_KEY, SEED_COA))
  }, [])

  const addAccount = useCallback((data: Omit<AkunCOA, 'id'>) => {
    const current = getStore<AkunCOA>(COA_STORE_KEY, SEED_COA)
    const id = `coa-${Date.now()}`
    const newAccount: AkunCOA = { ...data, id }
    const updated = [...current, newAccount].sort((a, b) => a.kode.localeCompare(b.kode))
    setStore(COA_STORE_KEY, updated)
    setAccounts(updated)
    return newAccount
  }, [])

  const removeAccount = useCallback((id: string) => {
    const current = getStore<AkunCOA>(COA_STORE_KEY, SEED_COA)
    const updated = current.filter(a => a.id !== id)
    setStore(COA_STORE_KEY, updated)
    setAccounts(updated)
  }, [])

  return { accounts, addAccount, removeAccount }
}
