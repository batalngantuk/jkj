'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore, generateId } from './index'

export interface BC20Document {
  id: string
  pibNumber: string           // nomor PIB
  supplierName: string
  importDate: string
  arrivalDate?: string
  grDate?: string             // tanggal GR
  items: Array<{
    id: string
    description: string
    hsCode: string
    quantity: number
    unit: string
    cifUsd: number
    lotNumber?: string
  }>
  cifUsd: number
  exchangeRate: number
  cifIdr: number
  beaMasuk: number
  ppnImport: number
  pph22: number
  totalLandedCost: number
  status: 'ARRIVED' | 'GR_DONE' | 'TAX_PAID' | 'CLOSED'
  notes?: string
  createdAt: string
}

// Seed dari data yang sudah ada di purchasing/bc20
const SEED: BC20Document[] = [
  {
    id: '1', pibNumber: 'PIB-2026-001', supplierName: 'Baosteel', importDate: '2026-02-28', arrivalDate: '2026-03-05', grDate: '2026-03-10',
    items: [{ id: '1', description: 'Natural Rubber Latex', hsCode: '4001.10.00', quantity: 5000, unit: 'kg', cifUsd: 61290, lotNumber: 'RM-LOT-2026-001' }],
    cifUsd: 61290, exchangeRate: 15500, cifIdr: 950000000, beaMasuk: 47500000, ppnImport: 108185000, pph22: 27312500,
    totalLandedCost: 1034000000, status: 'TAX_PAID', createdAt: '2026-02-28T08:00:00Z'
  },
  {
    id: '2', pibNumber: 'PIB-2026-002', supplierName: 'POSCO', importDate: '2026-03-06', arrivalDate: '2026-03-08', grDate: '2026-03-11',
    items: [{ id: '1', description: 'Nitrile Latex', hsCode: '3906.90.00', quantity: 4000, unit: 'kg', cifUsd: 77419 }],
    cifUsd: 77419, exchangeRate: 15500, cifIdr: 1200000000, beaMasuk: 60000000, ppnImport: 136400000, pph22: 34500000,
    totalLandedCost: 1304200000, status: 'GR_DONE', createdAt: '2026-03-06T08:00:00Z'
  },
]

export function useBC20() {
  const [documents, setDocuments] = useState<BC20Document[]>([])

  useEffect(() => {
    setDocuments(getStore(STORE_KEYS.BC20, SEED))
  }, [])

  const refresh = useCallback(() => {
    setDocuments(getStore(STORE_KEYS.BC20, SEED))
  }, [])

  const createBC20 = useCallback((data: Omit<BC20Document, 'id' | 'createdAt'>) => {
    const current = getStore<BC20Document>(STORE_KEYS.BC20, SEED)
    const id = generateId('BC20', current.map(d => d.id))
    const newDoc: BC20Document = { ...data, id, createdAt: new Date().toISOString() }
    const updated = addToStore(STORE_KEYS.BC20, newDoc, SEED)
    setDocuments(updated)
    return newDoc
  }, [])

  const updateBC20 = useCallback((id: string, patch: Partial<BC20Document>) => {
    const updated = updateInStore(STORE_KEYS.BC20, id, patch, SEED)
    setDocuments(updated)
  }, [])

  const getById = useCallback((id: string) => {
    return getStore<BC20Document>(STORE_KEYS.BC20, SEED).find(d => d.id === id)
  }, [])

  return { documents, createBC20, updateBC20, getById, refresh }
}
