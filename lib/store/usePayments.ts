'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORE_KEYS, getStore, addToStore, generateId } from './index'
import { MOCK_PAYMENTS, type Payment } from '@/lib/mock-data/finance'

// Catatan pembayaran AR (penerimaan piutang) dan AP (pembayaran hutang)
export interface PaymentRecord extends Payment {
  invoiceType?: 'AR' | 'AP'
  invoiceNumber?: string
  counterparty?: string
}

export function usePayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>(() =>
    getStore<PaymentRecord>(STORE_KEYS.PAYMENTS, MOCK_PAYMENTS)
  )

  useEffect(() => {
    setPayments(getStore<PaymentRecord>(STORE_KEYS.PAYMENTS, MOCK_PAYMENTS))
  }, [])

  const createPayment = useCallback((data: Omit<PaymentRecord, 'id' | 'paymentNumber'>) => {
    const current = getStore<PaymentRecord>(STORE_KEYS.PAYMENTS, MOCK_PAYMENTS)
    const id = generateId('pay', current.map(p => p.id))
    const paymentNumber = generateId('PAY', current.map(p => p.paymentNumber))
    const record: PaymentRecord = { ...data, id, paymentNumber }
    setPayments(addToStore(STORE_KEYS.PAYMENTS, record, MOCK_PAYMENTS))
    return record
  }, [])

  return { payments, createPayment }
}
