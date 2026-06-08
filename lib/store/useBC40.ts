'use client'

import { useState, useEffect, useCallback } from 'react'
import { getStore, setStore, generateId } from './index'

export interface BC40Item {
  id: string
  kodeBarang: string
  namaBarang: string
  posTarif: string
  satuan: string
  qty: number
  hargaSatuan: number
  mataUang: string
  nilaiIDR: number
}

export interface BC40Document {
  id: string
  nomorBC40: string
  tanggal: string
  kantorPabean: string
  jenisTranaksi: string
  // Penjual (pengusaha di luar TPB)
  penjualNama: string
  penjualNPWP: string
  penjualAlamat: string
  // Dokumen pendukung
  noFakturPajak: string
  noPackingList: string
  noKontrak: string
  // Pengangkutan
  jenisKendaraan: string
  noKendaraan: string
  noSuratJalan: string
  // Barang
  items: BC40Item[]
  // Nilai total
  totalNilaiIDR: number
  kurs: number
  mataUang: string
  status: 'Draft' | 'Submitted' | 'Approved'
  catatan: string
}

const STORE_KEY = 'jkj_bc40_v1'

const SEED: BC40Document[] = []

export function useBC40() {
  const [documents, setDocuments] = useState<BC40Document[]>([])

  useEffect(() => {
    setDocuments(getStore(STORE_KEY, SEED))
  }, [])

  const createDocument = useCallback((data: Omit<BC40Document, 'id'>) => {
    const current = getStore<BC40Document>(STORE_KEY, SEED)
    const id = generateId('BC40', current.map(d => d.id))
    const newDoc: BC40Document = { ...data, id }
    const updated = [newDoc, ...current]
    setStore(STORE_KEY, updated)
    setDocuments(updated)
    return newDoc
  }, [])

  return { documents, createDocument }
}
