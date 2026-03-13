// Mock data for Customs (Bea Cukai) - BC 2.0 Regular Import

export interface HSCode {
  code: string
  description: string
  dutyRate: number // Bea Masuk %
  ppnRate: number // PPN %
  pph22Rate: number // PPh 22 %
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

// Helper function to calculate duties (BC 2.0)
export function calculateDuties(cifValue: number, hsCode: string) {
  const hs = MOCK_HS_CODES.find(h => h.code === hsCode)
  if (!hs) return { dutyAmount: 0, ppnAmount: 0, pph22Amount: 0, totalDuties: 0 }

  const dutyAmount = cifValue * (hs.dutyRate / 100)
  const ppnAmount = cifValue * (hs.ppnRate / 100)
  const pph22Amount = cifValue * (hs.pph22Rate / 100)
  const totalDuties = dutyAmount + ppnAmount + pph22Amount

  return { dutyAmount, ppnAmount, pph22Amount, totalDuties }
}
