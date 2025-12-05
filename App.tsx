
import React, { useState, useReducer, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import Accounting from './components/Accounting';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import Login from './components/Login';
import { MOCK_INVENTORY, MOCK_CUSTOMERS, MOCK_SALES, MOCK_PO, MOCK_EXPENSES, MOCK_BRANCHES, MOCK_SUPPLIERS, MOCK_STOCK_LOGS, MOCK_SETTINGS, MOCK_SHIFTS } from './constants';
import { GlobalState, Action, StockLog, Shift, Customer, SystemLog } from './types';
import { Search, Bell, MapPin, ChevronDown, Menu } from 'lucide-react';

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
    case 'ADD_SALE':
        const newLogs: StockLog[] = action.payload.items.map(item => ({
            id: `LOG-${Date.now()}-${Math.random()}`,
            date: new Date().toLocaleString(),
            productId: item.id,
            productName: item.name,
            action: 'SALE',
            quantity: -item.quantity,
            staffName: state.currentUser?.name || 'Unknown'
        }));

        let updatedShift = state.activeShift;
        if (updatedShift && action.payload.paymentMethod === 'CASH') {
             updatedShift = {
                 ...updatedShift,
                 totalSales: updatedShift.totalSales + action.payload.netTotal
             };
        }

        let updatedCustomers = state.customers;
        if (action.payload.customerId) {
            updatedCustomers = state.customers.map(c => {
                if (c.id === action.payload.customerId) {
                    const earnedPoints = Math.floor(action.payload.netTotal / 20);
                    return {
                        ...c,
                        points: c.points - action.payload.pointsRedeemed + earnedPoints,
                        totalSpent: c.totalSpent + action.payload.netTotal,
                        lastVisit: new Date().toISOString().split('T')[0]
                    };
                }
                return c;
            });
        }

      return {
        ...state,
        sales: [action.payload, ...state.sales],
        stockLogs: [...newLogs, ...state.stockLogs],
        activeShift: updatedShift,
        customers: updatedCustomers
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
        
        const sysLog: SystemLog = {
             id: `SYS-${Date.now()}`,
             timestamp: new Date().toLocaleString(),
             actor: action.payload.staff,
             action: 'STOCK_ADJUST',
             details: `Adjusted ${adjustProduct.name} by ${action.payload.quantity} (${action.payload.reason})`,
             severity: 'WARNING'
        };

        return {
            ...state,
            inventory: state.inventory.map(p => 
                p.id === action.payload.productId
                ? { ...p, stock: p.stock + action.payload.quantity }
                : p
            ),
            stockLogs: [adjustmentLog, ...state.stockLogs],
            systemLogs: [sysLog, ...state.systemLogs]
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
            id: `SHIFT-${Date.now()}`,
            staffName: action.payload.staff,
            startTime: new Date().toLocaleString(),
            startCash: action.payload.startCash,
            totalSales: 0,
            status: 'OPEN'
        };
        return { ...state, activeShift: newShift };
        
    case 'CLOSE_SHIFT':
        if (!state.activeShift) return state;
        const closedShift: Shift = {
            ...state.activeShift,
            endTime: new Date().toLocaleString(),
            status: 'CLOSED',
            actualCash: action.payload.actualCash,
            expectedCash: state.activeShift.startCash + state.activeShift.totalSales
        };
        return { 
            ...state, 
            activeShift: null, 
            shiftHistory: [closedShift, ...state.shiftHistory] 
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

    default:
      return state;
  }
};

const initialState: GlobalState = {
  currentUser: null,
  inventory: MOCK_INVENTORY,
  customers: MOCK_CUSTOMERS,
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
  heldBills: []
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persistence Logic
  useEffect(() => {
      const savedState = localStorage.getItem('pharmaflow_db_v1');
      if (savedState) {
          try {
              const parsed = JSON.parse(savedState);
              // Ensure we don't load a logged-in user session by default for security
              dispatch({ type: 'LOAD_STATE', payload: { ...parsed, currentUser: null, activeShift: parsed.activeShift } }); 
          } catch (e) {
              console.error("Failed to load persistence");
          }
      }
  }, []);

  useEffect(() => {
      if (state.currentUser) { // Only save if system is being used
          localStorage.setItem('pharmaflow_db_v1', JSON.stringify(state));
      }
  }, [state]);

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
        // RBAC: Staff cannot see Accounting
        if (state.currentUser?.role === 'STAFF') return <div className="text-center p-10 text-slate-500">Access Denied: Requires Manager Privileges</div>;
        return <Accounting data={state} dispatch={dispatch} />;
      case 'ai-assistant':
        return <AIAssistant data={state} />;
      case 'settings':
         // RBAC: Staff cannot see Settings
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
        <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-20 shadow-sm">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
                    {activeTab === 'ai-assistant' ? 'AI Strategic Assistant' : activeTab}
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="flex items-center gap-6">
                 <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input type="text" placeholder="Global Search..." className="bg-transparent border-none text-sm focus:outline-none w-full text-slate-700" />
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

                 <div className="flex items-center gap-4 border-l border-slate-100 pl-6">
                    <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors hover:bg-blue-50 rounded-full">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
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
