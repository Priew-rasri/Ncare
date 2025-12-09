
export enum ProductCategory {
  RESPIRATORY = '1.กลุ่มยาระบบทางเดินหายใจ',
  ALLERGY = '2.กลุ่มยาโรคภูมิแพ้',
  GASTRO = '3.กลุ่มยาระบบทางเดินอาหาร',
  CNS = '4.กลุ่มยาระบบประสาทส่วนกลาง',
  URO_GENITAL = '5.กลุ่มยาระบบทางเดินปัสสาวะและสืบพันธุ์',
  ANTI_INFECTIVE = '6.กลุ่มยาฆ่าเชื้อ',
  EYE_EAR_THROAT = '7.กลุ่มยา ตา หู และ คอ',
  CONTRACEPTIVE = '8.ยาคุมกำเนิด และช่องคลอด',
  PAIN_FEVER = '9.กลุ่มยาแก้ปวด ลดไข้',
  MUSCLE_BONE = '10.กลุ่มยาระบบกล้ามเนื้อ และกระดูก',
  ORAL_DENTAL = '11.กลุ่มยาช่องปาก และ ฟัน',
  SKIN = '12.กลุ่มยาทาผิวหนัง',
  BEAUTY = '13.กลุ่ม ผิว ผม เล็บ และความงาม',
  KIDS_SYRUP = '14.กลุ่มยาน้ำเด็ก',
  CHRONIC = '15.กลุ่มยาโรคเรื้อรัง',
  SPECIAL_CONTROL = '16.ยาควบคุมพิเศษ',
  HERBAL = '17.ยาแผนโบราณและสมุนไพร',
  SUPPLEMENT = '18.ผลิตภัณฑ์อาหารเสริม และโภชนาการ',
  EQUIPMENT = '19.อุปกรณ์การแพทย์',
  FIRST_AID = '20.ปฐมพยาบาล'
}

export type UserRole = 'OWNER' | 'PHARMACIST' | 'STAFF';

export interface User {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    email?: string;
    avatar?: string;
    branchId?: string;
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
  action: 'SALE' | 'RECEIVE' | 'ADJUST' | 'RETURN' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'VOID_RETURN' | 'CREATE' | 'EDIT';
  quantity: number;
  staffName: string;
  note?: string;
  batchId?: string;
  runningBalance?: number; // Calculated field for Stock Card
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
  subCategory?: string; // New field for 6.1, 6.2, 15.1 etc.
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

export interface ClinicalCheck {
    isRightPatient: boolean;
    isRightDrug: boolean;
    isDoseCorrect: boolean;
    allergyChecked: boolean;
    counselingComplete: boolean;
    pharmacistName: string;
}

export interface SaleRecord {
  id: string; // Format: INV-YYMM-XXXX
  queueNumber?: string; // Format: A001
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
  doctorName?: string; // For clinic referral
  
  status: 'COMPLETED' | 'VOID';
  voidReason?: string;
  voidBy?: string;

  clinicalCheck?: ClinicalCheck; // Pharmacist verification

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

export interface CashTransaction {
    id: string;
    timestamp: string;
    type: 'PAY_OUT' | 'CASH_DROP'; // Pay Out = Expense, Cash Drop = Move to Safe
    amount: number;
    reason: string;
    staffName: string;
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
  
  cashTransactions: CashTransaction[]; // Petty cash tracking

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
  roundingType: 'NONE' | 'ROUND_DOWN_INT' | 'ROUND_0_25'; // New field for Payment Rounding
}

export interface Notification {
    id: string;
    type: 'LOW_STOCK' | 'EXPIRY' | 'TRANSFER' | 'SYSTEM';
    message: string;
    timestamp: string;
    read: boolean;
}

// Toast Notification Type
export interface ToastMessage {
    id: string;
    type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING';
    message: string;
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
  isQueueMode: boolean; // For Queue Display Board
  toast: ToastMessage | null; // Global Toast State
}

export type Action =
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'LOAD_STATE'; payload: GlobalState } 
  | { type: 'RESET_STATE' }
  | { type: 'IMPORT_DATA'; payload: GlobalState }
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
  | { type: 'ADD_CASH_TRANSACTION'; payload: { type: 'PAY_OUT' | 'CASH_DROP'; amount: number; reason: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Settings }
  | { type: 'HOLD_BILL'; payload: HeldBill }
  | { type: 'RESUME_BILL'; payload: string } 
  | { type: 'DELETE_HELD_BILL'; payload: string }
  | { type: 'UPDATE_CART_INSTRUCTION'; payload: { productId: string; instruction: string } }
  | { type: 'LOG_SYSTEM_EVENT'; payload: Omit<SystemLog, 'id' | 'timestamp'> }
  | { type: 'REQUEST_TRANSFER'; payload: TransferRequest }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'EDIT_PRODUCT'; payload: Product }
  | { type: 'TOGGLE_QUEUE_MODE'; payload: boolean }
  | { type: 'SHOW_TOAST'; payload: { type: 'SUCCESS' | 'ERROR' | 'INFO' | 'WARNING'; message: string } }
  | { type: 'HIDE_TOAST' };
