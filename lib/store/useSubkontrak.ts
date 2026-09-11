'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore, generateId } from './index'
import { MOCK_SUBKON_RECORDS, type SubkonRecord } from '@/lib/mock-data/subkontrak'

export function useSubkontrak() {
  const [records, setRecords] = useState<SubkonRecord[]>(() =>
    getStore(STORE_KEYS.SUBKONTRAK, MOCK_SUBKON_RECORDS)
  )

  useEffect(() => {
    setRecords(getStore(STORE_KEYS.SUBKONTRAK, MOCK_SUBKON_RECORDS))
  }, [])

  const refresh = useCallback(() => {
    setRecords(getStore(STORE_KEYS.SUBKONTRAK, MOCK_SUBKON_RECORDS))
  }, [])

  const createSubkon = useCallback((data: Omit<SubkonRecord, 'id'>) => {
    const current = getStore<SubkonRecord>(STORE_KEYS.SUBKONTRAK, MOCK_SUBKON_RECORDS)
    const id = generateId('SUBK', current.map(r => r.id))
    const newRecord: SubkonRecord = { ...data, id }
    const updated = addToStore(STORE_KEYS.SUBKONTRAK, newRecord, MOCK_SUBKON_RECORDS)
    setRecords(updated)
    return newRecord
  }, [])

  const updateSubkon = useCallback((id: string, patch: Partial<SubkonRecord>) => {
    const updated = updateInStore(STORE_KEYS.SUBKONTRAK, id, patch, MOCK_SUBKON_RECORDS)
    setRecords(updated)
  }, [])

  return { records, createSubkon, updateSubkon, refresh }
}
