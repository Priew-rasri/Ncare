import React from 'react';
import { GlobalState } from '../types';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface AccountingProps {
    data: GlobalState;
}

const Accounting: React.FC<AccountingProps> = ({ data }) => {
    return (
        <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">บัญชี & จัดซื้อ (PO & Accounting)</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Purchase Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                            <FileText className="w-5 h-5" /> ใบสั่งซื้อล่าสุด (Purchase Orders)
                        </h3>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-sm">
                            <thead className="bg-white border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">PO #</th>
                                    <th className="px-4 py-3 text-left font-medium text-slate-500">ผู้จัดจำหน่าย</th>
                                    <th className="px-4 py-3 text-right font-medium text-slate-500">ยอดรวม</th>
                                    <th className="px-4 py-3 text-center font-medium text-slate-500">สถานะ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {data.purchaseOrders.map(po => (
                                    <tr key={po.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{po.id}</td>
                                        <td className="px-4 py-3 text-slate-600">{po.supplierName}</td>
                                        <td className="px-4 py-3 text-right text-slate-900">฿{po.totalAmount.toLocaleString()}</td>
                                        <td className="px-4 py-3 flex justify-center">
                                            {po.status === 'COMPLETED' && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3"/> สำเร็จ</span>}
                                            {po.status === 'PENDING' && <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs flex items-center gap-1"><Clock className="w-3 h-3"/> รอของ</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <div className="p-4 border-t border-slate-100">
                        <button className="w-full py-2 border border-dashed border-slate-300 text-slate-500 rounded-lg hover:border-teal-500 hover:text-teal-600 transition-colors">
                            + สร้างใบสั่งซื้อใหม่
                        </button>
                    </div>
                </div>

                {/* Simple P&L */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-700 mb-4">สรุปรายรับ-รายจ่าย (เดือนนี้)</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                            <span className="text-green-800 font-medium">รายรับรวม (Sales)</span>
                            <span className="text-green-800 font-bold text-lg">฿52,450</span>
                        </div>
                         <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                            <span className="text-red-800 font-medium">ต้นทุนสินค้า (COGS)</span>
                            <span className="text-red-800 font-bold text-lg">-฿31,200</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-slate-600 font-medium">ค่าใช้จ่ายดำเนินงาน (OpEx)</span>
                            <span className="text-slate-800 font-bold text-lg">-฿8,500</span>
                        </div>
                        
                        <div className="border-t border-slate-200 my-4"></div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-800 font-bold text-lg">กำไรสุทธิ (Net Profit)</span>
                            <span className="text-teal-600 font-bold text-2xl">+฿12,750</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Accounting;