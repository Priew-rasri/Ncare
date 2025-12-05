
import React, { useState, useReducer } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import Accounting from './components/Accounting';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import { MOCK_INVENTORY, MOCK_CUSTOMERS, MOCK_SALES, MOCK_PO, MOCK_EXPENSES, MOCK_BRANCHES, MOCK_SUPPLIERS, MOCK_STOCK_LOGS, MOCK_SETTINGS, MOCK_SHIFTS } from './constants';
import { GlobalState, Action, StockLog, Shift } from './types';
import { Search, Bell, MapPin, ChevronDown, Menu } from 'lucide-react';

// Reducer
const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'ADD_SALE':
        // Log movement
        const newLogs: StockLog[] = action.payload.items.map(item => ({
            id: `LOG-${Date.now()}-${Math.random()}`,
            date: new Date().toLocaleString(),
            productId: item.id,
            productName: item.name,
            action: 'SALE',
            quantity: -item.quantity,
            staffName: 'Sales Staff'
        }));

        // Update Shift Sales
        let updatedShift = state.activeShift;
        if (updatedShift && action.payload.paymentMethod === 'CASH') {
             updatedShift = {
                 ...updatedShift,
                 totalSales: updatedShift.totalSales + action.payload.total
             };
        }

      return {
        ...state,
        sales: [action.payload, ...state.sales],
        stockLogs: [...newLogs, ...state.stockLogs],
        activeShift: updatedShift
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

        // 1. Update PO Status
        const updatedPOs = state.purchaseOrders.map(p => 
            p.id === action.payload.poId ? { ...p, status: 'RECEIVED' as const } : p
        );

        // 2. Add Items to Inventory (Generate new Batches)
        const updatedInventory = state.inventory.map(product => {
            const poItem = po.items.find(i => i.productId === product.id);
            if (poItem) {
                const newBatch = {
                    lotNumber: `LOT-${Date.now().toString().substr(-6)}`,
                    expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0], // Mock 2 year expiry
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

        // 3. Create Logs
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
        return { ...state, settings: action.payload };

    default:
      return state;
  }
};

const initialState: GlobalState = {
  inventory: MOCK_INVENTORY,
  customers: MOCK_CUSTOMERS,
  sales: MOCK_SALES,
  purchaseOrders: MOCK_PO,
  suppliers: MOCK_SUPPLIERS,
  stockLogs: MOCK_STOCK_LOGS,
  expenses: MOCK_EXPENSES,
  branches: MOCK_BRANCHES,
  currentBranch: MOCK_BRANCHES[0],
  settings: MOCK_SETTINGS,
  activeShift: null,
  shiftHistory: MOCK_SHIFTS
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, dispatch] = useReducer(reducer, initialState);

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
        return <Accounting data={state} dispatch={dispatch} />;
      case 'ai-assistant':
        return <AIAssistant data={state} />;
      case 'settings':
        return <Settings data={state} dispatch={dispatch} />;
      default:
        return <Dashboard data={state} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-72 flex flex-col h-screen overflow-hidden">
        {/* Modern White Sticky Header */}
        <header className="bg-white px-8 py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-20 shadow-sm">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 capitalize tracking-tight flex items-center gap-2">
                    {activeTab === 'ai-assistant' ? 'AI Strategic Assistant' : activeTab}
                </h1>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="flex items-center gap-6">
                 {/* Search Bar */}
                 <div className="hidden lg:flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 w-64 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <Search className="w-4 h-4 text-slate-400 mr-2" />
                    <input type="text" placeholder="Global Search..." className="bg-transparent border-none text-sm focus:outline-none w-full text-slate-700" />
                 </div>

                 {/* Branch Selector (Enterprise Feature) */}
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
                    <div className="flex items-center gap-3 cursor-pointer p-1 rounded-full transition-all group">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-200">
                             S
                        </div>
                    </div>
                 </div>
            </div>
        </header>

        {/* Content Area */}
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
