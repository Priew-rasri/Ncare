


import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { GlobalState } from '../types';
import { ArrowUpRight, ArrowDownRight, Users, DollarSign, PackageCheck, AlertTriangle, Filter, Clock, TrendingUp, MonitorPlay } from 'lucide-react';

interface DashboardProps {
  data: GlobalState;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // --- Real-time Data Calculation ---

  // 1. Calculate Total Metrics
  const totalSales = data.sales.reduce((acc, curr) => acc + curr.total, 0);
  const totalCustomers = data.customers.length;
  const lowStockItems = data.inventory.filter(i => i.stock <= i.minStock).length;
  
  // 2. Expiry Check Logic
  const expiringSoonItems = data.inventory.filter(item => 
      item.batches.some(batch => new Date(batch.expiryDate) < new Date('2025-01-01')) 
  );

  // 3. Dynamic Sales Chart Data (Last 7 Days)
  const salesChartData = useMemo(() => {
    const last7Days = new Map<string, number>();
    const today = new Date();
    
    // Initialize map with 0
    for(let i=6; i>=0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        // Format as "dd/mm"
        const key = d.getDate() + '/' + (d.getMonth()+1); 
        last7Days.set(key, 0);
    }

    // Aggregate Sales
    data.sales.forEach(sale => {
        let dateKey = '';
        try {
            const parts = sale.date.split(' ')[0].split('/');
            if(parts.length >= 2) {
                dateKey = parts[0] + '/' + parts[1];
            }
        } catch (e) {}

        if (last7Days.has(dateKey)) {
            last7Days.set(dateKey, (last7Days.get(dateKey) || 0) + sale.total);
        }
    });

    return Array.from(last7Days).map(([name, sales]) => ({ name, sales }));
  }, [data.sales]);

  // 4. Best Selling Products
  const topProducts = useMemo(() => {
     const productMap = new Map<string, number>();
     data.sales.forEach(sale => {
         sale.items.forEach(item => {
             productMap.set(item.name, (productMap.get(item.name) || 0) + item.quantity);
         });
     });
     return Array.from(productMap).map(([name, value]) => ({ name, value }))
                 .sort((a,b) => b.value - a.value)
                 .slice(0, 5);
  }, [data.sales]);

  // 5. Mock Live Queue for "Ncare Service"
  const queueList = [
      { id: 'A052', status: 'COUNSELING', name: 'คุณสมชาย' },
      { id: 'A053', status: 'WAITING', name: 'คุณหญิง' },
      { id: 'A054', status: 'READY', name: 'คุณลุง' },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

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
            <button className="px-4 py-2 rounded-full text-xs font-bold bg-slate-800 text-white shadow-md">Real-time</button>
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
            subValue="Calculated from real transactions"
            icon={DollarSign} 
            color="blue" 
            trend={12.5} 
        />
        <StatCard 
            title="Active Customers" 
            value={totalCustomers} 
            subValue="Ncare Members"
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
            title="Transactions" 
            value={data.sales.length} 
            subValue={`Avg. ฿${data.sales.length > 0 ? Math.round(totalSales/data.sales.length) : 0} / bill`}
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
                Sales Trend Analysis (Last 7 Days)
            </h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(value) => `฿${value}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)', padding: '12px' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Queue & Top Products */}
        <div className="space-y-6">
             {/* Live Queue Widget (Ncare Exclusive) */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg border border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <MonitorPlay className="w-20 h-20" />
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <h3 className="font-bold text-lg">Live Queue</h3>
                </div>
                <div className="space-y-3 relative z-10">
                    {queueList.map((q, i) => (
                        <div key={i} className="flex justify-between items-center bg-white/10 p-3 rounded-xl border border-white/10">
                            <div>
                                <span className="text-xs text-slate-300 block">{q.name}</span>
                                <span className="font-bold text-xl">{q.id}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                                q.status === 'READY' ? 'bg-green-500 text-white' : 
                                q.status === 'COUNSELING' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'
                            }`}>
                                {q.status}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 text-center">
                    <button className="text-xs font-bold text-slate-300 hover:text-white underline">Manage Queue</button>
                </div>
            </div>

            {/* Top Selling Products */}
            <div className="bg-white p-6 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-50">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    Best Sellers
                </h3>
                <div className="h-[200px] flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={topProducts}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {topProducts.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <TrendingUp className="w-8 h-8 text-slate-300" />
                    </div>
                </div>
                <div className="space-y-2 mt-2">
                    {topProducts.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-xs border-b border-slate-50 pb-1 last:border-0">
                            <span className="text-slate-600 truncate w-32">{p.name}</span>
                            <span className="font-bold text-slate-800">{p.value} units</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
