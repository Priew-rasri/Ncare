import React, { useState } from 'react';
import { GlobalState } from '../types';
import { FileText, CheckCircle, Clock, XCircle, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface AccountingProps {
    data: GlobalState;
}

const Accounting: React.FC<AccountingProps> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PO' | 'EXPENSE'>('OVERVIEW');

    const totalRevenue = data.sales.reduce((acc, curr) => acc + curr.total, 0);
    const totalExpenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCOGS = totalRevenue * 0.6; 
    const netProfit = totalRevenue - totalCOGS - totalExpenses;

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 p-8">
                <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-3 text-lg">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-blue-600" /> 
                    </div>
                    Financial Statement (P&L)
                </h3>
                <div className="space-y-5">
                    <div className="flex justify-between items-center p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100">
                        <div>
                            <span className="block text-green-800 text-sm font-bold uppercase tracking-wide">Total Revenue</span>
                            <span className="text-xs text-green-600 mt-1 opacity-80">Gross Sales (VAT Included)</span>
                        </div>
                        <span className="text-green-800 font-bold text-2xl">฿{totalRevenue.toLocaleString()}</span>
                    </div>
                        <div className="flex justify-between items-center p-3 px-2 border-b border-dashed border-slate-200">
                        <span className="text-slate-500 text-sm font-medium">Cost of Goods Sold (COGS)</span>
                        <span className="text-slate-800 font-semibold">-฿{totalCOGS.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 px-2 border-b border-dashed border-slate-200">
                        <span className="text-slate-500 text-sm font-medium">Operating Expenses</span>
                        <span className="text-slate-800 font-semibold">-฿{totalExpenses.toLocaleString()}</span>
                    </div>
                    
                    <div className="pt-6 flex justify-between items-center">
                        <span className="text-slate-800 font-bold text-lg">Net Profit</span>
                        <span className={`font-bold text-3xl ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {netProfit >= 0 ? '+' : ''}฿{netProfit.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 p-8">
                 <h3 className="font-bold text-slate-800 mb-8 flex items-center gap-3 text-lg">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    Accounts Payable
                </h3>
                <div className="space-y-4">
                     {data.purchaseOrders.filter(po => po.paymentStatus === 'UNPAID').map(po => (
                         <div key={po.id} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                             <div>
                                 <div className="font-bold text-slate-800 text-lg">{po.supplierName}</div>
                                 <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">Due Date: <span className="font-medium text-slate-700">{po.dueDate}</span></div>
                             </div>
                             <div className="text-right">
                                 <div className="font-bold text-slate-900 text-xl">฿{po.totalAmount.toLocaleString()}</div>
                                 <div className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-full inline-block mt-1 uppercase tracking-wide">Pending</div>
                             </div>
                         </div>
                     ))}
                     {data.purchaseOrders.filter(po => po.paymentStatus === 'UNPAID').length === 0 && (
                         <div className="text-center text-slate-400 py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>No pending payments</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );

    const renderPO = () => (
         <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden animate-fade-in">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-5 font-bold tracking-wider">PO #</th>
                            <th className="px-6 py-5 font-bold tracking-wider">Date / Due</th>
                            <th className="px-6 py-5 font-bold tracking-wider">Supplier</th>
                            <th className="px-6 py-5 font-bold tracking-wider text-right">Total</th>
                            <th className="px-6 py-5 font-bold tracking-wider text-center">Status</th>
                            <th className="px-6 py-5 font-bold tracking-wider text-center">Payment</th>
                            <th className="px-6 py-5 font-bold tracking-wider text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.purchaseOrders.map(po => (
                            <tr key={po.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-5 font-bold text-blue-600">{po.id}</td>
                                <td className="px-6 py-5">
                                    <div className="text-slate-800 font-medium">{po.date}</div>
                                    <div className="text-xs text-slate-400 mt-1">Due: {po.dueDate}</div>
                                </td>
                                <td className="px-6 py-5 font-medium text-slate-700">{po.supplierName}</td>
                                <td className="px-6 py-5 text-right font-bold text-slate-900">฿{po.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-5 text-center">
                                    {po.status === 'RECEIVED' && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Received</span>}
                                    {po.status === 'PENDING' && <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>}
                                    {po.status === 'APPROVED' && <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Approved</span>}
                                </td>
                                <td className="px-6 py-5 text-center">
                                     {po.paymentStatus === 'PAID' 
                                        ? <span className="text-green-600 flex justify-center items-center gap-1 text-xs font-bold"><CheckCircle className="w-4 h-4"/> Paid</span>
                                        : <span className="text-orange-500 flex justify-center items-center gap-1 text-xs font-bold"><Clock className="w-4 h-4"/> Unpaid</span>
                                     }
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <button className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors">...</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );

    const renderExpense = () => (
         <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                 <h3 className="font-bold text-slate-800 text-lg">Expense Records</h3>
                 <button className="text-blue-600 text-sm font-bold hover:bg-blue-50 px-4 py-2 rounded-full transition-colors">+ Add Expense</button>
             </div>
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                         <th className="px-6 py-5 font-bold tracking-wider">Date</th>
                         <th className="px-6 py-5 font-bold tracking-wider">Description</th>
                         <th className="px-6 py-5 font-bold tracking-wider">Category</th>
                         <th className="px-6 py-5 font-bold tracking-wider text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.expenses.map(exp => (
                        <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 text-slate-600 font-medium">{exp.date}</td>
                            <td className="px-6 py-5 font-bold text-slate-800">{exp.title}</td>
                            <td className="px-6 py-5">
                                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">{exp.category}</span>
                            </td>
                            <td className="px-6 py-5 text-right font-bold text-red-500">-฿{exp.amount.toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
         </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            <div className="flex justify-between items-end">
                <div>
                     <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Accounting & Finance</h2>
                     <p className="text-slate-500 mt-1">ติดตามสถานะทางการเงิน รายรับ และรายจ่าย</p>
                </div>
                <div className="flex bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('OVERVIEW')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'OVERVIEW' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Overview
                    </button>
                    <button 
                        onClick={() => setActiveTab('PO')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'PO' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Purchase Orders
                    </button>
                     <button 
                        onClick={() => setActiveTab('EXPENSE')}
                        className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'EXPENSE' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Expenses
                    </button>
                </div>
            </div>

            {activeTab === 'OVERVIEW' && renderOverview()}
            {activeTab === 'PO' && renderPO()}
            {activeTab === 'EXPENSE' && renderExpense()}
        </div>
    );
};

export default Accounting;