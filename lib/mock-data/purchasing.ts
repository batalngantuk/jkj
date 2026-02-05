export interface PurchaseOrder {
  id: string
  supplier: string
  items: Array<{
    code: string
    name: string
    quantity: number
    unit: string
    unitPrice: number
    total: number
  }>
  totalAmount: number
  orderDate: string
  expectedDelivery: string
  status: 'DRAFT' | 'APPROVED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED'
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID'
}

export interface Supplier {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  rating: number
  status: 'Active' | 'Inactive'
}

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'SUP-001', name: 'PT. Agro Latex Indonesia', contactPerson: 'Budi Santoso', email: 'sales@agrolatex.com', phone: '+62 21 555 0001', address: 'Jl. Raya Bogor KM 30', rating: 4.8, status: 'Active' },
  { id: 'SUP-002', name: 'Global Chemicals Ltd', contactPerson: 'Sarah Jenkins', email: 'sarah@globalchem.com', phone: '+65 6777 8888', address: 'Jurong Industrial Estate, Singapore', rating: 4.5, status: 'Active' },
  { id: 'SUP-003', name: 'Indo Box Packaging', contactPerson: 'Hendra Wijaya', email: 'hendra@indobox.com', phone: '+62 21 555 0003', address: 'Kawasan Industri Cikarang', rating: 4.2, status: 'Active' },
  { id: 'SUP-004', name: 'Mitra Logistik Utama', contactPerson: 'Dewi Lestari', email: 'dewi@mitralog.com', phone: '+62 21 555 0004', address: 'Tanjung Priok, Jakarta', rating: 4.0, status: 'Active' }
]

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-2026-001',
    supplier: 'PT. Agro Latex Indonesia',
    items: [
      { code: 'RM-LATEX', name: 'Natural Rubber Latex', quantity: 10000, unit: 'kg', unitPrice: 15000, total: 150000000 }
    ],
    totalAmount: 150000000,
    orderDate: '2026-02-01',
    expectedDelivery: '2026-02-05',
    status: 'APPROVED', // Ready to receive
    paymentStatus: 'UNPAID'
  },
  {
    id: 'PO-2026-002',
    supplier: 'Global Chemicals Ltd',
    items: [
      { code: 'RM-SULFUR', name: 'Sulfur Dispersion', quantity: 500, unit: 'kg', unitPrice: 25000, total: 12500000 },
      { code: 'RM-ZINC', name: 'Zinc Oxide', quantity: 200, unit: 'kg', unitPrice: 45000, total: 9000000 }
    ],
    totalAmount: 21500000,
    orderDate: '2026-02-02',
    expectedDelivery: '2026-02-06',
    status: 'APPROVED',
    paymentStatus: 'UNPAID'
  },
  {
    id: 'PO-2026-003',
    supplier: 'Indo Box Packaging',
    items: [
      { code: 'PKG-BOX-S', name: 'Inner Box Size S', quantity: 50000, unit: 'pcs', unitPrice: 1200, total: 60000000 }
    ],
    totalAmount: 60000000,
    orderDate: '2026-01-25',
    expectedDelivery: '2026-01-30',
    status: 'RECEIVED', // Already received
    paymentStatus: 'PAID'
  }
]
