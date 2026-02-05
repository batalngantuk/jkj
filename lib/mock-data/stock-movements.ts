// Stock Movement Report Mock Data for Bea Cukai Compliance

export interface StockMovement {
  id: string
  date: string
  materialCode: string
  materialName: string
  transactionType: 'OPENING' | 'IMPORT' | 'LOCAL_PURCHASE' | 'PRODUCTION_OUT' | 'EXPORT' | 'WASTE' | 'ADJUSTMENT' | 'RETURN'
  referenceType: 'BC23' | 'BC30' | 'WO' | 'PO' | 'SO' | 'ADJ' | 'NONE'
  referenceNumber: string
  lotNumber?: string
  quantityIn: number
  quantityOut: number
  unit: string
  runningBalance: number
  notes?: string
}

export interface StockMovementSummary {
  materialCode: string
  materialName: string
  unit: string
  openingBalance: number
  totalIn: number
  totalOut: number
  closingBalance: number
  // Breakdown
  importQty: number
  localPurchaseQty: number
  productionOutQty: number
  exportQty: number
  wasteQty: number
  adjustmentQty: number
}

// Mock Stock Movements for February 2026
export const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  // Steel Brackets - RM-2026-001
  {
    id: 'SM-001',
    date: '2026-02-01',
    materialCode: 'RM-STEEL-001',
    materialName: 'Steel Brackets for Industrial Use',
    transactionType: 'OPENING',
    referenceType: 'NONE',
    referenceNumber: '-',
    quantityIn: 1000,
    quantityOut: 0,
    unit: 'PCS',
    runningBalance: 1000,
    notes: 'Opening balance Feb 2026'
  },
  {
    id: 'SM-002',
    date: '2026-02-05',
    materialCode: 'RM-STEEL-001',
    materialName: 'Steel Brackets for Industrial Use',
    transactionType: 'IMPORT',
    referenceType: 'BC23',
    referenceNumber: 'BC23-2026-001234',
    lotNumber: 'RM-2026-001',
    quantityIn: 5000,
    quantityOut: 0,
    unit: 'PCS',
    runningBalance: 6000,
    notes: 'Import from Shanghai Metal Co.'
  },
  {
    id: 'SM-003',
    date: '2026-02-10',
    materialCode: 'RM-STEEL-001',
    materialName: 'Steel Brackets for Industrial Use',
    transactionType: 'PRODUCTION_OUT',
    referenceType: 'WO',
    referenceNumber: 'WO-2026-001',
    lotNumber: 'RM-2026-001',
    quantityIn: 0,
    quantityOut: 5000,
    unit: 'PCS',
    runningBalance: 1000,
    notes: 'Issued to production'
  },
  {
    id: 'SM-004',
    date: '2026-02-12',
    materialCode: 'RM-STEEL-001',
    materialName: 'Steel Brackets for Industrial Use',
    transactionType: 'WASTE',
    referenceType: 'WO',
    referenceNumber: 'WO-2026-001',
    quantityIn: 0,
    quantityOut: 500,
    unit: 'PCS',
    runningBalance: 500,
    notes: 'Production waste/scrap'
  },

  // Polyethylene Resin - RM-2026-002
  {
    id: 'SM-005',
    date: '2026-02-01',
    materialCode: 'RM-POLY-001',
    materialName: 'Polyethylene Resin - HDPE Grade',
    transactionType: 'OPENING',
    referenceType: 'NONE',
    referenceNumber: '-',
    quantityIn: 2000,
    quantityOut: 0,
    unit: 'KG',
    runningBalance: 2000,
    notes: 'Opening balance Feb 2026'
  },
  {
    id: 'SM-006',
    date: '2026-02-08',
    materialCode: 'RM-POLY-001',
    materialName: 'Polyethylene Resin - HDPE Grade',
    transactionType: 'IMPORT',
    referenceType: 'BC23',
    referenceNumber: 'BC23-2026-001567',
    lotNumber: 'RM-2026-002',
    quantityIn: 10000,
    quantityOut: 0,
    unit: 'KG',
    runningBalance: 12000,
    notes: 'Import from Taiwan Polymer'
  },
  {
    id: 'SM-007',
    date: '2026-02-15',
    materialCode: 'RM-POLY-001',
    materialName: 'Polyethylene Resin - HDPE Grade',
    transactionType: 'PRODUCTION_OUT',
    referenceType: 'WO',
    referenceNumber: 'WO-2026-002',
    lotNumber: 'RM-2026-002',
    quantityIn: 0,
    quantityOut: 10000,
    unit: 'KG',
    runningBalance: 2000,
    notes: 'Issued to production'
  },
  {
    id: 'SM-008',
    date: '2026-02-18',
    materialCode: 'RM-POLY-001',
    materialName: 'Polyethylene Resin - HDPE Grade',
    transactionType: 'WASTE',
    referenceType: 'WO',
    referenceNumber: 'WO-2026-002',
    quantityIn: 0,
    quantityOut: 2000,
    unit: 'KG',
    runningBalance: 0,
    notes: 'Production waste'
  },

  // Finished Goods - Steel Components
  {
    id: 'SM-009',
    date: '2026-02-01',
    materialCode: 'FG-STEEL-001',
    materialName: 'Steel Component Assembly',
    transactionType: 'OPENING',
    referenceType: 'NONE',
    referenceNumber: '-',
    quantityIn: 500,
    quantityOut: 0,
    unit: 'PCS',
    runningBalance: 500,
    notes: 'Opening balance Feb 2026'
  },
  {
    id: 'SM-010',
    date: '2026-02-12',
    materialCode: 'FG-STEEL-001',
    materialName: 'Steel Component Assembly',
    transactionType: 'PRODUCTION_OUT',
    referenceType: 'WO',
    referenceNumber: 'WO-2026-001',
    lotNumber: 'FG-2026-001',
    quantityIn: 4500,
    quantityOut: 0,
    unit: 'PCS',
    runningBalance: 5000,
    notes: 'Production output'
  },
  {
    id: 'SM-011',
    date: '2026-02-20',
    materialCode: 'FG-STEEL-001',
    materialName: 'Steel Component Assembly',
    transactionType: 'EXPORT',
    referenceType: 'BC30',
    referenceNumber: 'BC30-2026-005678',
    lotNumber: 'FG-2026-001',
    quantityIn: 0,
    quantityOut: 4500,
    unit: 'PCS',
    runningBalance: 500,
    notes: 'Export to Singapore'
  },

  // Finished Goods - Polymer Products
  {
    id: 'SM-012',
    date: '2026-02-01',
    materialCode: 'FG-POLY-001',
    materialName: 'Polymer Products - Custom Grade',
    transactionType: 'OPENING',
    referenceType: 'NONE',
    referenceNumber: '-',
    quantityIn: 1000,
    quantityOut: 0,
    unit: 'KG',
    runningBalance: 1000,
    notes: 'Opening balance Feb 2026'
  },
  {
    id: 'SM-013',
    date: '2026-02-18',
    materialCode: 'FG-POLY-001',
    materialName: 'Polymer Products - Custom Grade',
    transactionType: 'PRODUCTION_OUT',
    referenceType: 'WO',
    referenceNumber: 'WO-2026-002',
    lotNumber: 'FG-2026-002',
    quantityIn: 8000,
    quantityOut: 0,
    unit: 'KG',
    runningBalance: 9000,
    notes: 'Production output'
  },
  {
    id: 'SM-014',
    date: '2026-02-25',
    materialCode: 'FG-POLY-001',
    materialName: 'Polymer Products - Custom Grade',
    transactionType: 'EXPORT',
    referenceType: 'BC30',
    referenceNumber: 'BC30-2026-006123',
    lotNumber: 'FG-2026-002',
    quantityIn: 0,
    quantityOut: 8000,
    unit: 'KG',
    runningBalance: 1000,
    notes: 'Export to Malaysia'
  }
]

// Helper function to generate summary
export function generateStockMovementSummary(
  movements: StockMovement[],
  materialCode?: string
): StockMovementSummary[] {
  const materialGroups = new Map<string, StockMovement[]>()
  
  movements.forEach(movement => {
    if (materialCode && movement.materialCode !== materialCode) return
    
    if (!materialGroups.has(movement.materialCode)) {
      materialGroups.set(movement.materialCode, [])
    }
    materialGroups.get(movement.materialCode)!.push(movement)
  })
  
  const summaries: StockMovementSummary[] = []
  
  materialGroups.forEach((movs, code) => {
    const opening = movs.find(m => m.transactionType === 'OPENING')
    const materialName = movs[0].materialName
    const unit = movs[0].unit
    
    const summary: StockMovementSummary = {
      materialCode: code,
      materialName,
      unit,
      openingBalance: opening?.quantityIn || 0,
      totalIn: 0,
      totalOut: 0,
      closingBalance: 0,
      importQty: 0,
      localPurchaseQty: 0,
      productionOutQty: 0,
      exportQty: 0,
      wasteQty: 0,
      adjustmentQty: 0
    }
    
    movs.forEach(m => {
      if (m.transactionType !== 'OPENING') {
        summary.totalIn += m.quantityIn
        summary.totalOut += m.quantityOut
      }
      
      switch (m.transactionType) {
        case 'IMPORT':
          summary.importQty += m.quantityIn
          break
        case 'LOCAL_PURCHASE':
          summary.localPurchaseQty += m.quantityIn
          break
        case 'PRODUCTION_OUT':
          if (m.quantityIn > 0) summary.productionOutQty += m.quantityIn
          else summary.productionOutQty += m.quantityOut
          break
        case 'EXPORT':
          summary.exportQty += m.quantityOut
          break
        case 'WASTE':
          summary.wasteQty += m.quantityOut
          break
        case 'ADJUSTMENT':
          summary.adjustmentQty += (m.quantityIn - m.quantityOut)
          break
      }
    })
    
    summary.closingBalance = summary.openingBalance + summary.totalIn - summary.totalOut
    summaries.push(summary)
  })
  
  return summaries
}

// Get movements by material
export function getMovementsByMaterial(materialCode: string) {
  return MOCK_STOCK_MOVEMENTS.filter(m => m.materialCode === materialCode)
}

// Get movements by period
export function getMovementsByPeriod(startDate: string, endDate: string) {
  return MOCK_STOCK_MOVEMENTS.filter(m => m.date >= startDate && m.date <= endDate)
}
