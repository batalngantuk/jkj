import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBC20Duties } from '@/lib/bc20/calculations';

/**
 * GET /api/bc20
 * List all BC 2.0 documents with pagination and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const taxPaymentStatus = searchParams.get('taxPaymentStatus');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Build where clause
    const where: any = {};

    if (status) where.status = status;
    if (supplierId) where.supplierId = supplierId;
    if (taxPaymentStatus) where.taxPaymentStatus = taxPaymentStatus;

    if (fromDate || toDate) {
      where.documentDate = {};
      if (fromDate) where.documentDate.gte = new Date(fromDate);
      if (toDate) where.documentDate.lte = new Date(toDate);
    }

    // Execute query
    const [documents, total] = await Promise.all([
      prisma.bC20Document.findMany({
        where,
        skip,
        take: limit,
        include: {
          supplier: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          purchaseOrder: {
            select: {
              id: true,
              poNumber: true,
            },
          },
          items: {
            include: {
              material: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
              hsCode: {
                select: {
                  id: true,
                  code: true,
                  description: true,
                },
              },
            },
          },
        },
        orderBy: {
          documentDate: 'desc',
        },
      }),
      prisma.bC20Document.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: documents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching BC 2.0 documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch BC 2.0 documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/bc20
 * Create a new BC 2.0 document
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      supplierId,
      purchaseOrderId,
      portOfEntry,
      customsOffice,
      estimatedArrival,
      cifValue,
      currency,
      exchangeRate,
      freightCost,
      insuranceCost,
      handlingCost,
      otherCosts,
      items,
      notes,
      createdBy,
    } = body;

    // Validate required fields
    if (!supplierId || !portOfEntry || !customsOffice || !estimatedArrival || !cifValue || !exchangeRate || !items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate duties and taxes
    const calculations = calculateBC20Duties({
      cifValue: parseFloat(cifValue),
      exchangeRate: parseFloat(exchangeRate),
      freightCost: parseFloat(freightCost || '0'),
      insuranceCost: parseFloat(insuranceCost || '0'),
      handlingCost: parseFloat(handlingCost || '0'),
      otherCosts: parseFloat(otherCosts || '0'),
      items: items.map((item: any) => ({
        quantity: parseFloat(item.quantity),
        unitPriceForeign: parseFloat(item.unitPriceForeign),
        dutyRate: parseFloat(item.dutyRate),
      })),
    });

    // Create BC 2.0 document with items
    const bc20Document = await prisma.bC20Document.create({
      data: {
        documentNumber: `DRAFT-${Date.now()}`, // Will be replaced when submitted
        documentDate: new Date(),
        status: 'DRAFT',
        supplierId,
        purchaseOrderId: purchaseOrderId || null,
        portOfEntry,
        customsOffice,
        estimatedArrival: new Date(estimatedArrival),
        cifValue: parseFloat(cifValue),
        currency: currency || 'USD',
        exchangeRate: parseFloat(exchangeRate),
        cifIdr: calculations.cifIdr,
        beaMasuk: calculations.beaMasuk,
        ppnImport: calculations.ppnImport,
        pph22: calculations.pph22,
        totalTax: calculations.totalTax,
        freightCost: parseFloat(freightCost || '0'),
        insuranceCost: parseFloat(insuranceCost || '0'),
        handlingCost: parseFloat(handlingCost || '0'),
        otherCosts: parseFloat(otherCosts || '0'),
        totalLandedCost: calculations.totalLandedCost,
        taxPaymentStatus: 'PENDING',
        notes,
        createdBy,
        items: {
          create: items.map((item: any, index: number) => ({
            lineNumber: index + 1,
            materialId: item.materialId,
            hsCodeId: item.hsCodeId,
            description: item.description,
            quantity: parseFloat(item.quantity),
            unit: item.unit,
            unitPriceForeign: parseFloat(item.unitPriceForeign),
            totalPriceForeign: parseFloat(item.quantity) * parseFloat(item.unitPriceForeign),
            unitPriceIdr: parseFloat(item.unitPriceForeign) * parseFloat(exchangeRate),
            totalPriceIdr: parseFloat(item.quantity) * parseFloat(item.unitPriceForeign) * parseFloat(exchangeRate),
            dutyRate: parseFloat(item.dutyRate),
            dutyAmount: (parseFloat(item.quantity) * parseFloat(item.unitPriceForeign) * parseFloat(exchangeRate) * parseFloat(item.dutyRate)) / 100,
            countryOfOrigin: item.countryOfOrigin,
            lotNumber: item.lotNumber || null,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          })),
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            material: true,
            hsCode: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: bc20Document,
      message: 'BC 2.0 document created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating BC 2.0 document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create BC 2.0 document' },
      { status: 500 }
    );
  }
}
