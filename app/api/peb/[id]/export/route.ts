import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/peb/[id]/export - Mark PEB as exported (goods shipped)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      actualDeparture,
      vesselName,
      voyageNumber,
      blNumber,
      containerNumber,
      sealNumber,
      updatedBy,
    } = body

    if (!updatedBy || !actualDeparture) {
      return NextResponse.json(
        {
          success: false,
          error: 'updatedBy and actualDeparture are required',
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

    // Validate status (can only export if APPROVED)
    if (pebDoc.status !== 'APPROVED') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot mark as exported. PEB must be APPROVED first. Current status: ${pebDoc.status}`,
        },
        { status: 400 }
      )
    }

    // Update PEB status to EXPORTED
    const updatedPEB = await prisma.pEBDocument.update({
      where: { id },
      data: {
        status: 'EXPORTED',
        actualDeparture: new Date(actualDeparture),
        vesselName: vesselName || pebDoc.vesselName,
        voyageNumber: voyageNumber || pebDoc.voyageNumber,
        blNumber: blNumber || pebDoc.blNumber,
        containerNumber: containerNumber || pebDoc.containerNumber,
        sealNumber: sealNumber || pebDoc.sealNumber,
        updatedBy,
      },
      include: {
        customer: true,
        salesOrder: true,
        items: {
          include: {
            material: true,
          },
        },
      },
    })

    // TODO: Future enhancement
    // 1. Update Sales Order status to SHIPPED
    // 2. Create shipment record
    // 3. Send export confirmation notification
    // 4. Update inventory (outbound)

    return NextResponse.json({
      success: true,
      data: updatedPEB,
      message: `PEB ${updatedPEB.pebNumber} marked as exported successfully. Goods have been shipped.`,
    })
  } catch (error: any) {
    console.error('Error marking PEB as exported:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to mark PEB as exported',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
