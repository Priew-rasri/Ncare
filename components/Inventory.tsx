
import React, { useState, useMemo } from 'react';
import { GlobalState, TransferRequest, Product, ProductCategory, Batch } from '../types';
import { Search, Filter, AlertTriangle, CheckCircle, Download, ChevronDown, ChevronUp, Package, Box, RefreshCw, History, MapPin, Barcode, Settings, Save, X, Calendar, ArrowRight, TrendingUp, PieChart, Truck, ArrowLeftRight, Printer, Tag, FileText, AlertOctagon, Plus, Edit, Trash2 } from 'lucide-react';

interface InventoryProps {
  data: GlobalState;
  dispatch: React.Dispatch<any>;
}

const Inventory: React.FC<InventoryProps> = ({ data, dispatch }) => {
  const [activeTab, setActiveTab] = useState<'STOCK' | 'MOVEMENT' | 'TRANSFERS' | 'EXPIRY' | 'VALUATION'>('STOCK');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Damaged Stock');
  
  // Product CRUD Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({});
  const [editableBatches, setEditableBatches] = useState<Batch[]>([]);

  // Shelf Tag Printing State
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagProduct, setTagProduct] = useState<Product | null>(null);

  // Stock Card Modal
  const [showStockCard, setShowStockCard] = useState(false);
  const [stockCardProduct, setStockCardProduct] = useState<Product | null>(null);

  // Transfer Logic
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProduct, setTransferProduct] = useState('');
  const [transferQty, setTransferQty] = useState(0);
  const [transferTargetBranch, setTransferTargetBranch] = useState('');

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleAdjustStock = () => {
    if (!adjustProductId || adjustQty === 0) return;
    dispatch({ type: 'ADJUST_STOCK', payload: { productId: adjustProductId, quantity: adjustQty, reason: adjustReason, staff: data.currentUser?.name || 'Admin' } });
    setShowAdjustModal(false);
    setAdjustProductId('');
    setAdjustQty(0);
  };

  const handleRequestTransfer = () => {
      if(!transferProduct || !transferQty || !transferTargetBranch) return;
      const product = data.inventory.find(p => p.id === transferProduct);
      
      const request: TransferRequest = {
          id: `TR-${Date.now()}`,
          date: new Date().toLocaleDateString('en-CA'),
          fromBranchId: transferTargetBranch, // Requesting FROM another branch
          toBranchId: data.currentBranch.id, // TO current branch
          productId: transferProduct,
          productName: product?.name || 'Unknown',
          quantity: Number(transferQty),
          status: 'PENDING',
          requestedBy: data.currentUser?.name || 'Staff'
      };

      dispatch({ type: 'REQUEST_TRANSFER', payload: request });
      setShowTransferModal(false);
  };

  const handlePrintTag = (product: Product) => {
      setTagProduct(product);
      setShowTagModal(true);
  };

  const openStockCard = (product: Product) => {
      setStockCardProduct(product);
      setShowStockCard(true);
  };
  
  const handleOpenAddProduct = () => {
      setEditingProduct(null);
      setProductForm({
          category: ProductCategory.PAIN_FEVER,
          isVatExempt: true,
          requiresPrescription: false,
          stock: 0,
          minStock: 10,
          unit: 'ชิ้น',
          batches: []
      });
      setEditableBatches([]);
      setShowProductModal(true);
  };
  
  const handleOpenEditProduct = (product: Product) => {
      setEditingProduct(product);
      setProductForm({ ...product });
      setEditableBatches([...product.batches]);
      setShowProductModal(true);
  };

  const handleSaveProduct = () => {
      if (!productForm.name || !productForm.price || !productForm.barcode) {
          alert("Please fill in required fields (Name, Barcode, Price)");
          return;
      }

      if (editingProduct) {
          // Update
          dispatch({ 
              type: 'EDIT_PRODUCT', 
              payload: { ...editingProduct, ...productForm, batches: editableBatches } as Product 
          });
      } else {
          // Create
          const newProduct: Product = {
              ...productForm as Product,
              id: `P${Date.now()}`,
              batches: [] // Initial batches empty, use Receive PO to add
          };
          dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      }
      setShowProductModal(false);
  };

  const updateBatch = (index: number, field: keyof Batch, value: any) => {
      const newBatches = [...editableBatches];
      newBatches[index] = { ...newBatches[index], [field]: value };
      setEditableBatches(newBatches);
  };

  const generateBarcode = () => {
      const random = Math.floor(Math.random() * 900000000000) + 100000000000;
      setProductForm(prev => ({ ...prev, barcode: `885${random}` }));
  };

  const getFilteredInventory = () => {
      return data.inventory.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.barcode.includes(searchTerm)
      );
  };
  
  // Running Balance Calculation for Stock Card
  const getStockCardData = (productId: string) => {
      const logs = data.stockLogs
        .filter(log => log.productId === productId)
        // Sort Ascending (Oldest first) to calculate balance
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      let runningBalance = 0;
      const logsWithBalance = logs.map(log => {
          runningBalance += log.quantity;
          return { ...log, currentBalance: runningBalance };
      });
      
      // Return reversed (Newest first) for display
      return logsWithBalance.reverse();
  };

  // --- Sub-Renderers ---

  const renderStockTable = () => (
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <div className="relative w-96">
             <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
                type="text" 
                placeholder="Search product name or barcode..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <div className="flex gap-2">
            <button onClick={handleOpenAddProduct} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" /> Add Product
            </button>
            <button onClick={() => setShowTransferModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-sm font-bold transition-colors">
                <Truck className="w-4 h-4" /> Request Stock
            </button>
            <button onClick={() => setShowAdjustModal(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-md hover:bg-slate-800 transition-colors">
                <Settings className="w-4 h-4" /> Adjustment
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-blue-800 uppercase bg-blue-50/50 border-b border-blue-100">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider w-12"></th>
                <th className="px-6 py-4 font-bold tracking-wider">Product</th>
                <th className="px-6 py-4 font-bold tracking-wider">Category</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Cost</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Price</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Stock</th>
                <th className="px-6 py-4 font-bold tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {getFilteredInventory().map((item) => (
                <React.Fragment key={item.id}>
                    <tr className={`hover:bg-slate-50 cursor-pointer ${expandedRow === item.id ? 'bg-slate-50' : ''} ${item.stock <= item.minStock ? 'bg-red-50' : ''}`} onClick={() => toggleRow(item.id)}>
                        <td className="px-6 py-4 text-center"><ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedRow === item.id ? 'rotate-180' : ''}`} /></td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-slate-800 text-sm">{item.name}</div>
                            <div className="text-xs text-slate-500">{item.genericName}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><Barcode className="w-3 h-3"/> {item.barcode}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs">
                             <div className="font-bold text-slate-700 truncate max-w-[150px]">{item.category}</div>
                             {item.subCategory && <div className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded inline-block mt-1 border border-blue-100">{item.subCategory}</div>}
                             <div className="text-[10px] text-slate-400 mt-1">{item.location}</div>
                        </td>
                        <td className="px-6 py-4 text-right text-slate-500">฿{item.cost}</td>
                        <td className="px-6 py-4 text-right font-bold text-blue-600">฿{item.price}</td>
                        <td className="px-6 py-4 text-right">
                             <span className={`font-bold px-2 py-1 rounded ${item.stock <= item.minStock ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-800'}`}>
                                 {item.stock} {item.unit}
                             </span>
                        </td>
                        <td className="px-6 py-4 text-center flex justify-center gap-2">
                            <button onClick={(e) => { e.stopPropagation(); handleOpenEditProduct(item); }} className="text-slate-500 hover:text-blue-600 p-2 rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all" title="Edit Product">
                                <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); openStockCard(item); }} className="text-slate-500 hover:text-blue-600 p-2 rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all" title="View Stock Card">
                                <FileText className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handlePrintTag(item); }} className="text-slate-500 hover:text-blue-600 p-2 rounded-full hover:bg-white border border-transparent hover:border-slate-200 transition-all" title="Print Tag">
                                <Tag className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                    {expandedRow === item.id && (
                        <tr>
                            <td colSpan={7} className="px-6 py-4 bg-slate-50 border-b border-slate-100 shadow-inner">
                                <div className="ml-8">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                                        <Package className="w-3 h-3" /> Lot / Batch Details (FEFO)
                                    </h4>
                                    <table className="w-full max-w-2xl text-xs bg-white rounded-lg overflow-hidden border border-slate-200">
                                        <thead className="bg-slate-100 text-slate-600">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Lot No.</th>
                                                <th className="px-4 py-2 text-left">Expiry Date</th>
                                                <th className="px-4 py-2 text-right">Quantity</th>
                                                <th className="px-4 py-2 text-right">Cost Lot</th>
                                                <th className="px-4 py-2 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {item.batches.length === 0 ? (
                                                <tr><td colSpan={5} className="text-center py-2 text-slate-400">No batches available</td></tr>
                                            ) : (
                                                item.batches.map((batch, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-4 py-2 font-mono">{batch.lotNumber}</td>
                                                        <td className={`px-4 py-2 font-bold ${new Date(batch.expiryDate) < new Date('2025-01-01') ? 'text-red-500' : 'text-slate-600'}`}>
                                                            {batch.expiryDate}
                                                        </td>
                                                        <td className="px-4 py-2 text-right">{batch.quantity}</td>
                                                        <td className="px-4 py-2 text-right">฿{batch.costPrice}</td>
                                                        <td className="px-4 py-2 text-center">
                                                            {new Date(batch.expiryDate) < new Date() ? (
                                                                <span className="bg-red-100 text-red-600 px-1 py-0.5 rounded text-[10px] font-bold">EXPIRED</span>
                                                            ) : (
                                                                <span className="bg-green-100 text-green-600 px-1 py-0.5 rounded text-[10px] font-bold">GOOD</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
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

  const renderMovement = () => (
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-slate-100">
               <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                   <History className="w-5 h-5 text-blue-600" /> Stock Movement History
               </h3>
               <p className="text-xs text-slate-500 mt-1">Audit trail of all inventory transactions</p>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4 text-right">Qty</th>
                    <th className="px-6 py-4">Staff</th>
                    <th className="px-6 py-4">Ref/Note</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {data.stockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-500 text-xs font-mono">{log.date}</td>
                        <td className="px-6 py-4 font-bold text-slate-700">{log.productName}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                log.action === 'SALE' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                log.action === 'RECEIVE' ? 'bg-green-50 text-green-700 border-green-100' :
                                log.action === 'VOID_RETURN' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                log.action === 'CREATE' ? 'bg-teal-50 text-teal-700 border-teal-100' :
                                'bg-orange-50 text-orange-700 border-orange-100'
                            }`}>
                                {log.action}
                            </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {log.quantity > 0 ? '+' : ''}{log.quantity}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600">{log.staffName}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 italic truncate max-w-xs">{log.note}</td>
                    </tr>
                ))}
            </tbody>
          </table>
      </div>
  );

  const renderTransfers = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div>
                  <h3 className="font-bold text-slate-800 text-lg">Inter-Branch Transfers</h3>
                  <p className="text-xs text-slate-500">Manage incoming and outgoing stock requests</p>
              </div>
              <button onClick={() => setShowTransferModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                  + New Request
              </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                      <tr>
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4 text-center">Route</th>
                          <th className="px-6 py-4 text-right">Qty</th>
                          <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {data.transfers.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-mono text-xs text-blue-600">{t.id}</td>
                              <td className="px-6 py-4 text-xs text-slate-500">{t.date}</td>
                              <td className="px-6 py-4 font-bold text-slate-700">{t.productName}</td>
                              <td className="px-6 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                                      <span>{t.fromBranchId}</span>
                                      <ArrowRight className="w-3 h-3 text-slate-300" />
                                      <span>{t.toBranchId}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-right font-bold">{t.quantity}</td>
                              <td className="px-6 py-4 text-center">
                                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                      t.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                                      t.status === 'PENDING' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'
                                  }`}>
                                      {t.status}
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
               </table>
          </div>
      </div>
  );

  const renderExpiry = () => {
      const expiringItems = data.inventory.flatMap(p => 
        p.batches
            .filter(b => new Date(b.expiryDate) < new Date('2025-06-01')) // Mock cutoff
            .map(b => ({ ...b, product: p }))
      ).sort((a,b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

      return (
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-in">
               <div className="p-6 border-b border-slate-100 bg-red-50 flex justify-between items-center">
                   <div>
                       <h3 className="font-bold text-red-800 text-lg flex items-center gap-2">
                           <AlertOctagon className="w-5 h-5" /> Expiry Risk Management
                       </h3>
                       <p className="text-xs text-red-600 mt-1">Items expiring soon (FEFO Priority)</p>
                   </div>
                   <button className="bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">
                       Download Report
                   </button>
               </div>
               <table className="w-full text-sm text-left">
                  <thead className="bg-white border-b border-slate-100 text-xs uppercase text-slate-500">
                      <tr>
                          <th className="px-6 py-4">Expiry Date</th>
                          <th className="px-6 py-4">Product</th>
                          <th className="px-6 py-4">Lot Number</th>
                          <th className="px-6 py-4 text-right">Remaining Qty</th>
                          <th className="px-6 py-4 text-right">Value Risk</th>
                          <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {expiringItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-bold text-red-600">{item.expiryDate}</td>
                              <td className="px-6 py-4 font-bold text-slate-700">{item.product.name}</td>
                              <td className="px-6 py-4 font-mono text-xs">{item.lotNumber}</td>
                              <td className="px-6 py-4 text-right">{item.quantity}</td>
                              <td className="px-6 py-4 text-right text-slate-500">฿{(item.quantity * item.costPrice).toLocaleString()}</td>
                              <td className="px-6 py-4 text-center">
                                  <button className="text-xs font-bold text-red-600 hover:underline">Return to Supplier</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
               </table>
          </div>
      );
  };

  const renderValuation = () => {
      const sortedInventory = [...data.inventory].sort((a,b) => (b.stock * b.cost) - (a.stock * a.cost));
      const totalValue = sortedInventory.reduce((acc, curr) => acc + (curr.stock * curr.cost), 0);
      
      return (
          <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="text-slate-500 text-xs font-bold uppercase mb-2">Total Inventory Value</div>
                      <div className="text-3xl font-bold text-blue-800">฿{totalValue.toLocaleString()}</div>
                      <div className="text-xs text-green-600 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +5.2% from last month</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="text-slate-500 text-xs font-bold uppercase mb-2">Top Value Category</div>
                      <div className="text-2xl font-bold text-slate-800">Medicine</div>
                      <div className="text-xs text-slate-400 mt-2">65% of total value</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                      <div className="text-slate-500 text-xs font-bold uppercase mb-2">Stock Health</div>
                      <div className="text-2xl font-bold text-green-600">Healthy</div>
                      <div className="text-xs text-slate-400 mt-2">Turnover rate optimal</div>
                  </div>
              </div>

              <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden">
                  <div className="p-6 border-b border-slate-100 bg-blue-50/30">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2">
                           <PieChart className="w-5 h-5 text-blue-600" /> ABC Analysis (High Value Items)
                       </h3>
                  </div>
                  <table className="w-full text-sm text-left">
                      <thead className="bg-white border-b border-slate-100 text-xs uppercase text-slate-500">
                          <tr>
                              <th className="px-6 py-4 text-center">Class</th>
                              <th className="px-6 py-4">Product</th>
                              <th className="px-6 py-4 text-right">Stock</th>
                              <th className="px-6 py-4 text-right">Unit Cost</th>
                              <th className="px-6 py-4 text-right">Total Value</th>
                              <th className="px-6 py-4 text-center">% of Total</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {sortedInventory.map((item, idx) => {
                              const itemValue = item.stock * item.cost;
                              const percent = (itemValue / totalValue) * 100;
                              let abcClass = 'C';
                              if (idx < sortedInventory.length * 0.2) abcClass = 'A';
                              else if (idx < sortedInventory.length * 0.5) abcClass = 'B';
                              
                              return (
                                  <tr key={item.id} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 text-center">
                                          <span className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                                              abcClass === 'A' ? 'bg-purple-100 text-purple-700' :
                                              abcClass === 'B' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                          }`}>
                                              {abcClass}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                                      <td className="px-6 py-4 text-right">{item.stock}</td>
                                      <td className="px-6 py-4 text-right">฿{item.cost.toLocaleString()}</td>
                                      <td className="px-6 py-4 text-right font-bold text-slate-900">฿{itemValue.toLocaleString()}</td>
                                      <td className="px-6 py-4 text-center text-xs text-slate-500">{percent.toFixed(1)}%</td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 relative">
      
      {/* Product CRUD Modal */}
      {showProductModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 fixed top-0 left-0 w-full h-full">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                          {editingProduct ? <Edit className="w-6 h-6 text-blue-600" /> : <Plus className="w-6 h-6 text-green-600" />}
                          {editingProduct ? 'Edit Product' : 'Add New Product'}
                      </h3>
                      <button onClick={() => setShowProductModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Barcode *</label>
                          <div className="flex gap-2">
                              <input 
                                  type="text" 
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                                  value={productForm.barcode || ''}
                                  onChange={e => setProductForm({...productForm, barcode: e.target.value})}
                                  placeholder="Scan or Enter"
                              />
                              <button onClick={generateBarcode} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200" title="Generate Random Barcode">
                                  <RefreshCw className="w-4 h-4 text-slate-600"/>
                              </button>
                          </div>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                          <select 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                              value={productForm.category}
                              onChange={e => setProductForm({...productForm, category: e.target.value as any})}
                          >
                              {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                      </div>

                      <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Product Name *</label>
                          <input 
                              type="text" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                              value={productForm.name || ''}
                              onChange={e => setProductForm({...productForm, name: e.target.value})}
                              placeholder="Brand Name + Dosage"
                          />
                      </div>
                      
                      <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Generic Name</label>
                          <input 
                              type="text" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                              value={productForm.genericName || ''}
                              onChange={e => setProductForm({...productForm, genericName: e.target.value})}
                              placeholder="Scientific Name"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sell Price *</label>
                          <input 
                              type="number" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-blue-600"
                              value={productForm.price || ''}
                              onChange={e => setProductForm({...productForm, price: Number(e.target.value)})}
                              placeholder="0.00"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cost Price</label>
                          <input 
                              type="number" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                              value={productForm.cost || ''}
                              onChange={e => setProductForm({...productForm, cost: Number(e.target.value)})}
                              placeholder="0.00"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Min Stock Alert</label>
                          <input 
                              type="number" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                              value={productForm.minStock || ''}
                              onChange={e => setProductForm({...productForm, minStock: Number(e.target.value)})}
                              placeholder="10"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Unit</label>
                          <input 
                              type="text" 
                              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                              value={productForm.unit || ''}
                              onChange={e => setProductForm({...productForm, unit: e.target.value})}
                              placeholder="Box, Bottle, Pack"
                          />
                      </div>
                      
                      <div className="col-span-2 flex gap-4 mt-2">
                           <label className="flex items-center gap-2 cursor-pointer">
                               <input 
                                  type="checkbox" 
                                  className="w-4 h-4"
                                  checked={productForm.isVatExempt || false}
                                  onChange={e => setProductForm({...productForm, isVatExempt: e.target.checked})}
                               />
                               <span className="text-sm font-medium">VAT Exempt (Non-VAT)</span>
                           </label>
                           <label className="flex items-center gap-2 cursor-pointer">
                               <input 
                                  type="checkbox" 
                                  className="w-4 h-4"
                                  checked={productForm.requiresPrescription || false}
                                  onChange={e => setProductForm({...productForm, requiresPrescription: e.target.checked})}
                               />
                               <span className="text-sm font-medium text-red-600">Requires Prescription</span>
                           </label>
                      </div>

                      {/* Batch Edit Section */}
                      {editingProduct && (
                          <div className="col-span-2 mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Manage Lots & Expiry (Admin Only)</h4>
                              <div className="space-y-2">
                                  {editableBatches.map((batch, idx) => (
                                      <div key={idx} className="flex gap-2 items-center text-sm">
                                          <input 
                                              type="text" 
                                              value={batch.lotNumber} 
                                              onChange={(e) => updateBatch(idx, 'lotNumber', e.target.value)}
                                              className="w-24 p-2 border rounded bg-white text-xs"
                                          />
                                          <input 
                                              type="date" 
                                              value={batch.expiryDate} 
                                              onChange={(e) => updateBatch(idx, 'expiryDate', e.target.value)}
                                              className={`p-2 border rounded bg-white text-xs ${new Date(batch.expiryDate) < new Date() ? 'text-red-500 font-bold' : ''}`}
                                          />
                                          <input 
                                              type="number" 
                                              value={batch.quantity} 
                                              onChange={(e) => updateBatch(idx, 'quantity', Number(e.target.value))}
                                              className="w-16 p-2 border rounded bg-white text-xs"
                                          />
                                          <span className="text-xs text-slate-400">Qty</span>
                                      </div>
                                  ))}
                                  {editableBatches.length === 0 && <div className="text-xs text-slate-400 italic">No active batches</div>}
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="mt-8 flex gap-3">
                      <button onClick={handleSaveProduct} className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700">
                          {editingProduct ? 'Save Changes' : 'Create Product'}
                      </button>
                      <button onClick={() => setShowProductModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50">
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Stock Card Modal (Updated with Running Balance) */}
      {showStockCard && stockCardProduct && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <div>
                           <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                               <FileText className="w-6 h-6 text-blue-600" /> Stock Card (Ledger)
                           </h3>
                           <p className="text-sm text-slate-500">{stockCardProduct.name} (Calculated Running Balance)</p>
                       </div>
                       <button onClick={() => setShowStockCard(false)}><X className="w-6 h-6 text-slate-400" /></button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-0">
                       <table className="w-full text-left text-sm">
                           <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 sticky top-0">
                               <tr>
                                   <th className="p-4">Date/Time</th>
                                   <th className="p-4">Ref Doc</th>
                                   <th className="p-4">Action</th>
                                   <th className="p-4 text-right">In/Out</th>
                                   <th className="p-4 text-right bg-blue-50/50">Balance</th>
                                   <th className="p-4">Staff</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {getStockCardData(stockCardProduct.id).map(log => (
                                   <tr key={log.id} className="hover:bg-slate-50">
                                       <td className="p-4 text-slate-500 font-mono text-xs">{log.date}</td>
                                       <td className="p-4 text-xs">{log.note}</td>
                                       <td className="p-4">
                                           <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                                               log.action === 'SALE' ? 'bg-blue-50 text-blue-700' :
                                               log.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                           }`}>
                                               {log.action}
                                           </span>
                                       </td>
                                       <td className={`p-4 text-right font-bold ${log.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                           {log.quantity > 0 ? '+' : ''}{log.quantity}
                                       </td>
                                       <td className="p-4 text-right font-bold text-slate-800 bg-blue-50/20 font-mono">
                                            {log.currentBalance}
                                       </td>
                                       <td className="p-4 text-xs text-slate-500">{log.staffName}</td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
              </div>
          </div>
      )}

      {/* Shelf Tag Modal */}
      {showTagModal && tagProduct && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 no-print">
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-blue-600"/> Print Shelf Tag</h3>
                  
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

              {/* Printable Shelf Tag */}
              <div id="printable-shelf-tag" className="hidden">
                   <div className="shelf-tag">
                        <div className="price">฿{tagProduct.price}</div>
                        <div className="name">{tagProduct.name}</div>
                        <div className="barcode-bars">{tagProduct.barcode}</div>
                        <div className="code">{tagProduct.barcode}</div>
                   </div>
              </div>
          </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                 <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings className="w-5 h-5" /> Stock Adjustment</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">Product ID</label>
                         <select className="w-full p-3 border rounded-xl bg-slate-50" value={adjustProductId} onChange={e => setAdjustProductId(e.target.value)}>
                             <option value="">Select Product...</option>
                             {data.inventory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">Quantity (+/-)</label>
                         <input type="number" className="w-full p-3 border rounded-xl" value={adjustQty} onChange={e => setAdjustQty(Number(e.target.value))} />
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">Reason</label>
                         <input type="text" className="w-full p-3 border rounded-xl" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} />
                     </div>
                     <button onClick={handleAdjustStock} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl">Confirm Adjustment</button>
                     <button onClick={() => setShowAdjustModal(false)} className="w-full py-3 text-slate-500">Cancel</button>
                 </div>
             </div>
          </div>
      )}

      {/* Transfer Request Modal */}
      {showTransferModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                 <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-blue-600" /> Request Stock Transfer</h3>
                 <div className="space-y-4">
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">Request From (Branch)</label>
                         <select className="w-full p-3 border rounded-xl bg-slate-50" value={transferTargetBranch} onChange={e => setTransferTargetBranch(e.target.value)}>
                             <option value="">Select Branch...</option>
                             {data.branches.filter(b => b.id !== data.currentBranch.id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                         </select>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">Product</label>
                         <select className="w-full p-3 border rounded-xl bg-slate-50" value={transferProduct} onChange={e => setTransferProduct(e.target.value)}>
                             <option value="">Select Product...</option>
                             {data.inventory.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                         </select>
                     </div>
                     <div>
                         <label className="block text-xs font-bold text-slate-500 mb-2">Quantity</label>
                         <input type="number" className="w-full p-3 border rounded-xl" value={transferQty} onChange={e => setTransferQty(Number(e.target.value))} />
                     </div>
                     <button onClick={handleRequestTransfer} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg">Submit Request</button>
                     <button onClick={() => setShowTransferModal(false)} className="w-full py-3 text-slate-500">Cancel</button>
                 </div>
             </div>
          </div>
      )}

      {/* Header Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Warehouse</h2>
        <div className="flex bg-white p-1 rounded-full border border-slate-200 shadow-sm overflow-x-auto">
             <button onClick={() => setActiveTab('STOCK')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'STOCK' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Current Stock</button>
             <button onClick={() => setActiveTab('MOVEMENT')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'MOVEMENT' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Audit Log</button>
             <button onClick={() => setActiveTab('TRANSFERS')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'TRANSFERS' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Transfers</button>
             <button onClick={() => setActiveTab('EXPIRY')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'EXPIRY' ? 'bg-red-500 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Expiry Risk</button>
             <button onClick={() => setActiveTab('VALUATION')} className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'VALUATION' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}>Valuation</button>
        </div>
      </div>

      {activeTab === 'STOCK' && renderStockTable()}
      {activeTab === 'MOVEMENT' && renderMovement()}
      {activeTab === 'TRANSFERS' && renderTransfers()}
      {activeTab === 'EXPIRY' && renderExpiry()}
      {activeTab === 'VALUATION' && renderValuation()}
    </div>
  );
};

export default Inventory;
