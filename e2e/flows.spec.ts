import { test, expect } from '@playwright/test'
import { seedStore, readStore, stockItem } from './helpers'

type Stock = { materialCode: string; qtyOnHand: number }
const onHand = async (page: import('@playwright/test').Page, code: string) =>
  (await readStore<Stock[]>(page, 'jkj_stock')).find(s => s.materialCode === code)?.qtyOnHand

test.describe('Gudang — Pengeluaran BB', () => {
  test('buat → satuan benar → cetak → edit → hapus (stok konsisten)', async ({ page }) => {
    await seedStore(page, {
      jkj_stock: [stockItem('TST-KAIN', 'MTR', 1000), stockItem('TST-ZIP', 'YRD', 500)],
      jkj_stock_movements: [],
    })
    await page.goto('/warehouse/issue')

    // Buat bukti pengeluaran
    await page.getByRole('button', { name: 'Buat Bukti Pengeluaran', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('combobox').nth(0).click()
    await page.getByRole('option', { name: /WO-2026-001/ }).click()
    await dialog.getByRole('combobox').nth(1).click()
    await page.getByRole('option', { name: /TST-KAIN/ }).click()
    await dialog.locator('input[type=number]').nth(1).fill('100')
    await dialog.getByRole('button', { name: /Simpan & Update Stok/ }).click()
    await expect(dialog.getByText('Pengeluaran BB Berhasil Dicatat')).toBeVisible()
    await dialog.getByRole('button', { name: 'Tutup' }).first().click()

    // Satuan tetap MTR (bug lama: berubah jadi pcs), stok berkurang
    const row = page.getByRole('row').filter({ hasText: 'TST-KAIN' })
    await expect(row).toContainText('100 MTR')
    await expect(row).not.toContainText('pcs')
    expect(await onHand(page, 'TST-KAIN')).toBe(900)

    // Tetap ada setelah reload (persisted)
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: 'TST-KAIN' })).toContainText('100 MTR')

    // Cetak
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      page.getByRole('row').filter({ hasText: 'TST-KAIN' }).getByTitle('Cetak Bukti Pengeluaran').click(),
    ])
    await expect(popup.getByText('BUKTI PENGELUARAN BAHAN BAKU')).toBeVisible()
    await expect(popup.getByRole('cell', { name: 'TST-KAIN', exact: true })).toBeVisible()
    await expect(popup.getByRole('cell', { name: 'MTR' })).toBeVisible()
    await popup.close()

    // Edit qty → stok menyesuaikan
    await page.getByRole('row').filter({ hasText: 'TST-KAIN' }).getByTitle('Edit qty').click()
    const edit = page.getByRole('dialog')
    await edit.locator('input[type=number]').first().fill('150')
    await edit.getByRole('button', { name: 'Simpan Perubahan' }).click()
    await expect(page.getByRole('row').filter({ hasText: 'TST-KAIN' })).toContainText('150 MTR')
    expect(await onHand(page, 'TST-KAIN')).toBe(850)

    // Hapus → stok kembali penuh, movement ikut bersih
    await page.getByRole('row').filter({ hasText: 'TST-KAIN' }).getByTitle('Hapus & kembalikan stok').click()
    await page.getByRole('dialog').getByRole('button', { name: 'Hapus', exact: true }).click()
    await expect(page.getByRole('row').filter({ hasText: 'TST-KAIN' })).toHaveCount(0)
    expect(await onHand(page, 'TST-KAIN')).toBe(1000)
    const movs = await readStore<{ materialCode: string }[]>(page, 'jkj_stock_movements')
    expect(movs.filter(m => m.materialCode === 'TST-KAIN')).toHaveLength(0)
  })
})

test.describe('Sales Order', () => {
  const so = {
    id: 'SO-E2E-001', poNumber: 'JGT0101146', customer: 'golftrend', product: 'IAN POULTER GT-205',
    quantity: 3000, unitPrice: 5, total: 15000, deliveryDate: '2026-01-16', status: 'APPROVED', progress: 0,
    priority: 'Normal', createdAt: '2026-01-10T00:00:00Z', createdBy: 'Sales Admin',
    notes: 'Periksa PO sebelum jalan produksi massal',
    lineItems: [{ id: 'l1', namaBarang: 'IAN POULTER GT-205', kodeBarang: 'GT-205', satuan: 'pce', qty: 3000, hargaSatuan: 5 }],
    bomItems: [{ id: 'b1', no: 1, namaMaterial: 'Sheep Skin', spesifikasi: '-', warna: 'P/White', konsumsi: 1, satuan: 'SF', penggunaan: 'Full body use', asalMaterial: 'Impor' }],
    history: [{ date: '2026-01-10', action: 'Created', user: 'Sales Admin', status: 'DRAFT' }],
  }

  test('revisi qty setelah APPROVED + cetak memuat BOM & keterangan', async ({ page }) => {
    await seedStore(page, { jkj_sales_orders: [so] })
    await page.goto('/sales/SO-E2E-001')
    await expect(page.getByText('APPROVED').first()).toBeVisible()

    // Revisi qty setelah approve
    await page.getByRole('button', { name: 'Edit Order' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText(/sudah disetujui/)).toBeVisible()
    await dialog.locator('input[type=number]').first().fill('2500')
    await dialog.getByRole('button', { name: 'Simpan Perubahan' }).click()
    await expect(page.getByText('Grand Total: 12.500')).toBeVisible()
    const orders = await readStore<{ quantity: number; total: number; lineItems: { qty: number }[]; history: { action: string }[] }[]>(page, 'jkj_sales_orders')
    expect(orders[0].quantity).toBe(2500)
    expect(orders[0].lineItems[0].qty).toBe(2500)
    expect(orders[0].total).toBe(12500)
    expect(orders[0].history.at(-1)?.action).toContain('Revisi')

    // Cetak: tabel item + main material + keterangan
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('button', { name: 'Cetak Order' }).click()])
    await popup.waitForLoadState()
    await expect(popup.getByText('MAIN MATERIAL', { exact: true })).toBeVisible()
    await expect(popup.getByText('Sheep Skin')).toBeVisible()
    await expect(popup.getByText('KETERANGAN')).toBeVisible()
    await expect(popup.getByText('Periksa PO sebelum jalan produksi massal')).toBeVisible()
    await expect(popup.getByText('2.500').first()).toBeVisible()
  })
})

test.describe('Work Order — validasi stok saat Mulai Produksi', () => {
  test('peringatan jika stok kurang; batal = tidak berubah, lanjut = IN PROGRESS', async ({ page }) => {
    await seedStore(page, { jkj_stock: [], jkj_stock_movements: [] })
    await page.goto('/production/wo/WO-2026-002')
    const start = page.getByRole('button', { name: 'Mulai Produksi' })
    await expect(start).toBeVisible()

    let message = ''
    page.once('dialog', d => { message = d.message(); void d.dismiss() })
    await start.click()
    await expect.poll(() => message).toContain('tidak mencukupi')
    await expect(start).toBeVisible() // status masih PLANNED

    page.once('dialog', d => { void d.accept() })
    await start.click()
    await expect(page.getByRole('button', { name: /Selesai → QC/ })).toBeVisible()
  })
})
