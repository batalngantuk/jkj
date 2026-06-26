'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore, generateId } from './index'
import { MOCK_AP_INVOICES, type APInvoice } from '@/lib/mock-data/finance'

export function useAPInvoices() {
  const [invoices, setInvoices] = useState<APInvoice[]>(() =>
    getStore(STORE_KEYS.AP_INVOICES, MOCK_AP_INVOICES)
  )

  useEffect(() => {
    setInvoices(getStore(STORE_KEYS.AP_INVOICES, MOCK_AP_INVOICES))
  }, [])

  const refresh = useCallback(() => {
    setInvoices(getStore(STORE_KEYS.AP_INVOICES, MOCK_AP_INVOICES))
  }, [])

  const createInvoice = useCallback((data: Omit<APInvoice, 'id' | 'invoiceNumber'>) => {
    const current = getStore<APInvoice>(STORE_KEYS.AP_INVOICES, MOCK_AP_INVOICES)
    const id = generateId('ap', current.map(i => i.id))
    const invoiceNumber = generateId('BILL', current.map(i => i.invoiceNumber))
    const newInvoice: APInvoice = { ...data, id, invoiceNumber }
    const updated = addToStore(STORE_KEYS.AP_INVOICES, newInvoice, MOCK_AP_INVOICES)
    setInvoices(updated)
    return newInvoice
  }, [])

  const updateInvoice = useCallback((id: string, patch: Partial<APInvoice>) => {
    const updated = updateInStore(STORE_KEYS.AP_INVOICES, id, patch, MOCK_AP_INVOICES)
    setInvoices(updated)
  }, [])

  const getById = useCallback((id: string) => {
    return getStore<APInvoice>(STORE_KEYS.AP_INVOICES, MOCK_AP_INVOICES).find(i => i.id === id)
  }, [])

  return { invoices, createInvoice, updateInvoice, getById, refresh }
}
