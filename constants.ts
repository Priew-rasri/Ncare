

import { Product, ProductCategory, Customer, PurchaseOrder, SaleRecord, Expense, Branch, Supplier, StockLog, Settings, Shift, User } from './types';

export const MOCK_USERS: User[] = [
    { id: 'U001', username: 'owner', name: 'ภก. สมชาย (Owner)', role: 'OWNER' },
    { id: 'U002', username: 'pharm', name: 'ภญ. เจนจิรา (Pharmacist)', role: 'PHARMACIST' },
    { id: 'U003', username: 'staff', name: 'พนักงานขาย (Staff)', role: 'STAFF' },
];

export const MOCK_BRANCHES: Branch[] = [
    { id: 'B001', name: 'Ncare HQ (สาขาใหญ่)', location: 'Siam Square', type: 'HQ' },
    { id: 'B002', name: 'Ncare สาขาลาดพร้าว', location: 'Ladprao', type: 'BRANCH' },
    { id: 'B003', name: 'Ncare สาขาบางนา', location: 'Bangna', type: 'BRANCH' },
];

export const MOCK_SETTINGS: Settings = {
    storeName: 'Ncare Pharmacy (ร้านยา เอ็นแคร์)',
    taxId: '0105555888999',
    address: '88/9 อาคารเอ็นแคร์ ชั้น 1 ถ.สุขุมวิท เขตคลองเตย กทม. 10110',
    phone: '02-888-9999',
    vatRate: 7,
    printerIp: '192.168.1.200',
    receiptFooter: 'Ncare - We Care for Your Life. ปรึกษาเภสัชกรได้ตลอด 24 ชม.'
};

export const MOCK_SUPPLIERS: Supplier[] = [
    { id: 'S001', name: 'บ. ยาไทย จำกัด (Thai Pharma)', contactPerson: 'คุณวิชัย', phone: '02-123-4567', email: 'sales@thaipharma.com', address: 'Bangkok', creditTerm: 30, rating: 4.5 },
    { id: 'S002', name: 'Zuellig Pharma', contactPerson: 'Sales Support', phone: '02-999-8888', email: 'support@zuellig.com', address: 'Bangkok', creditTerm: 45, rating: 5.0 },
    { id: 'S003', name: 'DKSH Thailand', contactPerson: 'Call Center', phone: '02-777-6666', email: 'orders@dksh.com', address: 'Samut Prakan', creditTerm: 60, rating: 4.8 },
];

export const MOCK_INVENTORY: Product[] = [
  {
    id: 'P001',
    barcode: '8850123456789',
    name: 'Sara (Paracetamol 500mg)',
    genericName: 'Paracetamol',
    category: ProductCategory.HOUSEHOLD,
    manufacturer: 'Thai Nakorn Patana',
    location: 'A1-01',
    price: 15,
    cost: 8,
    stock: 120,
    minStock: 50,
    unit: 'แผง',
    requiresPrescription: false,
    drugInteractions: ['Warfarin', 'Alcohol'],
    isVatExempt: true, // Medicine often exempt
    batches: [
        { lotNumber: 'L23001', expiryDate: '2025-12-31', quantity: 100, costPrice: 8 },
        { lotNumber: 'L22055', expiryDate: '2024-11-30', quantity: 20, costPrice: 7.5 },
    ]
  },
  {
    id: 'P002',
    barcode: '8850987654321',
    name: 'Amoxy (Amoxicillin 500mg)',
    genericName: 'Amoxicillin',
    category: ProductCategory.MEDICINE,
    manufacturer: 'Siam Pharma',
    location: 'B2-05',
    price: 80,
    cost: 45,
    stock: 45,
    minStock: 30,
    unit: 'แผง',
    requiresPrescription: true,
    drugInteractions: ['Warfarin', 'Methotrexate'],
    isVatExempt: true, // Medicine often exempt
    batches: [
        { lotNumber: 'A9901', expiryDate: '2024-10-15', quantity: 45, costPrice: 45 }
    ]
  },
  {
    id: 'P003',
    barcode: '8850111222333',
    name: 'Vitamin C 1000mg Bio-C',
    genericName: 'Ascorbic Acid',
    category: ProductCategory.SUPPLEMENT,
    manufacturer: 'Blackmores',
    location: 'C1-12',
    price: 350,
    cost: 200,
    stock: 20,
    minStock: 10,
    unit: 'กระปุก',
    requiresPrescription: false,
    isVatExempt: false, // Supplement has VAT
    batches: [
         { lotNumber: 'V8821', expiryDate: '2026-05-20', quantity: 20, costPrice: 200 }
    ]
  },
  {
    id: 'P004',
    barcode: '8850555666777',
    name: 'N-95 Mask',
    genericName: 'Protective Mask',
    category: ProductCategory.EQUIPMENT,
    manufacturer: '3M',
    location: 'D4-01',
    price: 25,
    cost: 10,
    stock: 500,
    minStock: 100,
    unit: 'ชิ้น',
    requiresPrescription: false,
    isVatExempt: false, // Equipment has VAT
    batches: [
         { lotNumber: 'M1123', expiryDate: '2030-01-01', quantity: 500, costPrice: 10 }
    ]
  },
  {
    id: 'P005',
    barcode: '8850888999000',
    name: 'Alcohol Gel 75%',
    genericName: 'Ethyl Alcohol',
    category: ProductCategory.HOUSEHOLD,
    manufacturer: 'GPO',
    location: 'A2-03',
    price: 55,
    cost: 30,
    stock: 8,
    minStock: 20,
    unit: 'ขวด',
    requiresPrescription: false,
    drugInteractions: ['Paracetamol'],
    isVatExempt: false,
    batches: [
        { lotNumber: 'ALC001', expiryDate: '2025-02-14', quantity: 8, costPrice: 30 }
    ]
  },
  {
    id: 'P006',
    barcode: '8850444333222',
    name: 'Ezerra Cream',
    genericName: 'Moisturizer',
    category: ProductCategory.COSMETIC,
    manufacturer: 'Hoe Pharma',
    location: 'C2-08',
    price: 750,
    cost: 500,
    stock: 15,
    minStock: 5,
    unit: 'หลอด',
    requiresPrescription: false,
    isVatExempt: false, // Cosmetic has VAT
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
  { 
      id: 'PO-24001', 
      supplierId: 'S001', 
      supplierName: 'บ. ยาไทย จำกัด', 
      date: '2024-05-01', 
      dueDate: '2024-05-30', 
      status: 'RECEIVED', 
      totalAmount: 15000, 
      paymentStatus: 'PAID',
      items: [
          { productId: 'P001', productName: 'Sara (Paracetamol)', quantity: 1000, unitCost: 7.5 }
      ]
  },
  { 
      id: 'PO-24002', 
      supplierId: 'S002', 
      supplierName: 'Zuellig Pharma', 
      date: '2024-05-15', 
      dueDate: '2024-06-15', 
      status: 'PENDING', 
      totalAmount: 8500, 
      paymentStatus: 'UNPAID',
      items: [
          { productId: 'P002', productName: 'Amoxy', quantity: 200, unitCost: 42.5 }
      ]
  },
];

const generateMockSales = (): SaleRecord[] => {
    const sales: SaleRecord[] = [];
    const today = new Date();
    
    // Past 7 days
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toLocaleString('th-TH');
        
        const dailyCount = 3 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < dailyCount; j++) {
            const hasVat = Math.random() > 0.5;
            const total = 500 + Math.floor(Math.random() * 1000);
            const discount = 0;
            const netTotal = total - discount;
            
            sales.push({
                id: `INV-${date.getFullYear()}${date.getMonth()}${date.getDate()}-${j}`,
                date: dateStr,
                total: total,
                discount: discount,
                pointsRedeemed: 0,
                netTotal: netTotal,
                subtotalVatable: hasVat ? total * 0.934 : 0,
                subtotalExempt: hasVat ? 0 : total,
                vatAmount: hasVat ? total * 0.066 : 0,
                paymentMethod: Math.random() > 0.5 ? 'QR' : 'CASH',
                items: [
                   { ...MOCK_INVENTORY[0], quantity: 2 },
                   { ...MOCK_INVENTORY[2], quantity: 1 }
                ],
                branchId: 'B001'
            });
        }
    }
    return sales;
};

export const MOCK_SALES: SaleRecord[] = generateMockSales();

export const MOCK_STOCK_LOGS: StockLog[] = [
    { id: 'LOG-001', date: '2024-05-24 10:30', productId: 'P001', productName: 'Sara', action: 'SALE', quantity: -2, staffName: 'Admin' },
    { id: 'LOG-002', date: '2024-05-23 14:00', productId: 'P002', productName: 'Amoxy', action: 'RECEIVE', quantity: 50, staffName: 'Admin', note: 'From PO-24000' },
];

export const MOCK_EXPENSES: Expense[] = [
    { id: 'EXP-001', title: 'ค่าเช่าร้าน', category: 'OPERATING', amount: 15000, date: '2024-05-01' },
    { id: 'EXP-002', title: 'ค่าไฟฟ้า', category: 'UTILITY', amount: 4500, date: '2024-05-05' },
    { id: 'EXP-003', title: 'เงินเดือนพนักงาน (part-time)', category: 'SALARY', amount: 8000, date: '2024-05-25' },
];

export const MOCK_SHIFTS: Shift[] = [
    { id: 'S-1001', staffName: 'Staff A', startTime: '2024-05-24 08:00', endTime: '2024-05-24 16:00', startCash: 1000, expectedCash: 5400, actualCash: 5400, totalSales: 4400, status: 'CLOSED' },
    { id: 'S-1002', staffName: 'Staff B', startTime: '2024-05-23 08:00', endTime: '2024-05-23 16:00', startCash: 1000, expectedCash: 3500, actualCash: 3450, totalSales: 2500, status: 'CLOSED' }, 
];