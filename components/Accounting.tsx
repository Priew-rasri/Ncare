
import React, { useState } from 'react';
import { GlobalState, PurchaseOrder } from '../types';
import { FileText, CheckCircle, Clock, XCircle, TrendingUp, TrendingDown, DollarSign, Calendar, AlertCircle, Printer, Users, Truck, Phone, Box, Plus, X, ShoppingCart, Percent, FileBarChart, Wallet, Download, Zap } from 'lucide-react';

interface AccountingProps {
    data: GlobalState;
    dispatch: React.Dispatch<any>;
}

const Accounting: React.FC<AccountingProps> = ({ data, dispatch }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PO' | 'SUPPLIER' | 'EXPENSE' | 'REPORT' | 'CASH'>('OVERVIEW');
    const [showPOModal, setShowPOModal] = useState(false);
    
    const [newPOSupplier, setNewPOSupplier] = useState('');
    const [previewReport, setPreviewReport] = useState<'TAX' | 'SALES' | null>(null);

    // Accurate Financial Calculations
    const totalRevenue = data.sales.reduce((acc, curr) => acc + curr.total, 0);
    const totalExpenses = data.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    // Calculate True COGS based on sold items' cost price
    const totalCOGS = data.sales.reduce((acc, sale) => {
        const saleCost = sale.items.reduce((itemAcc, item) => {
            // Use the cost stored in the item at time of sale (from Product interface)
            return itemAcc + (item.cost * item.quantity);
        }, 0);
        return acc + saleCost;
    }, 0);

    const netProfit = totalRevenue - totalCOGS - totalExpenses;
    
    const totalOutputVAT = data.sales.reduce((acc, curr) => acc + (curr.vatAmount || 0), 0);
    const totalVatableSales = data.sales.reduce((acc, curr) => acc + (curr.subtotalVatable || 0), 0);
    const totalExemptSales = data.sales.reduce((acc, curr) => acc + (curr.subtotalExempt || 0), 0);

    // Margin Calculation
    const grossMarginPercent = totalRevenue > 0 ? ((totalRevenue - totalCOGS) / totalRevenue) * 100 : 0;

    const TabButton = ({ id, label }: { id: string, label: string }) => (
        <button 
            onClick={() => setActiveTab(id as any)}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${
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

    const handleSmartRestock = () => {
        const lowStockItems = data.inventory.filter(p => p.stock <= p.minStock);
        if (lowStockItems.length === 0) {
            alert("No items are currently below minimum stock levels.");
            return;
        }

        if(!window.confirm(`Found ${lowStockItems.length} items with low stock. Generate Purchase Order?`)) return;

        const supplier = data.suppliers[0]; 
        
        const newPO: PurchaseOrder = {
            id: `PO-${Date.now().toString().substr(-6)}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            date: new Date().toLocaleDateString('en-CA'),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            items: lowStockItems.map(p => ({
                productId: p.id,
                productName: p.name,
                quantity: p.minStock * 2,
                unitCost: p.cost
            })),
            totalAmount: lowStockItems.reduce((acc, p) => acc + (p.cost * p.minStock * 2), 0)
        };

        dispatch({ type: 'ADD_PO', payload: newPO });
    };

    const handleCreatePO = () => {
        if(!newPOSupplier) return;
        const supplierObj = data.suppliers.find(s => s.id === newPOSupplier);
        
        const newPO: PurchaseOrder = {
            id: `PO-${Date.now().toString().substr(-6)}`,
            supplierId: newPOSupplier,
            supplierName: supplierObj?.name || 'Unknown',
            date: new Date().toLocaleDateString('en-CA'),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-CA'),
            status: 'PENDING',
            paymentStatus: 'UNPAID',
            items: [
                { productId: 'P001', productName: 'Sara (Paracetamol)', quantity: 500, unitCost: 7.5 },
                { productId: 'P004', productName: 'N-95 Mask', quantity: 100, unitCost: 10 }
            ],
            totalAmount: (500*7.5) + (100*10)
        };

        dispatch({ type: 'ADD_PO', payload: newPO });
        setShowPOModal(false);
        setNewPOSupplier('');
    };

    // CSV Export Logic
    const handleExportTaxCSV = () => {
        const headers = ['Date', 'Invoice No', 'Vatable Amount', 'VAT Amount (7%)', 'Net Total', 'Exempt Sales'];
        const rows = data.sales.map(s => [
            s.date.split(' ')[0],
            s.id,
            s.subtotalVatable.toFixed(2),
            s.vatAmount.toFixed(2),
            s.netTotal.toFixed(2),
            s.subtotalExempt.toFixed(2)
        ]);
        
        // Add BOM for Thai Excel compatibility
        const BOM = "\uFEFF";
        const csvContent = "data:text/csv;charset=utf-8," + BOM
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
            
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `tax_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderOverview = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-8 lg:col-span-2">
                <div className="flex justify-between items-start mb-6">
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-600" /> 
                        </div>
                        Profit & Loss Statement
                    </h3>
                    <div className="text-right">
                         <div className="text-xs font-bold text-slate-500 uppercase">Gross Margin</div>
                         <div className="text-blue-600 font-bold">{grossMarginPercent.toFixed(1)}%</div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
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

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Percent className="w-4 h-4 text-slate-400" /> Revenue Tax Breakdown
                        </h4>
                         <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Exempt Sales (Non-VAT)</span>
                                    <span className="font-bold text-slate-700">฿{totalExemptSales.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-green-400 h-full" style={{ width: `${(totalExemptSales / (totalRevenue || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-500">Vatable Sales (Base)</span>
                                    <span className="font-bold text-slate-700">฿{totalVatableSales.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-400 h-full" style={{ width: `${(totalVatableSales / (totalRevenue || 1)) * 100}%` }}></div>
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 z-0"></div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-slate-800 mb-1">Tax Liability</h3>
                        <p className="text-xs text-slate-500 mb-4">Output VAT (ภาษีขายรอชำระ)</p>
                        <div className="text-4xl font-bold text-purple-700 mb-2">฿{totalOutputVAT.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                        <div className="text-xs bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg border border-purple-100 inline-block">
                             Current Month Accrued
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-6">
                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                        </div>
                        Accounts Payable
                    </h3>
                    <div className="space-y-4">
                        {data.purchaseOrders.filter(po => po.paymentStatus === 'UNPAID').slice(0, 3).map(po => (
                            <div key={po.id} className="flex justify-between items-center pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                                <div>
                                    <div className="font-bold text-slate-700 text-sm truncate w-24">{po.supplierName}</div>
                                    <div className="text-[10px] text-slate-400">Due: {po.dueDate}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900 text-sm">฿{po.totalAmount.toLocaleString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPO = () => (
         <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                 <h3 className="font-bold text-slate-800 text-lg">Purchase Orders</h3>
                 <div className="flex gap-2">
                    <button onClick={handleSmartRestock} className="bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 px-4 py-2.5 rounded-full transition-colors flex items-center gap-2">
                        <Zap className="w-4 h-4 text-orange-500" /> Smart Restock
                    </button>
                    <button onClick={() => setShowPOModal(true)} className="bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 px-5 py-2.5 rounded-full transition-colors shadow-lg shadow-blue-200 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Create PO
                    </button>
                 </div>
             </div>
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
                <Plus className="w-10 h-10 mb-2 opacity-50" />
                <span className="font-bold text-sm">Add New Supplier</span>
            </div>
        </div>
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

    const renderReports = () => (
        <div className="space-y-6 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group" onClick={() => setPreviewReport('TAX')}>
                     <div className="bg-purple-50 w-12 h-12 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                         <FileText className="w-6 h-6" />
                     </div>
                     <h3 className="font-bold text-slate-800 text-lg">VAT Report (P.P.30)</h3>
                     <p className="text-sm text-slate-500 mt-2">Generate monthly Input/Output VAT report for tax filing compliance.</p>
                     <div className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
                         Generate Preview <TrendingUp className="w-3 h-3" />
                     </div>
                 </div>

                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group" onClick={() => setPreviewReport('SALES')}>
                     <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                         <FileBarChart className="w-6 h-6" />
                     </div>
                     <h3 className="font-bold text-slate-800 text-lg">Daily Sales Summary</h3>
                     <p className="text-sm text-slate-500 mt-2">Detailed breakdown of sales by category, payment method, and profit margins.</p>
                     <div className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
                         Generate Preview <TrendingUp className="w-3 h-3" />
                     </div>
                 </div>
             </div>

             {previewReport && (
                 <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-in mt-6">
                     <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
                         <div className="flex items-center gap-2">
                             <Printer className="w-5 h-5" />
                             <span className="font-bold">Print Preview: {previewReport === 'TAX' ? 'Tax Report (Output VAT)' : 'Sales Summary'}</span>
                         </div>
                         <button onClick={() => setPreviewReport(null)} className="hover:bg-slate-700 p-1 rounded"><X className="w-5 h-5" /></button>
                     </div>
                     <div className="p-8 font-mono text-sm bg-slate-50 max-h-[600px] overflow-y-auto">
                         <div className="text-center mb-6">
                             <h2 className="font-bold text-xl text-slate-900">{data.settings.storeName}</h2>
                             <p className="text-slate-500">{data.settings.address} (Tax ID: {data.settings.taxId})</p>
                             <h3 className="font-bold text-slate-800 mt-4 border-b border-slate-300 inline-block pb-1">
                                 {previewReport === 'TAX' ? 'รายงานภาษีขาย (Output Tax Report)' : 'รายงานยอดขายประจำวัน (Daily Sales Report)'}
                             </h3>
                             <p className="text-xs text-slate-500 mt-1">Period: {new Date().toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</p>
                         </div>
                         
                         <table className="w-full text-left border-collapse">
                             <thead>
                                 <tr className="border-b-2 border-slate-300">
                                     <th className="py-2">Date</th>
                                     <th className="py-2">Doc No.</th>
                                     <th className="py-2 text-right">Gross Value</th>
                                     <th className="py-2 text-right">VAT (7%)</th>
                                     <th className="py-2 text-right">Net Value</th>
                                 </tr>
                             </thead>
                             <tbody>
                                 {/* REAL DATA INTEGRATION: Slicing only for performance if list is huge, but here we map state.sales */}
                                 {data.sales.map((sale) => (
                                     <tr key={sale.id} className="border-b border-slate-200 text-slate-600 hover:bg-white">
                                         <td className="py-2">{sale.date.split(' ')[0]}</td>
                                         <td className="py-2">{sale.id}</td>
                                         <td className="py-2 text-right">{sale.subtotalVatable.toFixed(2)}</td>
                                         <td className="py-2 text-right">{sale.vatAmount.toFixed(2)}</td>
                                         <td className="py-2 text-right">{(sale.subtotalVatable + sale.vatAmount).toFixed(2)}</td>
                                     </tr>
                                 ))}
                             </tbody>
                             <tfoot>
                                 <tr className="border-t-2 border-slate-300 font-bold text-slate-900 bg-slate-100">
                                     <td colSpan={2} className="py-3 text-right">Grand Total:</td>
                                     <td className="py-3 text-right">{data.sales.reduce((a,c)=>a+c.subtotalVatable,0).toFixed(2)}</td>
                                     <td className="py-3 text-right">{data.sales.reduce((a,c)=>a+c.vatAmount,0).toFixed(2)}</td>
                                     <td className="py-3 text-right">{data.sales.reduce((a,c)=>a+(c.subtotalVatable+c.vatAmount),0).toFixed(2)}</td>
                                 </tr>
                             </tfoot>
                         </table>
                         
                         <div className="mt-8 text-center flex gap-4 justify-center">
                             <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                                 <Printer className="w-4 h-4" /> Print Document
                             </button>
                             {previewReport === 'TAX' && (
                                 <button onClick={handleExportTaxCSV} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 transition-colors">
                                     <Download className="w-4 h-4" /> Export to CSV
                                 </button>
                             )}
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );

    const renderCashDrawer = () => (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                 <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                     <Wallet className="w-5 h-5 text-slate-400" /> Shift & Cash History
                 </h3>
                 <button className="text-slate-500 hover:text-blue-600 font-bold text-sm flex items-center gap-1">
                     <Download className="w-4 h-4" /> Export CSV
                 </button>
             </div>
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                         <th className="px-6 py-5 font-bold tracking-wider">Shift ID</th>
                         <th className="px-6 py-5 font-bold tracking-wider">Staff</th>
                         <th className="px-6 py-5 font-bold tracking-wider">Time Open/Close</th>
                         <th className="px-6 py-5 font-bold tracking-wider text-right">Total Sales</th>
                         <th className="px-6 py-5 font-bold tracking-wider text-right">Variance</th>
                         <th className="px-6 py-5 font-bold tracking-wider text-center">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.shiftHistory.map(shift => {
                        const variance = (shift.actualCash || 0) - (shift.expectedCash || 0);
                        return (
                            <tr key={shift.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-5 text-blue-600 font-bold font-mono text-xs">{shift.id}</td>
                                <td className="px-6 py-5 font-bold text-slate-800">{shift.staffName}</td>
                                <td className="px-6 py-5">
                                    <div className="text-xs text-slate-500">{shift.startTime}</div>
                                    <div className="text-xs text-slate-500">{shift.endTime}</div>
                                </td>
                                <td className="px-6 py-5 text-right font-bold text-slate-800">฿{shift.totalSales.toLocaleString()}</td>
                                <td className={`px-6 py-5 text-right font-bold ${variance < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {variance > 0 ? '+' : ''}{variance.toLocaleString()}
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-bold">CLOSED</span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
             </table>
         </div>
    );

    return (
        <div className="space-y-8 animate-fade-in pb-10 relative">
            {showPOModal && (
                <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 fixed top-0 left-72 w-[calc(100vw-18rem)] h-screen">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-8 animate-fade-in border border-slate-100">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <ShoppingCart className="w-6 h-6 text-blue-600" /> Create Purchase Order
                            </h3>
                            <button onClick={() => setShowPOModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-2">Select Supplier</label>
                                    <select 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                        value={newPOSupplier}
                                        onChange={(e) => setNewPOSupplier(e.target.value)}
                                    >
                                        <option value="">-- Choose Supplier --</option>
                                        {data.suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-600 mb-2">Expected Delivery</label>
                                    <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" />
                                </div>
                            </div>
                            
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <h4 className="text-sm font-bold text-slate-700 mb-3">Order Items (Simulation)</h4>
                                <div className="space-y-2 text-sm text-slate-600">
                                    <div className="flex justify-between bg-white p-2 rounded border border-slate-100">
                                        <span>Sara (Paracetamol) x 500 pack</span>
                                        <span>฿3,750</span>
                                    </div>
                                    <div className="flex justify-between bg-white p-2 rounded border border-slate-100">
                                        <span>N-95 Mask x 100 pcs</span>
                                        <span>฿1,000</span>
                                    </div>
                                    <div className="flex justify-between pt-2 font-bold text-slate-900 border-t border-slate-200 mt-2">
                                        <span>Total Amount</span>
                                        <span>฿4,750</span>
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleCreatePO} className="w-full py-4 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2">
                                Submit Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                     <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Financial Hub</h2>
                     <p className="text-slate-500 text-sm mt-1">Manage Cashflow, POs, Suppliers, Expenses & Taxes</p>
                </div>
                <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm overflow-x-auto">
                    <TabButton id="OVERVIEW" label="Overview" />
                    <TabButton id="PO" label="Orders (PO)" />
                    <TabButton id="SUPPLIER" label="Suppliers" />
                    <TabButton id="EXPENSE" label="Expenses" />
                    <TabButton id="REPORT" label="Reports" />
                    <TabButton id="CASH" label="Cash & Shifts" />
                </div>
            </div>

            {activeTab === 'OVERVIEW' && renderOverview()}
            {activeTab === 'PO' && renderPO()}
            {activeTab === 'SUPPLIER' && renderSuppliers()}
            {activeTab === 'EXPENSE' && renderExpense()}
            {activeTab === 'REPORT' && renderReports()}
            {activeTab === 'CASH' && renderCashDrawer()}
        </div>
    );
};

export default Accounting;
