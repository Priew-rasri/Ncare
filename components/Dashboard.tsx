
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
  Line,
  AreaChart,
  Area
} from 'recharts';
import { GlobalState } from '../types';
import { TrendingUp, AlertCircle, Users, DollarSign, ArrowUpRight, Building2, MapPin } from 'lucide-react';

interface DashboardProps {
  data: GlobalState;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const totalSales = data.sales.reduce((acc, curr) => acc + curr.total, 0);
  const lowStockItems = data.inventory.filter(i => i.stock <= i.minStock).length;
  const totalCustomers = data.customers.length;

  const chartData = [
    { name: 'Mon', sales: 4000, hq: 2500, branch1: 1500 },
    { name: 'Tue', sales: 3000, hq: 1800, branch1: 1200 },
    { name: 'Wed', sales: 2000, hq: 1200, branch1: 800 },
    { name: 'Thu', sales: 2780, hq: 1700, branch1: 1080 },
    { name: 'Fri', sales: 1890, hq: 1100, branch1: 790 },
    { name: 'Sat', sales: 2390, hq: 1500, branch1: 890 },
    { name: 'Sun', sales: 3490, hq: 2200, branch1: 1290 },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
             <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Business Overview</h2>
             <div className="flex items-center gap-2 mt-1 text-slate-500">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{data.currentBranch.name}</span>
             </div>
        </div>
        <div className="flex space-x-2">
            <select className="bg-white border border-slate-200 text-slate-700 text-sm font-medium py-2.5 px-4 rounded-full focus:outline-none shadow-sm hover:shadow-md transition-all cursor-pointer">
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
            </select>
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                Download Report
            </button>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl group-hover:bg-blue-600 transition-colors duration-300">
              <DollarSign className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +12.5%
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500">ยอดขายรวม (Total Sales)</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">฿{totalSales.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 rounded-2xl group-hover:bg-orange-500 transition-colors duration-300">
              <AlertCircle className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
            </div>
            {lowStockItems > 0 && (
                <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-100">
                  Refill Needed
                </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-500">สินค้าต่ำกว่าเกณฑ์ (Low Stock)</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{lowStockItems} <span className="text-lg font-normal text-slate-400">Items</span></h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
             <div className="p-3 bg-purple-50 rounded-2xl group-hover:bg-purple-600 transition-colors duration-300">
              <Users className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Active Members</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalCustomers} <span className="text-lg font-normal text-slate-400">Persons</span></h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors duration-300">
              <Building2 className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Branch Performance</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1">#1 <span className="text-lg font-normal text-slate-400">Rank</span></h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 h-[450px]">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
            Sales Overview
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 h-[450px]">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
             <div className="w-2 h-6 bg-orange-500 rounded-full"></div>
             Branch Comparison
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={chartData} barGap={8}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
               <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
               <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                cursor={{fill: '#f8fafc'}}
               />
               <Bar dataKey="hq" name="Headquarters" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={12} />
               <Bar dataKey="branch1" name="Ladprao Branch" fill="#f97316" radius={[6, 6, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
