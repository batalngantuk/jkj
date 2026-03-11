/**
 * Tax Asset Management Service
 *
 * BC 2.0 Regular Import - Tax Assets (PPN Import & PPh 22)
 *
 * IMPORTANT CONCEPT:
 * - PPN Import and PPh 22 are PREPAID TAXES (Tax Assets)
 * - They are NOT expenses and NOT part of inventory cost
 * - They can be credited against future tax liabilities
 *
 * PPN Import (11%):
 * - Calculated on Nilai Impor (CIF + Bea Masuk)
 * - Can be credited against PPN Keluaran (output VAT)
 * - Monthly reconciliation in SPT Masa PPN
 *
 * PPh 22 Import (2.5% for API, 7.5% non-API, 10% no NPWP):
 * - Calculated on Nilai Impor (CIF + Bea Masuk)
 * - Can be credited against annual income tax
 * - Tracked in SPT Tahunan PPh Badan
 */

export interface TaxAssetData {
  // Source Document
  bc20Id: string
  bc20Number: string
  grId?: string
  grNumber?: string

  // Tax Type
  type: 'PPN_IMPORT' | 'PPH22_IMPORT'

  // Amounts
  amount: number
  amountUsed: number
  amountRemaining: number

  // PPN Specific
  period?: string // 'YYYY-MM' for monthly reconciliation
  creditedAgainstOutput?: number // PPN Keluaran offset

  // PPh 22 Specific
  fiscalYear?: number
  creditedAgainstIncomeTax?: number

  // Status
  status: 'AVAILABLE' | 'PARTIALLY_USED' | 'FULLY_USED' | 'EXPIRED'

  // Dates
  recordedDate: Date
  availableFrom: Date
  expiryDate?: Date // PPN credit may expire (currently no expiry in Indonesia)

  // Reference
  importerNpwp?: string
  customsOffice?: string
  sppbNumber?: string
}

/**
 * Create tax asset records for BC 2.0 import
 *
 * This should be called when goods receipt is completed
 *
 * @param bc20Id - BC 2.0 document ID
 * @param bc20Number - BC 2.0 document number
 * @param ppnAmount - PPN Import amount
 * @param pph22Amount - PPh 22 amount
 * @param grId - Goods receipt ID (optional)
 * @param recordedBy - User who recorded the tax assets
 * @returns Created tax asset records
 */
export function prepareTaxAssetRecords(
  bc20Id: string,
  bc20Number: string,
  ppnAmount: number,
  pph22Amount: number,
  grId?: string,
  grNumber?: string
): Omit<TaxAssetData, 'id' | 'createdAt' | 'updatedAt'>[] {
  const now = new Date()
  const currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const fiscalYear = now.getFullYear()

  const taxAssets: Omit<TaxAssetData, 'id' | 'createdAt' | 'updatedAt'>[] = []

  // 1. PPN Import Tax Asset
  if (ppnAmount > 0) {
    taxAssets.push({
      bc20Id,
      bc20Number,
      grId,
      grNumber,
      type: 'PPN_IMPORT',
      amount: ppnAmount,
      amountUsed: 0,
      amountRemaining: ppnAmount,
      period: currentPeriod,
      creditedAgainstOutput: 0,
      status: 'AVAILABLE',
      recordedDate: now,
      availableFrom: now,
      // No expiry date for PPN credit in Indonesia (can be carried forward indefinitely)
      expiryDate: undefined,
    })
  }

  // 2. PPh 22 Import Tax Asset
  if (pph22Amount > 0) {
    taxAssets.push({
      bc20Id,
      bc20Number,
      grId,
      grNumber,
      type: 'PPH22_IMPORT',
      amount: pph22Amount,
      amountUsed: 0,
      amountRemaining: pph22Amount,
      fiscalYear,
      creditedAgainstIncomeTax: 0,
      status: 'AVAILABLE',
      recordedDate: now,
      availableFrom: now,
      // PPh 22 credit is for the fiscal year
      expiryDate: new Date(fiscalYear, 11, 31), // Dec 31 of fiscal year
    })
  }

  return taxAssets
}

/**
 * Calculate monthly PPN reconciliation
 *
 * @param period - Period in format 'YYYY-MM'
 * @param ppnMasukanImport - PPN Input from imports
 * @param ppnMasukanDomestic - PPN Input from domestic purchases
 * @param ppnKeluaran - PPN Output from sales
 * @returns PPN reconciliation result
 */
export function calculatePPNReconciliation(
  period: string,
  ppnMasukanImport: number,
  ppnMasukanDomestic: number,
  ppnKeluaran: number
) {
  // Total PPN Input (Credits)
  const totalPPNMasukan = ppnMasukanImport + ppnMasukanDomestic

  // Net PPN Position
  const netPPN = ppnKeluaran - totalPPNMasukan

  // Determine status
  let status: 'PAYABLE' | 'CREDITABLE' | 'BALANCED'
  let amountPayable = 0
  let amountCarryForward = 0

  if (netPPN > 0) {
    // PPN Keluaran > PPN Masukan → Must pay to tax office
    status = 'PAYABLE'
    amountPayable = netPPN
  } else if (netPPN < 0) {
    // PPN Keluaran < PPN Masukan → Credit, carry forward to next month
    status = 'CREDITABLE'
    amountCarryForward = Math.abs(netPPN)
  } else {
    // Exactly balanced
    status = 'BALANCED'
  }

  return {
    period,
    ppnMasukan: {
      ppnImport: ppnMasukanImport,
      ppnDomestic: ppnMasukanDomestic,
      total: totalPPNMasukan,
    },
    ppnKeluaran: {
      total: ppnKeluaran,
    },
    netPPN,
    status,
    amountPayable,
    amountCarryForward,
  }
}

/**
 * Use tax asset to offset tax liability
 *
 * @param taxAsset - Tax asset to use
 * @param amountToUse - Amount to use from the tax asset
 * @returns Updated tax asset
 */
export function useTaxAsset(
  taxAsset: TaxAssetData,
  amountToUse: number
): TaxAssetData {
  if (amountToUse > taxAsset.amountRemaining) {
    throw new Error('Amount to use exceeds remaining tax asset')
  }

  const newAmountUsed = taxAsset.amountUsed + amountToUse
  const newAmountRemaining = taxAsset.amountRemaining - amountToUse

  let newStatus: TaxAssetData['status'] = 'AVAILABLE'
  if (newAmountRemaining === 0) {
    newStatus = 'FULLY_USED'
  } else if (newAmountUsed > 0) {
    newStatus = 'PARTIALLY_USED'
  }

  return {
    ...taxAsset,
    amountUsed: newAmountUsed,
    amountRemaining: newAmountRemaining,
    status: newStatus,
    creditedAgainstOutput:
      taxAsset.type === 'PPN_IMPORT'
        ? (taxAsset.creditedAgainstOutput || 0) + amountToUse
        : taxAsset.creditedAgainstOutput,
    creditedAgainstIncomeTax:
      taxAsset.type === 'PPH22_IMPORT'
        ? (taxAsset.creditedAgainstIncomeTax || 0) + amountToUse
        : taxAsset.creditedAgainstIncomeTax,
  }
}

/**
 * Get tax asset summary
 *
 * @param taxAssets - Array of tax assets
 * @returns Summary of tax assets
 */
export function getTaxAssetSummary(taxAssets: TaxAssetData[]) {
  const ppnAssets = taxAssets.filter((ta) => ta.type === 'PPN_IMPORT')
  const pph22Assets = taxAssets.filter((ta) => ta.type === 'PPH22_IMPORT')

  const ppnTotal = ppnAssets.reduce((sum, ta) => sum + ta.amount, 0)
  const ppnUsed = ppnAssets.reduce((sum, ta) => sum + ta.amountUsed, 0)
  const ppnRemaining = ppnAssets.reduce((sum, ta) => sum + ta.amountRemaining, 0)

  const pph22Total = pph22Assets.reduce((sum, ta) => sum + ta.amount, 0)
  const pph22Used = pph22Assets.reduce((sum, ta) => sum + ta.amountUsed, 0)
  const pph22Remaining = pph22Assets.reduce((sum, ta) => sum + ta.amountRemaining, 0)

  return {
    ppn: {
      total: ppnTotal,
      used: ppnUsed,
      remaining: ppnRemaining,
      utilizationRate: ppnTotal > 0 ? (ppnUsed / ppnTotal) * 100 : 0,
      count: ppnAssets.length,
    },
    pph22: {
      total: pph22Total,
      used: pph22Used,
      remaining: pph22Remaining,
      utilizationRate: pph22Total > 0 ? (pph22Used / pph22Total) * 100 : 0,
      count: pph22Assets.length,
    },
    totalAssets: {
      total: ppnTotal + pph22Total,
      used: ppnUsed + pph22Used,
      remaining: ppnRemaining + pph22Remaining,
    },
  }
}

/**
 * Validate tax asset data
 *
 * @param taxAssetData - Tax asset data to validate
 * @returns Validation result
 */
export function validateTaxAssetData(
  taxAssetData: Partial<TaxAssetData>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!taxAssetData.bc20Id) {
    errors.push('BC 2.0 ID is required')
  }

  if (!taxAssetData.bc20Number) {
    errors.push('BC 2.0 number is required')
  }

  if (!taxAssetData.type) {
    errors.push('Tax asset type is required')
  }

  if (!taxAssetData.amount || taxAssetData.amount <= 0) {
    errors.push('Tax asset amount must be greater than 0')
  }

  if (taxAssetData.type === 'PPN_IMPORT' && !taxAssetData.period) {
    errors.push('Period is required for PPN Import tax asset')
  }

  if (taxAssetData.type === 'PPH22_IMPORT' && !taxAssetData.fiscalYear) {
    errors.push('Fiscal year is required for PPh 22 tax asset')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
