export enum ProductCategory {
  MEDICINE = 'ยา',
  SUPPLEMENT = 'อาหารเสริม',
  EQUIPMENT = 'อุปกรณ์การแพทย์',
  COSMETIC = 'เวชสำอาง',
  HOUSEHOLD = 'ยาสามัญประจำบ้าน'
}

export interface Product {
  id: string;
  name: string;
  genericName: string;
  category: ProductCategory;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  expiryDate: string;
  image?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  points: number;
  totalSpent: number;
  lastVisit: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface SaleRecord {
  id: string;
  date: string;
  customerId?: string; // Optional (Walk-in)
  items: CartItem[];
  total: number;
  paymentMethod: 'CASH' | 'QR' | 'CREDIT';
}

export interface PurchaseOrder {
  id: string;
  supplierName: string;
  date: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  itemsCount: number;
}

export interface GlobalState {
  inventory: Product[];
  customers: Customer[];
  sales: SaleRecord[];
  purchaseOrders: PurchaseOrder[];
}

export type Action =
  | { type: 'ADD_SALE'; payload: SaleRecord }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; quantity: number } } // quantity can be negative
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER_POINTS'; payload: { customerId: string; points: number; spent: number } };
