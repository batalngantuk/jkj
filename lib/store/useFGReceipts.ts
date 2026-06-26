'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, generateId } from './index'

export interface FGReceipt {
  id: string
  woId: string
  woNumber: string
  soNumber: string
  productName: string
  qtyProduced: number
  qtyReceived: number
  qtyReject: number
  unit: string
  wasteQty: number
  wasteRatio: number       // actual waste %
  gudangTujuan: string
  penerima: string
  tanggal: string
  createdAt: string
  status: 'Diterima' | 'Partial' | 'Pending'
}

const SEED: FGReceipt[] = [
  {
    id: 'FGR-2026-001',
    woId: 'WO-2026-003',
    woNumber: 'WO-2026-003',
    soNumber: 'SO-2026-006',
    productName: 'Nitrile Size S',
    qtyProduced: 2500,
    qtyReceived: 2450,
    qtyReject: 50,
    unit: 'cartons',
    wasteQty: 50,
    wasteRatio: 2.0,
    gudangTujuan: 'Gudang FG-A',
    penerima: 'Budi Santoso',
    tanggal: '2026-02-04',
    createdAt: '2026-02-04T17:00:00Z',
    status: 'Diterima',
  }
]

export function useFGReceipts() {
  const [receipts, setReceipts] = useState<FGReceipt[]>(() =>
    getStore(STORE_KEYS.FG_RECEIPTS, SEED)
  )

  useEffect(() => {
    setReceipts(getStore(STORE_KEYS.FG_RECEIPTS, SEED))
  }, [])

  const refresh = useCallback(() => {
    setReceipts(getStore(STORE_KEYS.FG_RECEIPTS, SEED))
  }, [])

  const createReceipt = useCallback((data: Omit<FGReceipt, 'id' | 'createdAt'>) => {
    const current = getStore<FGReceipt>(STORE_KEYS.FG_RECEIPTS, SEED)
    const id = generateId('FGR', current.map(r => r.id))
    const newReceipt: FGReceipt = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    }
    const updated = addToStore(STORE_KEYS.FG_RECEIPTS, newReceipt, SEED)
    setReceipts(updated)
    return newReceipt
  }, [])

  const getByWoId = useCallback((woId: string) => {
    return getStore<FGReceipt>(STORE_KEYS.FG_RECEIPTS, SEED).filter(r => r.woId === woId)
  }, [])

  const getAvailableForPEB = useCallback(() => {
    // FG yang sudah masuk gudang dan belum seluruhnya diekspor
    return getStore<FGReceipt>(STORE_KEYS.FG_RECEIPTS, SEED).filter(r => r.qtyReceived > 0)
  }, [])

  return { receipts, createReceipt, getByWoId, getAvailableForPEB, refresh }
}
