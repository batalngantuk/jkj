'use client'

import { useState, useEffect, useCallback } from 'react'
import { getStore, setStore, generateId } from './index'

export type JournalCategory = 'Penerimaan Kas/Bank' | 'Pengeluaran Kas/Bank' | 'Transaksi Umum'
export type JournalType = 'MASUK' | 'KELUAR'

export interface JournalEntry {
  id: string
  tanggal: string
  noBukti: string
  keterangan: string
  kategori: JournalCategory
  tipe: JournalType
  akun: 'Kas' | 'Bank'
  akunLawan?: string      // kode COA, e.g. "5-0100"
  nominal: number         // always IDR
  currency?: 'IDR' | 'USD' | 'KRW'
  kurs?: number
  nominalAsli?: number    // amount in original currency if non-IDR
}

// v2 key to flush old localStorage data from previous category structure
const STORE_KEY = 'jkj_journal_v2'

const SEED: JournalEntry[] = [
  { id: 'JRN-2026-001', tanggal: '2026-01-05', noBukti: 'BKM-001', keterangan: 'Penerimaan kas dari customer PT Mega', kategori: 'Penerimaan Kas/Bank', tipe: 'MASUK', akun: 'Kas', akunLawan: '1-1000', nominal: 45000000 },
  { id: 'JRN-2026-002', tanggal: '2026-01-10', noBukti: 'BKK-001', keterangan: 'Pembayaran gaji karyawan Januari', kategori: 'Pengeluaran Kas/Bank', tipe: 'KELUAR', akun: 'Bank', akunLawan: '5-0100', nominal: 85000000 },
  { id: 'JRN-2026-003', tanggal: '2026-01-15', noBukti: 'BKK-002', keterangan: 'Pembayaran listrik & air pabrik', kategori: 'Pengeluaran Kas/Bank', tipe: 'KELUAR', akun: 'Bank', akunLawan: '5-9000', nominal: 12500000 },
  { id: 'JRN-2026-004', tanggal: '2026-01-20', noBukti: 'BKM-002', keterangan: 'Transfer masuk dari customer ekspor (USD)', kategori: 'Penerimaan Kas/Bank', tipe: 'MASUK', akun: 'Bank', akunLawan: '1-1000', nominal: 320000000, currency: 'USD', kurs: 15500, nominalAsli: 20645 },
  { id: 'JRN-2026-005', tanggal: '2026-01-25', noBukti: 'BKK-003', keterangan: 'Pembayaran sewa gudang bulan Januari', kategori: 'Pengeluaran Kas/Bank', tipe: 'KELUAR', akun: 'Bank', akunLawan: '5-9000', nominal: 15000000 },
  { id: 'JRN-2026-006', tanggal: '2026-02-05', noBukti: 'BKK-004', keterangan: 'Pembayaran gaji karyawan Februari', kategori: 'Pengeluaran Kas/Bank', tipe: 'KELUAR', akun: 'Bank', akunLawan: '5-0100', nominal: 85000000 },
  { id: 'JRN-2026-007', tanggal: '2026-02-10', noBukti: 'BKM-003', keterangan: 'Penerimaan pembayaran customer domestik', kategori: 'Penerimaan Kas/Bank', tipe: 'MASUK', akun: 'Bank', akunLawan: '1-1000', nominal: 180000000 },
  { id: 'JRN-2026-008', tanggal: '2026-02-15', noBukti: 'BKK-005', keterangan: 'Biaya pengiriman / angkut ekspor', kategori: 'Pengeluaran Kas/Bank', tipe: 'KELUAR', akun: 'Bank', akunLawan: '5-0400', nominal: 8500000 },
  { id: 'JRN-2026-009', tanggal: '2026-02-20', noBukti: 'BKK-006', keterangan: 'Listrik, air, gas bulan Februari', kategori: 'Pengeluaran Kas/Bank', tipe: 'KELUAR', akun: 'Bank', akunLawan: '5-9000', nominal: 13200000 },
  { id: 'JRN-2026-010', tanggal: '2026-03-01', noBukti: 'BKK-007', keterangan: 'Pembayaran gaji karyawan Maret', kategori: 'Pengeluaran Kas/Bank', tipe: 'KELUAR', akun: 'Bank', akunLawan: '5-0100', nominal: 85000000 },
  { id: 'JRN-2026-011', tanggal: '2026-03-10', noBukti: 'BKM-004', keterangan: 'Transfer masuk pelunasan piutang', kategori: 'Penerimaan Kas/Bank', tipe: 'MASUK', akun: 'Bank', akunLawan: '1-1000', nominal: 250000000 },
  { id: 'JRN-2026-012', tanggal: '2026-03-15', noBukti: 'BKK-008', keterangan: 'Sewa gedung kantor & pabrik Maret', kategori: 'Pengeluaran Kas/Bank', tipe: 'KELUAR', akun: 'Bank', akunLawan: '5-9000', nominal: 15000000 },
]

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])

  useEffect(() => {
    setEntries(getStore(STORE_KEY, SEED))
  }, [])

  const refresh = useCallback(() => {
    setEntries(getStore(STORE_KEY, SEED))
  }, [])

  const createEntry = useCallback((data: Omit<JournalEntry, 'id'>) => {
    const current = getStore<JournalEntry>(STORE_KEY, SEED)
    const id = generateId('JRN', current.map(e => e.id))
    const newEntry: JournalEntry = { ...data, id }
    const updated = [newEntry, ...current]
    setStore(STORE_KEY, updated)
    setEntries(updated)
    return newEntry
  }, [])

  const deleteEntry = useCallback((id: string) => {
    const current = getStore<JournalEntry>(STORE_KEY, SEED)
    const updated = current.filter(e => e.id !== id)
    setStore(STORE_KEY, updated)
    setEntries(updated)
  }, [])

  return { entries, createEntry, deleteEntry, refresh }
}
