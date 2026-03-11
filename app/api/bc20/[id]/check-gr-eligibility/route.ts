import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/bc20/[id]/check-gr-eligibility
 *
 * Check if goods receipt (GR) is allowed for a BC 2.0 document
 *
 * Tax Payment Blocking Mechanism:
 * - GR is BLOCKED if tax payment status is not 'PAID'
 * - GR is BLOCKED if BC 2.0 status is not 'CUSTOMS_RELEASED'
 * - GR is ALLOWED only when:
 *   1. Tax payment status = 'PAID'
 *   2. SPPB (customs release) is received
 *   3. BC 2.0 status = 'CUSTOMS_RELEASED'
 *
 * This is a critical blocking mechanism for BC 2.0 Regular Import!
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Get BC 2.0 document with tax payment information
    const bc20Doc = await prisma.bC20Document.findUnique({
      where: { id },
      include: {
        taxBill: true,
        vendorBill: true,
      },
    })

    if (!bc20Doc) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 document not found' },
        { status: 404 }
      )
    }

    // Check eligibility rules
    const checks = {
      documentExists: true,
      documentSubmitted: bc20Doc.status !== 'DRAFT',
      taxPaymentPaid: bc20Doc.taxPaymentStatus === 'PAID',
      sppbReceived: !!bc20Doc.sppbNumber && !!bc20Doc.sppbDate,
      customsReleased: bc20Doc.status === 'CUSTOMS_RELEASED',
    }

    // Determine if GR is eligible
    const isEligible = checks.taxPaymentPaid && checks.customsReleased

    // Determine blocking reason if not eligible
    let blockingReason = null
    let blockingDetails = []

    if (!isEligible) {
      if (!checks.documentSubmitted) {
        blockingReason = 'BC 2.0 document not yet submitted to customs'
        blockingDetails.push('Document must be submitted before goods receipt')
      }

      if (!checks.taxPaymentPaid) {
        blockingReason = 'Tax payment pending - upfront tax payment required'
        blockingDetails.push(
          'Import duties and taxes must be paid before customs clearance',
          `Tax bill status: ${bc20Doc.taxPaymentStatus}`,
          `Total tax amount: Rp ${bc20Doc.totalTax?.toLocaleString() || 'N/A'}`
        )
      }

      if (!checks.sppbReceived) {
        blockingReason = blockingReason || 'SPPB (customs release) not yet received'
        blockingDetails.push('Waiting for SPPB from customs')
      }

      if (!checks.customsReleased) {
        blockingReason = blockingReason || 'Customs has not released the goods'
        blockingDetails.push(
          `Current status: ${bc20Doc.status}`,
          'Status must be CUSTOMS_RELEASED to receive goods'
        )
      }
    }

    // Get payment information
    const taxBillInfo = bc20Doc.taxBill ? {
      billNumber: bc20Doc.taxBill.billNumber,
      amount: bc20Doc.taxBill.amount,
      dueDate: bc20Doc.taxBill.dueDate,
      status: bc20Doc.taxBill.status,
      paidDate: bc20Doc.taxBill.paidDate,
      paidAmount: bc20Doc.taxBill.paidAmount,
      remainingAmount: bc20Doc.taxBill.remainingAmount,
    } : null

    return NextResponse.json({
      success: true,
      data: {
        bc20Id: bc20Doc.id,
        documentNumber: bc20Doc.documentNumber,
        status: bc20Doc.status,

        // GR Eligibility
        grEligible: isEligible,
        grBlocked: !isEligible,

        // Checks breakdown
        checks,

        // Blocking information
        blockingReason,
        blockingDetails,

        // Tax payment info
        taxPaymentStatus: bc20Doc.taxPaymentStatus,
        taxPaymentDate: bc20Doc.taxPaymentDate,
        taxBill: taxBillInfo,

        // SPPB info
        sppbNumber: bc20Doc.sppbNumber,
        sppbDate: bc20Doc.sppbDate,

        // Next actions required
        nextAction: !isEligible ? (
          !checks.taxPaymentPaid
            ? 'Pay import duties and taxes'
            : !checks.sppbReceived
            ? 'Wait for SPPB from customs'
            : 'Update BC 2.0 status to CUSTOMS_RELEASED'
        ) : 'Goods receipt can be processed',
      },
    })
  } catch (error) {
    console.error('Error checking GR eligibility:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check GR eligibility',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
