'use client'

import { useState, useEffect, useCallback } from 'react'
import { getStore, setStore, generateId } from './index'

export interface PLItem {
  _key: string
  kodeBarang: string
  namaBarang: string
  posTarif: string
  satuan: string
  qty: number
  beratBersih: number
  hargaSatuan: number
  nilaiIDR: number
}

export interface PenjualanLokalDoc {
  id: string
  nomorPL: string
  tanggal: string
  // Pembeli
  pembeliNama: string
  pembeliNPWP: string
  pembeliAlamat: string
  // Referensi
  noSORef: string
  noInvoice: string
  noPL: string // no. packing list
  noKontrak: string
  // Pengangkutan
  jenisKendaraan: string
  noKendaraan: string
  noSuratJalan: string
  // Barang
  items: PLItem[]
  // Nilai
  totalNilaiIDR: number
  catatan: string
  status: 'Draft' | 'Submitted' | 'Approved'
}

const STORE_KEY = 'jkj_penjualan_lokal_v1'
const SEED: PenjualanLokalDoc[] = []

export function usePenjualanLokal() {
  const [documents, setDocuments] = useState<PenjualanLokalDoc[]>(() =>
    getStore(STORE_KEY, SEED)
  )

  useEffect(() => {
    setDocuments(getStore(STORE_KEY, SEED))
  }, [])

  const createDocument = useCallback((data: Omit<PenjualanLokalDoc, 'id'>) => {
    const current = getStore<PenjualanLokalDoc>(STORE_KEY, SEED)
    const id = generateId('PL', current.map(d => d.id))
    const newDoc: PenjualanLokalDoc = { ...data, id }
    const updated = [newDoc, ...current]
    setStore(STORE_KEY, updated)
    setDocuments(updated)
    return newDoc
  }, [])

  return { documents, createDocument }
}
