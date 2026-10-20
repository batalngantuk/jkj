import { test, expect, type Page } from '@playwright/test'
import { seedStore, readStore, stockItem } from './helpers'

// Alur utama: SO → WO → produksi → QC → terima BJ → kirim → PEB (submit+approve) → laporan KITE.
// Data uji unik (E2E) supaya tidak tercampur data seed.
const PRODUCT = 'E2E Glove'
const FG_CODE = 'E2E-GLOVE' // = productName.replace(/\s+/g, '-').toUpperCase() (kode FG di stok & Lap 4)
const SO_ID = 'SO-E2E-100'

type Stock = { materialCode: string; qtyOnHand: number; category: string }
type WO = { id: string; soNumber: string; status: string; quantity: number }
type SO = { id: string; status: string }

const so = {
  id: SO_ID, poNumber: 'PO-E2E-100', customer: 'E2E Buyer', product: PRODUCT,
  quantity: 100, unitPrice: 5, total: 500, deliveryDate: '2026-12-01', status: 'APPROVED', progress: 0,
  priority: 'Normal', createdAt: '2026-10-01T00:00:00Z', createdBy: 'Sales Admin',
  lineItems: [{ id: 'l1', namaBarang: PRODUCT, kodeBarang: FG_CODE, satuan: 'carton', qty: 100, hargaSatuan: 5 }],
  history: [{ date: '2026-10-01', action: 'Created', user: 'Sales Admin', status: 'APPROVED' }],
}

const stockOf = async (page: Page, code: string) =>
  (await readStore<Stock[]>(page, 'jkj_stock')).find(s => s.materialCode === code)?.qtyOnHand

async function pick(page: Page, trigger: ReturnType<Page['getByRole']>, option: string | RegExp) {
  await trigger.click()
  await page.getByRole('option', { name: option }).first().click()
}

test.describe.serial('Alur penuh SO → KITE', () => {
  let page: Page
  let woId = ''

  test.beforeAll(async ({ browser }) => {
    page = await (await browser.newContext()).newPage()
    await seedStore(page, {
      jkj_sales_orders: [so],
      jkj_stock: [stockItem('TST-LATEX', 'kg', 1000)],
      jkj_stock_movements: [],
    })
  })
  test.afterAll(async () => { await page.context().close() })

  test('1. buat WO dari SO (BOM manual)', async () => {
    await page.goto(`/production/wo/new?so=${SO_ID}`)
    await expect(page.getByRole('combobox').filter({ hasText: /^E2E Glove$/ })).toBeVisible()
    await expect(page.getByPlaceholder('e.g. 1000')).toHaveValue('100') // qty auto-fill dari SO
    await pick(page, page.getByRole('combobox').filter({ hasText: 'Pilih line produksi' }), /Line D/)
    await page.getByPlaceholder('Kode BB').fill('TST-LATEX')
    await page.getByPlaceholder('Nama Bahan Baku').fill('Tes Latex')
    await page.getByPlaceholder('Qty/unit').fill('2')
    await page.getByRole('button', { name: 'Buat Work Order' }).click()
    await page.waitForURL('**/production/wo')

    const wos = await readStore<WO[]>(page, 'jkj_work_orders')
    const wo = wos.find(w => w.soNumber === SO_ID)
    expect(wo, 'WO tersimpan dengan ref SO').toBeTruthy()
    expect(wo!.status).toBe('PLANNED')
    expect(wo!.quantity).toBe(100)
    woId = wo!.id
  })

  test('2. produksi: mulai (stok BB turun) → QC → selesai (SO READY TO SHIP)', async () => {
    await page.goto(`/production/wo/${woId}`)
    page.once('dialog', d => { throw new Error(`Tidak boleh ada peringatan stok: ${d.message()}`) })
    await page.getByRole('button', { name: 'Mulai Produksi' }).click()
    await expect(page.getByRole('button', { name: /Selesai → QC/ })).toBeVisible()
    expect(await stockOf(page, 'TST-LATEX')).toBe(800) // 2 kg/unit × 100

    await page.getByRole('button', { name: /Selesai → QC/ }).click()
    await page.getByRole('button', { name: /QC Lulus → Selesai/ }).click()
    await expect(page.getByRole('link', { name: /Input BJ ke Gudang/ }).first()).toBeVisible()

    const orders = await readStore<SO[]>(page, 'jkj_sales_orders')
    expect(orders.find(o => o.id === SO_ID)?.status).toBe('READY TO SHIP')
  })

  test('3. terima BJ ke gudang (stok FG + progress SO)', async () => {
    await page.goto('/warehouse/outbound')
    const row = page.getByRole('row').filter({ hasText: woId })
    await row.getByRole('button', { name: /Terima ke Gudang/ }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('Masukkan qty penerimaan ini').fill('100')
    await dialog.getByPlaceholder('Nama petugas gudang').fill('Checker E2E')
    await dialog.getByRole('button', { name: 'Simpan Penerimaan BJ' }).click()
    await expect(dialog).toBeHidden()

    expect(await stockOf(page, FG_CODE)).toBe(100)
    const receipts = await readStore<{ woId: string; qtyReceived: number }[]>(page, 'jkj_fg_receipts')
    expect(receipts.filter(r => r.woId === woId).reduce((s, r) => s + r.qtyReceived, 0)).toBe(100)

    // WO yang sudah diterima penuh hilang dari antrian
    await page.reload()
    await expect(page.getByRole('row').filter({ hasText: woId })).toHaveCount(0)
  })

  test('4. kirim ke customer (validasi qty > stok BJ ditolak)', async () => {
    await page.goto('/warehouse/outbound')
    await page.getByRole('tab', { name: /Kirim ke Customer/ }).click()
    await page.getByRole('row').filter({ hasText: SO_ID }).getByRole('button', { name: /Proses Kirim/ }).click()
    const dialog = page.getByRole('dialog')
    const qty = dialog.locator('input[type=number]').first()
    const dispatch = dialog.getByRole('button', { name: /Dispatch Pengiriman/ })

    await qty.fill('150')
    await expect(dispatch).toBeDisabled() // melebihi stok BJ (100)
    await qty.fill('100')
    await expect(dispatch).toBeEnabled()
    await dialog.getByPlaceholder('SJ-OUT-2026-xxx').fill('SJ-E2E-1')
    await dispatch.click()

    const ships = await readStore<{ soId: string; items: { qtyDikirim: number }[] }[]>(page, 'jkj_shipments')
    expect(ships.find(s => s.soId === SO_ID)?.items[0].qtyDikirim).toBe(100)
    // Barang jadi keluar dari gudang saat dispatch
    expect(await stockOf(page, FG_CODE)).toBe(0)
    const movs = await readStore<{ materialCode: string; transactionType: string; quantityOut: number }[]>(page, 'jkj_stock_movements')
    expect(movs.find(m => m.materialCode === FG_CODE && m.transactionType === 'EXPORT')?.quantityOut).toBe(100)
  })

  test('5. PEB: submit → approve', async () => {
    await page.goto('/logistics/peb/new')
    await pick(page, page.getByRole('combobox').filter({ hasText: 'Pilih customer' }), 'E2E Buyer')
    await pick(page, page.getByRole('combobox').filter({ hasText: 'Select country' }), 'Japan')
    await page.locator('#destinationPort').fill('Port of Yokohama')
    await page.locator('#exportDate').fill('2026-11-15')
    await page.locator('#estimatedDeparture').fill('2026-11-16')
    await page.getByRole('button', { name: 'Add Item' }).click()
    await page.locator('#pebNumber').fill('PEB-E2E-001') // nomor resmi dari user harus dipakai
    await page.getByPlaceholder('FG-001').fill(FG_CODE)
    // kode cocok stok FG → nama terisi otomatis
    await expect(page.getByPlaceholder('Steel Coil Grade A')).toHaveValue(PRODUCT)
    await page.getByText('Quantity', { exact: true }).locator('xpath=following::input[1]').fill('100')
    await page.getByText(/^Unit Price/).locator('xpath=following::input[1]').fill('5')
    await page.getByRole('button', { name: 'Create PEB' }).click()
    await page.waitForURL('**/logistics/peb')

    const pebs = await readStore<{ id: string; status: string; customerName: string; items: { quantity: number; materialCode: string }[] }[]>(page, 'jkj_peb')
    const peb = pebs.find(p => p.customerName === 'E2E Buyer')
    expect(peb, 'PEB tersimpan').toBeTruthy()
    expect(peb!.status).toBe('SUBMITTED')
    expect((peb as unknown as { pebNumber: string }).pebNumber).toBe('PEB-E2E-001')
    expect(peb!.items[0]).toMatchObject({ quantity: 100, materialCode: FG_CODE })

    // PEB baru berstatus SUBMITTED belum masuk Lap 5 (hanya setelah Approved)
    await page.goto('/reports/kite-inventory')
    await page.getByRole('tab', { name: /5\. Pengeluaran HP/ }).click()
    await expect(page.getByRole('row').filter({ hasText: 'PEB-E2E-001' })).toHaveCount(0)

    await page.goto(`/logistics/peb/${peb!.id}`)
    await page.getByRole('button', { name: 'Approve' }).click()
    await expect(page.getByRole('button', { name: 'Approve' })).toBeHidden()
    const after = (await readStore<{ id: string; status: string; approvedAt?: string }[]>(page, 'jkj_peb')).find(p => p.id === peb!.id)
    expect(after?.status).toBe('APPROVED')
    expect(after?.approvedAt, 'tanggal approve tersimpan').toBeTruthy()
  })

  test('6. laporan KITE: Lap 2, 4, 5, 7 konsisten dengan transaksi', async () => {
    await page.goto('/reports/kite-inventory')

    await page.getByRole('tab', { name: /2\. Pemakaian BB/ }).click()
    await expect(page.getByRole('row').filter({ hasText: 'TST-LATEX' })).toContainText('200')

    await page.getByRole('tab', { name: /4\. Pemasukan HP/ }).click()
    await expect(page.getByRole('row').filter({ hasText: woId })).toContainText('100')

    await page.getByRole('tab', { name: /5\. Pengeluaran HP/ }).click()
    const lap5 = page.getByRole('row').filter({ hasText: 'E2E Buyer' })
    await expect(lap5).toContainText('100')
    await expect(lap5).toContainText('PEB-E2E-001')

    // Filter tanggal berfungsi: periode di masa depan menyembunyikan baris, periode lebar menampilkannya
    await page.getByText('Tanggal Dari').locator('xpath=following::input[1]').fill('2098-01-01')
    await expect(lap5).toHaveCount(0)
    await page.getByText('Tanggal Dari').locator('xpath=following::input[1]').fill('2026-01-01')
    await expect(lap5).toHaveCount(1)

    // Lap 7: satu baris per kode, saldo = pemasukan − pengeluaran = 0
    await page.getByRole('tab', { name: /7\. Mutasi HP/ }).click()
    const rows = page.getByRole('row').filter({ hasText: FG_CODE })
    await expect(rows).toHaveCount(1)
    const cells = await rows.first().getByRole('cell').allTextContents()
    // kolom: No | Kode | Nama | Satuan | Saldo Awal | Pemasukan | Pengeluaran | Saldo Akhir | Gudang
    expect(cells.slice(4, 8).map(c => c.trim())).toEqual(['0', '+100', '-100', '0'])
  })

  test('7. stok FG tetap 0 setelah PEB approved (tidak keluar dua kali)', async () => {
    await page.goto('/warehouse')
    expect(await stockOf(page, FG_CODE)).toBe(0)
  })
})
