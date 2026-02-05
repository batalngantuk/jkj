export interface InventoryItem {
  id: string
  code: string
  name: string
  category: 'Raw Material' | 'Work in Progress' | 'Finished Goods' | 'Spare Part'
  quantity: number
  unit: string
  location: string
  minStock: number
  maxStock: number
  status: 'In Stock' | 'Low Stock' | 'Critical' | 'Overstock'
  value: number
  lastUpdated: string
}

export interface StockTransaction {
  id: string
  date: string
  type: 'IN' | 'OUT' | 'ADJUSTMENT'
  refNumber: string // PO or SO or WO number
  itemId: string
  quantity: number
  user: string
  notes?: string
}

export const MOCK_INVENTORY: InventoryItem[] = [
  // Raw Materials
  {
    id: 'INV-001',
    code: 'RM-LATEX',
    name: 'Natural Rubber Latex',
    category: 'Raw Material',
    quantity: 15000,
    unit: 'kg',
    location: 'Tank A1',
    minStock: 5000,
    maxStock: 30000,
    status: 'In Stock',
    value: 50000000,
    lastUpdated: '2026-02-05 08:00'
  },
  {
    id: 'INV-002',
    code: 'RM-NITRILE',
    name: 'Nitrile Latex Compound',
    category: 'Raw Material',
    quantity: 3000,
    unit: 'kg',
    location: 'Tank B1',
    minStock: 4000,
    maxStock: 20000,
    status: 'Low Stock',
    value: 12000000,
    lastUpdated: '2026-02-05 09:30'
  },
  {
    id: 'INV-003',
    code: 'RM-SULFUR',
    name: 'Sulfur Dispersion',
    category: 'Raw Material',
    quantity: 500,
    unit: 'kg',
    location: 'Rack R-01',
    minStock: 1000,
    maxStock: 5000,
    status: 'Critical',
    value: 2000000,
    lastUpdated: '2026-02-04 14:00'
  },
  // Packaging
  {
    id: 'INV-004',
    code: 'PKG-BOX-S',
    name: 'Inner Box Size S',
    category: 'Raw Material',
    quantity: 25000,
    unit: 'pcs',
    location: 'Whse B-01',
    minStock: 10000,
    maxStock: 50000,
    status: 'In Stock',
    value: 15000000,
    lastUpdated: '2026-02-01'
  },
  // Finished Goods
  {
    id: 'INV-FG-001',
    code: 'FG-LATEX-S',
    name: 'Latex Glove Size S',
    category: 'Finished Goods',
    quantity: 2000,
    unit: 'ctn',
    location: 'FG Zone A',
    minStock: 500,
    maxStock: 5000,
    status: 'In Stock',
    value: 100000000,
    lastUpdated: '2026-02-05 11:00'
  },
  {
    id: 'INV-FG-002',
    code: 'FG-NITRILE-M',
    name: 'Nitrile Glove Size M',
    category: 'Finished Goods',
    quantity: 4500,
    unit: 'ctn',
    location: 'FG Zone B',
    minStock: 1000,
    maxStock: 10000,
    status: 'In Stock',
    value: 250000000,
    lastUpdated: '2026-02-05 10:15'
  }
]

export const MOCK_TRANSACTIONS: StockTransaction[] = [
  { id: 'TRX-001', date: '2026-02-05 10:00', type: 'IN', refNumber: 'PO-2026-001', itemId: 'INV-001', quantity: 5000, user: 'Warehouse Admin', notes: 'Received from Supplier A' },
  { id: 'TRX-002', date: '2026-02-05 11:30', type: 'OUT', refNumber: 'WO-2026-001', itemId: 'INV-001', quantity: 1500, user: 'Production Staff', notes: 'Issued to Production Line 1' },
  { id: 'TRX-003', date: '2026-02-05 14:00', type: 'IN', refNumber: 'WO-2026-003', itemId: 'INV-FG-002', quantity: 200, user: 'QC Admin', notes: 'Production Result' },
  { id: 'TRX-004', date: '2026-02-04 16:00', type: 'OUT', refNumber: 'SO-2026-002', itemId: 'INV-FG-001', quantity: 100, user: 'Logistics Staff', notes: 'Shipment to Customer X' },
]
