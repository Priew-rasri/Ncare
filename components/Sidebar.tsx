
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Activity,
  Bot,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', thLabel: 'ภาพรวมธุรกิจ', icon: LayoutDashboard },
    { id: 'pos', label: 'Point of Sale', thLabel: 'ขายหน้าร้าน', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', thLabel: 'คลังสินค้า', icon: Package },
    { id: 'crm', label: 'Customers', thLabel: 'ลูกค้าสัมพันธ์', icon: Users },
    { id: 'accounting', label: 'Accounting', thLabel: 'บัญชีและการเงิน', icon: FileText },
    { id: 'ai-assistant', label: 'AI Manager', thLabel: 'ผู้ช่วยอัจฉริยะ', icon: Bot, highlight: true },
    { id: 'settings', label: 'Settings', thLabel: 'ตั้งค่าระบบ', icon: Settings },
  ];

  return (
    <div className="w-72 bg-white text-slate-600 flex flex-col h-screen fixed left-0 top-0 shadow-[0_0_20px_rgba(0,0,0,0.03)] border-r border-slate-100 z-30">
      {/* Brand Header */}
      <div className="p-8 pb-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200 text-white">
          <Activity className="w-7 h-7" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">Pharma<span className="text-blue-600">Flow</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enterprise ERP</p>
        </div>
      </div>

      <div className="px-8 pb-4">
         <div className="h-[1px] bg-slate-100 w-full"></div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'hover:bg-slate-50 hover:text-slate-900'
              } ${item.highlight ? 'mt-6 ring-1 ring-blue-100' : ''}`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full"></div>
              )}
              <item.icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${item.highlight && !isActive ? 'text-blue-500' : ''}`} />
              <div className="flex flex-col items-start text-left">
                  <span className={`font-bold text-sm leading-tight ${isActive ? 'text-blue-800' : ''}`}>{item.label}</span>
                  <span className="text-[10px] opacity-70">{item.thLabel}</span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold border-2 border-white shadow-sm">
                AD
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">Admin User</p>
                <p className="text-xs text-slate-500">HQ Manager</p>
            </div>
        </div>
        <button className="flex items-center justify-center space-x-2 text-slate-500 hover:text-red-600 w-full py-2 text-xs font-bold transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
