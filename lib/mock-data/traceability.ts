// Traceability data linking BC 2.3 → GR → WO → FG → BC 3.0

export interface TraceabilityRecord {
  id: string
  // Raw Material
  bc23Id: string
  bc23Number: string
  rmLotNumber: string
  rmDescription: string
  rmQuantity: number
  rmUnit: string
  
  // Goods Receipt
  grId: string
  grNumber: string
  grDate: string
  poNumber: string
  
  // Production
  woId: string
  woNumber: string
  productName: string
  fgLotNumber: string
  fgQuantity: number
  fgUnit: string
  productionDate: string
  
  // Conversion
  conversionRatio: number // FG output / RM input
  standardRatio: number
  variance: number // %
  waste: number
  
  // Export (if applicable)
  bc30Id?: string
  bc30Number?: string
  exportDate?: string
  exportQuantity?: number
}

export const MOCK_TRACEABILITY: TraceabilityRecord[] = [
  {
    id: 'TRACE-001',
    // BC 2.3 Import
    bc23Id: 'bc23-001',
    bc23Number: 'BC23-2026-001234',
    rmLotNumber: 'RM-2026-001',
    rmDescription: 'Steel Brackets for Industrial Use',
    rmQuantity: 5000,
    rmUnit: 'PCS',
    
    // Goods Receipt
    grId: 'gr-001',
    grNumber: 'GR-2026-001',
    grDate: '2026-01-20',
    poNumber: 'PO-2026-001',
    
    // Production
    woId: 'wo-001',
    woNumber: 'WO-2026-001',
    productName: 'Steel Component Assembly',
    fgLotNumber: 'FG-2026-001',
    fgQuantity: 4500,
    fgUnit: 'PCS',
    productionDate: '2026-01-25',
    
    // Conversion
    conversionRatio: 0.90, // 4500/5000
    standardRatio: 0.92,
    variance: -2.17, // (0.90-0.92)/0.92 * 100
    waste: 500,
    
    // Export
    bc30Id: 'bc30-001',
    bc30Number: 'BC30-2026-005678',
    exportDate: '2026-01-30',
    exportQuantity: 4500
  },
  {
    id: 'TRACE-002',
    // BC 2.3 Import
    bc23Id: 'bc23-002',
    bc23Number: 'BC23-2026-001567',
    rmLotNumber: 'RM-2026-002',
    rmDescription: 'Polyethylene Resin - HDPE Grade',
    rmQuantity: 10000,
    rmUnit: 'KG',
    
    // Goods Receipt
    grId: 'gr-002',
    grNumber: 'GR-2026-002',
    grDate: '2026-01-28',
    poNumber: 'PO-2026-002',
    
    // Production
    woId: 'wo-002',
    woNumber: 'WO-2026-002',
    productName: 'Polymer Products - Custom Grade',
    fgLotNumber: 'FG-2026-002',
    fgQuantity: 8000,
    fgUnit: 'KG',
    productionDate: '2026-02-02',
    
    // Conversion
    conversionRatio: 0.80,
    standardRatio: 0.85,
    variance: -5.88,
    waste: 2000,
    
    // Export
    bc30Id: 'bc30-002',
    bc30Number: 'BC30-2026-006123',
    exportDate: '2026-02-05',
    exportQuantity: 8000
  },
  {
    id: 'TRACE-003',
    // BC 2.3 Import
    bc23Id: 'bc23-003',
    bc23Number: 'BC23-2026-001890',
    rmLotNumber: 'RM-2026-003',
    rmDescription: 'Industrial Ball Valves 2 inch',
    rmQuantity: 200,
    rmUnit: 'PCS',
    
    // Goods Receipt
    grId: 'gr-003',
    grNumber: 'GR-2026-003',
    grDate: '2026-02-05',
    poNumber: 'PO-2026-005',
    
    // Production
    woId: 'wo-003',
    woNumber: 'WO-2026-003',
    productName: 'Valve Assembly Units',
    fgLotNumber: 'FG-2026-003',
    fgQuantity: 195,
    fgUnit: 'PCS',
    productionDate: '2026-02-06',
    
    // Conversion
    conversionRatio: 0.975,
    standardRatio: 0.98,
    variance: -0.51,
    waste: 5
    
    // No export yet
  }
]

// Helper functions
export function getTraceabilityByBC23(bc23Id: string) {
  return MOCK_TRACEABILITY.filter(t => t.bc23Id === bc23Id)
}

export function getTraceabilityByBC30(bc30Id: string) {
  return MOCK_TRACEABILITY.filter(t => t.bc30Id === bc30Id)
}

export function getTraceabilityByWO(woId: string) {
  return MOCK_TRACEABILITY.find(t => t.woId === woId)
}

export function getTraceabilityByLot(lotNumber: string) {
  return MOCK_TRACEABILITY.find(t => 
    t.rmLotNumber === lotNumber || t.fgLotNumber === lotNumber
  )
}
