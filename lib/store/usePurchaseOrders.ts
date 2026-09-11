'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, updateInStore, generateId } from './index'
import { MOCK_PURCHASE_ORDERS, type PurchaseOrder } from '@/lib/mock-data/purchasing'

export function usePurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>(() =>
    getStore(STORE_KEYS.PURCHASE_ORDERS, MOCK_PURCHASE_ORDERS)
  )

  useEffect(() => {
    setOrders(getStore(STORE_KEYS.PURCHASE_ORDERS, MOCK_PURCHASE_ORDERS))
  }, [])

  const refresh = useCallback(() => {
    setOrders(getStore(STORE_KEYS.PURCHASE_ORDERS, MOCK_PURCHASE_ORDERS))
  }, [])

  const createOrder = useCallback((data: Omit<PurchaseOrder, 'id'>) => {
    const current = getStore<PurchaseOrder>(STORE_KEYS.PURCHASE_ORDERS, MOCK_PURCHASE_ORDERS)
    const id = generateId('PO', current.map(o => o.id))
    const newOrder: PurchaseOrder = { ...data, id }
    const updated = addToStore(STORE_KEYS.PURCHASE_ORDERS, newOrder, MOCK_PURCHASE_ORDERS)
    setOrders(updated)
    return newOrder
  }, [])

  const updateOrder = useCallback((id: string, patch: Partial<PurchaseOrder>) => {
    const updated = updateInStore(STORE_KEYS.PURCHASE_ORDERS, id, patch, MOCK_PURCHASE_ORDERS)
    setOrders(updated)
  }, [])

  const getById = useCallback((id: string) => {
    return getStore<PurchaseOrder>(STORE_KEYS.PURCHASE_ORDERS, MOCK_PURCHASE_ORDERS).find(o => o.id === id)
  }, [])

  return { orders, createOrder, updateOrder, getById, refresh }
}
