
import React, { useState } from 'react';
import { GlobalState } from '../types';
import { Search, Filter, AlertTriangle, CheckCircle, Download, ChevronDown, ChevronUp, Package, Box, RefreshCw, History, MapPin, Barcode } from 'lucide-react';

interface InventoryProps {
  data: GlobalState;
  dispatch: React.Dispatch<any>;
}

const Inventory: React.FC<InventoryProps> = ({ data, dispatch }) => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'MOVEMENT'>('STOCK');
  const [filter, setFilter] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getStatusBadge = (stock: number, min: number) => {
    if (stock === 0) return <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 border border-red-100"><AlertTriangle className="w-3 h-3" /> Out of Stock</span>;
    if (stock <= min) return <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 border border-orange-100"><AlertTriangle className="w-3 h-3" /> Low Stock</span>;
    return <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 border border-green-100"><CheckCircle className="w-3 h-3" /> In Stock</span>;
  };

  const renderStockTable = () => (
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full md:w-96">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input type="text" placeholder="Search product name, lot number..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" />
          </div>
          <div className="flex gap-2">
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
                <Filter className="w-4 h-4" /> Filter
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">
                <RefreshCw className="w-4 h-4" /> Refresh
             </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-blue-800 uppercase bg-blue-50/50 border-b border-blue-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider w-12"></th>
                <th className="px-6 py-4 font-bold tracking-wider">Product Information</th>
                <th className="px-6 py-4 font-bold tracking-wider">Manufacturer/Loc</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Retail Price</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Total Stock</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.inventory.map((item) => (
                <React.Fragment key={item.id}>
                    <tr className={`hover:bg-slate-50 transition-colors cursor-pointer group ${expandedRow === item.id ? 'bg-slate-50' : ''}`} onClick={() => toggleRow(item.id)}>
                    <td className="px-6 py-4 text-center">
                         <button className="text-slate-400 group-hover:text-blue-600 transition-colors">
                             {expandedRow === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                         </button>
                    </td>
                    <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{item.genericName}</div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                            <Barcode className="w-3 h-3" /> {item.barcode}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-slate-700 text-xs font-bold">{item.manufacturer}</div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 bg-slate-100 w-fit px-1.5 py-0.5 rounded">
                            <MapPin className="w-3 h-3" /> Zone: {item.location}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-700">฿{item.price}</td>
                    <td className="px-6 py-4 text-right">
                        <span className={`font-bold text-sm ${item.stock <= item.minStock ? 'text-orange-600' : 'text-slate-800'}`}>
                            {item.stock}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-6 py-4">
                        {getStatusBadge(item.stock, item.minStock)}
                    </td>
                    <td className="px-6 py-4 text-center">
                        <button className="text-blue-600 hover:text-blue-800 font-bold text-xs">Edit</button>
                    </td>
                    </tr>
                    
                    {/* Expanded Detail (Batch) */}
                    {expandedRow === item.id && (
                        <tr className="bg-slate-50/50 shadow-inner">
                            <td colSpan={7} className="px-6 py-4">
                                <div className="bg-white border border-slate-200 rounded-xl p-0 overflow-hidden ml-8 shadow-sm">
                                    <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2">
                                        <Package className="w-4 h-4 text-slate-500" />
                                        <span className="text-xs font-bold text-slate-700 uppercase">Batch Information</span>
                                    </div>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-slate-500 border-b border-slate-100 bg-slate-50">
                                                <th className="py-2 px-4 text-left font-semibold">Lot Number</th>
                                                <th className="py-2 px-4 text-left font-semibold">Expiry Date</th>
                                                <th className="py-2 px-4 text-right font-semibold">Cost Price</th>
                                                <th className="py-2 px-4 text-right font-semibold">Remaining Qty</th>
                                                <th className="py-2 px-4 text-right font-semibold">Condition</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.batches.map((batch, idx) => (
                                                <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                    <td className="py-3 px-4 font-mono text-slate-600">{batch.lotNumber}</td>
                                                    <td className={`py-3 px-4 ${new Date(batch.expiryDate) < new Date('2025-01-01') ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                                                        {batch.expiryDate}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-slate-600">฿{batch.costPrice}</td>
                                                    <td className="py-3 px-4 text-right font-bold text-slate-800">{batch.quantity}</td>
                                                    <td className="py-3 px-4 text-right">
                                                         {new Date(batch.expiryDate) < new Date('2025-01-01') 
                                                            ? <span className="text-red-600 text-[10px] font-bold bg-red-50 px-2 py-0.5 rounded border border-red-100">NEAR EXPIRY</span>
                                                            : <span className="text-green-600 text-[10px] font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">GOOD</span>
                                                         }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );

  const renderMovementLog = () => (
    <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><History className="w-5 h-5 text-slate-400"/> Stock Movement Audit Trail</h3>
            <div className="flex gap-2">
                 <input type="date" className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm text-slate-600" />
            </div>
        </div>
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                <tr>
                    <th className="px-6 py-4 font-bold">Date/Time</th>
                    <th className="px-6 py-4 font-bold">Product</th>
                    <th className="px-6 py-4 font-bold text-center">Action</th>
                    <th className="px-6 py-4 font-bold text-right">Quantity</th>
                    <th className="px-6 py-4 font-bold">Staff</th>
                    <th className="px-6 py-4 font-bold">Note</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {data.stockLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.date}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{log.productName}</td>
                        <td className="px-6 py-4 text-center">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                                log.action === 'SALE' ? 'bg-red-50 text-red-600' :
                                log.action === 'RECEIVE' ? 'bg-green-50 text-green-600' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {log.action}
                            </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {log.quantity > 0 ? '+' : ''}{log.quantity}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">{log.staffName}</td>
                        <td className="px-6 py-4 text-slate-400 text-xs italic">{log.note || '-'}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouse & Inventory</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time Stock Control with Batch Management</p>
        </div>
        <div className="flex space-x-3">
             <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setActiveTab('STOCK')}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'STOCK' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Current Stock
                </button>
                <button 
                    onClick={() => setActiveTab('MOVEMENT')}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'MOVEMENT' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Movement History
                </button>
             </div>
        </div>
      </div>

      {activeTab === 'STOCK' ? renderStockTable() : renderMovementLog()}
    </div>
  );
};

export default Inventory;
