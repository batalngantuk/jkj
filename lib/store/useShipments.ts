'use client'

import { useState, useEffect, useCallback } from 'react'
import { getStore, setStore, addToStore, generateId } from './index'

const STORE_KEY = 'jkj_shipments'

export interface ShipmentItem {
  productName: string
  qtyDikirim: number
  unit: string
}

export interface Shipment {
  id: string
  tanggal: string
  noSuratJalan: string
  soId: string
  soNumber: string
  customer: string
  items: ShipmentItem[]
  noPEB: string
  transporter: string
  noKendaraan: string
  supir: string
  catatan: string
  status: 'Dikirim' | 'Terima Dikonfirmasi'
}

const SEED_SHIPMENTS: Shipment[] = [
  {
    id: 'SJ-EXP-2026-001',
    tanggal: '2026-02-10',
    noSuratJalan: 'SJ-EXP-2026-001',
    soId: 'SO-2026-006',
    soNumber: 'PO/HCP/444',
    customer: 'HealthCare Plus',
    items: [{ productName: 'Nitrile Size S', qtyDikirim: 2500, unit: 'carton' }],
    noPEB: 'PEB-2026-001',
    transporter: 'PT. Mitra Logistik Utama',
    noKendaraan: 'B 9988 XX',
    supir: 'Agus Santoso',
    catatan: 'Pengiriman ekspor ke Sydney',
    status: 'Dikirim',
  },
]

export function useShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])

  useEffect(() => {
    setShipments(getStore(STORE_KEY, SEED_SHIPMENTS))
  }, [])

  const refresh = useCallback(() => {
    setShipments(getStore(STORE_KEY, SEED_SHIPMENTS))
  }, [])

  const createShipment = useCallback((data: Omit<Shipment, 'id' | 'noSuratJalan'>) => {
    const current = getStore<Shipment>(STORE_KEY, SEED_SHIPMENTS)
    const id = generateId('SJ-EXP', current.map(s => s.id))
    const newShipment: Shipment = { ...data, id, noSuratJalan: id }
    const updated = addToStore(STORE_KEY, newShipment, SEED_SHIPMENTS)
    setShipments(updated)
    return newShipment
  }, [])

  const updateShipment = useCallback((id: string, patch: Partial<Shipment>) => {
    const current = getStore<Shipment>(STORE_KEY, SEED_SHIPMENTS)
    const updated = current.map(s => s.id === id ? { ...s, ...patch } : s)
    setStore(STORE_KEY, updated)
    setShipments(updated)
  }, [])

  return { shipments, createShipment, updateShipment, refresh }
}
