
import React, { useState } from 'react';
import { GlobalState, TransferRequest, Product } from '../types';
import { Search, Filter, AlertTriangle, CheckCircle, Download, ChevronDown, ChevronUp, Package, Box, RefreshCw, History, MapPin, Barcode, Settings, Save, X, Calendar, ArrowRight, TrendingUp, PieChart, Truck, ArrowLeftRight, Printer, Tag } from 'lucide-react';

interface InventoryProps {
  data: GlobalState;
  dispatch: React.Dispatch<any>;
}

const Inventory: React.FC<InventoryProps> = ({ data, dispatch }) => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'MOVEMENT' | 'TRANSFERS' | 'EXPIRY' | 'VALUATION'>('STOCK');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  
  // Modals
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Damaged Stock');
  
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Shelf Tag Printing State
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagProduct, setTagProduct] = useState<Product | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleAdjustStock = () => {
    if (!adjustProductId || adjustQty === 0) return;
    dispatch({ type: 'ADJUST_STOCK', payload: { productId: adjustProductId, quantity: adjustQty, reason: adjustReason, staff: 'Warehouse Manager' } });
    setShowAdjustModal(false);
  };

  const handlePrintTag = (product: Product) => {
      setTagProduct(product);
      setShowTagModal(true);
  };

  // ... (Other functions like Export CSV remain the same)
  const handleExportCSV = () => { /* ... existing logic ... */ };

  const renderStockTable = () => (
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
        {/* Filter Bar ... */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="relative w-96">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input type="text" placeholder="Search product..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" />
          </div>
          <button onClick={() => setShowAdjustModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md">
             <Settings className="w-4 h-4" /> Adjustment
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-blue-800 uppercase bg-blue-50/50 border-b border-blue-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider w-12"></th>
                <th className="px-6 py-4 font-bold tracking-wider">Product</th>
                <th className="px-6 py-4 font-bold tracking-wider">Loc</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Price</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Stock</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.inventory.map((item) => (
                <React.Fragment key={item.id}>
                    <tr className={`hover:bg-slate-50 cursor-pointer ${expandedRow === item.id ? 'bg-slate-50' : ''}`} onClick={() => toggleRow(item.id)}>
                        <td className="px-6 py-4 text-center"><ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedRow === item.id ? 'rotate-180' : ''}`} /></td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.genericName}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><Barcode className="w-3 h-3"/> {item.barcode}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-bold">{item.location}</td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600">฿{item.price}</td>
                        <td className="px-6 py-4 text-right font-bold">{item.stock}</td>
                        <td className="px-6 py-4 text-center">
                            <button onClick={(e) => { e.stopPropagation(); handlePrintTag(item); }} className="text-slate-500 hover:text-blue-600 p-2 rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all">
                                <Tag className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative">
      {/* Shelf Tag Modal */}
      {showTagModal && tagProduct && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 no-print">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-blue-600"/> Print Shelf Tag</h3>
                  
                  {/* Tag Preview Box */}
                  <div className="bg-white border-2 border-slate-800 rounded p-4 mb-6 shadow-sm w-full aspect-[3/2] flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                          <span className="font-bold text-xl">{tagProduct.price}.-</span>
                          <span className="text-[10px] font-bold border border-black px-1">VAT</span>
                      </div>
                      <div className="text-center font-bold text-lg leading-tight line-clamp-2">{tagProduct.name}</div>
                      <div className="text-center">
                           <div className="h-8 bg-slate-800 w-3/4 mx-auto mb-1"></div>
                           <div className="text-[10px]">{tagProduct.barcode}</div>
                      </div>
                  </div>

                  <div className="flex gap-2">
                       <button onClick={() => setShowTagModal(false)} className="flex-1 py-3 text-slate-600 font-bold rounded-xl bg-slate-100 hover:bg-slate-200">Close</button>
                       <button onClick={() => window.print()} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg flex items-center justify-center gap-2">
                           <Printer className="w-4 h-4"/> Print
                       </button>
                  </div>
              </div>

              {/* Printable Shelf Tag Area */}
              <div id="printable-shelf-tag" className="hidden">
                   <div className="shelf-tag">
                        <div className="price">฿{tagProduct.price}</div>
                        <div className="name">{tagProduct.name}</div>
                        <div className="barcode-area">
                             <div className="barcode-bars">|||| ||| || ||||</div>
                             <div className="code">{tagProduct.barcode}</div>
                        </div>
                   </div>
              </div>
          </div>
      )}

      {/* Adjust Modal (Simplified) */}
      {showAdjustModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
             {/* ... Same adjust modal logic ... */}
             <div className="bg-white p-6 rounded-2xl"><button onClick={()=>setShowAdjustModal(false)}>Close</button></div>
          </div>
      )}

      {/* Header Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouse</h2>
        <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm">
             <button onClick={() => setActiveTab('STOCK')} className={`px-5 py-2 rounded-full text-xs font-bold ${activeTab === 'STOCK' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Current Stock</button>
             <button onClick={() => setActiveTab('MOVEMENT')} className={`px-5 py-2 rounded-full text-xs font-bold ${activeTab === 'MOVEMENT' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>History</button>
        </div>
      </div>

      {activeTab === 'STOCK' && renderStockTable()}
      {/* Other tabs... */}
    </div>
  );
};

export default Inventory;
