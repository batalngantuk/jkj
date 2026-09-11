'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, generateId } from './index'
import { MOCK_SUPPLIERS, type Supplier } from '@/lib/mock-data/purchasing'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    getStore(STORE_KEYS.SUPPLIERS, MOCK_SUPPLIERS)
  )

  useEffect(() => {
    setSuppliers(getStore(STORE_KEYS.SUPPLIERS, MOCK_SUPPLIERS))
  }, [])

  const createSupplier = useCallback((data: Omit<Supplier, 'id'>) => {
    const current = getStore<Supplier>(STORE_KEYS.SUPPLIERS, MOCK_SUPPLIERS)
    const id = generateId('SUP', current.map(s => s.id))
    const newSupplier: Supplier = { ...data, id }
    const updated = addToStore(STORE_KEYS.SUPPLIERS, newSupplier, MOCK_SUPPLIERS)
    setSuppliers(updated)
    return newSupplier
  }, [])

  return { suppliers, createSupplier }
}
