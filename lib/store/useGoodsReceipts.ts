'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, setStore, addToStore, generateId } from './index'

export interface GRItem {
  kode: string
  nama: string
  satuan: string
  qtyPO: number
  qtyDiterima: number
}

export interface GoodsReceipt {
  id: string
  tglMasuk: string
  noPIB: string
  noPO: string
  supplier: string
  jenisDoc: string
  items: GRItem[]
  gudang: string
  penerima: string
  noSuratJalan: string
  noKendaraan?: string
  catatan?: string
  status: 'Selesai' | 'Draft'
}

const SEED_GR: GoodsReceipt[] = [
  {
    id: 'GR-2026-001', tglMasuk: '2026-01-20', noPIB: 'PIB-2026-001234', noPO: 'PO-2026-001',
    supplier: 'Baosteel Co., Ltd', jenisDoc: 'BC 2.0',
    items: [{ kode: 'BB-HRC-001', nama: 'Hot Rolled Coil (HRC)', satuan: 'KG', qtyPO: 100000, qtyDiterima: 100000 }],
    gudang: 'Gudang RM-A', penerima: 'Ahmad Fauzi', noSuratJalan: 'SJ-2026-001', status: 'Selesai'
  },
  {
    id: 'GR-2026-002', tglMasuk: '2026-01-28', noPIB: 'PIB-2026-001567', noPO: 'PO-2026-002',
    supplier: 'Korea Petrochemical', jenisDoc: 'BC 2.0',
    items: [{ kode: 'BB-HDPE-001', nama: 'Polyethylene Resin HDPE', satuan: 'KG', qtyPO: 10000, qtyDiterima: 10000 }],
    gudang: 'Gudang RM-B', penerima: 'Budi Santoso', noSuratJalan: 'SJ-2026-002', status: 'Selesai'
  },
  {
    id: 'GR-2026-003', tglMasuk: '2026-02-15', noPIB: '-', noPO: 'PO-2026-003',
    supplier: 'PT. Supplier Lokal Jaya', jenisDoc: 'PO Lokal',
    items: [{ kode: 'BB-LOCAL-001', nama: 'Cat Primer Anti Karat', satuan: 'LITER', qtyPO: 500, qtyDiterima: 490 }],
    gudang: 'Gudang RM-B', penerima: 'Siti Rahayu', noSuratJalan: 'SJ-2026-003', status: 'Selesai'
  },
]

export function useGoodsReceipts() {
  const [receipts, setReceipts] = useState<GoodsReceipt[]>(() =>
    getStore(STORE_KEYS.GR, SEED_GR)
  )

  useEffect(() => {
    setReceipts(getStore(STORE_KEYS.GR, SEED_GR))
  }, [])

  const createReceipt = useCallback((data: Omit<GoodsReceipt, 'id'>) => {
    const current = getStore<GoodsReceipt>(STORE_KEYS.GR, SEED_GR)
    const id = generateId('GR', current.map(r => r.id))
    const newReceipt: GoodsReceipt = { ...data, id }
    const updated = addToStore(STORE_KEYS.GR, newReceipt, SEED_GR)
    setReceipts(updated)
    return newReceipt
  }, [])

  const updateReceipt = useCallback((id: string, patch: Partial<Omit<GoodsReceipt, 'id'>>) => {
    const current = getStore<GoodsReceipt>(STORE_KEYS.GR, SEED_GR)
    const updated = current.map(r => r.id === id ? { ...r, ...patch } : r)
    setStore(STORE_KEYS.GR, updated)
    setReceipts(updated)
  }, [])

  const deleteReceipt = useCallback((id: string) => {
    const current = getStore<GoodsReceipt>(STORE_KEYS.GR, SEED_GR)
    const updated = current.filter(r => r.id !== id)
    setStore(STORE_KEYS.GR, updated)
    setReceipts(updated)
  }, [])

  return { receipts, createReceipt, updateReceipt, deleteReceipt }
}
