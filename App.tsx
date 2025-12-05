
import React, { useState, useReducer, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import Accounting from './components/Accounting';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Login from './components/Login';
import { MOCK_INVENTORY, MOCK_SALES, MOCK_PO, MOCK_EXPENSES, MOCK_BRANCHES, MOCK_SUPPLIERS, MOCK_STOCK_LOGS, MOCK_SETTINGS, MOCK_SHIFTS } from './constants';
import { GlobalState, Action, StockLog, Shift, Customer, SystemLog, TransferRequest, Notification, SaleRecord } from './types';
import { Search, Bell, MapPin, ChevronDown, Menu, AlertTriangle, Truck, Clock } from 'lucide-react';

// Enhanced Mock Customers for CRM Demo
const MOCK_CUSTOMERS_ENHANCED: Customer[] = [
  { id: 'C001', name: 'คุณสมชาย ใจดี', phone: '081-111-1111', points: 150, totalSpent: 3000, lastVisit: '2024-05-20', allergies: ['Penicillin'] },
  { id: 'C002', name: 'คุณหญิง รักสุขภาพ', phone: '089-999-9999', points: 1200, totalSpent: 25400, lastVisit: '2024-05-22', allergies: [] },
  { id: 'C003', name: 'คุณลุง แข็งแรง', phone: '086-555-4444', points: 20, totalSpent: 400, lastVisit: '2024-04-10', allergies: [] },
  { id: 'C004', name: 'Dr. Strange', phone: '099-888-7777', points: 5000, totalSpent: 120000, lastVisit: '2024-05-25', allergies: ['Sulfa'] },
];

const MOCK_TRANSFERS: TransferRequest[] = [
    { id: 'TR-001', date: '2024-05-20', fromBranchId: 'B001', toBranchId: 'B002', productId: 'P001', productName: 'Sara (Paracetamol)', quantity: 50, status: 'COMPLETED', requestedBy: 'Staff B' }
];

// Helper to generate running numbers: INV-YYMM-XXXX
const generateDocId = (prefix: string, sales: SaleRecord[]): string => {
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefixDate = `${prefix}-${year}${month}-`;
    
    // Filter existing IDs for this month
    const existingIds = sales
        .filter(s => s.id.startsWith(prefixDate))
        .map(s => parseInt(s.id.split('-')[2] || '0'));
        
    const nextSeq = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
    return `${prefixDate}${nextSeq.toString().padStart(4, '0')}`;
};

// Helper for Daily Queue Number
const generateQueueNumber = (sales: SaleRecord[]): string => {
    const today = new Date().toLocaleDateString('en-CA');
    const todaysSales = sales.filter(s => new Date(s.date).toLocaleDateString('en-CA') === today);
    const count = todaysSales.length + 1;
    return `A${count.toString().padStart(3, '0')}`;
}

const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'LOGIN':
        return { 
            ...state, 
            currentUser: action.payload,
            systemLogs: [{
                id: `SYS-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                actor: action.payload.name,
                action: 'LOGIN',
                details: 'User logged into the system',
                severity: 'INFO'
            }, ...state.systemLogs]
        };
    case 'LOGOUT':
        return { 
            ...state, 
            currentUser: null, 
            activeShift: null,
            systemLogs: [{
                id: `SYS-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                actor: state.currentUser?.name || 'Unknown',
                action: 'LOGOUT',
                details: 'User logged out',
                severity: 'INFO'
            }, ...state.systemLogs]
        };
    case 'LOAD_STATE':
        return action.payload;
        
    case 'IMPORT_DATA':
        // Restore everything but keep the current user session if needed
        return {
            ...action.payload,
            currentUser: state.currentUser, // Maintain session
            systemLogs: [{
                id: `SYS-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                actor: state.currentUser?.name || 'Admin',
                action: 'DB_RESTORE',
                details: 'Database restored from backup file',
                severity: 'CRITICAL'
            }, ...(action.payload.systemLogs || [])]
        };
        
    case 'ADD_SALE':
        // Generate proper Running Number & Queue
        const newSaleId = generateDocId('INV', state.sales);
        const newQueue = generateQueueNumber(state.sales);
        const saleRecord = { ...action.payload, id: newSaleId, queueNumber: newQueue };

        // 1. FEFO Logic for Inventory Update
        const updatedInventoryFEFO = state.inventory.map(product => {
            const saleItem = saleRecord.items.find(i => i.id === product.id);
            if (!saleItem) return product;

            let remainingQtyToDeduct = saleItem.quantity;
            // Sort batches by expiry date (Ascending)
            const sortedBatches = [...product.batches].sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
            
            const updatedBatches = sortedBatches.map(batch => {
                if (remainingQtyToDeduct <= 0) return batch;
                
                if (batch.quantity >= remainingQtyToDeduct) {
                    const newBatch = { ...batch, quantity: batch.quantity - remainingQtyToDeduct };
                    remainingQtyToDeduct = 0;
                    return newBatch;
                } else {
                    remainingQtyToDeduct -= batch.quantity;
                    return { ...batch, quantity: 0 }; // Mark as empty
                }
            }).filter(b => b.quantity > 0); // Cleanup empty batches

            return {
                ...product,
                stock: product.stock - saleItem.quantity,
                batches: updatedBatches
            };
        });

        // 2. Stock Logs
        const newLogs: StockLog[] = saleRecord.items.map(item => ({
            id: `LOG-${Date.now()}-${Math.random()}`,
            date: new Date().toLocaleString(),
            productId: item.id,
            productName: item.name,
            action: 'SALE',
            quantity: -item.quantity,
            staffName: state.currentUser?.name || 'Unknown',
            note: `POS Sale: ${newSaleId}`
        }));

        // 3. Update Shift with Breakdown
        let updatedShift = state.activeShift;
        if (updatedShift) {
             updatedShift = {
                 ...updatedShift,
                 totalSales: updatedShift.totalSales + saleRecord.netTotal,
                 totalCashSales: saleRecord.paymentMethod === 'CASH' ? updatedShift.totalCashSales + saleRecord.netTotal : updatedShift.totalCashSales,
                 totalQrSales: saleRecord.paymentMethod === 'QR' ? updatedShift.totalQrSales + saleRecord.netTotal : updatedShift.totalQrSales,
                 totalCreditSales: saleRecord.paymentMethod === 'CREDIT' ? updatedShift.totalCreditSales + saleRecord.netTotal : updatedShift.totalCreditSales,
             };
        }

        // 4. Update Customer Points
        let updatedCustomers = state.customers;
        if (saleRecord.customerId) {
            updatedCustomers = state.customers.map(c => {
                if (c.id === saleRecord.customerId) {
                    const earnedPoints = Math.floor(saleRecord.netTotal / 20);
                    return {
                        ...c,
                        points: c.points - saleRecord.pointsRedeemed + earnedPoints,
                        totalSpent: c.totalSpent + saleRecord.netTotal,
                        lastVisit: new Date().toISOString().split('T')[0]
                    };
                }
                return c;
            });
        }

      return {
        ...state,
        sales: [saleRecord, ...state.sales],
        inventory: updatedInventoryFEFO, // Use the FEFO updated inventory
        stockLogs: [...newLogs, ...state.stockLogs],
        activeShift: updatedShift,
        customers: updatedCustomers
      };
    
    case 'VOID_SALE':
        const { saleId, reason, user } = action.payload;
        const saleToVoid = state.sales.find(s => s.id === saleId);
        
        if (!saleToVoid || saleToVoid.status === 'VOID') return state;

        // 1. Mark Sale as Void
        const updatedSales = state.sales.map(s => 
            s.id === saleId ? { ...s, status: 'VOID' as const, voidReason: reason, voidBy: user } : s
        );

        // 2. Return Stock
        const restoredInventory = state.inventory.map(prod => {
            const item = saleToVoid.items.find(i => i.id === prod.id);
            if (!item) return prod;
            
            const batches = [...prod.batches];
            if (batches.length > 0) {
                batches[batches.length - 1].quantity += item.quantity;
            } else {
                 batches.push({
                     lotNumber: 'RETURNED',
                     expiryDate: '2025-12-31',
                     quantity: item.quantity,
                     costPrice: prod.cost
                 });
            }

            return {
                ...prod,
                stock: prod.stock + item.quantity,
                batches: batches
            };
        });

        // 3. Log Stock Return
        const voidLogs: StockLog[] = saleToVoid.items.map(item => ({
            id: `LOG-VOID-${Date.now()}-${Math.random()}`,
            date: new Date().toLocaleString(),
            productId: item.id,
            productName: item.name,
            action: 'VOID_RETURN',
            quantity: item.quantity,
            staffName: user,
            note: `Void Bill: ${saleId} (${reason})`
        }));

        // 4. Deduct from Shift (Reverse breakdown)
        let shiftAfterVoid = state.activeShift;
        if (shiftAfterVoid) {
            shiftAfterVoid = {
                ...shiftAfterVoid,
                totalSales: shiftAfterVoid.totalSales - saleToVoid.netTotal,
                totalCashSales: saleToVoid.paymentMethod === 'CASH' ? shiftAfterVoid.totalCashSales - saleToVoid.netTotal : shiftAfterVoid.totalCashSales,
                totalQrSales: saleToVoid.paymentMethod === 'QR' ? shiftAfterVoid.totalQrSales - saleToVoid.netTotal : shiftAfterVoid.totalQrSales,
                totalCreditSales: saleToVoid.paymentMethod === 'CREDIT' ? shiftAfterVoid.totalCreditSales - saleToVoid.netTotal : shiftAfterVoid.totalCreditSales,
            };
        }

        return {
            ...state,
            sales: updatedSales,
            inventory: restoredInventory,
            stockLogs: [...voidLogs, ...state.stockLogs],
            activeShift: shiftAfterVoid,
            systemLogs: [{
                id: `SYS-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                actor: user,
                action: 'VOID_TRANSACTION',
                details: `Voided Bill ${saleId}: ${reason}`,
                severity: 'WARNING'
            }, ...state.systemLogs]
        };

    case 'UPDATE_STOCK':
      return {
        ...state,
        inventory: state.inventory.map(p => 
          p.id === action.payload.productId 
            ? { ...p, stock: p.stock + action.payload.quantity }
            : p
        )
      };

    case 'ADJUST_STOCK':
        const adjustProduct = state.inventory.find(p => p.id === action.payload.productId);
        if (!adjustProduct) return state;

        const adjustmentLog: StockLog = {
            id: `LOG-ADJ-${Date.now()}`,
            date: new Date().toLocaleString(),
            productId: action.payload.productId,
            productName: adjustProduct.name,
            action: 'ADJUST',
            quantity: action.payload.quantity,
            staffName: action.payload.staff,
            note: action.payload.reason
        };
        
        return {
            ...state,
            inventory: state.inventory.map(p => 
                p.id === action.payload.productId
                ? { ...p, stock: p.stock + action.payload.quantity }
                : p
            ),
            stockLogs: [adjustmentLog, ...state.stockLogs]
        };

    case 'UPDATE_CUSTOMER_POINTS':
      return {
        ...state,
        customers: state.customers.map(c =>
            c.id === action.payload.customerId
            ? { ...c, points: c.points + action.payload.points, totalSpent: c.totalSpent + action.payload.spent, lastVisit: new Date().toISOString().split('T')[0] }
            : c
        )
      };
    case 'ADD_PO':
        return {
            ...state,
            purchaseOrders: [action.payload, ...state.purchaseOrders]
        };
    case 'RECEIVE_PO':
        const po = state.purchaseOrders.find(p => p.id === action.payload.poId);
        if (!po || po.status === 'RECEIVED') return state;

        const updatedPOs = state.purchaseOrders.map(p => 
            p.id === action.payload.poId ? { ...p, status: 'RECEIVED' as const } : p
        );

        const updatedInventory = state.inventory.map(product => {
            const poItem = po.items.find(i => i.productId === product.id);
            if (poItem) {
                const newBatch = {
                    lotNumber: `LOT-${Date.now().toString().substr(-6)}`,
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0],
                    quantity: poItem.quantity,
                    costPrice: poItem.unitCost
                };
                return {
                    ...product,
                    stock: product.stock + poItem.quantity,
                    batches: [...product.batches, newBatch]
                };
            }
            return product;
        });

        const receiveLogs: StockLog[] = po.items.map(item => ({
            id: `LOG-${Date.now()}-${item.productId}`,
            date: new Date().toLocaleString(),
            productId: item.productId,
            productName: item.productName,
            action: 'RECEIVE',
            quantity: item.quantity,
            staffName: 'Warehouse Mgr',
            note: `Received from ${po.id}`
        }));

        return {
            ...state,
            purchaseOrders: updatedPOs,
            inventory: updatedInventory,
            stockLogs: [...receiveLogs, ...state.stockLogs]
        };

    case 'SWITCH_BRANCH':
        const newBranch = state.branches.find(b => b.id === action.payload);
        return newBranch ? { ...state, currentBranch: newBranch } : state;
        
    case 'OPEN_SHIFT':
        const newShift: Shift = {
            id: `S-${new Date().toISOString().slice(0,10)}-${Date.now().toString().slice(-4)}`,
            staffName: action.payload.staff,
            startTime: new Date().toLocaleString(),
            startCash: action.payload.startCash,
            totalSales: 0,
            totalCashSales: 0,
            totalQrSales: 0,
            totalCreditSales: 0,
            cashTransactions: [],
            status: 'OPEN'
        };
        return { ...state, activeShift: newShift };
        
    case 'CLOSE_SHIFT':
        if (!state.activeShift) return state;
        
        const totalPayOut = state.activeShift.cashTransactions
            .filter(t => t.type === 'PAY_OUT' || t.type === 'CASH_DROP')
            .reduce((acc, curr) => acc + curr.amount, 0);

        const closedShift: Shift = {
            ...state.activeShift,
            endTime: new Date().toLocaleString(),
            status: 'CLOSED',
            actualCash: action.payload.actualCash,
            expectedCash: (state.activeShift.startCash + state.activeShift.totalCashSales) - totalPayOut
        };
        return { 
            ...state, 
            activeShift: null, 
            shiftHistory: [closedShift, ...state.shiftHistory] 
        };
    
    case 'ADD_CASH_TRANSACTION':
        if (!state.activeShift) return state;
        const newTx = {
            id: `TX-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            type: action.payload.type,
            amount: action.payload.amount,
            reason: action.payload.reason,
            staffName: state.currentUser?.name || 'Unknown'
        };
        return {
            ...state,
            activeShift: {
                ...state.activeShift,
                cashTransactions: [...state.activeShift.cashTransactions, newTx]
            }
        };
        
    case 'UPDATE_SETTINGS':
        return { 
            ...state, 
            settings: action.payload,
            systemLogs: [{
                id: `SYS-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                actor: state.currentUser?.name || 'Admin',
                action: 'SETTINGS_UPDATE',
                details: 'Updated global store settings',
                severity: 'WARNING'
            }, ...state.systemLogs]
        };

    case 'HOLD_BILL':
        return {
            ...state,
            heldBills: [...state.heldBills, action.payload]
        };

    case 'RESUME_BILL':
        return {
            ...state,
            heldBills: state.heldBills.filter(b => b.id !== action.payload)
        };

    case 'DELETE_HELD_BILL':
        return {
             ...state,
             heldBills: state.heldBills.filter(b => b.id !== action.payload)
        };
        
    case 'LOG_SYSTEM_EVENT':
        return {
            ...state,
            systemLogs: [{
                id: `SYS-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                ...action.payload
            }, ...state.systemLogs]
        };
    
    case 'REQUEST_TRANSFER':
        return {
            ...state,
            transfers: [action.payload, ...state.transfers],
            systemLogs: [{
                id: `SYS-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                actor: action.payload.requestedBy,
                action: 'STOCK_TRANSFER_REQUEST',
                details: `Requested ${action.payload.quantity} of ${action.payload.productName} from ${action.payload.fromBranchId}`,
                severity: 'INFO'
            }, ...state.systemLogs]
        };

    case 'ADD_PRODUCT':
        const newProductLog: StockLog = {
            id: `LOG-CREATE-${Date.now()}`,
            date: new Date().toLocaleString(),
            productId: action.payload.id,
            productName: action.payload.name,
            action: 'CREATE',
            quantity: action.payload.stock,
            staffName: state.currentUser?.name || 'Admin',
            note: 'New Product Added'
        };
        return {
            ...state,
            inventory: [...state.inventory, action.payload],
            stockLogs: [newProductLog, ...state.stockLogs]
        };

    case 'EDIT_PRODUCT':
        return {
            ...state,
            inventory: state.inventory.map(p => p.id === action.payload.id ? action.payload : p),
            systemLogs: [{
                id: `SYS-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                actor: state.currentUser?.name || 'Admin',
                action: 'EDIT_PRODUCT',
                details: `Edited product details: ${action.payload.name}`,
                severity: 'INFO'
            }, ...state.systemLogs]
        };

    case 'UPDATE_CART_INSTRUCTION':
        return state; 

    default:
      return state;
  }
};

const initialState: GlobalState = {
  currentUser: null,
  inventory: MOCK_INVENTORY,
  customers: MOCK_CUSTOMERS_ENHANCED,
  sales: MOCK_SALES, 
  purchaseOrders: MOCK_PO,
  suppliers: MOCK_SUPPLIERS,
  stockLogs: MOCK_STOCK_LOGS,
  systemLogs: [],
  expenses: MOCK_EXPENSES,
  branches: MOCK_BRANCHES,
  currentBranch: MOCK_BRANCHES[0],
  settings: MOCK_SETTINGS,
  activeShift: null,
  shiftHistory: MOCK_SHIFTS,
  heldBills: [],
  transfers: MOCK_TRANSFERS
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, dispatch] = useReducer(reducer, initialState);
  const [showNotifications, setShowNotifications] = useState(false);

  // Persistence Logic
  useEffect(() => {
      const savedState = localStorage.getItem('pharmaflow_db_v1');
      if (savedState) {
          try {
              const parsed = JSON.parse(savedState);
              // Ensure critical arrays exist even if backup is old
              const mergedState = { 
                  ...parsed, 
                  transfers: parsed.transfers || MOCK_TRANSFERS,
                  sales: parsed.sales || MOCK_SALES 
              };
              dispatch({ type: 'LOAD_STATE', payload: { ...mergedState, currentUser: null, activeShift: parsed.activeShift } }); 
          } catch (e) {
              console.error("Failed to load persistence");
          }
      }
  }, []);

  useEffect(() => {
      if (state.currentUser) { 
          localStorage.setItem('pharmaflow_db_v1', JSON.stringify(state));
      }
  }, [state]);

  // Generate Notifications Logic
  const notifications: Notification[] = useMemo(() => {
      const notifs: Notification[] = [];
      const lowStock = state.inventory.filter(p => p.stock <= p.minStock);
      if (lowStock.length > 0) {
          notifs.push({
              id: 'N-STOCK',
              type: 'LOW_STOCK',
              message: `${lowStock.length} items are below minimum stock level.`,
              timestamp: 'Now',
              read: false
          });
      }
      const pendingTransfers = state.transfers.filter(t => t.toBranchId === state.currentBranch.id && t.status === 'PENDING');
      if (pendingTransfers.length > 0) {
           notifs.push({
              id: 'N-TRANS',
              type: 'TRANSFER',
              message: `${pendingTransfers.length} incoming stock transfer requests.`,
              timestamp: 'Now',
              read: false
          });
      }
      const expiring = state.inventory.filter(i => i.batches.some(b => new Date(b.expiryDate) < new Date('2025-01-01')));
      if (expiring.length > 0) {
          notifs.push({
              id: 'N-EXP',
              type: 'EXPIRY',
              message: `${expiring.length} products have batches near expiry.`,
              timestamp: 'Daily Check',
              read: false
          });
      }
      return notifs;
  }, [state.inventory, state.transfers, state.currentBranch.id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={state} />;
      case 'pos':
        return <POS state={state} dispatch={dispatch} />;
      case 'inventory':
        return <Inventory data={state} dispatch={dispatch} />;
      case 'crm':
        return <CRM data={state} />;
      case 'accounting':
        if (state.currentUser?.role === 'STAFF') return <div className="text-center p-10 text-slate-500">Access Denied: Requires Manager Privileges</div>;
        return <Accounting data={state} dispatch={dispatch} />;
      case 'ai-assistant':
        return <AIAssistant data={state} />;
      case 'settings':
        if (state.currentUser?.role === 'STAFF') return <div className="text-center p-10 text-slate-500">Access Denied: Requires Manager Privileges</div>;
        return <Settings data={state} dispatch={dispatch} />;
      default:
        return <Dashboard data={state} />;
    }
  };

  if (!state.currentUser) {
      return <Login onLogin={(user) => dispatch({ type: 'LOGIN', payload: user })} />;
  }

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
        <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-20 shadow-sm no-print">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
                    {activeTab === 'ai-assistant' ? 'AI Strategic Assistant' : activeTab}
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="flex items-center gap-6">
                 <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input type="text" placeholder="Global Search (Ctrl+K)..." className="bg-transparent border-none text-sm focus:outline-none w-full text-slate-700" />
                 </div>

                 <div className="relative group hidden lg:block">
                     <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>{state.currentBranch.name}</span>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                     </button>
                     <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden hidden group-hover:block animate-fade-in z-50">
                        <div className="p-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Branch</div>
                        {state.branches.map(branch => (
                            <button 
                                key={branch.id}
                                onClick={() => dispatch({ type: 'SWITCH_BRANCH', payload: branch.id })}
                                className={`w-full text-left px-4 py-3 text-sm font-medium hover:bg-blue-50 transition-colors flex items-center justify-between ${state.currentBranch.id === branch.id ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                            >
                                {branch.name}
                                {state.currentBranch.id === branch.id && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                            </button>
                        ))}
                     </div>
                 </div>

                 <div className="flex items-center gap-4 border-l border-slate-100 pl-6 relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-full"
                    >
                        <Bell className="w-5 h-5" />
                        {notifications.length > 0 && (
                             <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </button>
                    
                    {showNotifications && (
                        <div className="absolute right-16 top-14 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-fade-in">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                                <span className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded-full">{notifications.length} New</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-slate-400 text-sm">No new notifications</div>
                                ) : (
                                    notifications.map(n => (
                                        <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-full shrink-0 ${
                                                    n.type === 'LOW_STOCK' ? 'bg-orange-100 text-orange-600' : 
                                                    n.type === 'TRANSFER' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                                                }`}>
                                                    {n.type === 'LOW_STOCK' && <AlertTriangle className="w-4 h-4" />}
                                                    {n.type === 'TRANSFER' && <Truck className="w-4 h-4" />}
                                                    {n.type === 'EXPIRY' && <Clock className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-700 font-medium leading-tight">{n.message}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">{n.timestamp}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-3 cursor-pointer p-1 rounded-full transition-all group" onClick={() => dispatch({type: 'LOGOUT'})}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-200" title="Click to Logout">
                             {state.currentUser.name.charAt(0)}
                        </div>
                    </div>
                 </div>
            </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto bg-[#f3f4f6]">
             <div className="max-w-7xl mx-auto">
                {renderContent()}
             </div>
        </div>
      </main>
    </div>
  );
};

export default App;
