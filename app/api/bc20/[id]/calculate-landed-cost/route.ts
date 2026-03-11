import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  calculateLandedCost,
  validateLandedCostComponents,
  type LandedCostComponents,
} from '@/lib/bc20/landed-cost'

/**
 * POST /api/bc20/[id]/calculate-landed-cost
 *
 * Calculate landed cost for BC 2.0 import with additional costs
 *
 * This endpoint is called during goods receipt to calculate final landed cost
 * including all additional costs that occur after customs clearance:
 * - Domestic freight (port to warehouse)
 * - Handling fees
 * - Customs broker fees
 * - Port charges
 * - Unloading costs
 * - Quarantine/fumigation fees
 * - Other direct costs
 *
 * The landed cost will be capitalized to inventory.
 * Tax assets (PPN & PPh 22) are tracked separately, NOT in inventory cost.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      quantity,
      domesticFreight = 0,
      handlingFees = 0,
      customsBrokerFee = 0,
      portCharges = 0,
      unloadingCost = 0,
      quarantineFee = 0,
      fumigationFee = 0,
      otherCosts = 0,
    } = body

    // Get BC 2.0 document with all cost information
    const bc20Doc = await prisma.bC20Document.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })

    if (!bc20Doc) {
      return NextResponse.json(
        { success: false, error: 'BC 2.0 document not found' },
        { status: 404 }
      )
    }

    // Validate BC 2.0 status
    if (bc20Doc.status !== 'CUSTOMS_RELEASED') {
      return NextResponse.json(
        {
          success: false,
          error: 'BC 2.0 must be customs released before calculating landed cost',
          details: {
            currentStatus: bc20Doc.status,
            requiredStatus: 'CUSTOMS_RELEASED',
          },
        },
        { status: 400 }
      )
    }

    // Get total quantity from BC 2.0 items if not provided
    const totalQuantity = quantity || bc20Doc.items.reduce((sum, item) => sum + parseFloat(item.quantity.toString()), 0)

    // Prepare landed cost components
    const components: LandedCostComponents = {
      cifValueIdr: parseFloat(bc20Doc.cifIdr?.toString() || '0'),
      beaMasuk: parseFloat(bc20Doc.totalBeaMasuk?.toString() || '0'),
      domesticFreight: parseFloat(domesticFreight.toString()),
      handlingFees: parseFloat(handlingFees.toString()),
      customsBrokerFee: parseFloat(customsBrokerFee.toString()),
      portCharges: parseFloat(portCharges.toString()),
      unloadingCost: parseFloat(unloadingCost.toString()),
      quarantineFee: parseFloat(quarantineFee.toString()),
      fumigationFee: parseFloat(fumigationFee.toString()),
      otherCosts: parseFloat(otherCosts.toString()),
      quantity: totalQuantity,
    }

    // Validate components
    const validation = validateLandedCostComponents(components)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid landed cost components',
          details: validation.errors,
        },
        { status: 400 }
      )
    }

    // Calculate landed cost
    const ppnImport = parseFloat(bc20Doc.totalPpnImport?.toString() || '0')
    const pph22Import = parseFloat(bc20Doc.totalPph22?.toString() || '0')

    const landedCostResult = calculateLandedCost(
      components,
      ppnImport,
      pph22Import
    )

    // Calculate variance from estimated landed cost (if exists)
    const estimatedLandedCost = parseFloat(bc20Doc.totalLandedCost?.toString() || '0')
    const variance = landedCostResult.totalLandedCost - estimatedLandedCost
    const variancePercentage = estimatedLandedCost > 0
      ? (variance / estimatedLandedCost) * 100
      : 0

    return NextResponse.json({
      success: true,
      data: {
        bc20Id: bc20Doc.id,
        documentNumber: bc20Doc.documentNumber,

        // Landed Cost Breakdown
        components: landedCostResult.components,

        // Totals
        totalLandedCost: landedCostResult.totalLandedCost,
        quantity: landedCostResult.quantity,
        unitLandedCost: landedCostResult.unitLandedCost,

        // Tax Assets (separate from inventory cost)
        taxAssets: landedCostResult.taxAssets,

        // Total Cash Outflow
        totalCashOutflow: landedCostResult.totalCashOutflow,

        // Variance Analysis
        variance: {
          estimated: estimatedLandedCost,
          actual: landedCostResult.totalLandedCost,
          variance,
          variancePercentage,
          isSignificant: Math.abs(variancePercentage) > 5,
          isOverBudget: variance > 0,
        },

        // Important Notes
        notes: [
          'Landed cost will be capitalized to inventory',
          'Unit cost for inventory valuation: ' + landedCostResult.unitLandedCost.toFixed(2),
          'PPN and PPh 22 are recorded as tax assets, NOT inventory cost',
          'Total cash outflow includes landed cost + tax assets',
        ],
      },
    })
  } catch (error) {
    console.error('Error calculating landed cost:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to calculate landed cost',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
