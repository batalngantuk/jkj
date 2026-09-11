'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore, generateId } from './index'
import { MOCK_WASTE_RECORDS, type WasteRecord } from '@/lib/mock-data/waste-management'

export function useWaste() {
  const [records, setRecords] = useState<WasteRecord[]>(() =>
    getStore(STORE_KEYS.WASTE, MOCK_WASTE_RECORDS)
  )

  useEffect(() => {
    setRecords(getStore(STORE_KEYS.WASTE, MOCK_WASTE_RECORDS))
  }, [])

  const refresh = useCallback(() => {
    setRecords(getStore(STORE_KEYS.WASTE, MOCK_WASTE_RECORDS))
  }, [])

  const createWaste = useCallback((data: Omit<WasteRecord, 'id'>) => {
    const current = getStore<WasteRecord>(STORE_KEYS.WASTE, MOCK_WASTE_RECORDS)
    const id = generateId('WASTE', current.map(r => r.id))
    const newRecord: WasteRecord = { ...data, id }
    const updated = addToStore(STORE_KEYS.WASTE, newRecord, MOCK_WASTE_RECORDS)
    setRecords(updated)
    return newRecord
  }, [])

  const updateWaste = useCallback((id: string, patch: Partial<WasteRecord>) => {
    const updated = updateInStore(STORE_KEYS.WASTE, id, patch, MOCK_WASTE_RECORDS)
    setRecords(updated)
  }, [])

  return { records, createWaste, updateWaste, refresh }
}
