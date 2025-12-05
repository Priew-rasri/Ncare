
import React, { useState, useMemo } from 'react';
import { GlobalState, Product, CartItem, SaleRecord } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, QrCode, Banknote, User, AlertTriangle, ShieldCheck, ShoppingBag, FileText, Stethoscope } from 'lucide-react';

interface POSProps {
  state: GlobalState;
  dispatch: React.Dispatch<any>;
}

const POS: React.FC<POSProps> = ({ state, dispatch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [needsPrescription, setNeedsPrescription] = useState(false);

  const selectedCustomer = useMemo(() => 
    state.customers.find(c => c.id === selectedCustomerId), 
  [state.customers, selectedCustomerId]);

  const filteredProducts = useMemo(() => {
    return state.inventory.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.genericName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.inventory, searchTerm]);

  // Drug Interaction/Allergy Check Logic
  const getWarnings = (product: Product) => {
      if (!selectedCustomer) return null;
      // Mock allergy check
      const allergy = selectedCustomer.allergies?.find(a => 
          product.genericName.toLowerCase().includes(a.toLowerCase()) || 
          (product.genericName === 'Amoxicillin' && a === 'Penicillin')
      );
      if (allergy) return `ลูกค้าแพ้ยา: ${allergy}`;
      return null;
  };

  const addToCart = (product: Product) => {
    // Check allergy
    const warning = getWarnings(product);
    if (warning) {
        if (!window.confirm(`⚠️ SAFETY ALERT!\n\n${warning}\n\nยืนยันการจ่ายยานี้หรือไม่?`)) {
            return;
        }
    }

    // Check Prescription Requirement
    if (product.requiresPrescription && !needsPrescription) {
        setNeedsPrescription(true);
        // In a real app, this would trigger a modal to upload Rx image
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
        // Check if any other items need Rx
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

    if (needsPrescription && !window.confirm("ยืนยันว่าได้ตรวจสอบใบสั่งแพทย์ (Prescription) ถูกต้องแล้ว?")) {
        return;
    }

    const sale: SaleRecord = {
      id: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      items: cart,
      total: cartTotal,
      paymentMethod: method,
      customerId: selectedCustomerId || undefined,
      branchId: state.currentBranch.id
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

    setCart([]);
    setSelectedCustomerId('');
    setNeedsPrescription(false);
    alert('บันทึกการขายเรียบร้อย! (Transaction Complete)');
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 animate-fade-in pb-4">
      {/* Product List Area */}
      <div className="lg:w-2/3 bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-4 bg-white sticky top-0 z-10">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Scan Barcode or Search Product..." 
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-0 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 bg-slate-50/30">
          {filteredProducts.map(product => {
            const allergyWarning = getWarnings(product);
            return (
                <div 
                key={product.id} 
                onClick={() => product.stock > 0 && addToCart(product)}
                className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                >
                {allergyWarning && (
                    <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-[10px] py-1.5 px-2 text-center font-bold z-10 uppercase tracking-wide animate-pulse">
                        ⚠️ Allergy Alert
                    </div>
                )}
                {product.requiresPrescription && !allergyWarning && (
                    <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-[10px] py-1 px-3 rounded-bl-xl font-bold z-10 uppercase tracking-wide">
                        Rx Only
                    </div>
                )}
                
                <div className="mb-4 relative">
                    <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 relative mb-4 group-hover:bg-blue-50 transition-colors">
                        <PackageIcon />
                        {allergyWarning && <AlertTriangle className="absolute text-red-500 w-10 h-10 bg-white rounded-full p-2 shadow-lg top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />}
                    </div>
                    <div className="absolute top-2 left-2">
                         <span className="bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-50">{product.id}</span>
                    </div>
                    {product.stock <= product.minStock && product.stock > 0 && (
                        <div className="absolute bottom-2 right-2">
                             <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200">Low</span>
                        </div>
                    )}
                    <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight h-10 group-hover:text-blue-600 transition-colors">{product.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{product.genericName}</p>
                </div>
                
                <div className="flex justify-between items-end mt-2">
                    <div>
                         <p className="text-[10px] text-slate-400">Price</p>
                         <span className="font-bold text-lg text-blue-700">฿{product.price}</span>
                    </div>
                    <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-md shadow-blue-200 transition-transform active:scale-95">
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* Cart & Checkout Area */}
      <div className="lg:w-1/3 flex flex-col h-full">
        <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col h-full overflow-hidden">
            {/* Customer Section */}
            <div className="p-5 border-b border-slate-100 bg-white">
                <div className="flex items-center justify-between mb-3">
                     <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <ShoppingBag className="text-blue-600 w-5 h-5" /> Current Sale
                    </h2>
                    <div className="text-xs font-medium text-slate-400">Order #{Date.now().toString().slice(-6)}</div>
                </div>
               
                <div className="relative group">
                    <select 
                        className="w-full p-3.5 pl-11 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none appearance-none transition-all cursor-pointer font-medium text-slate-700"
                        value={selectedCustomerId}
                        onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                        <option value="">General Customer (Walk-in)</option>
                        {state.customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    <User className="absolute left-4 top-3.5 text-slate-400 w-5 h-5 group-hover:text-blue-500 transition-colors" />
                </div>
                
                {selectedCustomer && (
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm font-bold text-blue-900">{selectedCustomer.name}</div>
                                <div className="text-xs text-blue-600/70">{selectedCustomer.phone}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs font-semibold text-blue-400 uppercase">Points</div>
                                <div className="text-lg font-bold text-blue-700">{selectedCustomer.points.toLocaleString()}</div>
                            </div>
                        </div>
                        {selectedCustomer.allergies && selectedCustomer.allergies.length > 0 && (
                            <div className="mt-3 text-xs bg-white text-red-600 py-2 px-3 rounded-lg border border-red-100 flex items-center gap-2 shadow-sm font-medium">
                                <ShieldCheck className="w-4 h-4 shrink-0" /> 
                                <span>ALLERGY: {selectedCustomer.allergies.join(', ')}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <ShoppingBag size={64} className="mb-4 opacity-20" />
                    <p className="font-medium">Scan or select items</p>
                </div>
            ) : (
                <>
                    {needsPrescription && (
                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex items-start gap-3 mb-2 animate-pulse">
                            <Stethoscope className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-xs font-bold text-yellow-700 uppercase">Pharmacist Required</div>
                                <div className="text-[10px] text-yellow-600">This order contains Rx items. Please verify prescription.</div>
                            </div>
                        </div>
                    )}
                    {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                        {item.requiresPrescription && <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400"></div>}
                        <div className="flex-1 mr-4 ml-2">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">฿{item.price} / {item.unit}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                        <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 p-0.5">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-blue-600 transition-colors"><Minus className="w-3 h-3" /></button>
                            <span className="w-8 text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-full shadow-sm hover:text-blue-600 transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                    </div>
                    ))}
                </>
            )}
            </div>

            {/* Total & Payment */}
            <div className="p-6 bg-white border-t border-slate-100 rounded-b-3xl">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <span className="text-slate-500 font-medium text-sm">Subtotal</span>
                    <div className="text-xs text-slate-400 mt-1">{cart.reduce((a,c) => a + c.quantity, 0)} items</div>
                </div>
                <span className="text-4xl font-bold text-slate-900 tracking-tight">฿{cartTotal.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                <button 
                    onClick={() => handleCheckout('CASH')}
                    disabled={cart.length === 0}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all disabled:opacity-50 group"
                >
                    <Banknote className="w-6 h-6 mb-1 text-slate-400 group-hover:text-green-600" />
                    <span className="text-xs font-bold">Cash</span>
                </button>
                <button 
                    onClick={() => handleCheckout('QR')}
                    disabled={cart.length === 0}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all disabled:opacity-50 group"
                >
                    <QrCode className="w-6 h-6 mb-1 text-slate-400 group-hover:text-blue-600" />
                    <span className="text-xs font-bold">Scan</span>
                </button>
                <button 
                    onClick={() => handleCheckout('CREDIT')}
                    disabled={cart.length === 0}
                    className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all disabled:opacity-50 group"
                >
                    <CreditCard className="w-6 h-6 mb-1 text-slate-400 group-hover:text-indigo-600" />
                    <span className="text-xs font-bold">Card</span>
                </button>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const PackageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package w-12 h-12 text-slate-200"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);

export default POS;
