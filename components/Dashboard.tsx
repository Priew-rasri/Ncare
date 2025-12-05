import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { GlobalState } from '../types';
import { TrendingUp, AlertCircle, Users, DollarSign } from 'lucide-react';

interface DashboardProps {
  data: GlobalState;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const totalSales = data.sales.reduce((acc, curr) => acc + curr.total, 0);
  const lowStockItems = data.inventory.filter(i => i.stock <= i.minStock).length;
  const totalCustomers = data.customers.length;

  const chartData = [
    { name: 'Mon', sales: 4000 },
    { name: 'Tue', sales: 3000 },
    { name: 'Wed', sales: 2000 },
    { name: 'Thu', sales: 2780 },
    { name: 'Fri', sales: 1890 },
    { name: 'Sat', sales: 2390 },
    { name: 'Sun', sales: 3490 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800">ภาพรวมธุรกิจ (Overview)</h2>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">ยอดขายวันนี้</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">฿{totalSales.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-teal-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <p className="text-xs text-teal-600 mt-4 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" /> +12% จากเมื่อวาน
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">สินค้าใกล้หมด</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{lowStockItems} รายการ</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
           <p className="text-xs text-red-600 mt-4">ต้องสั่งซื้อด่วน</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">ลูกค้าสมาชิก</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalCustomers} คน</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Active ใน 30 วัน: 85%</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">กำไรขั้นต้น (Est.)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">฿{(totalSales * 0.4).toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Margin ~40%</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">แนวโน้มยอดขาย (7 วัน)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{fill: '#f1f5f9'}}
              />
              <Bar dataKey="sales" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">ยอดขายสะสม (Cumulative)</h3>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} />
               <YAxis axisLine={false} tickLine={false} />
               <Tooltip />
               <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;