/**
 * Landed Cost Calculation Service
 *
 * BC 2.0 Regular Import - Landed Cost Calculation
 *
 * Formula:
 * Landed Cost = CIF + Bea Masuk + Domestic Freight + Handling + Other
 *
 * IMPORTANT: PPN Import and PPh 22 are NOT included in landed cost.
 * They are recorded as prepaid tax assets, NOT inventory cost.
 *
 * Components capitalized to inventory:
 * 1. CIF Value (FOB + International Freight + Insurance)
 * 2. Bea Masuk (Import Duty)
 * 3. Domestic Freight (Port to Warehouse)
 * 4. Handling Fees (Port charges, customs broker, unloading)
 * 5. Other Direct Costs (quarantine, fumigation, etc.)
 */

export interface LandedCostComponents {
  // CIF Value (already includes FOB + International Freight + Insurance)
  cifValueIdr: number

  // Import Duty (capitalized)
  beaMasuk: number

  // Domestic Costs
  domesticFreight: number
  handlingFees: number
  customsBrokerFee: number
  portCharges: number
  unloadingCost: number
  quarantineFee: number
  fumigationFee: number
  otherCosts: number

  // Quantity for unit cost calculation
  quantity: number
}

export interface LandedCostResult {
  // Components Breakdown
  components: {
    cifValue: number
    beaMasuk: number
    domesticFreight: number
    handlingFees: number
    customsBrokerFee: number
    portCharges: number
    unloadingCost: number
    quarantineFee: number
    fumigationFee: number
    otherCosts: number
  }

  // Totals
  totalLandedCost: number
  quantity: number
  unitLandedCost: number

  // Tax Assets (NOT included in landed cost)
  taxAssets: {
    ppnImport: number
    pph22Import: number
    totalTaxAssets: number
  }

  // Total Cash Outflow (for cash flow tracking)
  totalCashOutflow: number // Landed Cost + Tax Assets
}

/**
 * Calculate landed cost for BC 2.0 import
 *
 * @param components - All cost components
 * @param ppnImport - PPN Import amount (tax asset, NOT inventory cost)
 * @param pph22Import - PPh 22 amount (tax asset, NOT inventory cost)
 * @returns Landed cost calculation result
 */
export function calculateLandedCost(
  components: LandedCostComponents,
  ppnImport: number = 0,
  pph22Import: number = 0
): LandedCostResult {
  // Validate quantity
  if (components.quantity <= 0) {
    throw new Error('Quantity must be greater than 0')
  }

  // Calculate total landed cost (capitalized to inventory)
  const totalLandedCost =
    components.cifValueIdr +
    components.beaMasuk +
    components.domesticFreight +
    components.handlingFees +
    components.customsBrokerFee +
    components.portCharges +
    components.unloadingCost +
    components.quarantineFee +
    components.fumigationFee +
    components.otherCosts

  // Calculate unit landed cost
  const unitLandedCost = totalLandedCost / components.quantity

  // Tax assets (NOT inventory cost)
  const totalTaxAssets = ppnImport + pph22Import

  // Total cash outflow
  const totalCashOutflow = totalLandedCost + totalTaxAssets

  return {
    components: {
      cifValue: components.cifValueIdr,
      beaMasuk: components.beaMasuk,
      domesticFreight: components.domesticFreight,
      handlingFees: components.handlingFees,
      customsBrokerFee: components.customsBrokerFee,
      portCharges: components.portCharges,
      unloadingCost: components.unloadingCost,
      quarantineFee: components.quarantineFee,
      fumigationFee: components.fumigationFee,
      otherCosts: components.otherCosts,
    },
    totalLandedCost,
    quantity: components.quantity,
    unitLandedCost,
    taxAssets: {
      ppnImport,
      pph22Import,
      totalTaxAssets,
    },
    totalCashOutflow,
  }
}

/**
 * Calculate variance between estimated and actual landed cost
 *
 * @param estimated - Estimated landed cost (from BC 2.0)
 * @param actual - Actual landed cost (from GR)
 * @returns Variance analysis
 */
export function calculateLandedCostVariance(
  estimated: number,
  actual: number
) {
  const variance = actual - estimated
  const variancePercentage = estimated > 0 ? (variance / estimated) * 100 : 0

  return {
    estimated,
    actual,
    variance,
    variancePercentage,
    isOverBudget: variance > 0,
    isUnderBudget: variance < 0,
    isSignificant: Math.abs(variancePercentage) > 5, // More than 5% variance
  }
}

/**
 * Generate journal entry for landed cost and tax assets
 *
 * @param landedCost - Landed cost calculation result
 * @param bc20Id - BC 2.0 document ID
 * @param grId - Goods receipt ID
 * @param supplierId - Supplier ID
 * @returns Journal entry data
 */
export function generateLandedCostJournalEntry(
  landedCost: LandedCostResult,
  bc20Id: string,
  grId: string,
  supplierId: string
) {
  const journalEntry = {
    description: `Goods receipt with landed cost - BC 2.0 import`,
    reference: `BC20:${bc20Id} / GR:${grId}`,

    // Debit entries
    debits: [
      {
        account: 'Raw Material Inventory',
        accountCode: '1-14000',
        amount: landedCost.totalLandedCost,
        description: `Landed cost capitalized to inventory (${landedCost.quantity} units @ ${landedCost.unitLandedCost.toFixed(2)})`,
      },
      {
        account: 'PPN Prepaid (Tax Asset)',
        accountCode: '1-15100',
        amount: landedCost.taxAssets.ppnImport,
        description: 'PPN Import - Prepaid tax asset',
      },
      {
        account: 'PPh 22 Prepaid (Tax Asset)',
        accountCode: '1-15200',
        amount: landedCost.taxAssets.pph22Import,
        description: 'PPh 22 Import - Prepaid tax asset',
      },
    ],

    // Credit entries
    credits: [
      {
        account: 'Accounts Payable - Vendor',
        accountCode: '2-10100',
        amount: landedCost.components.cifValue,
        description: `Vendor payment liability`,
        supplierId,
      },
      {
        account: 'Accounts Payable - Customs',
        accountCode: '2-10200',
        amount: landedCost.components.beaMasuk + landedCost.taxAssets.ppnImport + landedCost.taxAssets.pph22Import,
        description: 'Customs duties and taxes payable',
      },
      {
        account: 'Accounts Payable - Freight',
        accountCode: '2-10300',
        amount: landedCost.components.domesticFreight,
        description: 'Domestic freight payable',
      },
      {
        account: 'Accounts Payable - Other',
        accountCode: '2-10400',
        amount:
          landedCost.components.handlingFees +
          landedCost.components.customsBrokerFee +
          landedCost.components.portCharges +
          landedCost.components.unloadingCost +
          landedCost.components.quarantineFee +
          landedCost.components.fumigationFee +
          landedCost.components.otherCosts,
        description: 'Handling and other import costs payable',
      },
    ],

    // Totals for validation
    totalDebit: landedCost.totalLandedCost + landedCost.taxAssets.totalTaxAssets,
    totalCredit: landedCost.totalLandedCost + landedCost.taxAssets.totalTaxAssets,
    balanced: true,
  }

  return journalEntry
}

/**
 * Validate landed cost components
 *
 * @param components - Landed cost components to validate
 * @returns Validation result
 */
export function validateLandedCostComponents(
  components: LandedCostComponents
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check required components
  if (!components.cifValueIdr || components.cifValueIdr <= 0) {
    errors.push('CIF value is required and must be greater than 0')
  }

  if (!components.beaMasuk || components.beaMasuk < 0) {
    errors.push('Bea Masuk must be greater than or equal to 0')
  }

  if (!components.quantity || components.quantity <= 0) {
    errors.push('Quantity must be greater than 0')
  }

  // Check negative values
  const fields = [
    { name: 'domesticFreight', value: components.domesticFreight },
    { name: 'handlingFees', value: components.handlingFees },
    { name: 'customsBrokerFee', value: components.customsBrokerFee },
    { name: 'portCharges', value: components.portCharges },
    { name: 'unloadingCost', value: components.unloadingCost },
    { name: 'quarantineFee', value: components.quarantineFee },
    { name: 'fumigationFee', value: components.fumigationFee },
    { name: 'otherCosts', value: components.otherCosts },
  ]

  fields.forEach((field) => {
    if (field.value < 0) {
      errors.push(`${field.name} cannot be negative`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}
