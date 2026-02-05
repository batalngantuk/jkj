export interface SalesOrder {
  id: string
  poNumber: string
  customer: string
  product: string
  quantity: number
  unitPrice: number
  total: number
  deliveryDate: string
  status: 'DRAFT' | 'PENDING APPROVAL' | 'APPROVED' | 'IN PRODUCTION' | 'READY TO SHIP' | 'COMPLETED' | 'REJECTED'
  progress: number
  priority: 'Normal' | 'Urgent'
  createdAt: string
  createdBy: string
  notes?: string
  poDocumentUrl?: string
  history: Array<{
    date: string
    action: string
    user: string
    status: string
  }>
}

export const MOCK_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'SO-2026-001',
    poNumber: 'PO/ABC/12345',
    customer: 'ABC Corporation',
    product: 'Latex Size M',
    quantity: 1000,
    unitPrice: 15000,
    total: 15000000,
    deliveryDate: '15 Feb 2026',
    status: 'IN PRODUCTION',
    progress: 45,
    priority: 'Normal',
    createdAt: '2026-02-01T08:00:00Z',
    createdBy: 'Sales Admin',
    history: [
      { date: '2026-02-01 08:00', action: 'Created', user: 'Sales Admin', status: 'DRAFT' },
      { date: '2026-02-01 09:30', action: 'Approved', user: 'Sales Manager', status: 'APPROVED' },
      { date: '2026-02-02 10:00', action: 'Production Started', user: 'System', status: 'IN PRODUCTION' }
    ]
  },
  {
    id: 'SO-2026-002',
    poNumber: 'PO/XYZ/67890',
    customer: 'XYZ Global Ltd',
    product: 'Nitrile Size L',
    quantity: 500,
    unitPrice: 18000,
    total: 9000000,
    deliveryDate: '20 Feb 2026',
    status: 'DRAFT',
    progress: 0,
    priority: 'Normal',
    createdAt: '2026-02-04T14:00:00Z',
    createdBy: 'Sales Admin',
    history: [
      { date: '2026-02-04 14:00', action: 'Created', user: 'Sales Admin', status: 'DRAFT' }
    ]
  },
  {
    id: 'SO-2026-003',
    poNumber: 'PO/MEDI/111',
    customer: 'MediSupply Inc',
    product: 'Latex Size S',
    quantity: 2000,
    unitPrice: 14500,
    total: 29000000,
    deliveryDate: '25 Feb 2026',
    status: 'PENDING APPROVAL',
    progress: 0,
    priority: 'Urgent',
    createdAt: '2026-02-05T09:00:00Z',
    createdBy: 'Sales Admin',
    poDocumentUrl: 'mock-po.pdf',
    history: [
      { date: '2026-02-05 09:00', action: 'Created', user: 'Sales Admin', status: 'DRAFT' },
      { date: '2026-02-05 09:05', action: 'Submitted for Approval', user: 'Sales Admin', status: 'PENDING APPROVAL' }
    ]
  },
  {
    id: 'SO-2026-004',
    poNumber: 'PO/GH/222',
    customer: 'Global Health',
    product: 'Nitrile Size M',
    quantity: 750,
    unitPrice: 17500,
    total: 13125000,
    deliveryDate: '28 Feb 2026',
    status: 'APPROVED',
    progress: 0,
    priority: 'Normal',
    createdAt: '2026-02-03T11:00:00Z',
    createdBy: 'Sales Admin',
    history: [
      { date: '2026-02-03 11:00', action: 'Created', user: 'Sales Admin', status: 'DRAFT' },
      { date: '2026-02-03 13:00', action: 'Approved', user: 'Sales Manager', status: 'APPROVED' }
    ]
  },
  {
    id: 'SO-2026-006',
    poNumber: 'PO/HCP/444',
    customer: 'HealthCare Plus',
    product: 'Nitrile Size S',
    quantity: 2500,
    unitPrice: 16500,
    total: 41250000,
    deliveryDate: '10 Mar 2026',
    status: 'READY TO SHIP',
    progress: 100,
    priority: 'Normal',
    createdAt: '2026-01-25T10:00:00Z',
    createdBy: 'Sales Admin',
    history: [
      { date: '2026-01-25 10:00', action: 'Created', user: 'Sales Admin', status: 'DRAFT' },
      { date: '2026-01-25 14:00', action: 'Approved', user: 'Sales Manager', status: 'APPROVED' },
      { date: '2026-01-26 09:00', action: 'Production Started', user: 'System', status: 'IN PRODUCTION' },
      { date: '2026-02-04 16:00', action: 'Production Completed', user: 'Production Mgr', status: 'READY TO SHIP' }
    ]
  }
]

export const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'ABC Corporation', email: 'procurement@abc.com', address: 'Jakarta, Indonesia' },
  { id: 'CUST-002', name: 'XYZ Global Ltd', email: 'buying@xyz.com', address: 'Singapore' },
  { id: 'CUST-003', name: 'MediSupply Inc', email: 'orders@medisupply.com', address: 'New York, USA' },
  { id: 'CUST-004', name: 'Global Health', email: 'contact@globalhealth.com', address: 'London, UK' },
  { id: 'CUST-005', name: 'HealthCare Plus', email: 'purchasing@hcp.com', address: 'Sydney, Australia' },
]

export const MOCK_PRODUCTS = [
  { id: 'PROD-001', name: 'Latex Size S', stock: 12000, unit: 'cartons', type: 'Latex' },
  { id: 'PROD-002', name: 'Latex Size M', stock: 5000, unit: 'cartons', type: 'Latex' },
  { id: 'PROD-003', name: 'Latex Size L', stock: 8500, unit: 'cartons', type: 'Latex' },
  { id: 'PROD-004', name: 'Nitrile Size S', stock: 2000, unit: 'cartons', type: 'Nitrile' },
  { id: 'PROD-005', name: 'Nitrile Size M', stock: 4500, unit: 'cartons', type: 'Nitrile' },
  { id: 'PROD-006', name: 'Nitrile Size L', stock: 1000, unit: 'cartons', type: 'Nitrile' },
]
