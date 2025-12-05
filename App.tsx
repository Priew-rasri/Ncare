import React, { useState, useReducer } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import POS from './components/POS';
import Inventory from './components/Inventory';
import CRM from './components/CRM';
import Accounting from './components/Accounting';
import AIAssistant from './components/AIAssistant';
import { MOCK_INVENTORY, MOCK_CUSTOMERS, MOCK_SALES, MOCK_PO } from './constants';
import { GlobalState, Action } from './types';

// Reducer for basic state management
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
    default:
      return state;
  }
};

const initialState: GlobalState = {
  inventory: MOCK_INVENTORY,
  customers: MOCK_CUSTOMERS,
  sales: MOCK_SALES,
  purchaseOrders: MOCK_PO,
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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {/* Header Area */}
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 capitalize">{activeTab === 'ai-assistant' ? 'AI Assistant' : activeTab}</h1>
                <p className="text-sm text-slate-500">{new Date().toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end mr-2">
                    <span className="text-sm font-bold text-slate-700">เภสัชกร สมหญิง</span>
                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Admin</span>
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                     <img src="https://picsum.photos/200" alt="Profile" className="w-full h-full object-cover" />
                </div>
            </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;