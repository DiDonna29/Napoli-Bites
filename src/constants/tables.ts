import type { Table } from '@/types';

export const TABLES_DATA: Table[] = [
  { id: 'table-1', tableNumber: 1, capacity: 2, status: 'available' },
  { id: 'table-2', tableNumber: 2, capacity: 4, status: 'occupied', availabilityTime: 'approx. 30 mins' },
  { id: 'table-3', tableNumber: 3, capacity: 2, status: 'available' },
  { id: 'table-4', tableNumber: 4, capacity: 4, status: 'reserved', availabilityTime: 'from 7:00 PM' },
  { id: 'table-5', tableNumber: 5, capacity: 2, status: 'available' },
  { id: 'table-6', tableNumber: 6, capacity: 4, status: 'occupied', availabilityTime: 'approx. 1 hr 15 mins' },
  { id: 'table-7', tableNumber: 7, capacity: 2, status: 'available' },
  { id: 'table-8', tableNumber: 8, capacity: 4, status: 'available' },
  { id: 'table-9', tableNumber: 9, capacity: 2, status: 'reserved', availabilityTime: 'from 8:30 PM' },
  { id: 'table-10', tableNumber: 10, capacity: 4, status: 'available' },
];
