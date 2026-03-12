import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/peb/[id]/approve - Approve PEB (customs approval)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      approvedBy,
      customsReleaseRef,
      exportPermitNumber,
    } = body

    if (!approvedBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'approvedBy is required',
        },
        { status: 400 }
      )
    }

    // Get PEB document
    const pebDoc = await prisma.pEBDocument.findUnique({
      where: { id },
    })

    if (!pebDoc) {
      return NextResponse.json(
        {
          success: false,
          error: 'PEB document not found',
        },
        { status: 404 }
      )
    }

    // Validate status (can only approve SUBMITTED or UNDER_REVIEW)
    if (!['SUBMITTED', 'UNDER_REVIEW'].includes(pebDoc.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot approve PEB in ${pebDoc.status} status`,
        },
        { status: 400 }
      )
    }

    // Update PEB status to APPROVED
    const updatedPEB = await prisma.pEBDocument.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy,
        customsReleaseDate: new Date(),
        customsReleaseRef,
        exportPermitNumber,
      },
      include: {
        customer: true,
        items: {
          include: {
            material: true,
          },
        },
      },
    })

    // TODO: Future enhancement - Send approval notification
    // await sendPEBApprovalNotification(updatedPEB)

    return NextResponse.json({
      success: true,
      data: updatedPEB,
      message: `PEB ${updatedPEB.pebNumber} approved successfully. Ready for export.`,
    })
  } catch (error: any) {
    console.error('Error approving PEB:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to approve PEB',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
