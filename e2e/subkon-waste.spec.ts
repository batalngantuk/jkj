import { test, expect, type Page } from '@playwright/test'
import { seedStore, readStore, stockItem } from './helpers'

type Stock = { materialCode: string; qtyOnHand: number }
type Subkon = { id: string; namaSubkon: string; status: string; subkKiteKirimNo: string; subkKiteTerimaNo: string }
type Waste = { id: string; woNumber: string; status: string; bc24No: string; bc24Tgl: string; wasteQty: number; tglVerifikasi: string }

const stockOf = async (page: Page, code: string) =>
  (await readStore<Stock[]>(page, 'jkj_stock')).find(s => s.materialCode === code)?.qtyOnHand

async function createJob(page: Page, cmt: string, qtyBB: string) {
  await page.getByRole('button', { name: /Buat Job/ }).first().click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('combobox').first().click()
  await page.getByRole('option', { name: /Input nama baru/ }).click()
  await dialog.getByPlaceholder('Ketik nama subkontraktor / CMT baru').fill(cmt)
  await dialog.locator('input[type=date]').first().fill('2026-12-31')
  await dialog.getByPlaceholder('Jelaskan pekerjaan yang akan disubkonkan...').fill('Jahit sarung tangan')
  await dialog.getByPlaceholder('BB-001').fill('TST-SUBK')
  await dialog.getByPlaceholder('Nama bahan baku').fill('Kain Uji Subkon')
  await dialog.getByPlaceholder('Nama bahan baku').locator('xpath=following::input[1]').fill(qtyBB)
  await dialog.getByRole('button', { name: 'Simpan sebagai Draft' }).click()
  await expect(dialog).toBeHidden()
}

test.describe.serial('Subkontrak (CMT) → KITE', () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    page = await (await browser.newContext()).newPage()
    await seedStore(page, {
      jkj_stock: [stockItem('TST-SUBK', 'KG', 200)],
      jkj_stock_movements: [],
      jkj_subkontrak: [],
      jkj_fg_receipts: [],
    })
  })
  test.afterAll(async () => { await page.context().close() })

  test('1. buat job → Draft', async () => {
    await page.goto('/production/subkontrak')
    await createJob(page, 'CMT E2E', '50')
    const rec = (await readStore<Subkon[]>(page, 'jkj_subkontrak')).find(r => r.namaSubkon === 'CMT E2E')
    expect(rec?.status).toBe('Draft')
    await expect(page.getByRole('row').filter({ hasText: 'CMT E2E' })).toBeVisible()
  })

  test('2. kirim BB: stok turun, status BB Dikirim; stok kurang → konfirmasi', async () => {
    // Job kedua dengan qty melebihi stok → peringatan, batal = tetap Draft
    await createJob(page, 'CMT E2E Besar', '500')
    await page.getByRole('row').filter({ hasText: 'CMT E2E Besar' }).click()
    await page.getByRole('button', { name: 'Kirim BB ke Subkon' }).click()
    let message = ''
    page.once('dialog', d => { message = d.message(); void d.dismiss() })
    await page.getByRole('button', { name: 'Konfirmasi Kirim BB' }).click()
    await expect.poll(() => message).toContain('tidak mencukupi')
    expect((await readStore<Subkon[]>(page, 'jkj_subkontrak')).find(r => r.namaSubkon === 'CMT E2E Besar')?.status).toBe('Draft')
    expect(await stockOf(page, 'TST-SUBK')).toBe(200)
    await page.getByRole('button', { name: 'Batal' }).click()
    await page.keyboard.press('Escape')

    // Job normal
    await page.goto('/production/subkontrak')
    await page.getByRole('row').filter({ hasText: /CMT E2E(?! Besar)/ }).click()
    await page.getByRole('button', { name: 'Kirim BB ke Subkon' }).click()
    await page.getByRole('button', { name: 'Konfirmasi Kirim BB' }).click()
    await expect(page.getByRole('dialog')).toBeHidden()
    expect(await stockOf(page, 'TST-SUBK')).toBe(150)
    const rec = (await readStore<Subkon[]>(page, 'jkj_subkontrak')).find(r => r.namaSubkon === 'CMT E2E')!
    expect(rec.status).toBe('BB Dikirim')
    expect(rec.subkKiteKirimNo).toMatch(/^SUBK-1\.1-/)
  })

  test('3. terima hasil parsial → Dalam Proses; terima akhir → Hasil Diterima; selesai', async () => {
    const terima = async (qty: string, final: boolean, label: RegExp) => {
      await page.goto('/production/subkontrak')
      await page.getByRole('row').filter({ hasText: /CMT E2E(?! Besar)/ }).click()
      await page.getByRole('button', { name: label }).click()
      const dialog = page.getByRole('dialog')
      const nama = dialog.getByPlaceholder('Misal: Sarung Tangan XL Green')
      await nama.fill('Glove CMT E2E')
      await nama.locator('xpath=following::input[1]').fill(qty)
      if (final) await dialog.getByRole('checkbox').check()
      await dialog.getByRole('button', { name: final ? 'Terima & Tutup Job' : 'Terima Parsial' }).click()
      await expect(dialog).toBeHidden()
    }
    await terima('30', false, /Terima Hasil dari CMT/)
    let rec = (await readStore<Subkon[]>(page, 'jkj_subkontrak')).find(r => r.namaSubkon === 'CMT E2E')!
    expect(rec.status).toBe('Dalam Proses')
    expect(await stockOf(page, 'GLOVE-CMT-E2E')).toBe(30)

    await terima('20', true, /Terima Hasil dari CMT/)
    rec = (await readStore<Subkon[]>(page, 'jkj_subkontrak')).find(r => r.namaSubkon === 'CMT E2E')!
    expect(rec.status).toBe('Hasil Diterima')
    expect(await stockOf(page, 'GLOVE-CMT-E2E')).toBe(50)

    await page.goto('/production/subkontrak')
    await page.getByRole('row').filter({ hasText: /CMT E2E(?! Besar)/ }).click()
    await page.getByRole('button', { name: 'Selesaikan Job' }).click()
    rec = (await readStore<Subkon[]>(page, 'jkj_subkontrak')).find(r => r.namaSubkon === 'CMT E2E')!
    expect(rec.status).toBe('Selesai')
  })

  test('4. laporan KITE: Lap 2 & 3 (BB ke subkon), Lap 4 (BJ dari subkon)', async () => {
    await page.goto('/reports/kite-inventory')
    await page.getByRole('tab', { name: /2\. Pemakaian BB/ }).click()
    const lap2 = page.getByRole('row').filter({ hasText: 'TST-SUBK' })
    await expect(lap2).toContainText('CMT E2E')
    await expect(lap2).toContainText('50')

    await page.getByRole('tab', { name: /3\. BB Subkontrak/ }).click()
    const lap3 = page.getByRole('row').filter({ hasText: 'TST-SUBK' })
    await expect(lap3).toContainText('CMT E2E')
    await expect(lap3).toContainText('50')

    await page.getByRole('tab', { name: /4\. Pemasukan HP/ }).click()
    await expect(page.getByRole('row').filter({ hasText: 'Glove CMT E2E' })).toHaveCount(2) // dua penerimaan (parsial + akhir)
  })
})

test.describe('Waste/Scrap (BC 2.4) → KITE Lap 8', () => {
  test('draft → ajukan → verifikasi → selesai, lalu muncul di Lap 8', async ({ page }) => {
    await page.goto('/warehouse/waste')
    const before = await readStore<Waste[]>(page, 'jkj_waste') // null bila belum ada perubahan (pakai seed)
    await page.getByRole('button', { name: 'Ajukan Waste Baru' }).first().click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('combobox').first().click()
    await page.getByRole('option', { name: /WO-2026-006/ }).click()
    await dialog.getByPlaceholder(/Maks\./).fill('57200') // masuk 60.000 → waste 2.800
    await dialog.getByRole('combobox').filter({ hasText: 'Pilih disposisi...' }).click()
    await page.getByRole('option', { name: 'Dimusnahkan' }).click()
    await dialog.getByRole('button', { name: 'Simpan sebagai Draft' }).click()
    await expect(dialog).toBeHidden()

    const all = await readStore<Waste[]>(page, 'jkj_waste')
    const rec = all.find(w => w.wasteQty === 2800 && w.status === 'Draft' && !(before || []).some(b => b.id === w.id))
    expect(rec, 'waste baru tersimpan sebagai Draft').toBeTruthy()

    const open = async () => { await page.getByRole('row').filter({ hasText: rec!.id }).click() }
    await open()
    await page.getByRole('button', { name: 'Ajukan BC 2.4' }).click()
    let cur = (await readStore<Waste[]>(page, 'jkj_waste')).find(w => w.id === rec!.id)!
    expect(cur.status).toBe('Diajukan BC 2.4')
    expect(cur.bc24No).not.toBe('-')

    await page.getByRole('button', { name: 'Tandai Diverifikasi BC' }).click()
    cur = (await readStore<Waste[]>(page, 'jkj_waste')).find(w => w.id === rec!.id)!
    expect(cur.status).toBe('Diverifikasi BC')
    expect(cur.tglVerifikasi).not.toBe('-')

    await page.getByRole('button', { name: 'Konfirmasi Selesai' }).click()
    cur = (await readStore<Waste[]>(page, 'jkj_waste')).find(w => w.id === rec!.id)!
    expect(cur.status).toBe('Selesai')

    // Muncul di KITE Lap 8 dengan nomor BC 2.4 yang dihasilkan
    await page.goto('/reports/kite-inventory')
    await page.getByRole('tab', { name: /8\. Waste\/Scrap/ }).click()
    await expect(page.getByRole('row').filter({ hasText: cur.bc24No })).toContainText('2.800')
  })
})
