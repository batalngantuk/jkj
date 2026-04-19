'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore, generateId } from './index'
import { MOCK_AR_INVOICES, type ARInvoice } from '@/lib/mock-data/finance'

export function useARInvoices() {
  const [invoices, setInvoices] = useState<ARInvoice[]>([])

  useEffect(() => {
    setInvoices(getStore(STORE_KEYS.AR_INVOICES, MOCK_AR_INVOICES))
  }, [])

  const refresh = useCallback(() => {
    setInvoices(getStore(STORE_KEYS.AR_INVOICES, MOCK_AR_INVOICES))
  }, [])

  const createInvoice = useCallback((data: Omit<ARInvoice, 'id'>) => {
    const current = getStore<ARInvoice>(STORE_KEYS.AR_INVOICES, MOCK_AR_INVOICES)
    const id = generateId('AR-INV', current.map(i => i.id))
    const newInvoice: ARInvoice = { ...data, id }
    const updated = addToStore(STORE_KEYS.AR_INVOICES, newInvoice, MOCK_AR_INVOICES)
    setInvoices(updated)
    return newInvoice
  }, [])

  const updateInvoice = useCallback((id: string, patch: Partial<ARInvoice>) => {
    const updated = updateInStore(STORE_KEYS.AR_INVOICES, id, patch, MOCK_AR_INVOICES)
    setInvoices(updated)
  }, [])

  const getById = useCallback((id: string) => {
    return getStore<ARInvoice>(STORE_KEYS.AR_INVOICES, MOCK_AR_INVOICES).find(i => i.id === id)
  }, [])

  const getBySoNumber = useCallback((soNumber: string) => {
    return getStore<ARInvoice>(STORE_KEYS.AR_INVOICES, MOCK_AR_INVOICES).filter(i => i.soNumber === soNumber)
  }, [])

  return { invoices, createInvoice, updateInvoice, getById, getBySoNumber, refresh }
}
