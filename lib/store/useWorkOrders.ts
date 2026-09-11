'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore, generateId } from './index'
import { MOCK_WORK_ORDERS, type WorkOrder } from '@/lib/mock-data/production'

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(() =>
    getStore(STORE_KEYS.WORK_ORDERS, MOCK_WORK_ORDERS)
  )

  useEffect(() => {
    setWorkOrders(getStore(STORE_KEYS.WORK_ORDERS, MOCK_WORK_ORDERS))
  }, [])

  const refresh = useCallback(() => {
    setWorkOrders(getStore(STORE_KEYS.WORK_ORDERS, MOCK_WORK_ORDERS))
  }, [])

  const createWorkOrder = useCallback((data: Omit<WorkOrder, 'id' | 'history'>) => {
    const current = getStore<WorkOrder>(STORE_KEYS.WORK_ORDERS, MOCK_WORK_ORDERS)
    const id = generateId('WO', current.map(w => w.id))
    const now = new Date().toISOString()
    const newWO: WorkOrder = {
      ...data,
      id,
      history: [{ date: now, action: 'Created', user: 'Production Staff', status: data.status }],
    }
    const updated = addToStore(STORE_KEYS.WORK_ORDERS, newWO, MOCK_WORK_ORDERS)
    setWorkOrders(updated)
    return newWO
  }, [])

  const updateWorkOrder = useCallback((id: string, patch: Partial<WorkOrder>) => {
    const now = new Date().toISOString()
    const current = getStore<WorkOrder>(STORE_KEYS.WORK_ORDERS, MOCK_WORK_ORDERS)
    const existing = current.find(w => w.id === id)
    if (!existing) return
    const historyEntry = patch.status && patch.status !== existing.status
      ? [{ date: now, action: `Status: ${patch.status}`, user: 'System', status: patch.status }]
      : []
    const updated = updateInStore(STORE_KEYS.WORK_ORDERS, id, {
      ...patch,
      history: [...(existing.history || []), ...historyEntry],
    }, MOCK_WORK_ORDERS)
    setWorkOrders(updated)
  }, [])

  const getById = useCallback((id: string) => {
    return getStore<WorkOrder>(STORE_KEYS.WORK_ORDERS, MOCK_WORK_ORDERS).find(w => w.id === id)
  }, [])

  const getBySoNumber = useCallback((soNumber: string) => {
    return getStore<WorkOrder>(STORE_KEYS.WORK_ORDERS, MOCK_WORK_ORDERS).filter(w => w.soNumber === soNumber)
  }, [])

  return { workOrders, createWorkOrder, updateWorkOrder, getById, getBySoNumber, refresh }
}
