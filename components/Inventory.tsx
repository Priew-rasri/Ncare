import React, { useState } from 'react';
import { GlobalState, Product } from '../types';
import { Search, Filter, AlertTriangle, CheckCircle, Download, ChevronDown, ChevronUp, Package, Box } from 'lucide-react';

interface InventoryProps {
  data: GlobalState;
}

const Inventory: React.FC<InventoryProps> = ({ data }) => {
  const [filter, setFilter] = useState('ALL');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const getStatusBadge = (stock: number, min: number) => {
    if (stock === 0) return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 border border-red-100"><AlertTriangle className="w-3 h-3" /> Out of Stock</span>;
    if (stock <= min) return <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 border border-orange-100"><AlertTriangle className="w-3 h-3" /> Low Stock</span>;
    return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center w-fit gap-1 border border-green-100"><CheckCircle className="w-3 h-3" /> In Stock</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Inventory Management</h2>
            <p className="text-slate-500 mt-1">จัดการสต็อกสินค้า Lot และวันหมดอายุ (FEFO System)</p>
        </div>
        <div className="flex space-x-3">
            <button className="bg-white border border-slate-200 text-slate-600 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-50 flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
                <Download className="w-4 h-4" /> Export Report
            </button>
            <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-200 transition-all flex items-center gap-2">
                <Box className="w-4 h-4" /> Receive Goods (GR)
            </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative w-full md:w-96">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input type="text" placeholder="ค้นหารหัส, ชื่อยา, Lot No..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-0 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" />
          </div>
          <div className="flex gap-2">
             <select className="border border-slate-200 rounded-full px-4 py-2 text-sm bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer hover:border-blue-300 transition-colors">
                <option value="ALL">All Categories</option>
                <option value="MED">Medicine</option>
                <option value="SUP">Supplements</option>
             </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider"></th>
                <th className="px-6 py-4 font-bold tracking-wider">Product Name</th>
                <th className="px-6 py-4 font-bold tracking-wider">Category</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Price</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Total Stock</th>
                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.inventory.map((item) => (
                <React.Fragment key={item.id}>
                    <tr className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${expandedRow === item.id ? 'bg-blue-50/20' : ''}`} onClick={() => toggleRow(item.id)}>
                    <td className="px-6 py-5 text-center w-10">
                         <button className="text-slate-400 hover:text-blue-600 transition-colors">
                             {expandedRow === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                         </button>
                    </td>
                    <td className="px-6 py-5">
                        <div className="font-bold text-slate-800 text-base">{item.name}</div>
                        <div className="text-xs text-slate-500 mt-1">{item.genericName} <span className="text-slate-300 mx-2">|</span> ID: {item.id}</div>
                    </td>
                    <td className="px-6 py-5">
                        <span className="bg-slate-100 text-slate-600 py-1 px-3 rounded-full text-xs font-bold">{item.category}</span>
                    </td>
                    <td className="px-6 py-5 text-right font-bold text-slate-700">฿{item.price}</td>
                    <td className="px-6 py-5 text-right">
                        <span className={`font-bold text-base ${item.stock <= item.minStock ? 'text-red-600' : 'text-slate-800'}`}>
                            {item.stock}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                    </td>
                    <td className="px-6 py-5">
                        {getStatusBadge(item.stock, item.minStock)}
                    </td>
                    <td className="px-6 py-5 text-center">
                        <button className="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-full transition-colors">Edit</button>
                    </td>
                    </tr>
                    {expandedRow === item.id && (
                        <tr className="bg-slate-50/30">
                            <td colSpan={7} className="px-6 py-4">
                                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ml-10">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2 tracking-wider">
                                        <Package className="w-4 h-4 text-blue-500" /> Batch Details & Expiry
                                    </h4>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-slate-400 border-b border-slate-100">
                                                <th className="py-2 text-left font-medium">Lot Number</th>
                                                <th className="py-2 text-left font-medium">Expiry Date</th>
                                                <th className="py-2 text-right font-medium">Cost</th>
                                                <th className="py-2 text-right font-medium">Quantity</th>
                                                <th className="py-2 text-right font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {item.batches.map((batch, idx) => (
                                                <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                    <td className="py-3 font-semibold text-slate-700">{batch.lotNumber}</td>
                                                    <td className={`py-3 ${new Date(batch.expiryDate) < new Date('2025-01-01') ? 'text-red-500 font-bold' : 'text-slate-600'}`}>
                                                        {batch.expiryDate}
                                                    </td>
                                                    <td className="py-3 text-right text-slate-600">฿{batch.costPrice}</td>
                                                    <td className="py-3 text-right font-bold text-slate-800">{batch.quantity}</td>
                                                    <td className="py-3 text-right">
                                                         {new Date(batch.expiryDate) < new Date('2025-01-01') 
                                                            ? <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded">Expiring</span>
                                                            : <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded">Good</span>
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
    </div>
  );
};

export default Inventory;