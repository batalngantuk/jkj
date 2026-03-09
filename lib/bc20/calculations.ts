/**
 * BC 2.0 Import Calculation Utilities
 *
 * This file contains all calculation functions for:
 * - Import duties (Bea Masuk)
 * - Taxes (PPN Import, PPh 22)
 * - Landed cost
 * - Dual billing amounts
 */

import { Decimal } from '@prisma/client/runtime/library';

// ========================================
// TYPES
// ========================================

export interface BC20ItemCalculation {
  quantity: number;
  unitPriceForeign: number;
  dutyRate: number;
  ppnRate?: number;
  pph22Rate?: number;
}

export interface BC20DocumentCalculation {
  cifValue: number;
  exchangeRate: number;
  freightCost: number;
  insuranceCost: number;
  handlingCost: number;
  otherCosts?: number;
  items: BC20ItemCalculation[];
}

export interface DutyCalculationResult {
  cifIdr: number;
  beaMasuk: number;
  ppnImport: number;
  pph22: number;
  totalTax: number;
  totalLandedCost: number;
}

export interface DualBillingResult {
  vendorBillAmount: number;  // CIF value in IDR
  taxBillAmount: number;      // Bea Masuk + PPN + PPh22
  totalAmount: number;
}

// ========================================
// CONSTANTS
// ========================================

export const DEFAULT_PPN_RATE = 11.00;  // 11%
export const DEFAULT_PPH22_RATE = 2.50; // 2.5%

// ========================================
// CALCULATION FUNCTIONS
// ========================================

/**
 * Calculate CIF value in IDR
 */
export function calculateCIFInIDR(cifUSD: number, exchangeRate: number): number {
  return Number((cifUSD * exchangeRate).toFixed(2));
}

/**
 * Calculate Import Duty (Bea Masuk)
 * Formula: CIF (IDR) × Duty Rate (%)
 */
export function calculateBeaMasuk(cifIdr: number, dutyRate: number): number {
  return Number((cifIdr * (dutyRate / 100)).toFixed(2));
}

/**
 * Calculate PPN Import (11%)
 * Formula: (CIF + Bea Masuk) × PPN Rate (%)
 *
 * Note: PPN Import is calculated on the CIF value PLUS import duty
 */
export function calculatePPNImport(
  cifIdr: number,
  beaMasuk: number,
  ppnRate: number = DEFAULT_PPN_RATE
): number {
  const base = cifIdr + beaMasuk;
  return Number((base * (ppnRate / 100)).toFixed(2));
}

/**
 * Calculate PPh 22 (Income Tax Article 22)
 * Formula: (CIF + Bea Masuk) × PPh22 Rate (%)
 *
 * Default rate: 2.5% for most importers
 * Note: Can be 7.5% or 10% depending on importer status
 */
export function calculatePPh22(
  cifIdr: number,
  beaMasuk: number,
  pph22Rate: number = DEFAULT_PPH22_RATE
): number {
  const base = cifIdr + beaMasuk;
  return Number((base * (pph22Rate / 100)).toFixed(2));
}

/**
 * Calculate Total Tax
 * Formula: Bea Masuk + PPN Import + PPh 22
 */
export function calculateTotalTax(
  beaMasuk: number,
  ppnImport: number,
  pph22: number
): number {
  return Number((beaMasuk + ppnImport + pph22).toFixed(2));
}

/**
 * Calculate Landed Cost
 * Formula: CIF (IDR) + Bea Masuk + Freight + Insurance + Handling + Other Costs
 *
 * Note: Landed cost is capitalized to inventory value
 * Tax assets (PPN & PPh22) are NOT included in landed cost
 */
export function calculateLandedCost(
  cifIdr: number,
  beaMasuk: number,
  freightCost: number,
  insuranceCost: number,
  handlingCost: number,
  otherCosts: number = 0
): number {
  return Number((
    cifIdr +
    beaMasuk +
    freightCost +
    insuranceCost +
    handlingCost +
    otherCosts
  ).toFixed(2));
}

/**
 * Calculate complete BC 2.0 document duties and taxes
 */
export function calculateBC20Duties(
  params: BC20DocumentCalculation
): DutyCalculationResult {
  // Convert CIF to IDR
  const cifIdr = calculateCIFInIDR(params.cifValue, params.exchangeRate);

  // Calculate weighted average duty rate from items
  let totalItemValue = 0;
  let weightedDutyAmount = 0;

  params.items.forEach(item => {
    const itemValue = item.quantity * item.unitPriceForeign * params.exchangeRate;
    const itemDuty = itemValue * (item.dutyRate / 100);
    totalItemValue += itemValue;
    weightedDutyAmount += itemDuty;
  });

  // Use weighted duty for overall calculation
  const beaMasuk = Number(weightedDutyAmount.toFixed(2));

  // Calculate taxes
  const ppnImport = calculatePPNImport(cifIdr, beaMasuk);
  const pph22 = calculatePPh22(cifIdr, beaMasuk);

  // Total tax
  const totalTax = calculateTotalTax(beaMasuk, ppnImport, pph22);

  // Landed cost
  const totalLandedCost = calculateLandedCost(
    cifIdr,
    beaMasuk,
    params.freightCost,
    params.insuranceCost,
    params.handlingCost,
    params.otherCosts || 0
  );

  return {
    cifIdr,
    beaMasuk,
    ppnImport,
    pph22,
    totalTax,
    totalLandedCost,
  };
}

/**
 * Calculate Dual Billing amounts
 *
 * Returns two separate bill amounts:
 * 1. Vendor Bill: CIF value (payment to supplier)
 * 2. Tax Bill: Import duties and taxes (payment to customs)
 */
export function calculateDualBilling(
  cifIdr: number,
  beaMasuk: number,
  ppnImport: number,
  pph22: number
): DualBillingResult {
  const vendorBillAmount = cifIdr;
  const taxBillAmount = beaMasuk + ppnImport + pph22;
  const totalAmount = vendorBillAmount + taxBillAmount;

  return {
    vendorBillAmount: Number(vendorBillAmount.toFixed(2)),
    taxBillAmount: Number(taxBillAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
  };
}

/**
 * Calculate Landed Cost Per Unit
 * Used for inventory valuation in Goods Receipt
 */
export function calculateLandedCostPerUnit(
  totalLandedCost: number,
  totalQuantity: number
): number {
  if (totalQuantity === 0) return 0;
  return Number((totalLandedCost / totalQuantity).toFixed(4));
}

/**
 * Calculate Item-level duty for BC 2.0 line item
 */
export function calculateItemDuty(
  quantity: number,
  unitPriceIdr: number,
  dutyRate: number
): number {
  const itemValue = quantity * unitPriceIdr;
  return Number((itemValue * (dutyRate / 100)).toFixed(2));
}

// ========================================
// VALIDATION FUNCTIONS
// ========================================

/**
 * Validate if tax payment is complete
 */
export function isTaxPaymentComplete(
  paidAmount: number,
  totalTax: number
): boolean {
  return paidAmount >= totalTax;
}

/**
 * Validate if customs clearance can proceed
 * Requirements: Tax must be fully paid
 */
export function canProceedWithClearance(taxPaymentStatus: string): boolean {
  return taxPaymentStatus === 'PAID';
}

/**
 * Calculate tax payment due date (typically 7 days from document submission)
 */
export function calculateTaxDueDate(submissionDate: Date, daysToAdd: number = 7): Date {
  const dueDate = new Date(submissionDate);
  dueDate.setDate(dueDate.getDate() + daysToAdd);
  return dueDate;
}
