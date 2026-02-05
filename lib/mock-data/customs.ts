// Mock data for Customs (Bea Cukai) - BC 2.3 and BC 3.0

export type BC23Status = 
  | 'DRAFT' 
  | 'SUBMITTED' 
  | 'UNDER REVIEW' 
  | 'QUERY' 
  | 'APPROVED' 
  | 'CLOSED'

export type BC30Status = 
  | 'DRAFT' 
  | 'VERIFIED' 
  | 'SUBMITTED' 
  | 'UNDER REVIEW' 
  | 'APPROVED' 
  | 'EXPORTED' 
  | 'CLOSED'

export interface HSCode {
  code: string
  description: string
  dutyRate: number // Bea Masuk %
  ppnRate: number // PPN %
  pph22Rate: number // PPh 22 %
}

export interface BC23Document {
  id: string
  bcNumber: string
  poId: string
  poNumber: string
  supplierId: string
  supplierName: string
  status: BC23Status
  submissionDate?: string
  approvalDate?: string
  sppbNumber?: string // Surat Persetujuan Pengeluaran Barang
  
  // Goods Details
  hsCode: string
  goodsDescription: string
  quantity: number
  unit: string
  cifValue: number // Cost, Insurance, Freight
  currency: string
  countryOfOrigin: string
  
  // Duty Calculations
  dutyAmount: number
  ppnAmount: number
  pph22Amount: number
  totalDuties: number
  
  // Documents
  documents: {
    commercialInvoice: boolean
    packingList: boolean
    billOfLading: boolean
    certificateOfOrigin: boolean
  }
  
  // Lot tracking
  lotNumber?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy: string
  
  // Activity log
  activities: {
    date: string
    action: string
    user: string
    notes?: string
  }[]
}

export interface BC30Document {
  id: string
  bcNumber: string
  soId: string
  soNumber: string
  customerId: string
  customerName: string
  status: BC30Status
  submissionDate?: string
  approvalDate?: string
  pebNumber?: string // Pemberitahuan Ekspor Barang
  npe: string // Nomor Pendaftaran Eksportir
  
  // Goods Details
  hsCode: string
  goodsDescription: string
  quantity: number
  unit: string
  fobValue: number // Free On Board
  currency: string
  destinationCountry: string
  
  // Traceability
  woId?: string
  bc23References: string[] // Link to BC 2.3 of raw materials
  
  // Documents
  documents: {
    commercialInvoice: boolean
    packingList: boolean
    certificateOfOrigin: boolean
    healthCertificate: boolean
    formE: boolean // ASEAN Certificate
  }
  
  // Lot tracking
  fgLotNumber?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  createdBy: string
  
  // Activity log
  activities: {
    date: string
    action: string
    user: string
    notes?: string
  }[]
}

// HS Code Database (Sample)
export const MOCK_HS_CODES: HSCode[] = [
  {
    code: '7326.90.90',
    description: 'Other articles of iron or steel',
    dutyRate: 7.5,
    ppnRate: 11,
    pph22Rate: 2.5
  },
  {
    code: '3920.10.10',
    description: 'Polymers of ethylene, in primary forms',
    dutyRate: 5,
    ppnRate: 11,
    pph22Rate: 2.5
  },
  {
    code: '8481.80.91',
    description: 'Taps, cocks, valves and similar appliances',
    dutyRate: 10,
    ppnRate: 11,
    pph22Rate: 2.5
  },
  {
    code: '7318.15.00',
    description: 'Bolts and bolts and their nuts or washers',
    dutyRate: 7.5,
    ppnRate: 11,
    pph22Rate: 2.5
  }
]

// BC 2.3 Mock Data
export const MOCK_BC23: BC23Document[] = [
  {
    id: 'bc23-001',
    bcNumber: 'BC23-2026-001234',
    poId: 'po-001',
    poNumber: 'PO-2026-001',
    supplierId: 'sup-001',
    supplierName: 'Shanghai Metal Co., Ltd',
    status: 'APPROVED',
    submissionDate: '2026-01-15',
    approvalDate: '2026-01-18',
    sppbNumber: 'SPPB-001234-2026',
    
    hsCode: '7326.90.90',
    goodsDescription: 'Steel Brackets for Industrial Use',
    quantity: 5000,
    unit: 'PCS',
    cifValue: 25000,
    currency: 'USD',
    countryOfOrigin: 'China',
    
    dutyAmount: 1875, // 7.5% of 25000
    ppnAmount: 2750, // 11% of 25000
    pph22Amount: 625, // 2.5% of 25000
    totalDuties: 5250,
    
    documents: {
      commercialInvoice: true,
      packingList: true,
      billOfLading: true,
      certificateOfOrigin: true
    },
    
    lotNumber: 'RM-2026-001',
    
    createdAt: '2026-01-10T08:00:00',
    updatedAt: '2026-01-18T14:30:00',
    createdBy: 'Budi Santoso',
    
    activities: [
      { date: '2026-01-10T08:00:00', action: 'Created', user: 'Budi Santoso' },
      { date: '2026-01-12T10:00:00', action: 'Submitted to Customs', user: 'Budi Santoso' },
      { date: '2026-01-15T09:00:00', action: 'Under Review by Customs', user: 'System' },
      { date: '2026-01-18T14:30:00', action: 'Approved - SPPB Issued', user: 'System', notes: 'SPPB: SPPB-001234-2026' }
    ]
  },
  {
    id: 'bc23-002',
    bcNumber: 'BC23-2026-001567',
    poId: 'po-002',
    poNumber: 'PO-2026-002',
    supplierId: 'sup-002',
    supplierName: 'Taiwan Polymer Industries',
    status: 'UNDER REVIEW',
    submissionDate: '2026-01-25',
    
    hsCode: '3920.10.10',
    goodsDescription: 'Polyethylene Resin - HDPE Grade',
    quantity: 10000,
    unit: 'KG',
    cifValue: 18000,
    currency: 'USD',
    countryOfOrigin: 'Taiwan',
    
    dutyAmount: 900, // 5% of 18000
    ppnAmount: 1980, // 11% of 18000
    pph22Amount: 450, // 2.5% of 18000
    totalDuties: 3330,
    
    documents: {
      commercialInvoice: true,
      packingList: true,
      billOfLading: true,
      certificateOfOrigin: false
    },
    
    lotNumber: 'RM-2026-002',
    
    createdAt: '2026-01-20T09:00:00',
    updatedAt: '2026-01-25T11:00:00',
    createdBy: 'Siti Nurhaliza',
    
    activities: [
      { date: '2026-01-20T09:00:00', action: 'Created', user: 'Siti Nurhaliza' },
      { date: '2026-01-22T14:00:00', action: 'Verified by Finance', user: 'Andi Wijaya' },
      { date: '2026-01-25T11:00:00', action: 'Submitted to Customs', user: 'Siti Nurhaliza' }
    ]
  },
  {
    id: 'bc23-003',
    bcNumber: 'BC23-2026-001890',
    poId: 'po-003',
    poNumber: 'PO-2026-005',
    supplierId: 'sup-003',
    supplierName: 'Korea Valve Manufacturing',
    status: 'DRAFT',
    
    hsCode: '8481.80.91',
    goodsDescription: 'Industrial Ball Valves 2 inch',
    quantity: 200,
    unit: 'PCS',
    cifValue: 12000,
    currency: 'USD',
    countryOfOrigin: 'South Korea',
    
    dutyAmount: 1200, // 10% of 12000
    ppnAmount: 1320, // 11% of 12000
    pph22Amount: 300, // 2.5% of 12000
    totalDuties: 2820,
    
    documents: {
      commercialInvoice: true,
      packingList: false,
      billOfLading: false,
      certificateOfOrigin: false
    },
    
    createdAt: '2026-02-01T10:00:00',
    updatedAt: '2026-02-01T10:00:00',
    createdBy: 'Budi Santoso',
    
    activities: [
      { date: '2026-02-01T10:00:00', action: 'Created', user: 'Budi Santoso' }
    ]
  }
]

// BC 3.0 Mock Data
export const MOCK_BC30: BC30Document[] = [
  {
    id: 'bc30-001',
    bcNumber: 'BC30-2026-005678',
    soId: 'so-001',
    soNumber: 'SO-2026-001',
    customerId: 'cust-001',
    customerName: 'ABC Manufacturing Singapore',
    status: 'APPROVED',
    submissionDate: '2026-01-28',
    approvalDate: '2026-01-30',
    pebNumber: 'PEB-005678-2026',
    npe: 'NPE-123456789',
    
    hsCode: '7326.90.90',
    goodsDescription: 'Finished Steel Components',
    quantity: 4500,
    unit: 'PCS',
    fobValue: 45000,
    currency: 'USD',
    destinationCountry: 'Singapore',
    
    woId: 'wo-001',
    bc23References: ['bc23-001'],
    
    documents: {
      commercialInvoice: true,
      packingList: true,
      certificateOfOrigin: true,
      healthCertificate: false,
      formE: true
    },
    
    fgLotNumber: 'FG-2026-001',
    
    createdAt: '2026-01-25T08:00:00',
    updatedAt: '2026-01-30T15:00:00',
    createdBy: 'Dewi Lestari',
    
    activities: [
      { date: '2026-01-25T08:00:00', action: 'Created', user: 'Dewi Lestari' },
      { date: '2026-01-26T10:00:00', action: 'Verified by Finance', user: 'Andi Wijaya' },
      { date: '2026-01-28T09:00:00', action: 'Submitted to Customs', user: 'Dewi Lestari' },
      { date: '2026-01-30T15:00:00', action: 'Approved - PEB Issued', user: 'System', notes: 'PEB: PEB-005678-2026' }
    ]
  },
  {
    id: 'bc30-002',
    bcNumber: 'BC30-2026-006123',
    soId: 'so-002',
    soNumber: 'SO-2026-003',
    customerId: 'cust-002',
    customerName: 'Malaysia Industrial Supplies',
    status: 'SUBMITTED',
    submissionDate: '2026-02-03',
    npe: 'NPE-123456789',
    
    hsCode: '3920.10.10',
    goodsDescription: 'Polymer Products - Custom Grade',
    quantity: 8000,
    unit: 'KG',
    fobValue: 32000,
    currency: 'USD',
    destinationCountry: 'Malaysia',
    
    woId: 'wo-002',
    bc23References: ['bc23-002'],
    
    documents: {
      commercialInvoice: true,
      packingList: true,
      certificateOfOrigin: true,
      healthCertificate: false,
      formE: true
    },
    
    fgLotNumber: 'FG-2026-002',
    
    createdAt: '2026-02-01T09:00:00',
    updatedAt: '2026-02-03T10:00:00',
    createdBy: 'Dewi Lestari',
    
    activities: [
      { date: '2026-02-01T09:00:00', action: 'Created', user: 'Dewi Lestari' },
      { date: '2026-02-02T14:00:00', action: 'Verified by Finance', user: 'Andi Wijaya' },
      { date: '2026-02-03T10:00:00', action: 'Submitted to Customs', user: 'Dewi Lestari' }
    ]
  }
]

// Helper function to calculate duties
export function calculateDuties(cifValue: number, hsCode: string) {
  const hs = MOCK_HS_CODES.find(h => h.code === hsCode)
  if (!hs) return { dutyAmount: 0, ppnAmount: 0, pph22Amount: 0, totalDuties: 0 }
  
  const dutyAmount = cifValue * (hs.dutyRate / 100)
  const ppnAmount = cifValue * (hs.ppnRate / 100)
  const pph22Amount = cifValue * (hs.pph22Rate / 100)
  const totalDuties = dutyAmount + ppnAmount + pph22Amount
  
  return { dutyAmount, ppnAmount, pph22Amount, totalDuties }
}

// Get BC 2.3 by status
export function getBC23ByStatus(status: BC23Status) {
  return MOCK_BC23.filter(bc => bc.status === status)
}

// Get BC 3.0 by status
export function getBC30ByStatus(status: BC30Status) {
  return MOCK_BC30.filter(bc => bc.status === status)
}
