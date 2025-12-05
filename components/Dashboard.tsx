
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { GlobalState } from '../types';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, PackageCheck, AlertTriangle, Filter, Clock } from 'lucide-react';

interface DashboardProps {
  data: GlobalState;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const totalSales = data.sales.reduce((acc, curr) => acc + curr.total, 0);
  const lowStockItems = data.inventory.filter(i => i.stock <= i.minStock).length;
  const totalCustomers = data.customers.length;
  
  // Expiry Check Logic
  const expiringSoonItems = data.inventory.filter(item => 
      item.batches.some(batch => new Date(batch.expiryDate) < new Date('2025-01-01')) // Mock date for demo
  );

  const chartData = [
    { name: 'Mon', sales: 4000, hq: 2500, branch1: 1500 },
    { name: 'Tue', sales: 3000, hq: 1800, branch1: 1200 },
    { name: 'Wed', sales: 5000, hq: 3200, branch1: 1800 },
    { name: 'Thu', sales: 2780, hq: 1700, branch1: 1080 },
    { name: 'Fri', sales: 6890, hq: 4100, branch1: 2790 },
    { name: 'Sat', sales: 8390, hq: 5500, branch1: 2890 },
    { name: 'Sun', sales: 7490, hq: 4200, branch1: 3290 },
  ];

  const StatCard = ({ title, value, subValue, icon: Icon, color, trend }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-50 card-hover relative overflow-hidden group">
      <div className={`absolute top-0 right-0 p-4 opacity-10 transform translate-x-2 -translate-y-2 group-hover:scale-110 transition-transform duration-500`}>
         <Icon size={80} className={`text-${color}-600`} />
      </div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 bg-${color}-50 rounded-xl`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {trend > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {Math.abs(trend)}%
            </span>
        )}
      </div>
      <div className="relative z-10">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 mt-1 tracking-tight">{value}</h3>
          {subValue && <p className="text-xs text-slate-400 mt-2 font-medium">{subValue}</p>}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
             <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Executive Overview</h2>
             <p className="text-slate-500 text-sm mt-1">Real-time data insights for {data.currentBranch.name}</p>
        </div>
        <div className="flex items-center space-x-3 bg-white p-1 rounded-full shadow-sm border border-slate-200">
            <button className="px-4 py-2 rounded-full text-xs font-bold bg-slate-800 text-white shadow-md">Today</button>
            <button className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50">This Week</button>
            <button className="px-4 py-2 rounded-full text-xs font-bold text-slate-500 hover:bg-slate-50">This Month</button>
            <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
            <button className="p-2 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                <Filter className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Revenue" 
            value={`฿${totalSales.toLocaleString()}`} 
            subValue="+฿12,450 from yesterday"
            icon={DollarSign} 
            color="blue" 
            trend={12.5} 
        />
        <StatCard 
            title="Active Customers" 
            value={totalCustomers} 
            subValue="3 new members today"
            icon={Users} 
            color="indigo" 
            trend={5.2} 
        />
        <StatCard 
            title="Low Stock Items" 
            value={lowStockItems} 
            subValue="Immediate action required"
            icon={AlertTriangle} 
            color="orange" 
            trend={-2.4} 
        />
         <StatCard 
            title="Orders Processed" 
            value={data.sales.length} 
            subValue="Avg. ฿450 per order"
            icon={PackageCheck} 
            color="emerald" 
            trend={8.1} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Sales Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                Sales Trend Analysis
            </h3>
            <select className="text-xs font-bold text-slate-500 bg-slate-50 border-none rounded-lg py-1 px-3 cursor-pointer">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `฿${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', padding: '12px' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Branch & Expiry */}
        <div className="space-y-6">
            {/* Branch Performance */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-50">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    Branch Comparison
                </h3>
                <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                        <Tooltip 
                            cursor={{fill: '#f8fafc'}}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="hq" name="HQ" fill="#2563eb" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="branch1" name="Branch" fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Expiry Alert Widget (Critical for Pharmacy) */}
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-red-100 p-2 rounded-full">
                        <Clock className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                         <h3 className="font-bold text-red-900">Near Expiry Alert</h3>
                         <p className="text-xs text-red-700">Action needed for {expiringSoonItems.length} items</p>
                    </div>
                </div>
                <div className="space-y-2 mt-2">
                    {expiringSoonItems.slice(0, 3).map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg shadow-sm border border-red-100/50">
                            <span className="text-xs font-bold text-slate-700">{item.name}</span>
                            <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">Exp Soon</span>
                        </div>
                    ))}
                    {expiringSoonItems.length === 0 && (
                        <p className="text-xs text-green-700 italic">All items are fresh!</p>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
