import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/bc20/[id]/pay-tax
 * Record tax payment for BC 2.0 document
 *
 * This will:
 * 1. Create AP Payment for tax bill
 * 2. Update tax bill status
 * 3. Update BC 2.0 tax payment status
 * 4. Create tax assets (PPN Import & PPh 22) if fully paid
 * 5. Allow customs clearance if tax is fully paid
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber,
      bankAccount,
      notes,
      createdBy,
    } = body;

    // Validate required fields
    if (!amount || !paymentDate || !paymentMethod || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    // Get BC 2.0 document with tax bill
    const bc20Doc = await prisma.bC20Document.findUnique({
      where: { id },
      include: {
        taxBill: {
          include: {
            payments: true,
          },
        },
      },
    });

    if (!bc20Doc) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 document not found' },
        { status: 404 }
      );
    }

    if (!bc20Doc.taxBillId || !bc20Doc.taxBill) {
      return NextResponse.json(
        { success: false, error: 'Tax bill not found. Submit BC 2.0 document first.' },
        { status: 400 }
      );
    }

    const taxBill = bc20Doc.taxBill;
    const paymentAmount = parseFloat(amount);

    // Validate payment amount
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Payment amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (paymentAmount > parseFloat(taxBill.remainingAmount.toString())) {
      return NextResponse.json(
        { success: false, error: 'Payment amount exceeds remaining balance' },
        { status: 400 }
      );
    }

    // Process payment in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create AP Payment
      const payment = await tx.aPPayment.create({
        data: {
          paymentNumber: `TP-${bc20Doc.documentNumber}-${Date.now()}`,
          paymentDate: new Date(paymentDate),
          billId: taxBill.id,
          amount: paymentAmount,
          paymentMethod,
          referenceNumber: referenceNumber || null,
          bankAccount: bankAccount || null,
          notes,
          createdBy,
        },
      });

      // 2. Update tax bill
      const newPaidAmount = parseFloat(taxBill.paidAmount.toString()) + paymentAmount;
      const newRemainingAmount = parseFloat(taxBill.amount.toString()) - newPaidAmount;
      const isFullyPaid = newRemainingAmount <= 0.01; // Allow for rounding

      const updatedTaxBill = await tx.aPBill.update({
        where: { id: taxBill.id },
        data: {
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemainingAmount),
          status: isFullyPaid ? 'PAID' : 'PARTIAL_PAID',
        },
      });

      // 3. Update BC 2.0 tax payment status
      let bc20Status = bc20Doc.status;
      let taxPaymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE' = isFullyPaid ? 'PAID' : 'PARTIAL';

      if (isFullyPaid) {
        bc20Status = 'TAX_PAID';
      }

      const updatedBC20 = await tx.bC20Document.update({
        where: { id },
        data: {
          taxPaymentStatus,
          taxPaymentDate: isFullyPaid ? new Date(paymentDate) : bc20Doc.taxPaymentDate,
          taxPaymentRef: isFullyPaid ? referenceNumber : bc20Doc.taxPaymentRef,
          status: bc20Status,
        },
      });

      // 4. Create tax assets if fully paid
      let ppnAsset = null;
      let pph22Asset = null;

      if (isFullyPaid) {
        // Create PPN Import asset (can offset output VAT)
        ppnAsset = await tx.taxAsset.create({
          data: {
            assetNumber: `PPN-${bc20Doc.documentNumber}`,
            assetDate: new Date(paymentDate),
            taxType: 'PPN_IMPORT',
            description: `PPN Import from BC 2.0 ${bc20Doc.documentNumber}`,
            bc20DocumentId: id,
            amount: parseFloat(bc20Doc.ppnImport.toString()),
            remainingAmount: parseFloat(bc20Doc.ppnImport.toString()),
            status: 'AVAILABLE',
            createdBy,
          },
        });

        // Create PPh 22 asset (prepaid income tax)
        pph22Asset = await tx.taxAsset.create({
          data: {
            assetNumber: `PPH22-${bc20Doc.documentNumber}`,
            assetDate: new Date(paymentDate),
            taxType: 'PPH_22',
            description: `PPh 22 prepayment from BC 2.0 ${bc20Doc.documentNumber}`,
            bc20DocumentId: id,
            amount: parseFloat(bc20Doc.pph22.toString()),
            remainingAmount: parseFloat(bc20Doc.pph22.toString()),
            status: 'AVAILABLE',
            expiryDate: new Date(new Date(paymentDate).getFullYear(), 11, 31), // End of tax year
            createdBy,
          },
        });
      }

      return {
        payment,
        taxBill: updatedTaxBill,
        bc20Document: updatedBC20,
        taxAssets: isFullyPaid ? { ppnAsset, pph22Asset } : null,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: result.taxAssets
        ? 'Tax payment recorded. Tax assets created. Customs clearance can proceed.'
        : 'Partial tax payment recorded.',
    });
  } catch (error) {
    console.error('Error recording tax payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record tax payment' },
      { status: 500 }
    );
  }
}
