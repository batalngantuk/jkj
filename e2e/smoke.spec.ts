import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

// Kumpulkan semua route statis (tanpa segmen dinamis) dari folder app/
function collectRoutes(dir: string, base = ''): string[] {
  const out: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      if (entry.name === 'page.tsx') out.push(base || '/')
      continue
    }
    if (entry.name === 'api' || entry.name.startsWith('[') || entry.name.startsWith('_')) continue
    out.push(...collectRoutes(path.join(dir, entry.name), `${base}/${entry.name}`))
  }
  return out
}

const routes = collectRoutes(path.join(process.cwd(), 'app')).sort()

test.describe('smoke: semua halaman statis render tanpa error', () => {
  for (const route of routes) {
    test(route, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', e => errors.push(`pageerror: ${e.message}`))
      page.on('console', m => { if (m.type() === 'error') errors.push(`console: ${m.text()}`) })
      const res = await page.goto(route, { waitUntil: 'networkidle' })
      expect(res?.status(), `HTTP status ${route}`).toBeLessThan(400)
      await expect(page.locator('body')).not.toContainText(/Application error|This page couldn.t load/i)
      // Abaikan error resource eksternal (font/gambar) — yang dihitung hanya error aplikasi
      const appErrors = errors.filter(e => !/Failed to load resource|favicon|ERR_/i.test(e))
      expect(appErrors, appErrors.join('\n')).toEqual([])
    })
  }
})
