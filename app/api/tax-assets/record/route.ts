import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  prepareTaxAssetRecords,
  validateTaxAssetData,
} from '@/lib/bc20/tax-assets'

/**
 * POST /api/tax-assets/record
 *
 * Record tax assets (PPN Import & PPh 22) from BC 2.0 import
 *
 * This endpoint is called when goods receipt is completed to create
 * prepaid tax asset records that can be credited against future tax liabilities.
 *
 * Tax Assets:
 * - PPN Import (11%): Can offset PPN Keluaran (monthly reconciliation)
 * - PPh 22 (2.5%): Can credit against annual corporate income tax
 *
 * IMPORTANT: These are NOT expenses and NOT part of inventory cost!
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bc20Id,
      bc20Number,
      ppnAmount,
      pph22Amount,
      grId,
      grNumber,
      recordedBy,
    } = body

    // Validate required fields
    if (!bc20Id || !bc20Number) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 ID and number are required' },
        { status: 400 }
      )
    }

    if (!ppnAmount && !pph22Amount) {
      return NextResponse.json(
        { success: false, error: 'At least one tax amount (PPN or PPh 22) is required' },
        { status: 400 }
      )
    }

    // Get BC 2.0 document to verify
    const bc20Doc = await prisma.bC20Document.findUnique({
      where: { id: bc20Id },
    })

    if (!bc20Doc) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 document not found' },
        { status: 404 }
      )
    }

    // Check if tax assets already recorded for this BC 2.0
    const existingAssets = await prisma.taxAsset.findFirst({
      where: {
        bc20Id,
      },
    })

    if (existingAssets) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tax assets already recorded for this BC 2.0 document',
          details: {
            bc20Number: bc20Doc.documentNumber,
            message: 'Tax assets can only be recorded once per import',
          },
        },
        { status: 400 }
      )
    }

    // Prepare tax asset records
    const taxAssetRecords = prepareTaxAssetRecords(
      bc20Id,
      bc20Number || bc20Doc.documentNumber,
      parseFloat(ppnAmount?.toString() || '0'),
      parseFloat(pph22Amount?.toString() || '0'),
      grId,
      grNumber
    )

    // Validate each tax asset
    for (const record of taxAssetRecords) {
      const validation = validateTaxAssetData(record)
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid tax asset data',
            details: validation.errors,
          },
          { status: 400 }
        )
      }
    }

    // Create tax asset records in database
    const createdAssets = await prisma.$transaction(async (tx) => {
      const assets = []

      for (const record of taxAssetRecords) {
        const asset = await tx.taxAsset.create({
          data: {
            bc20Id: record.bc20Id,
            type: record.type,
            amount: record.amount,
            amountUsed: record.amountUsed,
            amountRemaining: record.amountRemaining,
            period: record.period,
            fiscalYear: record.fiscalYear,
            status: record.status,
            recordedDate: record.recordedDate,
            createdBy: recordedBy || 'system',
          },
        })
        assets.push(asset)
      }

      return assets
    })

    return NextResponse.json({
      success: true,
      message: 'Tax assets recorded successfully',
      data: {
        bc20Id,
        bc20Number: bc20Doc.documentNumber,
        taxAssets: createdAssets.map((asset) => ({
          id: asset.id,
          type: asset.type,
          amount: asset.amount,
          amountRemaining: asset.amountRemaining,
          status: asset.status,
          period: asset.period,
          fiscalYear: asset.fiscalYear,
        })),
        summary: {
          ppnImport: createdAssets
            .filter((a) => a.type === 'PPN_IMPORT')
            .reduce((sum, a) => sum + parseFloat(a.amount.toString()), 0),
          pph22Import: createdAssets
            .filter((a) => a.type === 'PPH22_IMPORT')
            .reduce((sum, a) => sum + parseFloat(a.amount.toString()), 0),
          totalTaxAssets: createdAssets.reduce(
            (sum, a) => sum + parseFloat(a.amount.toString()),
            0
          ),
        },
        notes: [
          'Tax assets recorded as prepaid tax',
          'PPN can be credited against monthly PPN Keluaran',
          'PPh 22 can be credited against annual corporate income tax',
          'These are NOT expenses and NOT part of inventory cost',
        ],
      },
    })
  } catch (error) {
    console.error('Error recording tax assets:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to record tax assets',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
