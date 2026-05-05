'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore } from './index'

export interface TempStorageItem {
  id: string
  materialCode: string
  materialName: string
  qty: number
  unit: string
  unitCost: number
  totalValue: number
  location: string
  sourcePoId: string
  supplier: string
  cancelledDate: string
  cancelReason: string
  status: 'IN_STORAGE' | 'RELEASED'
  releaseRef?: string
  releaseDate?: string
  releasedQty?: number
}

const SEED: TempStorageItem[] = []

export function useTempStorage() {
  const [items, setItems] = useState<TempStorageItem[]>([])

  useEffect(() => {
    setItems(getStore(STORE_KEYS.TEMP_STORAGE, SEED))
  }, [])

  const refresh = useCallback(() => {
    setItems(getStore(STORE_KEYS.TEMP_STORAGE, SEED))
  }, [])

  const addItem = useCallback((item: Omit<TempStorageItem, 'id'>) => {
    const current = getStore<TempStorageItem>(STORE_KEYS.TEMP_STORAGE, SEED)
    const newItem: TempStorageItem = { ...item, id: `TEMP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
    const updated = addToStore(STORE_KEYS.TEMP_STORAGE, newItem, SEED)
    setItems(updated)
    return newItem
  }, [])

  const releaseItem = useCallback((id: string, releaseRef: string, releasedQty: number) => {
    const updated = updateInStore<TempStorageItem>(STORE_KEYS.TEMP_STORAGE, id, {
      status: 'RELEASED',
      releaseRef,
      releaseDate: new Date().toISOString().split('T')[0],
      releasedQty,
    }, SEED)
    setItems(updated)
  }, [])

  return { items, addItem, releaseItem, refresh }
}
