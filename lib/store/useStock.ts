'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, setStore } from './index'

export interface StockItem {
  materialCode: string
  materialName: string
  category: 'BB' | 'FG' | 'Packaging' | 'WIP'
  unit: string
  qtyOnHand: number
  qtyReserved: number    // reserved untuk WO yang sudah dibuat
  qtyAvailable: number   // qtyOnHand - qtyReserved
  location: string
  lastUpdated: string
  fasilitas?: 'KITE' | 'Non-KITE'
}

export interface StockMovement {
  id: string
  date: string
  materialCode: string
  materialName: string
  transactionType: 'OPENING' | 'IMPORT' | 'LOCAL_PURCHASE' | 'PRODUCTION_OUT' | 'FG_IN' | 'WIP_IN' | 'WIP_OUT' | 'EXPORT' | 'WASTE' | 'ADJUSTMENT'
  referenceNumber: string
  referenceType: string
  quantityIn: number
  quantityOut: number
  runningBalance: number
  notes?: string
}

const SEED_STOCK: StockItem[] = [
  { materialCode: 'RM-LATEX', materialName: 'Natural Rubber Latex', category: 'BB', unit: 'kg', qtyOnHand: 5000, qtyReserved: 500, qtyAvailable: 4500, location: 'Gudang BB-1', lastUpdated: '2026-02-28', fasilitas: 'KITE' },
  { materialCode: 'RM-NITRILE', materialName: 'Nitrile Latex', category: 'BB', unit: 'kg', qtyOnHand: 4000, qtyReserved: 300, qtyAvailable: 3700, location: 'Gudang BB-1', lastUpdated: '2026-02-28', fasilitas: 'KITE' },
  { materialCode: 'RM-SULFUR', materialName: 'Sulfur Dispersion', category: 'BB', unit: 'kg', qtyOnHand: 200, qtyReserved: 10, qtyAvailable: 190, location: 'Gudang BB-2', lastUpdated: '2026-02-28', fasilitas: 'KITE' },
  { materialCode: 'RM-ZINC', materialName: 'Zinc Oxide', category: 'BB', unit: 'kg', qtyOnHand: 300, qtyReserved: 20, qtyAvailable: 280, location: 'Gudang BB-2', lastUpdated: '2026-02-28', fasilitas: 'KITE' },
  { materialCode: 'PKG-BOX', materialName: 'Inner Box', category: 'Packaging', unit: 'pc', qtyOnHand: 10000, qtyReserved: 1000, qtyAvailable: 9000, location: 'Gudang PKG', lastUpdated: '2026-02-28', fasilitas: 'Non-KITE' },
  { materialCode: 'PKG-CARTON', materialName: 'Carton Box', category: 'Packaging', unit: 'pc', qtyOnHand: 2000, qtyReserved: 200, qtyAvailable: 1800, location: 'Gudang PKG', lastUpdated: '2026-02-28', fasilitas: 'Non-KITE' },
  { materialCode: 'FG-LATEX-M', materialName: 'Latex Size M', category: 'FG', unit: 'cartons', qtyOnHand: 500, qtyReserved: 0, qtyAvailable: 500, location: 'Gudang FG-A', lastUpdated: '2026-02-28', fasilitas: 'KITE' },
  { materialCode: 'FG-NITRILE-S', materialName: 'Nitrile Size S', category: 'FG', unit: 'cartons', qtyOnHand: 2450, qtyReserved: 0, qtyAvailable: 2450, location: 'Gudang FG-A', lastUpdated: '2026-03-04', fasilitas: 'KITE' },
  // WIP — bahan setengah jadi
  { materialCode: 'WIP-COMPOUND-LATEX', materialName: 'Latex Compound (Post-Mixing)', category: 'WIP', unit: 'kg', qtyOnHand: 2000, qtyReserved: 500, qtyAvailable: 1500, location: 'Gudang WIP-1', lastUpdated: '2026-04-10', fasilitas: 'KITE' },
  { materialCode: 'WIP-DIPPED-M', materialName: 'Sarung Tangan Dipped Size M', category: 'WIP', unit: 'batch', qtyOnHand: 8, qtyReserved: 2, qtyAvailable: 6, location: 'Gudang WIP-1', lastUpdated: '2026-04-12', fasilitas: 'KITE' },
  { materialCode: 'WIP-COMPOUND-NITRILE', materialName: 'Nitrile Compound (Post-Mixing)', category: 'WIP', unit: 'kg', qtyOnHand: 1500, qtyReserved: 0, qtyAvailable: 1500, location: 'Gudang WIP-2', lastUpdated: '2026-04-11', fasilitas: 'KITE' },
]

const SEED_MOVEMENTS: StockMovement[] = [
  { id: 'MOV-001', date: '2026-01-01', materialCode: 'RM-LATEX', materialName: 'Natural Rubber Latex', transactionType: 'OPENING', referenceNumber: '-', referenceType: 'NONE', quantityIn: 5000, quantityOut: 0, runningBalance: 5000 },
  { id: 'MOV-002', date: '2026-01-01', materialCode: 'RM-NITRILE', materialName: 'Nitrile Latex', transactionType: 'OPENING', referenceNumber: '-', referenceType: 'NONE', quantityIn: 4000, quantityOut: 0, runningBalance: 4000 },
  { id: 'MOV-003', date: '2026-02-04', materialCode: 'FG-NITRILE-S', materialName: 'Nitrile Size S', transactionType: 'FG_IN', referenceNumber: 'WO-2026-003', referenceType: 'WO', quantityIn: 2450, quantityOut: 0, runningBalance: 2450, notes: 'Dari WO-2026-003' },
  { id: 'MOV-004', date: '2026-03-15', materialCode: 'FG-NITRILE-S', materialName: 'Nitrile Size S', transactionType: 'EXPORT', referenceNumber: 'PEB-2026-001', referenceType: 'PEB', quantityIn: 0, quantityOut: 2450, runningBalance: 0 },
]

export function useStock() {
  const [stock, setStock] = useState<StockItem[]>(() =>
    getStore(STORE_KEYS.STOCK, SEED_STOCK)
  )
  const [movements, setMovements] = useState<StockMovement[]>(() =>
    getStore('jkj_stock_movements', SEED_MOVEMENTS)
  )

  useEffect(() => {
    setStock(getStore(STORE_KEYS.STOCK, SEED_STOCK))
    setMovements(getStore('jkj_stock_movements', SEED_MOVEMENTS))
  }, [])

  const refresh = useCallback(() => {
    setStock(getStore(STORE_KEYS.STOCK, SEED_STOCK))
    setMovements(getStore('jkj_stock_movements', SEED_MOVEMENTS))
  }, [])

  // Tambah stok (dari GR/inbound)
  const addStock = useCallback((materialCode: string, materialName: string, qty: number, ref: string, refType: string, category: StockItem['category'] = 'BB', unit = 'kg', location = 'Gudang BB-1') => {
    const currentStock = getStore<StockItem>(STORE_KEYS.STOCK, SEED_STOCK)
    const currentMovements = getStore<StockMovement>('jkj_stock_movements', SEED_MOVEMENTS)

    const idx = currentStock.findIndex(s => s.materialCode === materialCode)
    let updatedStock: StockItem[]
    let newBalance: number

    if (idx >= 0) {
      newBalance = currentStock[idx].qtyOnHand + qty
      updatedStock = currentStock.map((s, i) => i === idx
        ? { ...s, qtyOnHand: newBalance, qtyAvailable: newBalance - s.qtyReserved, lastUpdated: new Date().toISOString().split('T')[0] }
        : s)
    } else {
      newBalance = qty
      updatedStock = [...currentStock, { materialCode, materialName, category, unit, qtyOnHand: qty, qtyReserved: 0, qtyAvailable: qty, location, lastUpdated: new Date().toISOString().split('T')[0] }]
    }

    const newMovement: StockMovement = {
      id: `MOV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      materialCode, materialName,
      transactionType: category === 'FG' ? 'FG_IN' : category === 'WIP' ? 'WIP_IN' : 'IMPORT',
      referenceNumber: ref, referenceType: refType,
      quantityIn: qty, quantityOut: 0, runningBalance: newBalance,
    }

    setStore(STORE_KEYS.STOCK, updatedStock)
    setStore('jkj_stock_movements', [...currentMovements, newMovement])
    setStock(updatedStock)
    setMovements([...currentMovements, newMovement])
  }, [])

  // Kurangi stok (dari WO/produksi/ekspor)
  const deductStock = useCallback((materialCode: string, qty: number, ref: string, refType: string, txType: StockMovement['transactionType']) => {
    const currentStock = getStore<StockItem>(STORE_KEYS.STOCK, SEED_STOCK)
    const currentMovements = getStore<StockMovement>('jkj_stock_movements', SEED_MOVEMENTS)

    const idx = currentStock.findIndex(s => s.materialCode === materialCode)
    if (idx < 0) return

    const item = currentStock[idx]
    const newBalance = Math.max(0, item.qtyOnHand - qty)
    const updatedStock = currentStock.map((s, i) => i === idx
      ? { ...s, qtyOnHand: newBalance, qtyAvailable: Math.max(0, newBalance - s.qtyReserved), lastUpdated: new Date().toISOString().split('T')[0] }
      : s)

    const newMovement: StockMovement = {
      id: `MOV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      materialCode, materialName: item.materialName,
      transactionType: txType,
      referenceNumber: ref, referenceType: refType,
      quantityIn: 0, quantityOut: qty, runningBalance: newBalance,
    }

    setStore(STORE_KEYS.STOCK, updatedStock)
    setStore('jkj_stock_movements', [...currentMovements, newMovement])
    setStock(updatedStock)
    setMovements([...currentMovements, newMovement])
  }, [])

  const getByCode = useCallback((code: string) => {
    return getStore<StockItem>(STORE_KEYS.STOCK, SEED_STOCK).find(s => s.materialCode === code)
  }, [])

  return { stock, movements, addStock, deductStock, getByCode, refresh }
}
