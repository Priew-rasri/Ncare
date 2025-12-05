
export enum ProductCategory {
  MEDICINE = 'ยา',
  SUPPLEMENT = 'อาหารเสริม',
  EQUIPMENT = 'อุปกรณ์การแพทย์',
  COSMETIC = 'เวชสำอาง',
  HOUSEHOLD = 'ยาสามัญประจำบ้าน'
}

export interface Batch {
  lotNumber: string;
  expiryDate: string;
  quantity: number;
  costPrice: number;
}

export interface StockLog {
  id: string;
  date: string;
  productId: string;
  productName: string;
  action: 'SALE' | 'RECEIVE' | 'ADJUST' | 'RETURN';
  quantity: number;
  staffName: string;
  note?: string;
  batchId?: string;
}

export interface Product {
  id: string;
  barcode: string; // Critical for POS
  name: string;
  genericName: string;
  category: ProductCategory;
  manufacturer: string;
  location: string; // Warehouse Zone e.g., A1-02
  price: number;
  cost: number; // Moving Average Cost
  stock: number; // Total stock
  minStock: number;
  unit: string;
  batches: Batch[];
  image?: string;
  requiresPrescription?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
  lastVisit: string;
  allergies?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  customerId?: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'CASH' | 'QR' | 'CREDIT';
  branchId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  creditTerm: number; // Days
  rating: number; // 1-5
}

export interface POItem {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  dueDate: string;
  status: 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  items: POItem[];
  totalAmount: number;
  paymentStatus: 'UNPAID' | 'PAID';
}

export interface Expense {
  id: string;
  title: string;
  category: 'OPERATING' | 'SALARY' | 'UTILITY' | 'MARKETING';
  amount: number;
  date: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  type: 'HQ' | 'BRANCH';
}

export interface GlobalState {
  inventory: Product[];
  customers: Customer[];
  sales: SaleRecord[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  stockLogs: StockLog[];
  expenses: Expense[];
  currentBranch: Branch;
  branches: Branch[];
}

export type Action =
  | { type: 'ADD_SALE'; payload: SaleRecord }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; quantity: number; note: string } }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER_POINTS'; payload: { customerId: string; points: number; spent: number } }
  | { type: 'ADD_PO'; payload: PurchaseOrder }
  | { type: 'RECEIVE_PO'; payload: { poId: string; receivedDate: string } }
  | { type: 'ADJUST_STOCK'; payload: { productId: string; quantity: number; reason: string; staff: string } } // Warehouse Correction
  | { type: 'SWITCH_BRANCH'; payload: string };
