
import { Product, ProductCategory, Customer, PurchaseOrder, SaleRecord, Expense, Branch } from './types';

export const MOCK_BRANCHES: Branch[] = [
    { id: 'B001', name: 'สาขาใหญ่ (Headquarters)', location: 'Siam Square', type: 'HQ' },
    { id: 'B002', name: 'สาขาลาดพร้าว', location: 'Ladprao', type: 'BRANCH' },
    { id: 'B003', name: 'สาขาบางนา', location: 'Bangna', type: 'BRANCH' },
];

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
    requiresPrescription: false,
    batches: [
        { lotNumber: 'L23001', expiryDate: '2025-12-31', quantity: 100, costPrice: 8 },
        { lotNumber: 'L22055', expiryDate: '2024-11-30', quantity: 20, costPrice: 7.5 },
    ]
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
    requiresPrescription: true,
    batches: [
        { lotNumber: 'A9901', expiryDate: '2024-10-15', quantity: 45, costPrice: 45 }
    ]
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
    requiresPrescription: false,
    batches: [
         { lotNumber: 'V8821', expiryDate: '2026-05-20', quantity: 20, costPrice: 200 }
    ]
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
    requiresPrescription: false,
    batches: [
         { lotNumber: 'M1123', expiryDate: '2030-01-01', quantity: 500, costPrice: 10 }
    ]
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
    requiresPrescription: false,
    batches: [
        { lotNumber: 'ALC001', expiryDate: '2025-02-14', quantity: 8, costPrice: 30 }
    ]
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
    requiresPrescription: false,
    batches: [
        { lotNumber: 'CR009', expiryDate: '2025-08-10', quantity: 15, costPrice: 500 }
    ]
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  { id: 'C001', name: 'คุณสมชาย ใจดี', phone: '081-111-1111', points: 150, totalSpent: 3000, lastVisit: '2024-05-20', allergies: ['Penicillin'] },
  { id: 'C002', name: 'คุณหญิง รักสุขภาพ', phone: '089-999-9999', points: 520, totalSpent: 10400, lastVisit: '2024-05-22', allergies: [] },
  { id: 'C003', name: 'คุณลุง แข็งแรง', phone: '086-555-4444', points: 20, totalSpent: 400, lastVisit: '2024-04-10', allergies: [] },
];

export const MOCK_PO: PurchaseOrder[] = [
  { id: 'PO-24001', supplierName: 'บ. ยาไทย จำกัด', date: '2024-05-01', dueDate: '2024-05-30', status: 'RECEIVED', totalAmount: 15000, itemsCount: 500, paymentStatus: 'PAID' },
  { id: 'PO-24002', supplierName: 'Zuellig Pharma', date: '2024-05-15', dueDate: '2024-06-15', status: 'PENDING', totalAmount: 8500, itemsCount: 120, paymentStatus: 'UNPAID' },
  { id: 'PO-24003', supplierName: 'DKSH Thailand', date: '2024-05-25', dueDate: '2024-06-25', status: 'APPROVED', totalAmount: 42000, itemsCount: 350, paymentStatus: 'UNPAID' },
];

export const MOCK_SALES: SaleRecord[] = [
  { id: 'INV-0001', date: '2024-05-24', total: 450, paymentMethod: 'QR', items: [], branchId: 'B001' },
  { id: 'INV-0002', date: '2024-05-24', total: 120, paymentMethod: 'CASH', items: [], branchId: 'B001' },
  { id: 'INV-0003', date: '2024-05-23', total: 1250, paymentMethod: 'CREDIT', items: [], branchId: 'B002' },
  { id: 'INV-0004', date: '2024-05-23', total: 80, paymentMethod: 'CASH', items: [], branchId: 'B001' },
  { id: 'INV-0005', date: '2024-05-22', total: 3200, paymentMethod: 'QR', items: [], branchId: 'B003' },
];

export const MOCK_EXPENSES: Expense[] = [
    { id: 'EXP-001', title: 'ค่าเช่าร้าน', category: 'OPERATING', amount: 15000, date: '2024-05-01' },
    { id: 'EXP-002', title: 'ค่าไฟฟ้า', category: 'UTILITY', amount: 4500, date: '2024-05-05' },
    { id: 'EXP-003', title: 'เงินเดือนพนักงาน (part-time)', category: 'SALARY', amount: 8000, date: '2024-05-25' },
];
