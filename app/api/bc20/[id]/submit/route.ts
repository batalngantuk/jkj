import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDualBilling, calculateTaxDueDate } from '@/lib/bc20/calculations';

/**
 * POST /api/bc20/[id]/submit
 * Submit BC 2.0 document and generate dual billing
 *
 * This will:
 * 1. Change status to SUBMITTED
 * 2. Generate PIB document number
 * 3. Create two AP bills:
 *    - Vendor Bill (CIF payment)
 *    - Tax Bill (Bea Masuk + PPN + PPh22)
 * 4. Set tax payment due date
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { documentNumber, submittedBy } = body;

    // Validate required fields
    if (!documentNumber || !submittedBy) {
      return NextResponse.json(
        { success: false, error: 'Document number and submittedBy are required' },
        { status: 400 }
      );
    }

    // Get BC 2.0 document
    const bc20Doc = await prisma.bC20Document.findUnique({
      where: { id },
      include: {
        supplier: true,
      },
    });

    if (!bc20Doc) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 document not found' },
        { status: 404 }
      );
    }

    // Only DRAFT documents can be submitted
    if (bc20Doc.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'Only DRAFT documents can be submitted' },
        { status: 400 }
      );
    }

    // Check if document number already exists
    const existingDoc = await prisma.bC20Document.findFirst({
      where: {
        documentNumber,
        id: { not: id },
      },
    });

    if (existingDoc) {
      return NextResponse.json(
        { success: false, error: 'Document number already exists' },
        { status: 400 }
      );
    }

    // Calculate dual billing amounts
    const dualBilling = calculateDualBilling(
      parseFloat(bc20Doc.cifIdr.toString()),
      parseFloat(bc20Doc.beaMasuk.toString()),
      parseFloat(bc20Doc.ppnImport.toString()),
      parseFloat(bc20Doc.pph22.toString())
    );

    const now = new Date();
    const taxDueDate = calculateTaxDueDate(now, 7);

    // Create bills and update BC 2.0 in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Vendor Bill (CIF payment)
      const vendorBill = await tx.aPBill.create({
        data: {
          billNumber: `VB-${documentNumber}`,
          billDate: now,
          dueDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'PENDING',
          supplierId: bc20Doc.supplierId,
          billType: 'VENDOR_PAYMENT',
          description: `Vendor payment for BC 2.0 ${documentNumber} - CIF value`,
          currency: 'IDR',
          amount: dualBilling.vendorBillAmount,
          remainingAmount: dualBilling.vendorBillAmount,
          createdBy: submittedBy,
        },
      });

      // 2. Create Tax Bill (Bea Masuk + PPN + PPh22)
      const taxBill = await tx.aPBill.create({
        data: {
          billNumber: `TB-${documentNumber}`,
          billDate: now,
          dueDate: taxDueDate,
          status: 'PENDING',
          supplierId: bc20Doc.supplierId, // Using same supplier for tracking, but payment goes to customs
          billType: 'TAX_PAYMENT',
          description: `Tax payment for BC 2.0 ${documentNumber} - Import duties and taxes`,
          currency: 'IDR',
          amount: dualBilling.taxBillAmount,
          remainingAmount: dualBilling.taxBillAmount,
          taxType: 'Import Duties (Bea Masuk + PPN + PPh 22)',
          taxReference: documentNumber,
          createdBy: submittedBy,
        },
      });

      // 3. Update BC 2.0 document
      const updatedBC20 = await tx.bC20Document.update({
        where: { id },
        data: {
          documentNumber,
          status: 'SUBMITTED',
          submittedAt: now,
          submittedBy,
          vendorBillId: vendorBill.id,
          taxBillId: taxBill.id,
        },
        include: {
          supplier: true,
          items: {
            include: {
              material: true,
              hsCode: true,
            },
          },
          vendorBill: true,
          taxBill: true,
        },
      });

      return {
        bc20Document: updatedBC20,
        vendorBill,
        taxBill,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'BC 2.0 document submitted successfully. Dual billing created.',
    });
  } catch (error) {
    console.error('Error submitting BC 2.0 document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit BC 2.0 document' },
      { status: 500 }
    );
  }
}
