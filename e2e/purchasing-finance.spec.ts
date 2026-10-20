import { test, expect, type Page } from '@playwright/test'
import { seedStore, readStore } from './helpers'

type Stock = { materialCode: string; qtyOnHand: number }
type PO = { id: string; poNumber?: string; status: string; supplier: string; items: { code: string; quantity: number }[] }
type AP = { id: string; vendorInvoiceNumber: string; totalAmount: number; paidAmount: number; balance: number; status: string }

const stockOf = async (page: Page, code: string) =>
  (await readStore<Stock[]>(page, 'jkj_stock'))?.find(s => s.materialCode === code)?.qtyOnHand

test.describe.serial('Pembelian → Penerimaan → AP', () => {
  let page: Page
  let poId = ''
  const CODE = 'TST-PO-1'

  test.beforeAll(async ({ browser }) => {
    page = await (await browser.newContext()).newPage()
    await seedStore(page, { jkj_stock: [], jkj_stock_movements: [] })
  })
  test.afterAll(async () => { await page.context().close() })

  test('1. buat PO lokal', async () => {
    await page.goto('/purchasing/po/create')
    await page.getByRole('combobox').filter({ hasText: 'Pilih Supplier' }).click()
    await page.getByRole('option').first().click()
    await page.getByPlaceholder('RM-001').fill(CODE)
    await page.getByPlaceholder('Nama barang').fill('Bahan Uji PO')
    await page.getByRole('combobox').filter({ hasText: 'Satuan' }).click()
    await page.getByRole('option', { name: 'kg', exact: true }).click()
    const row = page.getByRole('row').filter({ has: page.getByPlaceholder('Nama barang') })
    await row.locator('input[type=number]').nth(0).fill('100')
    await row.locator('input[type=number]').nth(1).fill('10000')
    await page.getByRole('button', { name: /Submit untuk Persetujuan/ }).click()
    await page.waitForURL('**/purchasing/po')

    const pos = await readStore<PO[]>(page, 'jkj_purchase_orders')
    const po = pos.find(p => p.items.some(i => i.code === CODE))
    expect(po, 'PO tersimpan').toBeTruthy()
    expect(po!.items[0].quantity).toBe(100)
    poId = po!.id
  })

  test('2. terima parsial 60 → PARTIAL, lalu sisa 40 → RECEIVED, stok 100', async () => {
    await page.goto('/warehouse/inbound')
    await page.getByRole('tab', { name: /Antrian PO/ }).click()
    await page.getByRole('row').filter({ hasText: poId }).getByRole('button', { name: /Terima/ }).click()
    let dialog = page.getByRole('dialog')
    const qty = dialog.locator('input[type=number]').first()
    await qty.fill('60')
    await dialog.getByRole('button', { name: 'Konfirmasi Penerimaan' }).click()
    await expect(dialog).toBeHidden()
    expect(await stockOf(page, CODE)).toBe(60)
    expect((await readStore<PO[]>(page, 'jkj_purchase_orders')).find(p => p.id === poId)?.status).toBe('PARTIAL')

    // Penerimaan kedua: default = sisa (40), PO masih di antrian
    await page.reload()
    await page.getByRole('tab', { name: /Antrian PO/ }).click()
    await page.getByRole('row').filter({ hasText: poId }).getByRole('button', { name: /Terima/ }).click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByText('Sudah Diterima')).toBeVisible()
    await expect(dialog.locator('input[type=number]').first()).toHaveValue('40')
    await dialog.getByRole('button', { name: 'Konfirmasi Penerimaan' }).click()
    await expect(dialog).toBeHidden()
    expect(await stockOf(page, CODE)).toBe(100)
    expect((await readStore<PO[]>(page, 'jkj_purchase_orders')).find(p => p.id === poId)?.status).toBe('RECEIVED')

    // PO sudah lengkap → hilang dari antrian
    await page.reload()
    await page.getByRole('tab', { name: /Antrian PO/ }).click()
    await expect(page.getByRole('row').filter({ hasText: poId })).toHaveCount(0)
  })

  test('3. penerimaan melebihi sisa PO menampilkan peringatan (kebijakan: peringatan, bukan blokir)', async () => {
    // PO baru lewat seed store agar test independen dari form
    await page.evaluate((id) => {
      const pos = JSON.parse(localStorage.getItem('jkj_purchase_orders') || '[]')
      pos.unshift({ ...pos.find((p: { id: string }) => p.id === id), id: 'PO-E2E-OVER', poNumber: 'PO-E2E-OVER', status: 'APPROVED', items: [{ code: 'TST-OVER', name: 'Over', quantity: 10, unit: 'kg', unitPrice: 1, total: 10 }] })
      localStorage.setItem('jkj_purchase_orders', JSON.stringify(pos))
    }, poId)
    await page.goto('/warehouse/inbound')
    await page.getByRole('tab', { name: /Antrian PO/ }).click()
    await page.getByRole('row').filter({ hasText: 'PO-E2E-OVER' }).getByRole('button', { name: /Terima/ }).click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('input[type=number]').first().fill('50')
    await expect(dialog.getByText(/Melebihi sisa/)).toBeVisible()
    // Keputusan klien (Agustus): hanya peringatan; tombol tetap aktif. Ubah ke toBeDisabled bila kebijakan jadi blokir.
    await expect(dialog.getByRole('button', { name: 'Konfirmasi Penerimaan' })).toBeEnabled()
  })

  test('4. buat tagihan AP lalu bayar sebagian dan lunas', async () => {
    await page.goto('/finance/ap/new')
    await page.getByRole('combobox').filter({ hasText: 'Select Purchase Order' }).click()
    await page.getByRole('option', { name: new RegExp(poId) }).click()
    await page.getByPlaceholder('VND-INV-XXXX').fill('VND-E2E-001')
    await page.getByPlaceholder('Item description').fill('Bahan Uji PO')
    const row = page.getByRole('row').filter({ has: page.getByPlaceholder('Item description') })
    await row.locator('input[type=number]').nth(0).fill('100')
    await row.locator('input[type=number]').nth(1).fill('10000')
    await page.getByRole('button', { name: 'Save as Draft' }).click()
    await page.waitForURL('**/finance/ap')

    const bill = (await readStore<AP[]>(page, 'jkj_ap_invoices_v2')).find(b => b.vendorInvoiceNumber === 'VND-E2E-001')
    expect(bill, 'tagihan tersimpan').toBeTruthy()
    expect(bill!.totalAmount).toBe(1110000) // 1.000.000 + PPN 11%
    expect(bill!.balance).toBe(1110000)

    // Bayar sebagian
    const pay = async (nominal: string) => {
      await page.getByRole('row').filter({ hasText: 'VND-E2E-001' }).getByRole('button', { name: 'Bayar' }).click()
      const dialog = page.getByRole('dialog')
      await dialog.getByPlaceholder('0', { exact: true }).fill(nominal)
      await dialog.getByRole('button', { name: 'Simpan Pembayaran' }).click()
      await expect(dialog).toBeHidden()
    }
    await pay('500000')
    let after = (await readStore<AP[]>(page, 'jkj_ap_invoices_v2')).find(b => b.vendorInvoiceNumber === 'VND-E2E-001')!
    expect(after).toMatchObject({ paidAmount: 500000, balance: 610000, status: 'SCHEDULED' })

    // Lunasi sisa
    await pay('610000')
    after = (await readStore<AP[]>(page, 'jkj_ap_invoices_v2')).find(b => b.vendorInvoiceNumber === 'VND-E2E-001')!
    expect(after).toMatchObject({ paidAmount: 1110000, balance: 0, status: 'PAID' })
    await expect(page.getByRole('row').filter({ hasText: 'VND-E2E-001' }).getByRole('button', { name: 'Bayar' })).toHaveCount(0)
  })

  test('5. saldo desimal (USD × kurs) tidak membengkak 100× saat dibayar penuh', async () => {
    // Regresi: nominal dulu di-strip ke digit saja ("1937.5" → 19375)
    await page.evaluate(() => {
      const list = JSON.parse(localStorage.getItem('jkj_ap_invoices_v2') || '[]')
      list.unshift({
        id: 'ap-e2e-dec', invoiceNumber: 'BILL-E2E-DEC', vendorInvoiceNumber: 'VND-E2E-DEC', poId: 'x', poNumber: 'PO-X',
        vendorId: 'x', vendorName: 'Vendor Desimal', invoiceDate: '2026-10-01', dueDate: '2026-11-01',
        totalAmount: 1937.5, taxAmount: 0, paidAmount: 0, balance: 1937.5, invoiceType: 'Loc', status: 'APPROVED',
        currency: 'IDR', lineItems: [], paymentIds: [],
      })
      localStorage.setItem('jkj_ap_invoices_v2', JSON.stringify(list))
    })
    await page.goto('/finance/ap')
    await page.getByRole('row').filter({ hasText: 'VND-E2E-DEC' }).getByRole('button', { name: 'Bayar' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByPlaceholder('0', { exact: true })).toHaveValue('1937.5')
    await dialog.getByRole('button', { name: 'Simpan Pembayaran' }).click()
    await expect(dialog).toBeHidden()
    const inv = (await readStore<AP[]>(page, 'jkj_ap_invoices_v2')).find(b => b.id === 'ap-e2e-dec')!
    expect(inv).toMatchObject({ paidAmount: 1937.5, balance: 0, status: 'PAID' })
  })
})

test.describe('AR — pembayaran piutang', () => {
  test('saldo desimal dibayar penuh → PAID; sebagian → PARTIALLY_PAID', async ({ page }) => {
    await seedStore(page, {
      jkj_ar_invoices_v2: [{
        id: 'ar-e2e', invoiceNumber: 'INV-E2E-1', customerId: 'c1', customerName: 'Cust E2E', soId: 's', soNumber: 'SO-X',
        invoiceDate: '2026-10-01', dueDate: '2026-11-01', totalAmount: 2500.75, taxAmount: 0, paidAmount: 0, balance: 2500.75,
        status: 'SENT', currency: 'IDR', lineItems: [], paymentIds: [],
      }],
    })
    await page.goto('/finance/ar')
    const open = () => page.getByRole('row').filter({ hasText: 'INV-E2E-1' }).getByRole('button', { name: /Terima|Bayar/ }).first()
    await open().click()
    let dialog = page.getByRole('dialog')
    await dialog.getByPlaceholder('0', { exact: true }).fill('1000')
    await dialog.getByRole('button', { name: /Simpan/ }).click()
    await expect(dialog).toBeHidden()
    let inv = (await readStore<{ id: string; paidAmount: number; balance: number; status: string }[]>(page, 'jkj_ar_invoices_v2'))[0]
    expect(inv).toMatchObject({ paidAmount: 1000, balance: 1500.75, status: 'PARTIALLY_PAID' })

    await open().click()
    dialog = page.getByRole('dialog')
    await expect(dialog.getByPlaceholder('0', { exact: true })).toHaveValue('1500.75')
    await dialog.getByRole('button', { name: /Simpan/ }).click()
    await expect(dialog).toBeHidden()
    inv = (await readStore<{ id: string; paidAmount: number; balance: number; status: string }[]>(page, 'jkj_ar_invoices_v2'))[0]
    expect(inv).toMatchObject({ paidAmount: 2500.75, balance: 0, status: 'PAID' })
  })
})
