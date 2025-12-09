import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  Timestamp,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type {
  Product,
  Customer,
  SaleRecord,
  PurchaseOrder,
  Supplier,
  StockLog,
  SystemLog,
  Expense,
  Shift,
  TransferRequest,
  HeldBill,
  Settings,
  Branch,
  User
} from '../types';

// Collection names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  SALES: 'sales',
  PURCHASE_ORDERS: 'purchaseOrders',
  SUPPLIERS: 'suppliers',
  STOCK_LOGS: 'stockLogs',
  SYSTEM_LOGS: 'systemLogs',
  EXPENSES: 'expenses',
  SHIFTS: 'shifts',
  TRANSFERS: 'transfers',
  HELD_BILLS: 'heldBills',
  SETTINGS: 'settings',
  BRANCHES: 'branches',
  USERS: 'users'
};

// ==================== GENERIC CRUD OPERATIONS ====================

/**
 * Get all documents from a collection
 */
export async function getAll<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get a single document by ID
 */
export async function getById<T>(collectionName: string, id: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
  } catch (error) {
    console.error(`Error getting document ${id} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Add a new document
 */
export async function add<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Update an existing document
 */
export async function update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
  try {
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating document ${id} in ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Delete a document
 */
export async function remove(collectionName: string, id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, collectionName, id));
  } catch (error) {
    console.error(`Error deleting document ${id} from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for a collection
 */
export function subscribe<T>(
  collectionName: string,
  callback: (data: T[]) => void,
  constraints: QueryConstraint[] = []
): () => void {
  const q = query(collection(db, collectionName), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    callback(data);
  }, (error) => {
    console.error(`Error in real-time subscription for ${collectionName}:`, error);
  });
}

/**
 * Subscribe to a single document
 */
export function subscribeToDoc<T>(
  collectionName: string,
  id: string,
  callback: (data: T | null) => void
): () => void {
  const docRef = doc(db, collectionName, id);

  return onSnapshot(docRef, (docSnap) => {
    const data = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as T : null;
    callback(data);
  }, (error) => {
    console.error(`Error in document subscription for ${id}:`, error);
  });
}

// ==================== SPECIALIZED FUNCTIONS ====================

/**
 * Get products by branch
 */
export async function getProductsByBranch(branchId: string): Promise<Product[]> {
  return getAll<Product>(
    COLLECTIONS.PRODUCTS,
    [where('branchId', '==', branchId)]
  );
}

/**
 * Get sales by date range
 */
export async function getSalesByDateRange(startDate: Date, endDate: Date, branchId?: string): Promise<SaleRecord[]> {
  const constraints: QueryConstraint[] = [
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  ];

  if (branchId) {
    constraints.push(where('branchId', '==', branchId));
  }

  return getAll<SaleRecord>(COLLECTIONS.SALES, constraints);
}

/**
 * Get active shift for a branch
 */
export async function getActiveShift(branchId: string): Promise<Shift | null> {
  const shifts = await getAll<Shift>(
    COLLECTIONS.SHIFTS,
    [
      where('branchId', '==', branchId),
      where('status', '==', 'OPEN'),
      limit(1)
    ]
  );
  return shifts.length > 0 ? shifts[0] : null;
}

/**
 * Get customer by phone number
 */
export async function getCustomerByPhone(phone: string): Promise<Customer | null> {
  const customers = await getAll<Customer>(
    COLLECTIONS.CUSTOMERS,
    [where('phone', '==', phone), limit(1)]
  );
  return customers.length > 0 ? customers[0] : null;
}

/**
 * Get low stock items
 */
export async function getLowStockItems(branchId?: string): Promise<Product[]> {
  const constraints: QueryConstraint[] = [];

  if (branchId) {
    constraints.push(where('branchId', '==', branchId));
  }

  const products = await getAll<Product>(COLLECTIONS.PRODUCTS, constraints);
  return products.filter(p => p.stock <= p.minStock);
}

/**
 * Get pending transfers for a branch
 */
export async function getPendingTransfers(toBranchId: string): Promise<TransferRequest[]> {
  return getAll<TransferRequest>(
    COLLECTIONS.TRANSFERS,
    [
      where('toBranchId', '==', toBranchId),
      where('status', '==', 'PENDING')
    ]
  );
}

/**
 * Batch write multiple operations (for transactions)
 */
export async function batchWrite(operations: Array<{
  type: 'add' | 'update' | 'delete';
  collection: string;
  id?: string;
  data?: any;
}>): Promise<void> {
  const batch = writeBatch(db);

  operations.forEach(op => {
    if (op.type === 'add' && op.data) {
      const docRef = doc(collection(db, op.collection));
      batch.set(docRef, {
        ...op.data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else if (op.type === 'update' && op.id && op.data) {
      const docRef = doc(db, op.collection, op.id);
      batch.update(docRef, {
        ...op.data,
        updatedAt: serverTimestamp()
      });
    } else if (op.type === 'delete' && op.id) {
      const docRef = doc(db, op.collection, op.id);
      batch.delete(docRef);
    }
  });

  await batch.commit();
}

/**
 * Initialize default settings for a branch
 */
export async function initializeSettings(branchId: string, defaultSettings: Settings): Promise<void> {
  const settingsId = `settings_${branchId}`;
  const existing = await getById<Settings>(COLLECTIONS.SETTINGS, settingsId);

  if (!existing) {
    await add(COLLECTIONS.SETTINGS, {
      ...defaultSettings,
      branchId
    });
  }
}

/**
 * Migrate local storage data to Firestore (one-time migration)
 */
export async function migrateLocalStorageToFirestore(localData: any, branchId: string): Promise<void> {
  try {
    console.log('Starting migration to Firestore...');

    const batch = writeBatch(db);
    let count = 0;

    // Migrate products
    if (localData.inventory && Array.isArray(localData.inventory)) {
      for (const product of localData.inventory) {
        const docRef = doc(collection(db, COLLECTIONS.PRODUCTS));
        batch.set(docRef, { ...product, branchId, createdAt: serverTimestamp() });
        count++;
      }
    }

    // Migrate customers
    if (localData.customers && Array.isArray(localData.customers)) {
      for (const customer of localData.customers) {
        const docRef = doc(collection(db, COLLECTIONS.CUSTOMERS));
        batch.set(docRef, { ...customer, createdAt: serverTimestamp() });
        count++;
      }
    }

    // Migrate sales
    if (localData.sales && Array.isArray(localData.sales)) {
      for (const sale of localData.sales) {
        const docRef = doc(collection(db, COLLECTIONS.SALES));
        batch.set(docRef, { ...sale, branchId, createdAt: serverTimestamp() });
        count++;
      }
    }

    // Commit in batches of 500 (Firestore limit)
    if (count > 0) {
      await batch.commit();
    }

    console.log(`Migration completed: ${count} documents migrated`);
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

export default {
  getAll,
  getById,
  add,
  update,
  remove,
  subscribe,
  subscribeToDoc,
  getProductsByBranch,
  getSalesByDateRange,
  getActiveShift,
  getCustomerByPhone,
  getLowStockItems,
  getPendingTransfers,
  batchWrite,
  initializeSettings,
  migrateLocalStorageToFirestore
};
