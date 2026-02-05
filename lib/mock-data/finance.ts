export interface Invoice {
  id: string
  referenceNumber: string // SO Number or PO Number
  type: 'AR' | 'AP' // Accounts Receivable (Sales) or Accounts Payable (Purchasing)
  counterparty: string // Customer or Supplier Name
  amount: number
  issueDate: string
  dueDate: string
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
}

export const MOCK_INVOICES: Invoice[] = [
  // Accounts Receivable (Sales)
  {
    id: 'INV-2026-001',
    referenceNumber: 'SO-2026-001',
    type: 'AR',
    counterparty: 'PT. Maju Mundur',
    amount: 50000000,
    issueDate: '2026-02-05',
    dueDate: '2026-03-05',
    status: 'Sent'
  },
  {
    id: 'INV-2026-002',
    referenceNumber: 'SO-2026-003',
    type: 'AR',
    counterparty: 'Global Medical Supplies',
    amount: 120000000,
    issueDate: '2026-02-01',
    dueDate: '2026-03-01',
    status: 'Paid'
  },
  {
    id: 'INV-2026-003',
    referenceNumber: 'SO-2025-120',
    type: 'AR',
    counterparty: 'CV. Sehat Sejahtera',
    amount: 5000000,
    issueDate: '2026-01-10',
    dueDate: '2026-02-10',
    status: 'Overdue'
  },
  // Accounts Payable (Purchasing)
  {
    id: 'BILL-2026-001',
    referenceNumber: 'PO-2026-001',
    type: 'AP',
    counterparty: 'PT. Agro Latex Indonesia',
    amount: 150000000,
    issueDate: '2026-02-05',
    dueDate: '2026-02-20',
    status: 'Draft'
  },
  {
    id: 'BILL-2026-002',
    referenceNumber: 'PO-2026-003',
    type: 'AP',
    counterparty: 'Indo Box Packaging',
    amount: 60000000,
    issueDate: '2026-01-30',
    dueDate: '2026-02-14',
    status: 'Paid'
  }
]
