export interface ProductionLine {
  id: string
  name: string
  status: 'Running' | 'Idle' | 'Maintenance' | 'Setup'
  currentWo?: string
  progress: number
  target: number
  completed: number
  operator: string
}

export interface WorkOrder {
  id: string
  soNumber: string // Link to Sales Order
  product: string
  quantity: number
  startDate: string
  endDate: string
  status: 'PLANNED' | 'IN PROGRESS' | 'QC INSPECTION' | 'COMPLETED' | 'ON HOLD'
  priority: 'Normal' | 'Urgent'
  line: string
  progress: number
  bomId: string
  history: Array<{
    date: string
    action: string
    user: string
    status: string
  }>
}

export interface BOMItem {
  id: string
  materialName: string
  code: string
  quantityPerUnit: number
  unit: string
  stockAvailable: number
}

export interface BillOfMaterials {
  id: string
  productId: string
  productName: string
  items: BOMItem[]
}

export const MOCK_PRODUCTION_LINES: ProductionLine[] = [
  { id: 'L1', name: 'Line A (Dipping)', status: 'Running', currentWo: 'WO-2026-001', progress: 85, target: 5000, completed: 4250, operator: 'Budi Santoso' },
  { id: 'L2', name: 'Line B (Dipping)', status: 'Setup', currentWo: 'WO-2026-003', progress: 0, target: 3000, completed: 0, operator: 'Agus Setiawan' },
  { id: 'L3', name: 'Line C (Packing)', status: 'Running', currentWo: 'WO-2026-002', progress: 45, target: 2000, completed: 900, operator: 'Siti Aminah' },
  { id: 'L4', name: 'Line D (Sterilization)', status: 'Idle', progress: 0, target: 0, completed: 0, operator: '-' },
]

export const MOCK_BOMS: BillOfMaterials[] = [
  {
    id: 'BOM-LATEX-M',
    productId: 'PROD-002',
    productName: 'Latex Size M',
    items: [
      { id: 'MAT-001', materialName: 'Natural Rubber Latex', code: 'RM-LATEX', quantityPerUnit: 0.005, unit: 'kg', stockAvailable: 5000 },
      { id: 'MAT-002', materialName: 'Sulfur Dispersion', code: 'RM-SULFUR', quantityPerUnit: 0.0001, unit: 'kg', stockAvailable: 200 },
      { id: 'MAT-003', materialName: 'Zinc Oxide', code: 'RM-ZINC', quantityPerUnit: 0.0002, unit: 'kg', stockAvailable: 300 },
      { id: 'MAT-004', materialName: 'Inner Box', code: 'PKG-BOX', quantityPerUnit: 1, unit: 'pc', stockAvailable: 10000 },
      { id: 'MAT-005', materialName: 'Carton Box', code: 'PKG-CARTON', quantityPerUnit: 0.001, unit: 'pc', stockAvailable: 2000 },
    ]
  },
  {
    id: 'BOM-NITRILE-L',
    productId: 'PROD-006',
    productName: 'Nitrile Size L',
    items: [
      { id: 'MAT-006', materialName: 'Nitrile Latex', code: 'RM-NITRILE', quantityPerUnit: 0.005, unit: 'kg', stockAvailable: 4000 },
      { id: 'MAT-002', materialName: 'Sulfur Dispersion', code: 'RM-SULFUR', quantityPerUnit: 0.0001, unit: 'kg', stockAvailable: 200 },
      { id: 'MAT-004', materialName: 'Inner Box', code: 'PKG-BOX', quantityPerUnit: 1, unit: 'pc', stockAvailable: 10000 },
    ]
  }
]

export const MOCK_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-2026-001',
    soNumber: 'SO-2026-001',
    product: 'Latex Size M',
    quantity: 1000, // cartons (each carton 1000pcs) -> 1,000,000 pcs
    startDate: '2026-02-05',
    endDate: '2026-02-10',
    status: 'IN PROGRESS',
    priority: 'Normal',
    line: 'Line A (Dipping)',
    progress: 45,
    bomId: 'BOM-LATEX-M',
    history: [
      { date: '2026-02-05 08:00', action: 'Created', user: 'System', status: 'PLANNED' },
      { date: '2026-02-05 09:00', action: 'Started', user: 'Production Mgr', status: 'IN PROGRESS' }
    ]
  },
  {
    id: 'WO-2026-002',
    soNumber: 'SO-2026-003',
    product: 'Latex Size S',
    quantity: 2000,
    startDate: '2026-02-06',
    endDate: '2026-02-15',
    status: 'PLANNED',
    priority: 'Urgent',
    line: 'Line B (Dipping)',
    progress: 0,
    bomId: 'BOM-LATEX-M',
    history: [
      { date: '2026-02-05 10:00', action: 'Created', user: 'System', status: 'PLANNED' }
    ]
  },
  {
    id: 'WO-2026-003',
    soNumber: 'SO-2026-006',
    product: 'Nitrile Size S',
    quantity: 2500,
    startDate: '2026-02-01',
    endDate: '2026-02-04',
    status: 'COMPLETED',
    priority: 'Normal',
    line: 'Line A (Dipping)',
    progress: 100,
    bomId: 'BOM-NITRILE-L',
    history: [
      { date: '2026-02-01 08:00', action: 'Created', user: 'System', status: 'PLANNED' },
      { date: '2026-02-01 09:00', action: 'Started', user: 'Production Mgr', status: 'IN PROGRESS' },
      { date: '2026-02-04 16:00', action: 'Completed', user: 'Production Mgr', status: 'COMPLETED' },
      { date: '2026-02-04 17:00', action: 'QC Passed', user: 'QC Admin', status: 'COMPLETED' }
    ]
  }
]
