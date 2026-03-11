import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/bc20/[id]/record-sppb
 *
 * Record SPPB (Surat Persetujuan Pengeluaran Barang) - Customs Release
 *
 * Business Logic:
 * - SPPB can only be recorded if tax payment is PAID
 * - Recording SPPB automatically updates BC 2.0 status to CUSTOMS_RELEASED
 * - This unblocks goods receipt (GR) process
 * - SPPB is the final approval from customs after tax payment
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { sppbNumber, sppbDate, customsOfficer, notes, recordedBy } = body

    // Validate required fields
    if (!sppbNumber || !sppbDate) {
      return NextResponse.json(
        { success: false, error: 'SPPB number and date are required' },
        { status: 400 }
      )
    }

    // Get BC 2.0 document
    const bc20Doc = await prisma.bC20Document.findUnique({
      where: { id },
      include: {
        taxBill: true,
      },
    })

    if (!bc20Doc) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 document not found' },
        { status: 404 }
      )
    }

    // Validation: Tax payment must be paid before SPPB
    if (bc20Doc.taxPaymentStatus !== 'PAID') {
      return NextResponse.json(
        {
          success: false,
          error: 'Tax payment must be completed before recording SPPB',
          details: {
            currentTaxStatus: bc20Doc.taxPaymentStatus,
            taxAmount: bc20Doc.totalTax,
            message: 'Please complete tax payment first via /api/bc20/[id]/pay-tax',
          },
        },
        { status: 400 }
      )
    }

    // Validation: Cannot record SPPB twice
    if (bc20Doc.sppbNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'SPPB already recorded for this document',
          details: {
            existingSppbNumber: bc20Doc.sppbNumber,
            existingSppbDate: bc20Doc.sppbDate,
          },
        },
        { status: 400 }
      )
    }

    // Check if SPPB number already exists
    const existingSppb = await prisma.bC20Document.findFirst({
      where: {
        sppbNumber,
        id: { not: id },
      },
    })

    if (existingSppb) {
      return NextResponse.json(
        { success: false, error: 'SPPB number already exists' },
        { status: 400 }
      )
    }

    // Update BC 2.0 document with SPPB and release status
    const updatedBC20 = await prisma.bC20Document.update({
      where: { id },
      data: {
        sppbNumber,
        sppbDate: new Date(sppbDate),
        customsOfficer: customsOfficer || null,
        sppbNotes: notes || null,

        // Update status to CUSTOMS_RELEASED - This unblocks GR!
        status: 'CUSTOMS_RELEASED',
        customsReleasedAt: new Date(),
        customsReleasedBy: recordedBy || 'system',
      },
      include: {
        supplier: true,
        taxBill: true,
        vendorBill: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'SPPB recorded successfully. Goods receipt is now allowed.',
      data: {
        bc20Id: updatedBC20.id,
        documentNumber: updatedBC20.documentNumber,
        sppbNumber: updatedBC20.sppbNumber,
        sppbDate: updatedBC20.sppbDate,
        status: updatedBC20.status,
        customsOfficer: updatedBC20.customsOfficer,

        // GR status
        grEligible: true,
        grBlocked: false,
        nextAction: 'Proceed with goods receipt',

        // Tax payment confirmation
        taxPaymentStatus: updatedBC20.taxPaymentStatus,
        taxPaymentDate: updatedBC20.taxPaymentDate,
        totalTaxPaid: updatedBC20.totalTax,
      },
    })
  } catch (error) {
    console.error('Error recording SPPB:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record SPPB',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
