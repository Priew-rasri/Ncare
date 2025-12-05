
import React, { useState } from 'react';
import { GlobalState } from '../types';
import { FileText, CheckCircle, Clock, XCircle, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle, Printer, Users, Truck, Phone, Box } from 'lucide-react';

interface AccountingProps {
    data: GlobalState;
    dispatch: React.Dispatch<any>;
}

const Accounting: React.FC<AccountingProps> = ({ data, dispatch }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PO' | 'SUPPLIER' | 'EXPENSE'>('OVERVIEW');

    const totalRevenue = data.sales.reduce((acc, curr) => acc + curr.total, 0);
    const totalExpenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalCOGS = totalRevenue * 0.6; // Estimated COGS
    const netProfit = totalRevenue - totalCOGS - totalExpenses;

    const TabButton = ({ id, label }: { id: string, label: string }) => (
        <button 
            onClick={() => setActiveTab(id as any)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeTab === id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
        >
            {label}
        </button>
    );

    const handleReceivePO = (poId: string) => {
        if (window.confirm("ยืนยันการรับสินค้าเข้าคลัง? \nระบบจะสร้าง Lot ใหม่และเพิ่มจำนวนสินค้าใน Inventory ทันที")) {
            dispatch({ type: 'RECEIVE_PO', payload: { poId, receivedDate: new Date().toISOString() } });
        }
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
            {/* P&L Card */}
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-8">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> 
                        </div>
                        Profit & Loss Statement
                    </h3>
                    <button className="text-slate-400 hover:text-blue-600"><Printer className="w-5 h-5"/></button>
                </div>
                
                <div className="space-y-6">
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                        <div>
                            <span className="block text-emerald-800 text-sm font-bold uppercase tracking-wide">Total Revenue</span>
                            <span className="text-xs text-emerald-600 mt-1 opacity-80">Gross Sales (VAT Included)</span>
                        </div>
                        <span className="text-emerald-800 font-bold text-3xl tracking-tight">฿{totalRevenue.toLocaleString()}</span>
                    </div>

                    <div className="space-y-3">
                         <div className="flex justify-between items-center px-2">
                            <span className="text-slate-500 text-sm font-medium">Cost of Goods Sold (COGS)</span>
                            <span className="text-slate-800 font-semibold">-฿{totalCOGS.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-[1px]"></div>
                        <div className="flex justify-between items-center px-2">
                            <span className="text-slate-500 text-sm font-medium">Operating Expenses</span>
                            <span className="text-slate-800 font-semibold">-฿{totalExpenses.toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t-2 border-slate-100 flex justify-between items-center">
                        <span className="text-slate-900 font-bold text-lg">Net Profit</span>
                        <span className={`font-bold text-3xl tracking-tight ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {netProfit >= 0 ? '+' : ''}฿{netProfit.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Pending AP Card */}
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-8">
                 <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3 text-lg">
                    <div className="bg-orange-100 p-2 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    Accounts Payable (Unpaid POs)
                </h3>
                <div className="space-y-4">
                     {data.purchaseOrders.filter(po => po.paymentStatus === 'UNPAID').map(po => (
                         <div key={po.id} className="flex justify-between items-center p-5 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                             <div>
                                 <div className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">{po.supplierName}</div>
                                 <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">Due: <span className="font-mono">{po.dueDate}</span></div>
                             </div>
                             <div className="text-right">
                                 <div className="font-bold text-slate-900 text-lg">฿{po.totalAmount.toLocaleString()}</div>
                                 <div className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100 inline-block mt-1 uppercase">Pending</div>
                             </div>
                         </div>
                     ))}
                     {data.purchaseOrders.filter(po => po.paymentStatus === 'UNPAID').length === 0 && (
                         <div className="text-center text-slate-400 py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <CheckCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">All caught up! No pending payments.</p>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );

    const renderPO = () => (
         <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-in">
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-5 font-bold tracking-wider">PO Number</th>
                            <th className="px-6 py-5 font-bold tracking-wider">Date / Due</th>
                            <th className="px-6 py-5 font-bold tracking-wider">Supplier</th>
                            <th className="px-6 py-5 font-bold tracking-wider text-right">Amount</th>
                            <th className="px-6 py-5 font-bold tracking-wider text-center">Status</th>
                            <th className="px-6 py-5 font-bold tracking-wider text-center">ERP Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.purchaseOrders.map(po => (
                            <tr key={po.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-5 font-bold text-blue-600 font-mono">{po.id}</td>
                                <td className="px-6 py-5">
                                    <div className="text-slate-800 font-medium">{po.date}</div>
                                    <div className="text-xs text-slate-400 mt-1">Due: {po.dueDate}</div>
                                </td>
                                <td className="px-6 py-5 font-medium text-slate-700">{po.supplierName}</td>
                                <td className="px-6 py-5 text-right font-bold text-slate-900">฿{po.totalAmount.toLocaleString()}</td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                        po.status === 'RECEIVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                        po.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                        'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {po.status}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    {po.status === 'PENDING' ? (
                                        <button 
                                            onClick={() => handleReceivePO(po.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-2 px-3 rounded-lg flex items-center gap-1 mx-auto shadow-sm transition-all"
                                        >
                                            <Box className="w-3 h-3"/> Receive Goods
                                        </button>
                                    ) : (
                                        <span className="text-slate-400 text-xs flex justify-center items-center gap-1"><CheckCircle className="w-3 h-3"/> Completed</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );

    const renderSuppliers = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {data.suppliers.map(sup => (
                <div key={sup.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {sup.name.charAt(0)}
                        </div>
                        <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold">
                            Credit: {sup.creditTerm} Days
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1">{sup.name}</h3>
                    <p className="text-sm text-slate-500 mb-4">{sup.address}</p>
                    
                    <div className="space-y-2 border-t border-slate-50 pt-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="w-4 h-4 text-slate-400" /> {sup.contactPerson}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" /> {sup.phone}
                        </div>
                    </div>
                </div>
            ))}
             <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-all h-full min-h-[200px]">
                <PlusIcon className="w-10 h-10 mb-2 opacity-50" />
                <span className="font-bold text-sm">Add New Supplier</span>
            </div>
        </div>
    );
    
    // Helper Icon
    const PlusIcon = ({className}:{className?:string}) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    );

    const renderExpense = () => (
         <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                 <h3 className="font-bold text-slate-800 text-lg">Expense Records</h3>
                 <button className="bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 px-5 py-2.5 rounded-full transition-colors shadow-lg shadow-slate-200">+ Record Expense</button>
             </div>
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                         <th className="px-6 py-5 font-bold tracking-wider">Date</th>
                         <th className="px-6 py-5 font-bold tracking-wider">Description</th>
                         <th className="px-6 py-5 font-bold tracking-wider">Category</th>
                         <th className="px-6 py-5 font-bold tracking-wider text-right">Amount</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.expenses.map(exp => (
                        <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-5 text-slate-500 font-mono text-xs">{exp.date}</td>
                            <td className="px-6 py-5 font-bold text-slate-800">{exp.title}</td>
                            <td className="px-6 py-5">
                                <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">{exp.category}</span>
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Hub</h2>
                     <p className="text-slate-500 text-sm mt-1">Manage Cashflow, POs, Suppliers and Expenses</p>
                </div>
                <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm overflow-x-auto">
                    <TabButton id="OVERVIEW" label="Overview" />
                    <TabButton id="PO" label="Purchase Orders" />
                    <TabButton id="SUPPLIER" label="Suppliers" />
                    <TabButton id="EXPENSE" label="Expenses" />
                </div>
            </div>

            {activeTab === 'OVERVIEW' && renderOverview()}
            {activeTab === 'PO' && renderPO()}
            {activeTab === 'SUPPLIER' && renderSuppliers()}
            {activeTab === 'EXPENSE' && renderExpense()}
        </div>
    );
};

export default Accounting;
