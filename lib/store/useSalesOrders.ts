'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore, generateId } from './index'
import { MOCK_SALES_ORDERS, type SalesOrder } from '@/lib/mock-data/sales'

export function useSalesOrders() {
  const [orders, setOrders] = useState<SalesOrder[]>([])

  useEffect(() => {
    setOrders(getStore(STORE_KEYS.SALES_ORDERS, MOCK_SALES_ORDERS))
  }, [])

  const refresh = useCallback(() => {
    setOrders(getStore(STORE_KEYS.SALES_ORDERS, MOCK_SALES_ORDERS))
  }, [])

  const createOrder = useCallback((data: Omit<SalesOrder, 'id' | 'createdAt' | 'history'>) => {
    const current = getStore<SalesOrder>(STORE_KEYS.SALES_ORDERS, MOCK_SALES_ORDERS)
    const id = generateId('SO', current.map(o => o.id))
    const now = new Date().toISOString()
    const newOrder: SalesOrder = {
      ...data,
      id,
      createdAt: now,
      history: [{ date: now, action: 'Created', user: 'Sales Admin', status: data.status }],
    }
    const updated = addToStore(STORE_KEYS.SALES_ORDERS, newOrder, MOCK_SALES_ORDERS)
    setOrders(updated)
    return newOrder
  }, [])

  const updateOrder = useCallback((id: string, patch: Partial<SalesOrder>) => {
    const now = new Date().toISOString()
    const current = getStore<SalesOrder>(STORE_KEYS.SALES_ORDERS, MOCK_SALES_ORDERS)
    const existing = current.find(o => o.id === id)
    if (!existing) return
    const historyEntry = patch.status && patch.status !== existing.status
      ? [{ date: now, action: `Status changed to ${patch.status}`, user: 'System', status: patch.status }]
      : []
    const updated = updateInStore(STORE_KEYS.SALES_ORDERS, id, {
      ...patch,
      history: [...(existing.history || []), ...historyEntry],
    }, MOCK_SALES_ORDERS)
    setOrders(updated)
  }, [])

  const getById = useCallback((id: string) => {
    return getStore<SalesOrder>(STORE_KEYS.SALES_ORDERS, MOCK_SALES_ORDERS).find(o => o.id === id)
  }, [])

  return { orders, createOrder, updateOrder, getById, refresh }
}
