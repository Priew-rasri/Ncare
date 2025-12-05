import { Product, ProductCategory, Customer, PurchaseOrder, SaleRecord } from './types';

export const MOCK_INVENTORY: Product[] = [
  {
    id: 'P001',
    name: 'Sara (Paracetamol 500mg)',
    genericName: 'Paracetamol',
    category: ProductCategory.HOUSEHOLD,
    price: 15,
    cost: 8,
    stock: 120,
    minStock: 50,
    unit: 'แผง',
    expiryDate: '2025-12-31',
  },
  {
    id: 'P002',
    name: 'Amoxy (Amoxicillin 500mg)',
    genericName: 'Amoxicillin',
    category: ProductCategory.MEDICINE,
    price: 80,
    cost: 45,
    stock: 45,
    minStock: 30,
    unit: 'แผง',
    expiryDate: '2024-10-15',
  },
  {
    id: 'P003',
    name: 'Vitamin C 1000mg Bio-C',
    genericName: 'Ascorbic Acid',
    category: ProductCategory.SUPPLEMENT,
    price: 350,
    cost: 200,
    stock: 20,
    minStock: 10,
    unit: 'กระปุก',
    expiryDate: '2026-05-20',
  },
  {
    id: 'P004',
    name: 'N-95 Mask',
    genericName: 'Protective Mask',
    category: ProductCategory.EQUIPMENT,
    price: 25,
    cost: 10,
    stock: 500,
    minStock: 100,
    unit: 'ชิ้น',
    expiryDate: '2030-01-01',
  },
  {
    id: 'P005',
    name: 'Alcohol Gel 75%',
    genericName: 'Ethyl Alcohol',
    category: ProductCategory.HOUSEHOLD,
    price: 55,
    cost: 30,
    stock: 8,
    minStock: 20,
    unit: 'ขวด',
    expiryDate: '2025-02-14',
  },
  {
    id: 'P006',
    name: 'Ezerra Cream',
    genericName: 'Moisturizer',
    category: ProductCategory.COSMETIC,
    price: 750,
    cost: 500,
    stock: 15,
    minStock: 5,
    unit: 'หลอด',
    expiryDate: '2025-08-10',
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'C001', name: 'คุณสมชาย ใจดี', phone: '081-111-1111', points: 150, totalSpent: 3000, lastVisit: '2024-05-20' },
  { id: 'C002', name: 'คุณหญิง รักสุขภาพ', phone: '089-999-9999', points: 520, totalSpent: 10400, lastVisit: '2024-05-22' },
  { id: 'C003', name: 'คุณลุง แข็งแรง', phone: '086-555-4444', points: 20, totalSpent: 400, lastVisit: '2024-04-10' },
];

export const MOCK_PO: PurchaseOrder[] = [
  { id: 'PO-24001', supplierName: 'บ. ยาไทย จำกัด', date: '2024-05-01', status: 'COMPLETED', totalAmount: 15000, itemsCount: 500 },
  { id: 'PO-24002', supplierName: 'Zuellig Pharma', date: '2024-05-15', status: 'PENDING', totalAmount: 8500, itemsCount: 120 },
];

export const MOCK_SALES: SaleRecord[] = [
  { id: 'INV-0001', date: '2024-05-24', total: 450, paymentMethod: 'QR', items: [] },
  { id: 'INV-0002', date: '2024-05-24', total: 120, paymentMethod: 'CASH', items: [] },
  { id: 'INV-0003', date: '2024-05-23', total: 1250, paymentMethod: 'CREDIT', items: [] },
  { id: 'INV-0004', date: '2024-05-23', total: 80, paymentMethod: 'CASH', items: [] },
  { id: 'INV-0005', date: '2024-05-22', total: 3200, paymentMethod: 'QR', items: [] },
];
