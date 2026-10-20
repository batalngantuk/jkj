import { Page } from '@playwright/test'

// Seed localStorage sekali per konteks (tidak menimpa perubahan saat navigasi/reload).
export async function seedStore(page: Page, data: Record<string, unknown>) {
  await page.addInitScript((d) => {
    if (localStorage.getItem('__e2e_seeded')) return
    Object.entries(d).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)))
    localStorage.setItem('__e2e_seeded', '1')
  }, data)
}

export async function readStore<T = unknown>(page: Page, key: string): Promise<T> {
  return page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), key) as Promise<T>
}

export const stockItem = (materialCode: string, unit: string, qty: number, category = 'BB') => ({
  materialCode, materialName: `Tes ${materialCode}`, category, unit,
  qtyOnHand: qty, qtyReserved: 0, qtyAvailable: qty, location: 'Gudang BB-1', lastUpdated: '2026-10-20',
})
