import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/peb/[id]/submit - Submit PEB to customs
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { submittedBy } = body

    if (!submittedBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'submittedBy is required',
        },
        { status: 400 }
      )
    }

    // Get PEB document
    const pebDoc = await prisma.pEBDocument.findUnique({
      where: { id },
      include: {
        items: true,
      },
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

    // Validate status (can only submit DRAFT or VERIFIED)
    if (!['DRAFT', 'VERIFIED'].includes(pebDoc.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot submit PEB in ${pebDoc.status} status`,
        },
        { status: 400 }
      )
    }

    // Validate has items
    if (!pebDoc.items || pebDoc.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot submit PEB without items',
        },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!pebDoc.portOfLoading || !pebDoc.destinationPort || !pebDoc.customsOffice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: portOfLoading, destinationPort, or customsOffice',
        },
        { status: 400 }
      )
    }

    // Update PEB status to SUBMITTED
    const updatedPEB = await prisma.pEBDocument.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        submittedBy,
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

    // TODO: Future enhancement - Send notification to customs/logistics team
    // await sendPEBSubmissionNotification(updatedPEB)

    return NextResponse.json({
      success: true,
      data: updatedPEB,
      message: `PEB ${updatedPEB.pebNumber} submitted successfully to customs`,
    })
  } catch (error: any) {
    console.error('Error submitting PEB:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit PEB',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
