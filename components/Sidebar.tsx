import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Activity,
  Bot
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'ภาพรวม (Dashboard)', icon: LayoutDashboard },
    { id: 'pos', label: 'ขายหน้าร้าน (POS)', icon: ShoppingCart },
    { id: 'inventory', label: 'คลังสินค้า (Inventory)', icon: Package },
    { id: 'crm', label: 'ลูกค้า (CRM)', icon: Users },
    { id: 'accounting', label: 'บัญชี & จัดซื้อ (Acc/PO)', icon: FileText },
    { id: 'ai-assistant', label: 'ผู้ช่วยอัจฉริยะ (AI)', icon: Bot, highlight: true },
  ];

  return (
    <div className="w-64 bg-white text-slate-700 flex flex-col h-screen fixed left-0 top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-slate-100 z-20">
      <div className="p-6 flex items-center space-x-3">
        {/* Amway-like Logo Style: Clean, Bold Color */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2.5 rounded-xl shadow-lg shadow-blue-200">
          <Activity className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-800">PharmaFlow</h1>
          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Enterprise ERP</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-200' 
                  : 'text-slate-500 hover:bg-blue-50 hover:text-blue-700'
              } ${item.highlight ? 'mt-6' : ''}`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${item.highlight && !isActive ? 'text-blue-500' : ''}`} />
              <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button className="flex items-center space-x-3 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors w-full px-4 py-3">
          <Settings className="w-5 h-5" />
          <span className="font-medium">ตั้งค่าระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;