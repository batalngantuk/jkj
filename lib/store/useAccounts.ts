'use client'

import { useState, useEffect, useCallback } from 'react'
import { getStore, setStore } from './index'

export interface AccountBalances {
  // Aktiva Lancar
  kas: number
  bank: number
  piutangLainLain: number
  piutangPemegangSaham: number
  perlengkapanPabrik: number
  biayaDibayarDimuka: number
  ppnPembelian: number

  // Aktiva Tetap (nilai buku = nilai perolehan - akumulasi penyusutan)
  tanah: number
  bangunan: number
  akumPenyusutanBangunan: number
  peralatanPabrik: number
  akumPenyusutanPeralatanPabrik: number
  peralatanKantor: number
  akumPenyusutanPeralatanKantor: number
  kendaraan: number
  akumPenyusutanKendaraan: number
  mesin: number
  akumPenyusutanMesin: number
  perlengkapanKantorAssetTA: number

  // Hutang Lancar
  hutangGaji: number
  uangMukaPenjualan: number
  hutangUsahaLainnya: number
  hutangPPNPenjualan: number
  hutangPPh25: number
  hutangPPh21: number
  hutangPPhBadan: number

  // Hutang Jangka Panjang
  hutangMobilRush: number
  hutangPemegangSaham: number
  hutangMobilPajero: number

  // Modal
  modalSaham: number
  labaDitahan: number  // laba ditahan deklarasi TA
  labaTahunLalu: number

  // Meta
  periodeAwal: string  // misal '2026-01-01'
}

const STORE_KEY = 'jkj_account_balances'

export const DEFAULT_BALANCES: AccountBalances = {
  kas: 50000000,
  bank: 450000000,
  piutangLainLain: 0,
  piutangPemegangSaham: 0,
  perlengkapanPabrik: 25000000,
  biayaDibayarDimuka: 10000000,
  ppnPembelian: 0,

  tanah: 500000000,
  bangunan: 800000000,
  akumPenyusutanBangunan: 120000000,
  peralatanPabrik: 350000000,
  akumPenyusutanPeralatanPabrik: 85000000,
  peralatanKantor: 75000000,
  akumPenyusutanPeralatanKantor: 22500000,
  kendaraan: 450000000,
  akumPenyusutanKendaraan: 90000000,
  mesin: 620000000,
  akumPenyusutanMesin: 186000000,
  perlengkapanKantorAssetTA: 15000000,

  hutangGaji: 0,
  uangMukaPenjualan: 0,
  hutangUsahaLainnya: 5000000,
  hutangPPNPenjualan: 0,
  hutangPPh25: 8500000,
  hutangPPh21: 3200000,
  hutangPPhBadan: 0,

  hutangMobilRush: 85000000,
  hutangPemegangSaham: 200000000,
  hutangMobilPajero: 120000000,

  modalSaham: 1000000000,
  labaDitahan: 250000000,
  labaTahunLalu: 180000000,

  periodeAwal: '2026-01-01',
}

export function useAccounts() {
  const [balances, setBalances] = useState<AccountBalances>(DEFAULT_BALANCES)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(STORE_KEY)
      if (raw) setBalances(JSON.parse(raw) as AccountBalances)
    } catch { /* use default */ }
  }, [])

  const saveBalances = useCallback((data: AccountBalances) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORE_KEY, JSON.stringify(data))
    }
    setBalances(data)
  }, [])

  return { balances, saveBalances }
}
