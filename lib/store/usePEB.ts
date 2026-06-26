'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore, generateId } from './index'

export interface PEBItem {
  id: string
  materialCode: string
  materialName: string
  hsCode: string
  quantity: number
  uom: string
  unitPrice: number
  totalPrice: number
  lotNumber?: string
}

export interface PEBDocument {
  id: string
  pebNumber: string
  documentDate: string
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'EXPORTED' | 'CANCELLED'
  soNumber?: string
  woId?: string
  fgrId?: string              // FGReceipt id
  invoiceNo?: string
  invoiceDate?: string
  customerName: string
  destinationCountry: string
  portOfLoading: string
  exportDate: string
  currency: 'USD' | 'EUR' | 'SGD'
  exchangeRate: number
  fobValue: number            // in foreign currency
  fobIdr: number              // fobValue × exchangeRate
  items: PEBItem[]
  notes?: string
  createdAt: string
  createdBy: string
  history: Array<{ date: string; action: string; user: string; status: string }>
}

const SEED: PEBDocument[] = [
  {
    id: '1',
    pebNumber: 'PEB-2026-001',
    documentDate: '2026-03-10',
    status: 'EXPORTED',
    soNumber: 'SO-2026-006',
    woId: 'WO-2026-003',
    fgrId: 'FGR-2026-001',
    customerName: 'ABC Trading USA',
    destinationCountry: 'United States',
    portOfLoading: 'Tanjung Priok',
    exportDate: '2026-03-15',
    currency: 'USD',
    exchangeRate: 15500,
    fobValue: 125000,
    fobIdr: 1937500000,
    items: [
      { id: '1', materialCode: 'FG-001', materialName: 'Nitrile Size S', hsCode: '4015.11.00', quantity: 2450, uom: 'cartons', unitPrice: 51.02, totalPrice: 125000, lotNumber: 'FG-LOT-001' }
    ],
    createdAt: '2026-03-10T10:00:00Z',
    createdBy: 'kite@jkj.com',
    history: [
      { date: '2026-03-10T10:00:00Z', action: 'Created', user: 'kite@jkj.com', status: 'DRAFT' },
      { date: '2026-03-14T09:00:00Z', action: 'Approved by Bea Cukai', user: 'customs@beacukai.go.id', status: 'APPROVED' },
      { date: '2026-03-15T08:00:00Z', action: 'Exported', user: 'kite@jkj.com', status: 'EXPORTED' },
    ]
  }
]

export function usePEB() {
  const [pebs, setPebs] = useState<PEBDocument[]>(() =>
    getStore(STORE_KEYS.PEB, SEED)
  )

  useEffect(() => {
    setPebs(getStore(STORE_KEYS.PEB, SEED))
  }, [])

  const refresh = useCallback(() => {
    setPebs(getStore(STORE_KEYS.PEB, SEED))
  }, [])

  const createPEB = useCallback((data: Omit<PEBDocument, 'id' | 'pebNumber' | 'createdAt' | 'history'>) => {
    const current = getStore<PEBDocument>(STORE_KEYS.PEB, SEED)
    const id = generateId('PEB', current.map(p => p.id))
    const pebNumber = generateId('PEB', current.map(p => p.pebNumber))
    const now = new Date().toISOString()
    const newPEB: PEBDocument = {
      ...data,
      id,
      pebNumber,
      createdAt: now,
      history: [{ date: now, action: 'Created', user: data.createdBy, status: data.status }],
    }
    const updated = addToStore(STORE_KEYS.PEB, newPEB, SEED)
    setPebs(updated)
    return newPEB
  }, [])

  const updatePEB = useCallback((id: string, patch: Partial<PEBDocument>) => {
    const now = new Date().toISOString()
    const current = getStore<PEBDocument>(STORE_KEYS.PEB, SEED)
    const existing = current.find(p => p.id === id)
    if (!existing) return
    const historyEntry = patch.status && patch.status !== existing.status
      ? [{ date: now, action: `Status: ${patch.status}`, user: 'System', status: patch.status }]
      : []
    const updated = updateInStore(STORE_KEYS.PEB, id, {
      ...patch,
      history: [...(existing.history || []), ...historyEntry],
    }, SEED)
    setPebs(updated)
  }, [])

  const getById = useCallback((id: string) => {
    return getStore<PEBDocument>(STORE_KEYS.PEB, SEED).find(p => p.id === id)
  }, [])

  return { pebs, createPEB, updatePEB, getById, refresh }
}
