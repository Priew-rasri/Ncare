import React, { useState } from 'react';
import { GlobalState } from '../types';
import { Search, Filter, AlertTriangle, CheckCircle, Download } from 'lucide-react';

interface InventoryProps {
  data: GlobalState;
}

const Inventory: React.FC<InventoryProps> = ({ data }) => {
  const [filter, setFilter] = useState('ALL');

  const getStatusBadge = (stock: number, min: number) => {
    if (stock === 0) return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1"><AlertTriangle className="w-3 h-3" /> สินค้าหมด</span>;
    if (stock <= min) return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1"><AlertTriangle className="w-3 h-3" /> ใกล้หมด</span>;
    return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1"><CheckCircle className="w-3 h-3" /> ปกติ</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">คลังสินค้า (Inventory)</h2>
        <div className="flex space-x-2">
            <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2">
                <Download className="w-4 h-4" /> Export
            </button>
            <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 shadow-lg shadow-teal-500/20">
                + เพิ่มสินค้าใหม่
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input type="text" placeholder="ค้นหารหัส, ชื่อยา..." className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="flex gap-2">
             <select className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-600 focus:outline-none">
                <option value="ALL">ทุกหมวดหมู่</option>
                <option value="MED">ยา</option>
                <option value="SUP">อาหารเสริม</option>
             </select>
             <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500">
                <Filter className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-medium">รหัสสินค้า</th>
                <th className="px-6 py-3 font-medium">ชื่อสินค้า</th>
                <th className="px-6 py-3 font-medium">หมวดหมู่</th>
                <th className="px-6 py-3 font-medium text-right">ราคาขาย</th>
                <th className="px-6 py-3 font-medium text-right">คงเหลือ</th>
                <th className="px-6 py-3 font-medium">สถานะ</th>
                <th className="px-6 py-3 font-medium">วันหมดอายุ</th>
                <th className="px-6 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.inventory.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.id}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.genericName}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.category}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">฿{item.price}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-medium ${item.stock <= item.minStock ? 'text-red-600' : 'text-slate-700'}`}>
                        {item.stock}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.stock, item.minStock)}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.expiryDate}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-teal-600 hover:text-teal-800 font-medium text-xs">แก้ไข</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
            <span>แสดง {data.inventory.length} รายการ</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-slate-200 rounded bg-white disabled:opacity-50">ก่อนหน้า</button>
                <button className="px-3 py-1 border border-slate-200 rounded bg-white">ถัดไป</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;