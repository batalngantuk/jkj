export interface Vehicle {
  id: string
  plateNumber: string
  type: 'Truck' | 'Van' | 'Container'
  capacity: string
  status: 'Available' | 'In Transit' | 'Maintenance'
  driverId?: string
}

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  phone: string
  status: 'Available' | 'On Duty' | 'Leave'
}

export interface Shipment {
  id: string
  soNumber: string
  customer: string
  destination: string
  departureDate: string
  estimatedArrival: string
  status: 'Scheduled' | 'In Transit' | 'Delivered' | 'Returned'
  vehicleId: string
  driverId: string
  customsDoc?: string // BC 3.0 Number
}

export const MOCK_VEHICLES: Vehicle[] = [
  { id: 'V-001', plateNumber: 'B 9283 XT', type: 'Truck', capacity: '10 Ton', status: 'Available' },
  { id: 'V-002', plateNumber: 'B 1234 XY', type: 'Container', capacity: '20ft', status: 'In Transit', driverId: 'DRV-001' },
  { id: 'V-003', plateNumber: 'B 5555 ZZ', type: 'Van', capacity: '1 Ton', status: 'Available' }
]

export const MOCK_DRIVERS: Driver[] = [
  { id: 'DRV-001', name: 'Agus Salim', licenseNumber: 'SIM-B2-001', phone: '08123456789', status: 'On Duty' },
  { id: 'DRV-002', name: 'Bambang Pamungkas', licenseNumber: 'SIM-B2-002', phone: '08129876543', status: 'Available' },
  { id: 'DRV-003', name: 'Joko Widodo', licenseNumber: 'SIM-A-003', phone: '081311223344', status: 'Available' }
]

export const MOCK_SHIPMENTS: Shipment[] = [
  {
    id: 'SHP-2026-001',
    soNumber: 'SO-2026-001',
    customer: 'PT. Maju Mundur',
    destination: 'Jakarta Warehouse',
    departureDate: '2026-02-05 09:00',
    estimatedArrival: '2026-02-05 14:00',
    status: 'In Transit',
    vehicleId: 'V-002',
    driverId: 'DRV-001',
    customsDoc: 'BC30-001234'
  },
  {
    id: 'SHP-2026-002',
    soNumber: 'SO-2026-005',
    customer: 'Global Medical Supplies',
    destination: 'Tanjung Priok Port',
    departureDate: '2026-02-06 08:00',
    estimatedArrival: '2026-02-06 12:00',
    status: 'Scheduled',
    vehicleId: 'V-001',
    driverId: 'DRV-002',
    customsDoc: 'Pending'
  }
]
