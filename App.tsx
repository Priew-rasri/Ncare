
import React, { useState, useReducer } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import Accounting from './components/Accounting';
import AIAssistant from './components/AIAssistant';
import { MOCK_INVENTORY, MOCK_CUSTOMERS, MOCK_SALES, MOCK_PO, MOCK_EXPENSES, MOCK_BRANCHES } from './constants';
import { GlobalState, Action } from './types';
import { Search, Bell, MapPin, ChevronDown } from 'lucide-react';

// Reducer
const reducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'ADD_SALE':
      return {
        ...state,
        sales: [action.payload, ...state.sales]
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
    case 'SWITCH_BRANCH':
        const newBranch = state.branches.find(b => b.id === action.payload);
        return newBranch ? { ...state, currentBranch: newBranch } : state;
    default:
      return state;
  }
};

const initialState: GlobalState = {
  inventory: MOCK_INVENTORY,
  customers: MOCK_CUSTOMERS,
  sales: MOCK_SALES,
  purchaseOrders: MOCK_PO,
  expenses: MOCK_EXPENSES,
  branches: MOCK_BRANCHES,
  currentBranch: MOCK_BRANCHES[0]
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
        return <Inventory data={state} />;
      case 'crm':
        return <CRM data={state} />;
      case 'accounting':
        return <Accounting data={state} />;
      case 'ai-assistant':
        return <AIAssistant data={state} />;
      default:
        return <Dashboard data={state} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Modern White Sticky Header */}
        <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex justify-between items-center border-b border-slate-100 sticky top-0 z-20">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold text-slate-800 capitalize tracking-tight">{activeTab === 'ai-assistant' ? 'AI Strategic Assistant' : activeTab}</h1>
                <p className="text-xs text-slate-400 font-medium">{new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="flex items-center gap-6">
                 {/* Branch Selector (Enterprise Feature) */}
                 <div className="relative group hidden lg:block">
                     <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-full text-sm font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-all">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{state.currentBranch.name}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                     </button>
                     <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden hidden group-hover:block animate-fade-in z-50">
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
                    <button className="relative p-2 text-slate-400 hover:text-blue-600 transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 pr-3 rounded-full transition-all group">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-blue-200 group-hover:scale-105 transition-transform">
                             S
                        </div>
                        <div className="flex flex-col items-start hidden lg:flex">
                            <span className="text-sm font-bold text-slate-700 leading-none group-hover:text-blue-600 transition-colors">Somying.P</span>
                            <span className="text-[10px] text-blue-500 font-bold mt-1">Pharmacist (Admin)</span>
                        </div>
                    </div>
                 </div>
            </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto bg-[#f8fafc]">
             {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
