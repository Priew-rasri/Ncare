
import React, { useState } from 'react';
import { GlobalState, TransferRequest } from '../types';
import { Search, Filter, AlertTriangle, CheckCircle, Download, ChevronDown, ChevronUp, Package, Box, RefreshCw, History, MapPin, Barcode, Settings, Save, X, Calendar, ArrowRight, TrendingUp, PieChart, Truck, ArrowLeftRight } from 'lucide-react';

interface InventoryProps {
  data: GlobalState;
  dispatch: React.Dispatch<any>;
}

const Inventory: React.FC<InventoryProps> = ({ data, dispatch }) => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'MOVEMENT' | 'TRANSFERS' | 'EXPIRY' | 'VALUATION'>('STOCK');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Adjustment Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Damaged Stock');

  // Transfer Modal State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProductId, setTransferProductId] = useState('');
  const [transferToBranch, setTransferToBranch] = useState('');
  const [transferQty, setTransferQty] = useState(0);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleAdjustStock = () => {
    if (!adjustProductId || adjustQty === 0) return;
    dispatch({
        type: 'ADJUST_STOCK',
        payload: {
            productId: adjustProductId,
            quantity: adjustQty,
            reason: adjustReason,
            staff: 'Warehouse Manager'
        }
    });
    setShowAdjustModal(false);
    setAdjustProductId('');
    setAdjustQty(0);
  };

  const handleRequestTransfer = () => {
      if(!transferProductId || !transferToBranch || transferQty <= 0) return;
      const product = data.inventory.find(p => p.id === transferProductId);
      
      const newTransfer: TransferRequest = {
          id: `TR-${Date.now().toString().substr(-6)}`,
          date: new Date().toLocaleDateString('en-CA'),
          fromBranchId: data.currentBranch.id,
          toBranchId: transferToBranch,
          productId: transferProductId,
          productName: product?.name || 'Unknown',
          quantity: transferQty,
          status: 'PENDING',
          requestedBy: data.currentUser?.name || 'Admin'
      };

      dispatch({ type: 'REQUEST_TRANSFER', payload: newTransfer });
      setShowTransferModal(false);
      setTransferProductId('');
      setTransferQty(0);
      setTransferToBranch('');
  };

  const handleExportCSV = () => {
      // 1. Convert inventory data to CSV string
      const headers = ['ID', 'Name', 'Generic Name', 'Category', 'Price', 'Cost', 'Stock', 'Min Stock', 'Unit', 'Location'];
      const rows = data.inventory.map(item => [
          item.id,
          `"${item.name}"`, // Quote strings to handle commas
          `"${item.genericName}"`,
          item.category,
          item.price,
          item.cost,
          item.stock,
          item.minStock,
          item.unit,
          item.location
      ]);

      const csvContent = [
          headers.join(','), 
          ...rows.map(r => r.join(','))
      ].join('\n');

      // 2. Create blob and link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
             <button onClick={() => setShowTransferModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg text-sm font-bold text-blue-700 hover:bg-blue-100 shadow-sm">
                <Truck className="w-4 h-4" /> Request Transfer
             </button>
             <button onClick={() => setShowAdjustModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-900 rounded-lg text-sm font-bold text-white hover:bg-slate-800 shadow-md">
                <Settings className="w-4 h-4" /> Stock Adjustment
             </button>
             <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors">
                <Download className="w-4 h-4" /> Export
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
                <th className="px-6 py-4 font-bold tracking-wider text-center">Tax</th>
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
                    <td className="px-6 py-4 text-center">
                        {item.isVatExempt ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">NON-VAT</span>
                        ) : (
                             <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">VAT 7%</span>
                        )}
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
                        <button className="text-blue-600 hover:text-blue-800 font-bold text-xs" onClick={(e) => { e.stopPropagation(); setAdjustProductId(item.id); setShowAdjustModal(true); }}>Adjust</button>
                    </td>
                    </tr>
                    
                    {/* Expanded Detail (Batch) */}
                    {expandedRow === item.id && (
                        <tr className="bg-slate-50/50 shadow-inner">
                            <td colSpan={8} className="px-6 py-4">
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
                                log.action === 'ADJUST' ? 'bg-orange-50 text-orange-600' :
                                'bg-slate-100 text-slate-600'
                            }`}>
                                {log.action}
                            </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${log.quantity > 0 ? 'text-green-600' : log.quantity < 0 ? 'text-red-600' : 'text-slate-600'}`}>
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

  const renderTransfers = () => (
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                   <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><ArrowLeftRight className="w-5 h-5 text-blue-500"/> Inter-Branch Transfers</h3>
                   <p className="text-xs text-slate-400 mt-1">Manage inbound and outbound stock requests between branches.</p>
              </div>
          </div>
          <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                  <tr>
                      <th className="px-6 py-4 font-bold">ID / Date</th>
                      <th className="px-6 py-4 font-bold">Route</th>
                      <th className="px-6 py-4 font-bold">Product</th>
                      <th className="px-6 py-4 font-bold text-right">Qty</th>
                      <th className="px-6 py-4 font-bold text-center">Status</th>
                      <th className="px-6 py-4 font-bold">Requested By</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {data.transfers.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4">
                              <div className="font-bold text-blue-600 text-xs font-mono">{t.id}</div>
                              <div className="text-slate-500 text-xs">{t.date}</div>
                          </td>
                          <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-xs">
                                  <span className="bg-slate-100 px-2 py-1 rounded font-bold text-slate-600">{t.fromBranchId}</span>
                                  <ArrowRight className="w-3 h-3 text-slate-400" />
                                  <span className="bg-blue-50 px-2 py-1 rounded font-bold text-blue-600">{t.toBranchId}</span>
                              </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700">{t.productName}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-800">{t.quantity}</td>
                          <td className="px-6 py-4 text-center">
                              <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                                  t.status === 'COMPLETED' ? 'bg-green-50 text-green-700' :
                                  t.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-slate-100 text-slate-500'
                              }`}>
                                  {t.status}
                              </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">{t.requestedBy}</td>
                      </tr>
                  ))}
                  {data.transfers.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-8 text-slate-400">No transfer requests found</td></tr>
                  )}
              </tbody>
          </table>
      </div>
  );

  const renderExpiryRisk = () => {
      // Flatten inventory to find batches near expiry
      const expiringBatches = data.inventory.flatMap(item => 
          item.batches.map(batch => ({
              ...batch,
              productName: item.name,
              productId: item.id,
              daysRemaining: Math.ceil((new Date(batch.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
          }))
      ).sort((a, b) => a.daysRemaining - b.daysRemaining);

      return (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <div>
                    <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-red-500"/> Expiry Risk Management</h3>
                    <p className="text-xs text-slate-400 mt-1">Batches expiring within 6 months sorted by risk</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-100 rounded-lg text-sm font-bold hover:bg-red-100">
                        Generate Return List
                    </button>
                </div>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-4 font-bold">Product Name</th>
                        <th className="px-6 py-4 font-bold">Lot Number</th>
                        <th className="px-6 py-4 font-bold">Expiry Date</th>
                        <th className="px-6 py-4 font-bold">Days Left</th>
                        <th className="px-6 py-4 font-bold text-right">Quantity</th>
                        <th className="px-6 py-4 font-bold text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {expiringBatches.map((batch, idx) => (
                        <tr key={idx} className={`hover:bg-slate-50 ${batch.daysRemaining < 0 ? 'bg-red-50/30' : ''}`}>
                            <td className="px-6 py-4 font-bold text-slate-700">{batch.productName}</td>
                            <td className="px-6 py-4 font-mono text-slate-500 text-xs">{batch.lotNumber}</td>
                            <td className="px-6 py-4 text-slate-600">{batch.expiryDate}</td>
                            <td className="px-6 py-4">
                                {batch.daysRemaining < 0 ? (
                                    <span className="text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded text-xs">EXPIRED</span>
                                ) : batch.daysRemaining < 90 ? (
                                    <span className="text-orange-600 font-bold">{batch.daysRemaining} days</span>
                                ) : (
                                    <span className="text-green-600">{batch.daysRemaining} days</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">{batch.quantity}</td>
                            <td className="px-6 py-4 text-center">
                                <button className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 mx-auto">
                                    Return <ArrowRight className="w-3 h-3"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      );
  };
  
  const renderValuation = () => {
      // Calculate total stock value
      const totalValue = data.inventory.reduce((acc, curr) => acc + (curr.stock * curr.cost), 0);
      
      // ABC Analysis (Simplified)
      // Sort products by value (consumption value would be better, but let's use stock value for now)
      const sortedByValue = [...data.inventory].sort((a,b) => (b.stock * b.cost) - (a.stock * a.cost));
      
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg flex justify-between items-center">
                  <div>
                      <h3 className="text-slate-400 font-medium text-sm">Total Inventory Valuation (Cost Basis)</h3>
                      <div className="text-4xl font-bold mt-2">฿{totalValue.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-green-400" />
                  </div>
              </div>
              
              <div className="md:col-span-3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                   <div className="p-6 border-b border-slate-100">
                       <h3 className="font-bold text-slate-800 text-lg">Inventory Valuation Breakdown (Top 10 High Value Items)</h3>
                       <p className="text-xs text-slate-500 mt-1">Based on Cost Price * Current Stock</p>
                   </div>
                   <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                           <tr>
                               <th className="px-6 py-4 font-bold">Product</th>
                               <th className="px-6 py-4 font-bold text-right">Cost</th>
                               <th className="px-6 py-4 font-bold text-right">Stock</th>
                               <th className="px-6 py-4 font-bold text-right">Total Value</th>
                               <th className="px-6 py-4 font-bold text-center">Class</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {sortedByValue.slice(0, 10).map((item, idx) => (
                               <tr key={item.id} className="hover:bg-slate-50">
                                   <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                                   <td className="px-6 py-4 text-right text-slate-600">฿{item.cost.toLocaleString()}</td>
                                   <td className="px-6 py-4 text-right text-slate-600">{item.stock}</td>
                                   <td className="px-6 py-4 text-right font-bold text-slate-900">฿{(item.stock * item.cost).toLocaleString()}</td>
                                   <td className="px-6 py-4 text-center">
                                       <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold text-xs border border-blue-100">Class A</span>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative">
      {/* Transfer Request Modal */}
      {showTransferModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 fixed top-0 left-72 w-[calc(100vw-18rem)] h-screen">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-blue-600" /> Request Transfer
                    </h3>
                    <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Select Product</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            value={transferProductId}
                            onChange={(e) => setTransferProductId(e.target.value)}
                        >
                            <option value="">-- Product to Transfer --</option>
                            {data.inventory.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Destination Branch</label>
                         <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            value={transferToBranch}
                            onChange={(e) => setTransferToBranch(e.target.value)}
                        >
                            <option value="">-- Select Branch --</option>
                            {data.branches.filter(b => b.id !== data.currentBranch.id).map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Quantity</label>
                        <input 
                            type="number" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            placeholder="Amount to send"
                            value={transferQty}
                            onChange={(e) => setTransferQty(Number(e.target.value))}
                        />
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowTransferModal(false)} className="flex-1 py-3 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-xl border border-transparent">Cancel</button>
                        <button onClick={handleRequestTransfer} className="flex-1 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2">
                            Send Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 fixed top-0 left-72 w-[calc(100vw-18rem)] h-screen">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-slate-500" /> Stock Adjustment
                    </h3>
                    <button onClick={() => setShowAdjustModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Product</label>
                        <select 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                            value={adjustProductId}
                            onChange={(e) => setAdjustProductId(e.target.value)}
                        >
                            <option value="">-- Select Product to Adjust --</option>
                            {data.inventory.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Curr: {p.stock})</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Adjustment Qty (+/-)</label>
                            <input 
                                type="number" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                placeholder="-5 or 10"
                                value={adjustQty}
                                onChange={(e) => setAdjustQty(Number(e.target.value))}
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Reason</label>
                            <select 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                            >
                                <option value="Damaged Stock">Damaged Stock</option>
                                <option value="Expired">Expired</option>
                                <option value="Inventory Count">Inventory Count Correction</option>
                                <option value="Internal Use">Internal Use</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg flex gap-2 items-start mt-2">
                        <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5" />
                        <p className="text-xs text-blue-700 leading-relaxed">
                            This action will immediately affect the inventory count and create an audit log entry.
                        </p>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button onClick={() => setShowAdjustModal(false)} className="flex-1 py-3 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-xl border border-transparent">Cancel</button>
                        <button onClick={handleAdjustStock} className="flex-1 py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 shadow-lg flex items-center justify-center gap-2">
                            <Save className="w-4 h-4" /> Confirm Adjustment
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouse & Inventory</h2>
            <p className="text-slate-500 text-sm mt-1">Real-time Stock Control with Batch Management</p>
        </div>
        <div className="flex space-x-3 overflow-x-auto">
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
                 <button 
                    onClick={() => setActiveTab('TRANSFERS')}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'TRANSFERS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Transfers
                </button>
                <button 
                    onClick={() => setActiveTab('EXPIRY')}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'EXPIRY' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Expiry Risk
                </button>
                <button 
                    onClick={() => setActiveTab('VALUATION')}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'VALUATION' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Valuation
                </button>
             </div>
        </div>
      </div>

      {activeTab === 'STOCK' && renderStockTable()}
      {activeTab === 'MOVEMENT' && renderMovementLog()}
      {activeTab === 'TRANSFERS' && renderTransfers()}
      {activeTab === 'EXPIRY' && renderExpiryRisk()}
      {activeTab === 'VALUATION' && renderValuation()}
    </div>
  );
};

export default Inventory;
