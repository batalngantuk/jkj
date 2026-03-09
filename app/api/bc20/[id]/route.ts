import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateBC20Duties } from '@/lib/bc20/calculations';

/**
 * GET /api/bc20/[id]
 * Get a single BC 2.0 document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const bc20Document = await prisma.bC20Document.findUnique({
      where: { id },
      include: {
        supplier: true,
        purchaseOrder: {
          include: {
            items: {
              include: {
                material: true,
              },
            },
          },
        },
        items: {
          include: {
            material: true,
            hsCode: true,
          },
          orderBy: {
            lineNumber: 'asc',
          },
        },
        vendorBill: true,
        taxBill: true,
        goodsReceipts: {
          include: {
            items: {
              include: {
                material: true,
              },
            },
          },
        },
      },
    });

    if (!bc20Document) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bc20Document,
    });
  } catch (error) {
    console.error('Error fetching BC 2.0 document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch BC 2.0 document' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/bc20/[id]
 * Update a BC 2.0 document
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if document exists and can be modified
    const existingDoc = await prisma.bC20Document.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 document not found' },
        { status: 404 }
      );
    }

    // Only DRAFT documents can be fully edited
    if (existingDoc.status !== 'DRAFT' && body.items) {
      return NextResponse.json(
        { success: false, error: 'Cannot modify items of submitted documents' },
        { status: 400 }
      );
    }

    const {
      cifValue,
      exchangeRate,
      freightCost,
      insuranceCost,
      handlingCost,
      otherCosts,
      items,
      updatedBy,
      ...otherFields
    } = body;

    let updateData: any = {
      ...otherFields,
      updatedBy,
    };

    // If financial fields are changed, recalculate
    if (cifValue || exchangeRate || freightCost || insuranceCost || handlingCost || otherCosts || items) {
      const calculations = calculateBC20Duties({
        cifValue: parseFloat(cifValue || existingDoc.cifValue.toString()),
        exchangeRate: parseFloat(exchangeRate || existingDoc.exchangeRate.toString()),
        freightCost: parseFloat(freightCost ?? existingDoc.freightCost.toString()),
        insuranceCost: parseFloat(insuranceCost ?? existingDoc.insuranceCost.toString()),
        handlingCost: parseFloat(handlingCost ?? existingDoc.handlingCost.toString()),
        otherCosts: parseFloat(otherCosts ?? existingDoc.otherCosts.toString()),
        items: items ? items.map((item: any) => ({
          quantity: parseFloat(item.quantity),
          unitPriceForeign: parseFloat(item.unitPriceForeign),
          dutyRate: parseFloat(item.dutyRate),
        })) : [],
      });

      updateData = {
        ...updateData,
        cifValue: cifValue ? parseFloat(cifValue) : undefined,
        exchangeRate: exchangeRate ? parseFloat(exchangeRate) : undefined,
        cifIdr: calculations.cifIdr,
        beaMasuk: calculations.beaMasuk,
        ppnImport: calculations.ppnImport,
        pph22: calculations.pph22,
        totalTax: calculations.totalTax,
        freightCost: freightCost !== undefined ? parseFloat(freightCost) : undefined,
        insuranceCost: insuranceCost !== undefined ? parseFloat(insuranceCost) : undefined,
        handlingCost: handlingCost !== undefined ? parseFloat(handlingCost) : undefined,
        otherCosts: otherCosts !== undefined ? parseFloat(otherCosts) : undefined,
        totalLandedCost: calculations.totalLandedCost,
      };

      // Update items if provided
      if (items && existingDoc.status === 'DRAFT') {
        // Delete existing items and create new ones
        await prisma.bC20Item.deleteMany({
          where: { bc20DocumentId: id },
        });

        updateData.items = {
          create: items.map((item: any, index: number) => ({
            lineNumber: index + 1,
            materialId: item.materialId,
            hsCodeId: item.hsCodeId,
            description: item.description,
            quantity: parseFloat(item.quantity),
            unit: item.unit,
            unitPriceForeign: parseFloat(item.unitPriceForeign),
            totalPriceForeign: parseFloat(item.quantity) * parseFloat(item.unitPriceForeign),
            unitPriceIdr: parseFloat(item.unitPriceForeign) * parseFloat(exchangeRate || existingDoc.exchangeRate.toString()),
            totalPriceIdr: parseFloat(item.quantity) * parseFloat(item.unitPriceForeign) * parseFloat(exchangeRate || existingDoc.exchangeRate.toString()),
            dutyRate: parseFloat(item.dutyRate),
            dutyAmount: (parseFloat(item.quantity) * parseFloat(item.unitPriceForeign) * parseFloat(exchangeRate || existingDoc.exchangeRate.toString()) * parseFloat(item.dutyRate)) / 100,
            countryOfOrigin: item.countryOfOrigin,
            lotNumber: item.lotNumber || null,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          })),
        };
      }
    }

    // Update document
    const updatedDocument = await prisma.bC20Document.update({
      where: { id },
      data: updateData,
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
      data: updatedDocument,
      message: 'BC 2.0 document updated successfully',
    });
  } catch (error) {
    console.error('Error updating BC 2.0 document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update BC 2.0 document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bc20/[id]
 * Delete a BC 2.0 document (only DRAFT status)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if document exists
    const existingDoc = await prisma.bC20Document.findUnique({
      where: { id },
    });

    if (!existingDoc) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 document not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of DRAFT documents
    if (existingDoc.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete submitted documents' },
        { status: 400 }
      );
    }

    // Delete document (items will be cascade deleted)
    await prisma.bC20Document.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'BC 2.0 document deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting BC 2.0 document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete BC 2.0 document' },
      { status: 500 }
    );
  }
}
