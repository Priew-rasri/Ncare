
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

export interface Product {
  id: string;
  name: string;
  genericName: string;
  category: ProductCategory;
  price: number;
  cost: number; // Average cost
  stock: number; // Total stock across batches
  minStock: number;
  unit: string;
  batches: Batch[]; // Added for GPP Compliance
  image?: string;
  requiresPrescription?: boolean; // New: GPP Requirement
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
  lastVisit: string;
  allergies?: string[]; // Critical for pharmacy
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
  branchId: string; // New: Multi-branch support
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  creditTerm: number; // Days
}

export interface PurchaseOrder {
  id: string;
  supplierName: string;
  date: string;
  dueDate: string;
  status: 'PENDING' | 'APPROVED' | 'RECEIVED' | 'CANCELLED';
  totalAmount: number;
  itemsCount: number;
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
  expenses: Expense[];
  currentBranch: Branch;
  branches: Branch[];
}

export type Action =
  | { type: 'ADD_SALE'; payload: SaleRecord }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; quantity: number } }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER_POINTS'; payload: { customerId: string; points: number; spent: number } }
  | { type: 'ADD_PO'; payload: PurchaseOrder }
  | { type: 'SWITCH_BRANCH'; payload: string };
