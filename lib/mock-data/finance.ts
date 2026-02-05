// Finance Module Mock Data
// Includes AR Invoices, AP Invoices, and Payments

export interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxAmount: number
}

export interface Payment {
  id: string
  paymentNumber: string
  invoiceId: string
  paymentDate: string
  amount: number
  method: 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'CREDIT_CARD'
  reference: string
  notes?: string
}

export interface ARInvoice {
  id: string
  invoiceNumber: string
  soId: string
  soNumber: string
  customerId: string
  customerName: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  taxAmount: number
  paidAmount: number
  balance: number
  status: 'DRAFT' | 'APPROVED' | 'SENT' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'
  fakturPajakNumber?: string
  lineItems: InvoiceLineItem[]
  paymentIds: string[]
  notes?: string
}

export interface APInvoice {
  id: string
  invoiceNumber: string
  vendorInvoiceNumber: string
  poId: string
  poNumber: string
  vendorId: string
  vendorName: string
  invoiceDate: string
  dueDate: string
  totalAmount: number
  taxAmount: number
  paidAmount: number
  balance: number
  status: 'DRAFT' | 'VERIFIED' | 'APPROVED' | 'SCHEDULED' | 'PAID'
  bc23Id?: string
  bc23Number?: string
  lineItems: InvoiceLineItem[]
  paymentIds: string[]
  notes?: string
}

// Mock AR Invoices
export const MOCK_AR_INVOICES: ARInvoice[] = [
  {
    id: 'ar-001',
    invoiceNumber: 'INV/2026/001',
    soId: 'so-001',
    soNumber: 'SO-2026-001',
    customerId: 'cust-001',
    customerName: 'PT. Global Trading Indonesia',
    invoiceDate: '2026-01-15',
    dueDate: '2026-02-14',
    totalAmount: 150000000,
    taxAmount: 16500000,
    paidAmount: 150000000,
    balance: 0,
    status: 'PAID',
    fakturPajakNumber: 'FP-001-26-00001',
    lineItems: [
      {
        id: 'li-001',
        description: 'Finished Goods - Product A',
        quantity: 1000,
        unitPrice: 135000,
        amount: 135000000,
        taxAmount: 14850000
      }
    ],
    paymentIds: ['pay-001'],
    notes: 'Payment received on time'
  },
  {
    id: 'ar-002',
    invoiceNumber: 'INV/2026/002',
    soId: 'so-002',
    soNumber: 'SO-2026-002',
    customerId: 'cust-002',
    customerName: 'CV. Maju Jaya',
    invoiceDate: '2026-01-20',
    dueDate: '2026-02-19',
    totalAmount: 85000000,
    taxAmount: 9350000,
    paidAmount: 42500000,
    balance: 42500000,
    status: 'PARTIALLY_PAID',
    fakturPajakNumber: 'FP-001-26-00002',
    lineItems: [
      {
        id: 'li-002',
        description: 'Finished Goods - Product B',
        quantity: 500,
        unitPrice: 153000,
        amount: 76500000,
        taxAmount: 8415000
      }
    ],
    paymentIds: ['pay-002'],
    notes: 'Partial payment received'
  },
  {
    id: 'ar-003',
    invoiceNumber: 'INV/2026/003',
    soId: 'so-003',
    soNumber: 'SO-2026-003',
    customerId: 'cust-003',
    customerName: 'PT. Sejahtera Abadi',
    invoiceDate: '2026-02-01',
    dueDate: '2026-03-03',
    totalAmount: 120000000,
    taxAmount: 13200000,
    paidAmount: 0,
    balance: 120000000,
    status: 'SENT',
    fakturPajakNumber: 'FP-001-26-00003',
    lineItems: [
      {
        id: 'li-003',
        description: 'Finished Goods - Product A',
        quantity: 800,
        unitPrice: 135000,
        amount: 108000000,
        taxAmount: 11880000
      }
    ],
    paymentIds: [],
    notes: 'Invoice sent to customer'
  },
  {
    id: 'ar-004',
    invoiceNumber: 'INV/2026/004',
    soId: 'so-004',
    soNumber: 'SO-2026-004',
    customerId: 'cust-001',
    customerName: 'PT. Global Trading Indonesia',
    invoiceDate: '2025-12-15',
    dueDate: '2026-01-14',
    totalAmount: 95000000,
    taxAmount: 10450000,
    paidAmount: 0,
    balance: 95000000,
    status: 'OVERDUE',
    fakturPajakNumber: 'FP-001-25-00125',
    lineItems: [
      {
        id: 'li-004',
        description: 'Finished Goods - Product C',
        quantity: 600,
        unitPrice: 142500,
        amount: 85500000,
        taxAmount: 9405000
      }
    ],
    paymentIds: [],
    notes: 'Payment overdue - follow up required'
  }
]

// Mock AP Invoices
export const MOCK_AP_INVOICES: APInvoice[] = [
  {
    id: 'ap-001',
    invoiceNumber: 'APINV/2026/001',
    vendorInvoiceNumber: 'VND-INV-2026-001',
    poId: 'po-001',
    poNumber: 'PO-2026-001',
    vendorId: 'vendor-001',
    vendorName: 'PT. Supplier Material Utama',
    invoiceDate: '2026-01-10',
    dueDate: '2026-02-09',
    totalAmount: 75000000,
    taxAmount: 8250000,
    paidAmount: 75000000,
    balance: 0,
    status: 'PAID',
    bc23Id: 'bc23-001',
    bc23Number: 'BC23-2026-001',
    lineItems: [
      {
        id: 'li-ap-001',
        description: 'Raw Material A - Import',
        quantity: 5000,
        unitPrice: 13500,
        amount: 67500000,
        taxAmount: 7425000
      }
    ],
    paymentIds: ['pay-003'],
    notes: 'Payment completed including import duties'
  },
  {
    id: 'ap-002',
    invoiceNumber: 'APINV/2026/002',
    vendorInvoiceNumber: 'VND-INV-2026-002',
    poId: 'po-002',
    poNumber: 'PO-2026-002',
    vendorId: 'vendor-002',
    vendorName: 'CV. Packaging Solutions',
    invoiceDate: '2026-01-25',
    dueDate: '2026-02-24',
    totalAmount: 25000000,
    taxAmount: 2750000,
    paidAmount: 0,
    balance: 25000000,
    status: 'APPROVED',
    lineItems: [
      {
        id: 'li-ap-002',
        description: 'Packaging Materials',
        quantity: 10000,
        unitPrice: 2250,
        amount: 22500000,
        taxAmount: 2475000
      }
    ],
    paymentIds: [],
    notes: 'Scheduled for payment next week'
  },
  {
    id: 'ap-003',
    invoiceNumber: 'APINV/2026/003',
    vendorInvoiceNumber: 'VND-INV-2026-003',
    poId: 'po-003',
    poNumber: 'PO-2026-003',
    vendorId: 'vendor-001',
    vendorName: 'PT. Supplier Material Utama',
    invoiceDate: '2026-02-05',
    dueDate: '2026-03-07',
    totalAmount: 85000000,
    taxAmount: 9350000,
    paidAmount: 0,
    balance: 85000000,
    status: 'VERIFIED',
    bc23Id: 'bc23-002',
    bc23Number: 'BC23-2026-002',
    lineItems: [
      {
        id: 'li-ap-003',
        description: 'Raw Material B - Import',
        quantity: 6000,
        unitPrice: 12750,
        amount: 76500000,
        taxAmount: 8415000
      }
    ],
    paymentIds: [],
    notes: 'Awaiting approval for payment'
  }
]

// Mock Payments
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'pay-001',
    paymentNumber: 'PAY/AR/2026/001',
    invoiceId: 'ar-001',
    paymentDate: '2026-02-10',
    amount: 150000000,
    method: 'BANK_TRANSFER',
    reference: 'TRF-20260210-001',
    notes: 'Full payment received'
  },
  {
    id: 'pay-002',
    paymentNumber: 'PAY/AR/2026/002',
    invoiceId: 'ar-002',
    paymentDate: '2026-02-15',
    amount: 42500000,
    method: 'BANK_TRANSFER',
    reference: 'TRF-20260215-001',
    notes: 'Partial payment - 50%'
  },
  {
    id: 'pay-003',
    paymentNumber: 'PAY/AP/2026/001',
    invoiceId: 'ap-001',
    paymentDate: '2026-02-05',
    amount: 75000000,
    method: 'BANK_TRANSFER',
    reference: 'TRF-20260205-001',
    notes: 'Payment to supplier including duties'
  }
]

// Helper functions
export function getARInvoiceById(id: string): ARInvoice | undefined {
  return MOCK_AR_INVOICES.find(inv => inv.id === id)
}

export function getAPInvoiceById(id: string): APInvoice | undefined {
  return MOCK_AP_INVOICES.find(inv => inv.id === id)
}

export function getARInvoicesByStatus(status: ARInvoice['status']): ARInvoice[] {
  return MOCK_AR_INVOICES.filter(inv => inv.status === status)
}

export function getAPInvoicesByStatus(status: APInvoice['status']): APInvoice[] {
  return MOCK_AP_INVOICES.filter(inv => inv.status === status)
}

export function getPaymentsByInvoiceId(invoiceId: string): Payment[] {
  return MOCK_PAYMENTS.filter(pay => pay.invoiceId === invoiceId)
}

export function getTotalAR(): number {
  return MOCK_AR_INVOICES.reduce((sum, inv) => sum + inv.balance, 0)
}

export function getTotalAP(): number {
  return MOCK_AP_INVOICES.reduce((sum, inv) => sum + inv.balance, 0)
}

export function getOverdueAR(): ARInvoice[] {
  return MOCK_AR_INVOICES.filter(inv => inv.status === 'OVERDUE')
}

export function getOverdueAP(): APInvoice[] {
  const today = new Date()
  return MOCK_AP_INVOICES.filter(inv => {
    const dueDate = new Date(inv.dueDate)
    return inv.status !== 'PAID' && dueDate < today
  })
}
