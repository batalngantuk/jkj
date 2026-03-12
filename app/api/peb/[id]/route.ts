import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/peb/[id] - Get PEB document details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const pebDocument = await prisma.pEBDocument.findUnique({
      where: { id },
      include: {
        customer: true,
        salesOrder: {
          include: {
            items: {
              include: {
                material: true,
              },
            },
          },
        },
        workOrder: true,
        items: {
          include: {
            material: true,
          },
        },
      },
    })

    if (!pebDocument) {
      return NextResponse.json(
        {
          success: false,
          error: 'PEB document not found',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: pebDocument,
    })
  } catch (error: any) {
    console.error('Error fetching PEB document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch PEB document',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// PUT /api/peb/[id] - Update PEB document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    // Check if PEB exists
    const existingPEB = await prisma.pEBDocument.findUnique({
      where: { id },
    })

    if (!existingPEB) {
      return NextResponse.json(
        {
          success: false,
          error: 'PEB document not found',
        },
        { status: 404 }
      )
    }

    // Only allow updates if status is DRAFT or VERIFIED
    if (!['DRAFT', 'VERIFIED'].includes(existingPEB.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot update PEB in ${existingPEB.status} status`,
        },
        { status: 400 }
      )
    }

    const {
      npeNumber,
      destinationCountry,
      destinationPort,
      portOfLoading,
      customsOffice,
      exportDate,
      estimatedDeparture,
      actualDeparture,
      vesselName,
      voyageNumber,
      containerNumber,
      blNumber,
      sealNumber,
      fobValue,
      currency,
      exchangeRate,
      exportIncentive,
      incentiveType,
      workOrderId,
      fgLotNumber,
      bc20Reference,
      updatedBy,
      notes,
    } = body

    // Calculate FOB in IDR if values changed
    const fobIdr = fobValue && exchangeRate ? fobValue * exchangeRate : existingPEB.fobIdr

    // Update PEB document
    const updatedPEB = await prisma.pEBDocument.update({
      where: { id },
      data: {
        npeNumber,
        destinationCountry,
        destinationPort,
        portOfLoading,
        customsOffice,
        exportDate: exportDate ? new Date(exportDate) : undefined,
        estimatedDeparture: estimatedDeparture ? new Date(estimatedDeparture) : undefined,
        actualDeparture: actualDeparture ? new Date(actualDeparture) : undefined,
        vesselName,
        voyageNumber,
        containerNumber,
        blNumber,
        sealNumber,
        fobValue: fobValue ? parseFloat(fobValue) : undefined,
        currency,
        exchangeRate: exchangeRate ? parseFloat(exchangeRate) : undefined,
        fobIdr,
        exportIncentive: exportIncentive !== undefined ? parseFloat(exportIncentive) : undefined,
        incentiveType,
        workOrderId,
        fgLotNumber,
        bc20Reference,
        updatedBy,
        notes,
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

    return NextResponse.json({
      success: true,
      data: updatedPEB,
      message: `PEB ${updatedPEB.pebNumber} updated successfully`,
    })
  } catch (error: any) {
    console.error('Error updating PEB document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update PEB document',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// DELETE /api/peb/[id] - Delete PEB document (only DRAFT)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const existingPEB = await prisma.pEBDocument.findUnique({
      where: { id },
    })

    if (!existingPEB) {
      return NextResponse.json(
        {
          success: false,
          error: 'PEB document not found',
        },
        { status: 404 }
      )
    }

    // Only allow deletion if status is DRAFT
    if (existingPEB.status !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete PEB in ${existingPEB.status} status. Only DRAFT can be deleted.`,
        },
        { status: 400 }
      )
    }

    // Delete PEB (cascade will delete items)
    await prisma.pEBDocument.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `PEB ${existingPEB.pebNumber} deleted successfully`,
    })
  } catch (error: any) {
    console.error('Error deleting PEB document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete PEB document',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
