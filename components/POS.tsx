
import React, { useState, useMemo } from 'react';
import { GlobalState, Product, CartItem, SaleRecord, Shift } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, QrCode, Banknote, User, ShieldCheck, ShoppingBag, Pill, Stethoscope, ChevronRight, CheckCircle, Barcode, Printer, Lock, LogIn, AlertOctagon, X } from 'lucide-react';

interface POSProps {
  state: GlobalState;
  dispatch: React.Dispatch<any>;
}

const POS: React.FC<POSProps> = ({ state, dispatch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [needsPrescription, setNeedsPrescription] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  // Shift State
  const [openShiftAmount, setOpenShiftAmount] = useState<number>(1000);
  const [closeShiftActual, setCloseShiftActual] = useState<number>(0);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);

  // Receipt State
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<SaleRecord | null>(null);

  const selectedCustomer = useMemo(() => 
    state.customers.find(c => c.id === selectedCustomerId), 
  [state.customers, selectedCustomerId]);

  const filteredProducts = useMemo(() => {
    return state.inventory.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              p.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              p.barcode.includes(searchTerm);
        const matchesCat = activeCategory === 'ALL' || p.category === activeCategory;
        return matchesSearch && matchesCat;
    });
  }, [state.inventory, searchTerm, activeCategory]);

  const activeShift = state.activeShift;

  const getAllergyWarnings = (product: Product) => {
      if (!selectedCustomer) return null;
      const allergy = selectedCustomer.allergies?.find(a => 
          product.genericName.toLowerCase().includes(a.toLowerCase()) || 
          (product.genericName === 'Amoxicillin' && a === 'Penicillin')
      );
      if (allergy) return `แพ้ยา: ${allergy}`;
      return null;
  };

  const getInteractionWarnings = (product: Product, currentCart: CartItem[]) => {
      const interactions: string[] = [];
      if (product.drugInteractions) {
          currentCart.forEach(cartItem => {
               // Check if the product being added interacts with anything in the cart
               if (product.drugInteractions?.includes(cartItem.genericName)) {
                   interactions.push(`${product.name} ❌ ${cartItem.name}`);
               }
               // Check if anything in the cart interacts with the product being added
               if (cartItem.drugInteractions?.includes(product.genericName)) {
                   interactions.push(`${cartItem.name} ❌ ${product.name}`);
               }
          });
      }
      return [...new Set(interactions)];
  };

  const addToCart = (product: Product) => {
    // 1. Check Allergies
    const allergyWarning = getAllergyWarnings(product);
    if (allergyWarning) {
        if (!window.confirm(`⚠️ ALLERGY WARNING\n\nลูกค้ามีประวัติ ${allergyWarning}\n\nต้องการยืนยันการจ่ายยานี้หรือไม่?`)) return;
    }

    // 2. Check Drug Interactions
    const interactionWarnings = getInteractionWarnings(product, cart);
    if (interactionWarnings.length > 0) {
         if (!window.confirm(`⚠️ DRUG INTERACTION DETECTED\n\nยาที่เลือกทำปฏิกิริยากับยาในตะกร้า:\n${interactionWarnings.join('\n')}\n\nเภสัชกรยืนยันการจ่ายหรือไม่?`)) return;
    }

    if (product.requiresPrescription && !needsPrescription) {
        setNeedsPrescription(true);
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = cart.find(i => i.id === id);
    if (itemToRemove?.requiresPrescription) {
        const othersNeedRx = cart.some(i => i.id !== id && i.requiresPrescription);
        if (!othersNeedRx) setNeedsPrescription(false);
    }
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = (method: 'CASH' | 'QR' | 'CREDIT') => {
    if (cart.length === 0) return;
    if (needsPrescription && !window.confirm("กรุณายืนยันว่าเภสัชกรได้ตรวจสอบใบสั่งแพทย์แล้ว?")) return;

    const sale: SaleRecord = {
      id: `INV-${Date.now()}`,
      date: new Date().toLocaleString('th-TH'),
      items: cart,
      total: cartTotal,
      paymentMethod: method,
      customerId: selectedCustomerId || undefined,
      branchId: state.currentBranch.id,
      shiftId: activeShift?.id
    };

    dispatch({ type: 'ADD_SALE', payload: sale });
    cart.forEach(item => {
      dispatch({ type: 'UPDATE_STOCK', payload: { productId: item.id, quantity: -item.quantity } });
    });
    if (selectedCustomerId) {
        dispatch({ 
            type: 'UPDATE_CUSTOMER_POINTS', 
            payload: { customerId: selectedCustomerId, points: Math.floor(cartTotal / 20), spent: cartTotal } 
        });
    }

    setLastSale(sale);
    setShowReceipt(true);
    setCart([]);
    setSelectedCustomerId('');
    setNeedsPrescription(false);
  };

  const handleOpenShift = () => {
      dispatch({ type: 'OPEN_SHIFT', payload: { staff: 'Admin User', startCash: openShiftAmount } });
  };

  const handleCloseShift = () => {
      if(window.confirm("Confirm closing shift? This action cannot be undone.")) {
          dispatch({ type: 'CLOSE_SHIFT', payload: { actualCash: closeShiftActual } });
          setShowCloseShiftModal(false);
      }
  };

  const categories = ['ALL', ...Array.from(new Set(state.inventory.map(p => p.category)))];

  // ---------------- RENDER ---------------- //

  // 1. No Active Shift - Show Open Shift Screen
  if (!activeShift) {
      return (
          <div className="h-[calc(100vh-8rem)] flex items-center justify-center animate-fade-in">
              <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 text-center">
                  <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Lock className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">POS Station Locked</h2>
                  <p className="text-slate-500 mb-8">Please open a new shift to start selling.</p>
                  
                  <div className="text-left mb-6">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Starting Cash (Float)</label>
                      <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">฿</span>
                          <input 
                              type="number" 
                              value={openShiftAmount} 
                              onChange={(e) => setOpenShiftAmount(Number(e.target.value))}
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                      </div>
                  </div>

                  <button onClick={handleOpenShift} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
                      <LogIn className="w-5 h-5" /> Open Shift
                  </button>
              </div>
          </div>
      );
  }

  // 2. Active Shift - Show POS
  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-9rem)] gap-6 animate-fade-in pb-2 relative">
      
      {/* Close Shift Modal */}
      {showCloseShiftModal && (
           <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-fade-in">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-xl font-bold text-slate-800">Close Shift Reconciliation</h3>
                       <button onClick={() => setShowCloseShiftModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
                   </div>
                   
                   <div className="space-y-4 mb-6">
                       <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
                           <span className="text-slate-500">Opening Cash</span>
                           <span className="font-bold text-slate-800">฿{activeShift.startCash.toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                           <span className="text-blue-600">Total Sales (Cash)</span>
                           <span className="font-bold text-blue-800">฿{(activeShift.totalSales || 0).toLocaleString()}</span>
                       </div>
                       <div className="flex justify-between p-3 bg-slate-100 rounded-lg border border-slate-200">
                           <span className="text-slate-700 font-bold">Expected Cash in Drawer</span>
                           <span className="font-bold text-slate-900">฿{((activeShift.startCash) + (activeShift.totalSales || 0)).toLocaleString()}</span>
                       </div>
                   </div>

                   <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Actual Cash Counted</label>
                        <input 
                              type="number" 
                              value={closeShiftActual} 
                              onChange={(e) => setCloseShiftActual(Number(e.target.value))}
                              className="w-full p-3 bg-white border border-slate-300 rounded-xl font-bold text-xl text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                              autoFocus
                        />
                        <div className={`mt-2 text-xs font-bold flex items-center gap-1 ${closeShiftActual - (activeShift.startCash + activeShift.totalSales) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                            Diff: ฿{(closeShiftActual - (activeShift.startCash + activeShift.totalSales)).toLocaleString()}
                        </div>
                   </div>

                   <button onClick={handleCloseShift} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:bg-slate-800">
                       Confirm Close Shift
                   </button>
               </div>
           </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && lastSale && (
        <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                <div className="bg-blue-600 p-6 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle,white,transparent)]"></div>
                    <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                    <h2 className="text-2xl font-bold">Payment Success</h2>
                    <p className="opacity-90">Thank you for your purchase!</p>
                </div>
                <div className="p-6">
                    <div className="text-center mb-4">
                        <h3 className="font-bold text-slate-800">{state.settings.storeName}</h3>
                        <p className="text-xs text-slate-500">{state.settings.address}</p>
                        <p className="text-xs text-slate-500">Tax ID: {state.settings.taxId}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500 mb-4 pb-4 border-b border-dashed border-slate-200">
                        <span>Receipt No:</span>
                        <span className="font-mono font-bold text-slate-800">{lastSale.id}</span>
                    </div>
                    <div className="space-y-3 mb-6">
                        {lastSale.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="text-slate-600">{item.quantity} x {item.name}</span>
                                <span className="font-bold text-slate-800">฿{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold text-slate-900 pt-4 border-t border-slate-100 mb-2">
                        <span>Total Paid</span>
                        <span className="text-blue-600">฿{lastSale.total.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-center text-slate-400 mt-4 italic">
                        {state.settings.receiptFooter}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button onClick={() => setShowReceipt(false)} className="py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Close</button>
                        <button onClick={() => { alert("Printing to " + state.settings.printerIp); setShowReceipt(false); }} className="py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                             <Printer className="w-4 h-4" /> Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Catalog Area */}
      <div className="lg:w-2/3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col overflow-hidden">
        {/* Search & Filter Header */}
        <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10 space-y-4">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     Shift: <span className="font-bold text-slate-700">{activeShift.staffName}</span>
                     <span className="text-slate-300">|</span>
                     Started: {activeShift.startTime.split(' ')[1]}
                 </div>
                 <button 
                    onClick={() => { setCloseShiftActual(0); setShowCloseShiftModal(true); }}
                    className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                 >
                    End Shift
                 </button>
            </div>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Scan Barcode or Search Product..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Barcode className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 opacity-50" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all ${
                            activeCategory === cat 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map(product => {
                const allergyWarning = getAllergyWarnings(product);
                const interactionWarnings = getInteractionWarnings(product, cart);
                const hasIssues = allergyWarning || interactionWarnings.length > 0;

                return (
                    <div 
                        key={product.id} 
                        onClick={() => product.stock > 0 && addToCart(product)}
                        className={`bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col group overflow-hidden ${product.stock === 0 ? 'opacity-60 grayscale' : ''}`}
                    >
                        <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative p-6">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="object-contain w-full h-full mix-blend-multiply" />
                            ) : (
                                <Pill className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            )}
                            
                            {/* Warnings */}
                            {hasIssues && (
                                <div className="absolute top-2 left-2 right-2 bg-red-500 text-white text-[10px] py-1 px-2 rounded-md font-bold text-center shadow-sm animate-pulse flex items-center justify-center gap-1">
                                    <AlertOctagon className="w-3 h-3" /> SAFETY ALERT
                                </div>
                            )}
                            {product.requiresPrescription && !hasIssues && (
                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] py-1 px-2 rounded-md font-bold shadow-sm">
                                    Rx
                                </div>
                            )}
                            {product.stock <= product.minStock && product.stock > 0 && (
                                <div className="absolute bottom-2 left-2 bg-orange-500 text-white text-[10px] py-1 px-2 rounded-full font-bold shadow-sm">
                                    Low Stock
                                </div>
                            )}
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                            <div className="mb-2">
                                <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h3>
                                <p className="text-xs text-slate-500 mt-1 truncate">{product.genericName}</p>
                            </div>
                            <div className="mt-auto flex justify-between items-end">
                                <div>
                                    <span className="block text-[10px] text-slate-400">Price</span>
                                    <span className="font-bold text-lg text-blue-700">฿{product.price.toLocaleString()}</span>
                                </div>
                                <button className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-colors">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      </div>

      {/* Cart Section */}
      <div className="lg:w-1/3 flex flex-col h-full bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden relative z-20">
        <div className="p-5 border-b border-slate-100 bg-white">
            <div className="relative mb-4">
                <select 
                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                    <option value="">General Customer (Walk-in)</option>
                    {state.customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <User className="absolute left-3 top-3 text-slate-400 w-5 h-5 pointer-events-none" />
                <ChevronRight className="absolute right-3 top-3 text-slate-400 w-5 h-5 pointer-events-none rotate-90" />
            </div>
            
            {selectedCustomer && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-bold text-blue-900">{selectedCustomer.name}</div>
                            <div className="text-xs text-blue-600">{selectedCustomer.phone}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-semibold text-blue-400">Points</div>
                            <div className="font-bold text-blue-700">{selectedCustomer.points}</div>
                        </div>
                    </div>
                    {selectedCustomer.allergies && selectedCustomer.allergies.length > 0 && (
                        <div className="mt-3 flex items-start gap-2 text-xs bg-white p-2 rounded-lg text-red-600 border border-red-100 shadow-sm">
                            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" /> 
                            <span className="font-bold">ALLERGY: {selectedCustomer.allergies.join(', ')}</span>
                        </div>
                    )}
                </div>
            )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm">Cart is empty</p>
                    <p className="text-xs">Scan items to begin</p>
                </div>
            ) : (
                <>
                    {needsPrescription && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-3 animate-fade-in">
                            <div className="bg-yellow-100 p-2 rounded-lg h-fit">
                                <Stethoscope className="w-5 h-5 text-yellow-700" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-yellow-800">Prescription Required</h4>
                                <p className="text-xs text-yellow-700 mt-1">รายการยานี้ต้องได้รับการอนุมัติโดยเภสัชกร</p>
                            </div>
                        </div>
                    )}
                    {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-xl transition-colors group">
                            <div className="flex-1 pr-4">
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{item.name}</h4>
                                    {item.requiresPrescription && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 rounded font-bold">Rx</span>}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">฿{item.price} x {item.quantity}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900 w-16 text-right">฿{(item.price * item.quantity).toLocaleString()}</span>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded-l-lg text-slate-500"><Minus className="w-3 h-3" /></button>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded-r-lg text-slate-500"><Plus className="w-3 h-3" /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
            <div className="flex justify-between items-end mb-6">
                <span className="text-slate-500 text-sm font-medium">Net Total <span className="text-xs text-slate-400">(VAT Inc.)</span></span>
                <span className="text-3xl font-bold text-slate-900 tracking-tight">฿{cartTotal.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'CASH', label: 'Cash', icon: Banknote, color: 'green' },
                    { id: 'QR', label: 'QR Scan', icon: QrCode, color: 'blue' },
                    { id: 'CREDIT', label: 'Card', icon: CreditCard, color: 'indigo' }
                ].map((m) => (
                    <button 
                        key={m.id}
                        onClick={() => handleCheckout(m.id as any)}
                        disabled={cart.length === 0}
                        className={`flex flex-col items-center justify-center p-4 bg-white border border-slate-200 rounded-xl hover:border-${m.color}-500 hover:shadow-md transition-all disabled:opacity-50 disabled:hover:shadow-none group`}
                    >
                        <m.icon className={`w-6 h-6 mb-2 text-slate-400 group-hover:text-${m.color}-600 transition-colors`} />
                        <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900">{m.label}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default POS;
