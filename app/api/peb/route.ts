import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/peb - List all PEB documents
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const customerId = searchParams.get('customerId')
    const country = searchParams.get('country')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (customerId) {
      where.customerId = customerId
    }

    if (country) {
      where.destinationCountry = country
    }

    const [pebDocuments, total] = await Promise.all([
      prisma.pEBDocument.findMany({
        where,
        include: {
          customer: {
            select: {
              customerCode: true,
              customerName: true,
              country: true,
            },
          },
          salesOrder: {
            select: {
              soNumber: true,
              soDate: true,
            },
          },
          items: {
            include: {
              material: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          documentDate: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.pEBDocument.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: pebDocuments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Error fetching PEB documents:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch PEB documents',
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// POST /api/peb - Create new PEB document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      pebNumber,
      npeNumber,
      customerId,
      customerName,
      salesOrderId,
      destinationCountry,
      destinationPort,
      portOfLoading,
      customsOffice,
      exportDate,
      estimatedDeparture,
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
      items,
      createdBy,
      notes,
    } = body

    // Validate required fields
    if (!pebNumber || !customerId || !customerName || !destinationCountry || !exportDate || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      )
    }

    // Check if PEB number already exists
    const existingPEB = await prisma.pEBDocument.findUnique({
      where: { pebNumber },
    })

    if (existingPEB) {
      return NextResponse.json(
        {
          success: false,
          error: `PEB number ${pebNumber} already exists`,
        },
        { status: 400 }
      )
    }

    // Calculate FOB in IDR
    const fobIdr = fobValue * exchangeRate

    // VAT is zero-rated for exports
    const vatRate = 0
    const vatAmount = 0

    // Calculate total from items
    const itemsTotal = items.reduce((sum: number, item: any) => sum + parseFloat(item.totalPrice), 0)

    // Create PEB document with items
    const pebDocument = await prisma.pEBDocument.create({
      data: {
        pebNumber,
        npeNumber,
        documentDate: new Date(),
        status: 'DRAFT',
        customerId,
        customerName,
        salesOrderId,
        destinationCountry,
        destinationPort: destinationPort || '',
        portOfLoading: portOfLoading || '',
        customsOffice: customsOffice || '',
        exportDate: new Date(exportDate),
        estimatedDeparture: new Date(estimatedDeparture),
        vesselName,
        voyageNumber,
        containerNumber,
        blNumber,
        sealNumber,
        fobValue: parseFloat(fobValue),
        currency: currency || 'USD',
        exchangeRate: parseFloat(exchangeRate),
        fobIdr,
        vatRate,
        vatAmount,
        exportIncentive: exportIncentive ? parseFloat(exportIncentive) : 0,
        incentiveType,
        workOrderId,
        fgLotNumber,
        bc20Reference,
        notes,
        createdBy,
        items: {
          create: items.map((item: any) => ({
            materialId: item.materialId,
            materialCode: item.materialCode,
            materialName: item.materialName,
            hsCode: item.hsCode,
            hsDescription: item.hsDescription,
            quantity: parseFloat(item.quantity),
            uom: item.uom,
            unitPrice: parseFloat(item.unitPrice),
            totalPrice: parseFloat(item.totalPrice),
            lotNumber: item.lotNumber,
            batchNumber: item.batchNumber,
            packagingType: item.packagingType,
            numberOfPackages: item.numberOfPackages ? parseInt(item.numberOfPackages) : null,
            grossWeight: item.grossWeight ? parseFloat(item.grossWeight) : null,
            netWeight: item.netWeight ? parseFloat(item.netWeight) : null,
          })),
        },
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
      data: pebDocument,
      message: `PEB ${pebNumber} created successfully`,
    })
  } catch (error: any) {
    console.error('Error creating PEB document:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create PEB document',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
