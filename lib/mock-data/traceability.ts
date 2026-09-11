// Traceability data linking BC 2.0 → GR → WO → FG → PEB

export interface MaterialUsed {
  materialCode: string
  materialName: string
  qtyUsed: number
  unit: string
  unitCost: number      // Rp per unit
  totalCost: number
  poNumber: string
  supplier: string
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID'
}

export interface TraceabilityRecord {
  id: string
  // Raw Material (main)
  bc20Id: string
  bc20Number: string
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

  // Materials detail (all RM consumed for this WO)
  materialsUsed: MaterialUsed[]

  // Conversion
  conversionRatio: number
  standardRatio: number
  variance: number
  waste: number

  // Export (if applicable)
  pebId?: string
  pebNumber?: string
  exportDate?: string
  exportQuantity?: number
}

export const MOCK_TRACEABILITY: TraceabilityRecord[] = [
  {
    id: 'TRACE-001',
    bc20Id: 'bc20-001',
    bc20Number: 'PIB-2026-001234',
    rmLotNumber: 'RM-2026-001',
    rmDescription: 'Natural Rubber Latex',
    rmQuantity: 5000,
    rmUnit: 'kg',

    grId: 'gr-001',
    grNumber: 'GR-2026-001',
    grDate: '2026-01-20',
    poNumber: 'PO-2026-001',

    woId: 'WO-2026-001',
    woNumber: 'WO-2026-001',
    productName: 'Latex Gloves Size M',
    fgLotNumber: 'FG-2026-001',
    fgQuantity: 1000,
    fgUnit: 'ctn',
    productionDate: '2026-01-25',

    materialsUsed: [
      { materialCode: 'RM-LATEX',   materialName: 'Natural Rubber Latex', qtyUsed: 5000, unit: 'kg',  unitCost: 15000, totalCost: 75000000,  poNumber: 'PO-2026-001', supplier: 'PT. Agro Latex Indonesia', paymentStatus: 'UNPAID' },
      { materialCode: 'RM-SULFUR',  materialName: 'Sulfur Dispersion',    qtyUsed: 100,  unit: 'kg',  unitCost: 25000, totalCost: 2500000,   poNumber: 'PO-2026-002', supplier: 'Global Chemicals Ltd',     paymentStatus: 'UNPAID' },
      { materialCode: 'RM-ZINC',    materialName: 'Zinc Oxide',           qtyUsed: 200,  unit: 'kg',  unitCost: 45000, totalCost: 9000000,   poNumber: 'PO-2026-002', supplier: 'Global Chemicals Ltd',     paymentStatus: 'UNPAID' },
      { materialCode: 'PKG-BOX-S',  materialName: 'Inner Box Size S',     qtyUsed: 1000, unit: 'pcs', unitCost: 1200,  totalCost: 1200000,   poNumber: 'PO-2026-003', supplier: 'Indo Box Packaging',       paymentStatus: 'PAID'   },
    ],

    conversionRatio: 0.20,
    standardRatio: 0.21,
    variance: -4.76,
    waste: 100,

    pebId: 'peb-001',
    pebNumber: 'PEB-2026-001',
    exportDate: '2026-01-30',
    exportQuantity: 1000
  },
  {
    id: 'TRACE-002',
    bc20Id: 'bc20-002',
    bc20Number: 'PIB-2026-001567',
    rmLotNumber: 'RM-2026-002',
    rmDescription: 'Natural Rubber Latex',
    rmQuantity: 10000,
    rmUnit: 'kg',

    grId: 'gr-002',
    grNumber: 'GR-2026-002',
    grDate: '2026-01-28',
    poNumber: 'PO-2026-001',

    woId: 'WO-2026-002',
    woNumber: 'WO-2026-002',
    productName: 'Latex Gloves Size S',
    fgLotNumber: 'FG-2026-002',
    fgQuantity: 2000,
    fgUnit: 'ctn',
    productionDate: '2026-02-10',

    materialsUsed: [
      { materialCode: 'RM-LATEX',   materialName: 'Natural Rubber Latex', qtyUsed: 10000, unit: 'kg',  unitCost: 15000, totalCost: 150000000, poNumber: 'PO-2026-001', supplier: 'PT. Agro Latex Indonesia', paymentStatus: 'UNPAID' },
      { materialCode: 'RM-SULFUR',  materialName: 'Sulfur Dispersion',    qtyUsed: 200,   unit: 'kg',  unitCost: 25000, totalCost: 5000000,   poNumber: 'PO-2026-002', supplier: 'Global Chemicals Ltd',     paymentStatus: 'UNPAID' },
      { materialCode: 'RM-ZINC',    materialName: 'Zinc Oxide',           qtyUsed: 400,   unit: 'kg',  unitCost: 45000, totalCost: 18000000,  poNumber: 'PO-2026-002', supplier: 'Global Chemicals Ltd',     paymentStatus: 'UNPAID' },
      { materialCode: 'PKG-BOX-S',  materialName: 'Inner Box Size S',     qtyUsed: 2000,  unit: 'pcs', unitCost: 1200,  totalCost: 2400000,   poNumber: 'PO-2026-003', supplier: 'Indo Box Packaging',       paymentStatus: 'PAID'   },
    ],

    conversionRatio: 0.20,
    standardRatio: 0.21,
    variance: -4.76,
    waste: 200,

    pebId: 'peb-002',
    pebNumber: 'PEB-2026-002',
    exportDate: '2026-02-15',
    exportQuantity: 2000
  },
  {
    id: 'TRACE-003',
    bc20Id: 'bc20-003',
    bc20Number: 'PIB-2026-001890',
    rmLotNumber: 'RM-2026-003',
    rmDescription: 'Nitrile Latex',
    rmQuantity: 12500,
    rmUnit: 'kg',

    grId: 'gr-003',
    grNumber: 'GR-2026-003',
    grDate: '2026-02-03',
    poNumber: 'PO-2026-004',

    woId: 'WO-2026-003',
    woNumber: 'WO-2026-003',
    productName: 'Nitrile Gloves Size S',
    fgLotNumber: 'FG-2026-003',
    fgQuantity: 2500,
    fgUnit: 'ctn',
    productionDate: '2026-02-04',

    materialsUsed: [
      { materialCode: 'RM-NITRILE', materialName: 'Nitrile Latex',     qtyUsed: 12500, unit: 'kg',  unitCost: 18000, totalCost: 225000000, poNumber: 'PO-2026-004', supplier: 'Global Chemicals Ltd', paymentStatus: 'PARTIAL' },
      { materialCode: 'RM-SULFUR',  materialName: 'Sulfur Dispersion', qtyUsed: 250,   unit: 'kg',  unitCost: 25000, totalCost: 6250000,   poNumber: 'PO-2026-002', supplier: 'Global Chemicals Ltd', paymentStatus: 'UNPAID'  },
      { materialCode: 'PKG-BOX-S',  materialName: 'Inner Box Size S',  qtyUsed: 2500,  unit: 'pcs', unitCost: 1200,  totalCost: 3000000,   poNumber: 'PO-2026-003', supplier: 'Indo Box Packaging',  paymentStatus: 'PAID'    },
    ],

    conversionRatio: 0.20,
    standardRatio: 0.21,
    variance: -4.76,
    waste: 125,

    // Domestic sales, no PEB yet
  }
]

// Helper functions
export function getTraceabilityByBC20(bc20Id: string) {
  return MOCK_TRACEABILITY.filter(t => t.bc20Id === bc20Id)
}

export function getTraceabilityByPEB(pebId: string) {
  return MOCK_TRACEABILITY.filter(t => t.pebId === pebId)
}

export function getTraceabilityByWO(woId: string) {
  return MOCK_TRACEABILITY.find(t => t.woId === woId)
}

export function getTraceabilityByLot(lotNumber: string) {
  return MOCK_TRACEABILITY.find(t =>
    t.rmLotNumber === lotNumber || t.fgLotNumber === lotNumber
  )
}

// New helpers for material usage features
export function getTracesByMaterial(materialCode: string) {
  return MOCK_TRACEABILITY.filter(t =>
    t.materialsUsed.some(m => m.materialCode === materialCode)
  )
}

export function getAllMaterials() {
  const map = new Map<string, { code: string; name: string }>()
  for (const t of MOCK_TRACEABILITY) {
    for (const m of t.materialsUsed) {
      if (!map.has(m.materialCode)) map.set(m.materialCode, { code: m.materialCode, name: m.materialName })
    }
  }
  return Array.from(map.values())
}
