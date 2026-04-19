// Central localStorage store utilities
// All keys prefixed with 'jkj_' to avoid collisions

export const STORE_KEYS = {
  SALES_ORDERS: 'jkj_sales_orders',
  WORK_ORDERS: 'jkj_work_orders',
  FG_RECEIPTS: 'jkj_fg_receipts',      // FG masuk gudang dari WO
  PEB: 'jkj_peb',
  BC20: 'jkj_bc20',
  PURCHASE_ORDERS: 'jkj_purchase_orders',
  GR: 'jkj_goods_receipts',            // BB masuk gudang dari impor
  STOCK: 'jkj_stock',                  // saldo stok BB & FG
  WASTE: 'jkj_waste',
  AR_INVOICES: 'jkj_ar_invoices',
  AP_INVOICES: 'jkj_ap_invoices',
  PAYMENTS: 'jkj_payments',
  SUBKONTRAK: 'jkj_subkontrak',
} as const

export function getStore<T>(key: string, seed: T[]): T[] {
  if (typeof window === 'undefined') return seed
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return seed
    return JSON.parse(raw) as T[]
  } catch {
    return seed
  }
}

export function setStore<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

export function addToStore<T extends { id: string }>(key: string, item: T, seed: T[]): T[] {
  const current = getStore<T>(key, seed)
  const updated = [item, ...current]
  setStore(key, updated)
  return updated
}

export function updateInStore<T extends { id: string }>(key: string, id: string, patch: Partial<T>, seed: T[]): T[] {
  const current = getStore<T>(key, seed)
  const updated = current.map(item => item.id === id ? { ...item, ...patch } : item)
  setStore(key, updated)
  return updated
}

export function removeFromStore<T extends { id: string }>(key: string, id: string, seed: T[]): T[] {
  const current = getStore<T>(key, seed)
  const updated = current.filter(item => item.id !== id)
  setStore(key, updated)
  return updated
}

export function clearStore(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(key)
}

// Generate sequential IDs like SO-2026-007
export function generateId(prefix: string, existing: string[]): string {
  const year = new Date().getFullYear()
  const nums = existing
    .map(id => {
      const match = id.match(/(\d+)$/)
      return match ? parseInt(match[1]) : 0
    })
    .filter(n => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}-${year}-${String(next).padStart(3, '0')}`
}
