
export enum ProductCategory {
  MEDICINE = 'ยา',
  SUPPLEMENT = 'อาหารเสริม',
  EQUIPMENT = 'อุปกรณ์การแพทย์',
  COSMETIC = 'เวชสำอาง',
  HOUSEHOLD = 'ยาสามัญประจำบ้าน'
}

export type UserRole = 'OWNER' | 'PHARMACIST' | 'STAFF';

export interface User {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    avatar?: string;
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
  action: 'SALE' | 'RECEIVE' | 'ADJUST' | 'RETURN' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'VOID_RETURN';
  quantity: number;
  staffName: string;
  note?: string;
  batchId?: string;
}

export interface SystemLog {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  genericName: string;
  category: ProductCategory;
  manufacturer: string;
  location: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  batches: Batch[];
  image?: string;
  requiresPrescription?: boolean;
  drugInteractions?: string[];
  isVatExempt: boolean; 
  defaultInstruction?: string; // Standard dosage instructions
}

export type MembershipTier = 'MEMBER' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
  lastVisit: string;
  allergies?: string[];
  tier?: MembershipTier; // Computed usually
}

export interface CartItem extends Product {
  quantity: number;
  instruction?: string; // Custom instruction for this specific sale
}

export interface HeldBill {
    id: string;
    timestamp: string;
    customer?: Customer;
    items: CartItem[];
    note?: string;
}

export interface SaleRecord {
  id: string; // Format: INV-YYMM-XXXX
  date: string;
  customerId?: string;
  items: CartItem[];
  total: number;       
  discount: number;    
  pointsRedeemed: number;
  netTotal: number;    
  
  subtotalVatable: number; 
  subtotalExempt: number;  
  vatAmount: number;       
  
  paymentMethod: 'CASH' | 'QR' | 'CREDIT';
  tenderedAmount?: number;
  change?: number;

  branchId: string;
  shiftId?: string;
  prescriptionImage?: string; // Base64 or URL for GPP compliance
  
  status: 'COMPLETED' | 'VOID';
  voidReason?: string;
  voidBy?: string;

  taxInvoiceDetails?: {
      name: string;
      taxId: string;
      address: string;
      branch?: string;
  }
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  creditTerm: number;
  rating: number;
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

export interface TransferRequest {
    id: string;
    date: string;
    fromBranchId: string;
    toBranchId: string;
    productId: string;
    productName: string;
    quantity: number;
    status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
    requestedBy: string;
}

export interface Shift {
  id: string;
  staffName: string;
  startTime: string;
  endTime?: string;
  startCash: number;
  expectedCash?: number; 
  actualCash?: number; 
  
  // Breakdown for reconciliation
  totalCashSales: number;
  totalQrSales: number;
  totalCreditSales: number;
  totalSales: number; // Sum of all

  status: 'OPEN' | 'CLOSED';
}

export interface Settings {
  storeName: string;
  taxId: string;
  address: string;
  phone: string;
  vatRate: number;
  printerIp: string;
  receiptFooter: string;
}

export interface Notification {
    id: string;
    type: 'LOW_STOCK' | 'EXPIRY' | 'TRANSFER' | 'SYSTEM';
    message: string;
    timestamp: string;
    read: boolean;
}

export interface GlobalState {
  currentUser: User | null; // Auth
  inventory: Product[];
  customers: Customer[];
  sales: SaleRecord[];
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  stockLogs: StockLog[];
  systemLogs: SystemLog[];
  expenses: Expense[];
  currentBranch: Branch;
  branches: Branch[];
  activeShift: Shift | null;
  shiftHistory: Shift[];
  settings: Settings;
  heldBills: HeldBill[];
  transfers: TransferRequest[];
}

export type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_STATE'; payload: GlobalState } // For persistence
  | { type: 'ADD_SALE'; payload: SaleRecord }
  | { type: 'VOID_SALE'; payload: { saleId: string; reason: string; user: string } }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; quantity: number; note: string } }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER_POINTS'; payload: { customerId: string; points: number; spent: number } }
  | { type: 'ADD_PO'; payload: PurchaseOrder }
  | { type: 'RECEIVE_PO'; payload: { poId: string; receivedDate: string } }
  | { type: 'ADJUST_STOCK'; payload: { productId: string; quantity: number; reason: string; staff: string } }
  | { type: 'SWITCH_BRANCH'; payload: string }
  | { type: 'OPEN_SHIFT'; payload: { staff: string; startCash: number } }
  | { type: 'CLOSE_SHIFT'; payload: { actualCash: number } }
  | { type: 'UPDATE_SETTINGS'; payload: Settings }
  | { type: 'HOLD_BILL'; payload: HeldBill }
  | { type: 'RESUME_BILL'; payload: string } 
  | { type: 'DELETE_HELD_BILL'; payload: string }
  | { type: 'UPDATE_CART_INSTRUCTION'; payload: { productId: string; instruction: string } }
  | { type: 'LOG_SYSTEM_EVENT'; payload: Omit<SystemLog, 'id' | 'timestamp'> }
  | { type: 'REQUEST_TRANSFER'; payload: TransferRequest };
