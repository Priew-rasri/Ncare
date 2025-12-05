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
    <div className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl z-20">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <div className="bg-teal-500 p-2 rounded-lg">
          <Activity className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-wide">PharmaFlow</h1>
          <p className="text-xs text-slate-400">System v1.0.0</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              } ${item.highlight ? 'ring-1 ring-teal-500/50 mt-6' : ''}`}
            >
              <item.icon className={`w-5 h-5 ${item.highlight ? 'text-teal-400' : ''}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center space-x-3 text-slate-400 hover:text-white transition-colors w-full px-4 py-2">
          <Settings className="w-5 h-5" />
          <span>ตั้งค่าระบบ</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;