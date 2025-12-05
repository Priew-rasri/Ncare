
import React, { useState, useMemo, useEffect } from 'react';
import { GlobalState, Product, CartItem, SaleRecord, Shift, HeldBill } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, QrCode, Banknote, User, ShieldCheck, ShoppingBag, Pill, Stethoscope, ChevronRight, CheckCircle, Barcode, Printer, Lock, LogIn, AlertOctagon, X, Percent, PauseCircle, PlayCircle, Clock, Gift, Scan, Edit3, Sticker, UploadCloud, FileCheck, Camera } from 'lucide-react';

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
  const [usePoints, setUsePoints] = useState(false);
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [openShiftAmount, setOpenShiftAmount] = useState<number>(1000);
  const [closeShiftActual, setCloseShiftActual] = useState<number>(0);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<SaleRecord | null>(null);
  const [showLabelPrint, setShowLabelPrint] = useState(false);
  
  // Instruction Editor State
  const [editingInstructionId, setEditingInstructionId] = useState<string | null>(null);
  const [instructionText, setInstructionText] = useState('');

  // QR Payment State
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);

  // Prescription Upload State
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [showRxUpload, setShowRxUpload] = useState(false);

  // Barcode Scanner Logic
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
        // Simple logic: if keys are typed very fast, assume it's a scanner
        const currentTime = Date.now();
        const isFast = currentTime - lastKeyTime < 50; 
        lastKeyTime = currentTime;

        if (e.key === 'Enter') {
            if (barcodeBuffer.length > 5 && (isFast || document.activeElement?.tagName !== 'INPUT')) {
                // Try to find product by barcode
                const product = state.inventory.find(p => p.barcode === barcodeBuffer);
                if (product) {
                    addToCart(product);
                    setSearchTerm(''); // Clear search if scanning
                }
                barcodeBuffer = '';
            }
        } else if (e.key.length === 1) {
            if (isFast) {
                barcodeBuffer += e.key;
            } else {
                 barcodeBuffer = ''; // Reset if typing slowly (human)
            }
        }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.inventory, cart]);


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

  const calculateTotals = (cartItems: CartItem[]) => {
      let total = 0;
      let totalExempt = 0;
      let totalVatable = 0; 

      cartItems.forEach(item => {
          const lineTotal = item.price * item.quantity;
          total += lineTotal;
          if (item.isVatExempt) {
              totalExempt += lineTotal;
          } else {
              totalVatable += lineTotal;
          }
      });
      
      let discount = 0;
      let pointsToRedeem = 0;
      if (usePoints && selectedCustomer && selectedCustomer.points > 0) {
          const maxDiscount = total * 0.2;
          const potentialDiscount = selectedCustomer.points / 10;
          
          discount = Math.min(maxDiscount, potentialDiscount);
          discount = Math.floor(discount); 
          pointsToRedeem = discount * 10;
      }
      
      const netTotal = total - discount;
      
      const vatableRatio = total > 0 ? totalVatable / total : 0;
      const discountVatable = discount * vatableRatio;
      const netVatable = totalVatable - discountVatable;
      
      const vatRate = state.settings.vatRate || 7;
      const vatAmount = netVatable * (vatRate / (100 + vatRate));
      const subtotalVatableBase = netVatable - vatAmount;
      
      const discountExempt = discount - discountVatable;
      const netExempt = totalExempt - discountExempt;

      return { total, totalExempt: netExempt, totalVatable, subtotalVatableBase, vatAmount, discount, pointsToRedeem, netTotal };
  };

  const { total: cartTotal, discount, netTotal } = calculateTotals(cart);

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
               if (product.drugInteractions?.includes(cartItem.genericName)) {
                   interactions.push(`${product.name} ❌ ${cartItem.name}`);
               }
               if (cartItem.drugInteractions?.includes(product.genericName)) {
                   interactions.push(`${cartItem.name} ❌ ${product.name}`);
               }
          });
      }
      return [...new Set(interactions)];
  };

  const addToCart = (product: Product) => {
    const allergyWarning = getAllergyWarnings(product);
    if (allergyWarning) {
        if (!window.confirm(`⚠️ ALLERGY WARNING\n\nลูกค้ามีประวัติ ${allergyWarning}\n\nต้องการยืนยันการจ่ายยานี้หรือไม่?`)) return;
    }

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
      return [...prev, { ...product, quantity: 1, instruction: product.defaultInstruction || 'รับประทานตามแพทย์สั่ง' }];
    });
  };

  const removeFromCart = (id: string) => {
    const itemToRemove = cart.find(i => i.id === id);
    if (itemToRemove?.requiresPrescription) {
        const othersNeedRx = cart.some(i => i.id !== id && i.requiresPrescription);
        if (!othersNeedRx) {
            setNeedsPrescription(false);
            setPrescriptionImage(null); // Reset rx if no longer needed
        }
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
  
  const openInstructionEditor = (item: CartItem) => {
      setEditingInstructionId(item.id);
      setInstructionText(item.instruction || '');
  };

  const saveInstruction = () => {
      if (editingInstructionId) {
          setCart(prev => prev.map(item => 
              item.id === editingInstructionId ? { ...item, instruction: instructionText } : item
          ));
          setEditingInstructionId(null);
      }
  };

  const handleHoldBill = () => {
      if (cart.length === 0) return;
      const heldBill: HeldBill = {
          id: `HOLD-${Date.now().toString().substr(-5)}`,
          timestamp: new Date().toLocaleTimeString('th-TH'),
          items: cart,
          customer: selectedCustomer,
          note: 'Customer paused checkout'
      };
      dispatch({ type: 'HOLD_BILL', payload: heldBill });
      setCart([]);
      setSelectedCustomerId('');
      setUsePoints(false);
      setNeedsPrescription(false);
  };

  const handleResumeBill = (bill: HeldBill) => {
      setCart(bill.items);
      if (bill.customer) setSelectedCustomerId(bill.customer.id);
      dispatch({ type: 'RESUME_BILL', payload: bill.id });
      setShowHeldBills(false);
      // Recheck prescription requirement
      if (bill.items.some(i => i.requiresPrescription)) {
          setNeedsPrescription(true);
      }
  };

  const initiatePayment = (method: 'CASH' | 'QR' | 'CREDIT') => {
      if (cart.length === 0) return;
      
      // Rx Check
      if (needsPrescription && !prescriptionImage) {
          setShowRxUpload(true);
          return;
      }

      const { netTotal } = calculateTotals(cart);

      if (method === 'QR') {
          setQrAmount(netTotal);
          setShowQRModal(true);
      } else {
          completeCheckout(method);
      }
  };
  
  const handleRxUpload = () => {
      // Simulation of file upload
      setPrescriptionImage("mock-base64-string");
      setShowRxUpload(false);
  };

  const completeCheckout = (method: 'CASH' | 'QR' | 'CREDIT') => {
    const { total, totalExempt, totalVatable, subtotalVatableBase, vatAmount, discount, pointsToRedeem, netTotal } = calculateTotals(cart);

    const sale: SaleRecord = {
      id: `INV-${Date.now()}`,
      date: new Date().toLocaleString('th-TH'),
      items: cart,
      total: total,
      discount: discount,
      pointsRedeemed: pointsToRedeem,
      netTotal: netTotal,
      subtotalExempt: totalExempt,
      subtotalVatable: subtotalVatableBase,
      vatAmount: vatAmount,
      paymentMethod: method,
      customerId: selectedCustomerId || undefined,
      branchId: state.currentBranch.id,
      shiftId: activeShift?.id,
      prescriptionImage: prescriptionImage || undefined
    };

    dispatch({ type: 'ADD_SALE', payload: sale });
    // Note: Inventory deduction is now handled in ADD_SALE reducer for FEFO accuracy
    
    setLastSale(sale);
    setShowReceipt(true);
    setCart([]);
    setSelectedCustomerId('');
    setNeedsPrescription(false);
    setPrescriptionImage(null);
    setUsePoints(false);
    setShowQRModal(false);
  };

  const handleOpenShift = () => {
      dispatch({ type: 'OPEN_SHIFT', payload: { staff: state.currentUser?.name || 'Staff', startCash: openShiftAmount } });
  };

  const handleCloseShift = () => {
      if(window.confirm("Confirm closing shift? This action cannot be undone.")) {
          dispatch({ type: 'CLOSE_SHIFT', payload: { actualCash: closeShiftActual } });
          setShowCloseShiftModal(false);
      }
  };

  const categories = ['ALL', ...Array.from(new Set(state.inventory.map(p => p.category)))];

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

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-9rem)] gap-6 animate-fade-in pb-2 relative">
      
      {/* Instruction Editor Modal */}
      {editingInstructionId && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-fade-in">
                   <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                       <Edit3 className="w-5 h-5 text-blue-600"/> Edit Dosage Instruction
                   </h3>
                   <p className="text-xs text-slate-500 mb-4">Edit usage instructions for label printing.</p>
                   <textarea 
                       className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                       value={instructionText}
                       onChange={(e) => setInstructionText(e.target.value)}
                       placeholder="e.g. รับประทานครั้งละ 1 เม็ด หลังอาหาร เช้า-เย็น"
                   />
                   <div className="flex gap-2">
                       <button onClick={() => setEditingInstructionId(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200">Cancel</button>
                       <button onClick={saveInstruction} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg">Save Instruction</button>
                   </div>
               </div>
          </div>
      )}

      {/* Prescription Upload Modal */}
      {showRxUpload && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 animate-fade-in text-center">
                   <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Stethoscope className="w-8 h-8 text-yellow-600" />
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2">Prescription Required</h3>
                   <p className="text-sm text-slate-500 mb-6">
                       Some items in this cart are restricted (Rx). Please upload or scan a digital prescription to proceed with compliance.
                   </p>
                   
                   <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 mb-6 hover:bg-slate-50 cursor-pointer transition-colors" onClick={handleRxUpload}>
                       <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                       <p className="text-sm font-bold text-slate-600">Click to Upload Image</p>
                       <p className="text-xs text-slate-400">JPG, PNG supported</p>
                   </div>

                   <button onClick={() => setShowRxUpload(false)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">
                       Cancel
                   </button>
               </div>
          </div>
      )}

      {/* QR Payment Modal */}
      {showQRModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
                   <div className="bg-[#103259] p-6 text-center text-white">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c5/PromptPay-logo.png" alt="PromptPay" className="h-8 mx-auto mb-4 bg-white p-1 rounded" />
                        <h3 className="font-bold text-lg">Scan to Pay</h3>
                        <div className="text-3xl font-bold mt-2">฿{qrAmount.toLocaleString()}</div>
                   </div>
                   <div className="p-8 flex flex-col items-center">
                        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-inner mb-6">
                             <QrCode size={180} className="text-slate-800" />
                        </div>
                        <p className="text-xs text-slate-400 mb-6 text-center">Reference: {`INV-${Date.now().toString().substr(-6)}`}</p>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <button onClick={() => setShowQRModal(false)} className="py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                            <button onClick={() => completeCheckout('QR')} className="py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg">Confirm Payment</button>
                        </div>
                   </div>
               </div>
          </div>
      )}

      {/* Held Bills Modal */}
      {showHeldBills && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
               <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 animate-fade-in">
                   <div className="flex justify-between items-center mb-6">
                       <h3 className="text-xl font-bold text-slate-800">Held Bills (พักบิล)</h3>
                       <button onClick={() => setShowHeldBills(false)}><X className="w-6 h-6 text-slate-400" /></button>
                   </div>
                   {state.heldBills.length === 0 ? (
                       <div className="text-center py-8 text-slate-400">No held bills</div>
                   ) : (
                       <div className="space-y-3">
                           {state.heldBills.map(bill => (
                               <div key={bill.id} className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
                                   <div>
                                       <div className="flex items-center gap-2">
                                           <span className="font-bold text-slate-800">{bill.timestamp}</span>
                                           <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">{bill.id}</span>
                                       </div>
                                       <div className="text-sm text-slate-500 mt-1">
                                           {bill.customer ? bill.customer.name : 'Walk-in Customer'} • {bill.items.length} Items
                                       </div>
                                   </div>
                                   <div className="flex gap-2">
                                       <button onClick={() => dispatch({type: 'DELETE_HELD_BILL', payload: bill.id})} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-5 h-5"/></button>
                                       <button onClick={() => handleResumeBill(bill)} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow flex items-center gap-2">
                                           <PlayCircle className="w-4 h-4"/> Resume
                                       </button>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
               </div>
          </div>
      )}

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

      {/* Receipt / Label Print Modal */}
      {showReceipt && lastSale && (
        <div id="receipt-modal" className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div id="printable-receipt" className={`bg-white w-full rounded-3xl shadow-2xl overflow-hidden animate-fade-in transition-all duration-300 ${showLabelPrint ? 'max-w-4xl' : 'max-w-sm'}`}>
                {showLabelPrint ? (
                    // Label Print View
                    <div className="flex flex-col h-[80vh]">
                         <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center no-print">
                             <h3 className="font-bold text-slate-800 flex items-center gap-2"><Sticker className="w-5 h-5"/> Drug Label Preview</h3>
                             <button onClick={() => setShowLabelPrint(false)} className="text-sm font-bold text-blue-600 hover:text-blue-800">Back to Receipt</button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-6 bg-slate-200">
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                 {lastSale.items.map((item, idx) => (
                                     <div key={idx} className="bg-white w-full aspect-[3/2] p-4 rounded shadow-sm border border-slate-300 flex flex-col justify-between text-xs font-mono relative">
                                         <div className="absolute top-2 right-2 font-bold text-slate-300">LOGO</div>
                                         <div>
                                             <div className="font-bold text-base mb-1">{state.settings.storeName}</div>
                                             <div className="mb-2">Tel: {state.settings.phone}</div>
                                             <div className="border-b border-black mb-2"></div>
                                             <div className="font-bold text-lg mb-1">{item.name}</div>
                                             <div className="text-slate-600 mb-2">{item.genericName} | {item.quantity} {item.unit}</div>
                                             <div className="font-bold text-sm bg-yellow-50 p-1 border border-yellow-200 rounded">{item.instruction || 'รับประทานตามแพทย์สั่ง'}</div>
                                         </div>
                                         <div className="text-[10px] text-right mt-2 text-slate-400">
                                             Date: {lastSale.date.split(' ')[0]} | Rx: {lastSale.id}
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                         <div className="p-4 border-t border-slate-100 flex justify-end gap-3 bg-white no-print">
                             <button onClick={() => window.print()} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center gap-2">
                                 <Printer className="w-4 h-4" /> Print All Labels
                             </button>
                         </div>
                    </div>
                ) : (
                    // Standard Receipt View
                    <>
                        <div className="bg-blue-600 p-6 text-center text-white relative overflow-hidden no-print">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle,white,transparent)]"></div>
                            <CheckCircle className="w-16 h-16 mx-auto mb-3" />
                            <h2 className="text-2xl font-bold">Payment Success</h2>
                        </div>
                        <div className="p-6">
                            <div className="text-center mb-4">
                                <h3 className="font-bold text-slate-800 text-xl">{state.settings.storeName}</h3>
                                <p className="text-xs text-slate-500 mb-1">{state.settings.address}</p>
                                <p className="text-xs text-slate-500">Tax ID: {state.settings.taxId} | Tel: {state.settings.phone}</p>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-500 mb-4 pb-4 border-b border-dashed border-slate-200">
                                <span>No: <span className="font-mono font-bold text-slate-800">{lastSale.id}</span></span>
                                <span>{lastSale.date}</span>
                            </div>
                            <div className="space-y-3 mb-6 max-h-none overflow-visible">
                                {lastSale.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-slate-600 w-2/3 truncate">
                                            {item.quantity} x {item.name}
                                        </span>
                                        <span className="font-bold text-slate-800">฿{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Subtotal</span>
                                    <span>฿{lastSale.total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>VAT 7%</span>
                                    <span>฿{lastSale.vatAmount.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                                </div>
                                {lastSale.discount > 0 && (
                                     <div className="flex justify-between text-xs text-green-600 font-bold">
                                        <span>Discount</span>
                                        <span>-฿{lastSale.discount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-center text-xl font-bold text-slate-900 pt-4 mt-2 border-t border-slate-900">
                                <span>Net Total</span>
                                <span>฿{lastSale.netTotal.toLocaleString()}</span>
                            </div>

                            <div className="mt-8 text-center text-[10px] text-slate-400">
                                <p>Thank you for shopping with Ncare.</p>
                                <p>{state.settings.receiptFooter}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mt-6 no-print">
                                <button onClick={() => setShowReceipt(false)} className="py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Close</button>
                                <button onClick={() => setShowLabelPrint(true)} className="py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 flex items-center justify-center gap-2">
                                     <Sticker className="w-4 h-4" /> Print Labels
                                </button>
                            </div>
                            <div className="mt-2 no-print">
                                <button onClick={() => window.print()} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                                     <Printer className="w-4 h-4" /> Print Receipt
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
      )}

      {/* Catalog Area */}
      <div className="lg:w-2/3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col overflow-hidden no-print">
        {/* Search & Filter Header */}
        <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10 space-y-4">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     Shift: <span className="font-bold text-slate-700">{activeShift.staffName}</span>
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
                    autoFocus
                />
                <Scan className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 opacity-50" />
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
                            
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                                {!product.isVatExempt && (
                                    <div className="bg-slate-800 text-white text-[9px] py-0.5 px-1.5 rounded font-bold shadow-sm">
                                        VAT
                                    </div>
                                )}
                            </div>

                            {hasIssues && (
                                <div className="absolute top-2 right-2 left-auto bg-red-500 text-white text-[10px] py-1 px-2 rounded-md font-bold text-center shadow-sm animate-pulse flex items-center justify-center gap-1">
                                    <AlertOctagon className="w-3 h-3" /> SAFETY
                                </div>
                            )}
                            {product.requiresPrescription && !hasIssues && (
                                <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] py-1 px-2 rounded-md font-bold shadow-sm">
                                    Rx
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

      <div className="lg:w-1/3 flex flex-col h-full bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden relative z-20 no-print">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-end gap-2">
            <button 
                onClick={() => setShowHeldBills(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm px-3 py-1.5 rounded-lg transition-all relative"
            >
                <Clock className="w-3.5 h-3.5" /> Recalls
                {state.heldBills.length > 0 && (
                    <span className="bg-red-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full absolute -top-1 -right-1">
                        {state.heldBills.length}
                    </span>
                )}
            </button>
             <button 
                onClick={handleHoldBill}
                disabled={cart.length === 0}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
                <PauseCircle className="w-3.5 h-3.5" /> Hold Bill
            </button>
        </div>

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
                        <div className={`border rounded-xl p-3 flex gap-3 animate-fade-in ${prescriptionImage ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className={`p-2 rounded-lg h-fit ${prescriptionImage ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                {prescriptionImage ? <FileCheck className="w-5 h-5 text-green-700" /> : <Stethoscope className="w-5 h-5 text-yellow-700" />}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${prescriptionImage ? 'text-green-800' : 'text-yellow-800'}`}>
                                    {prescriptionImage ? 'Prescription Attached' : 'Prescription Required'}
                                </h4>
                                <p className={`text-xs mt-1 ${prescriptionImage ? 'text-green-700' : 'text-yellow-700'}`}>
                                    {prescriptionImage ? 'Digital Rx loaded. Ready for review.' : 'Items marked Rx require documentation.'}
                                </p>
                                {!prescriptionImage && (
                                    <button onClick={() => setShowRxUpload(true)} className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                                        <Camera className="w-3 h-3"/> Upload Now
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    {cart.map(item => (
                        <div key={item.id} className="flex flex-col p-2 hover:bg-slate-50 rounded-xl transition-colors group">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex-1 pr-4">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{item.name}</h4>
                                        {!item.isVatExempt ? (
                                            <span className="text-[9px] bg-slate-200 text-slate-600 px-1 rounded font-bold" title="VAT Included">V</span>
                                        ) : (
                                            <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded font-bold" title="Tax Exempt">E</span>
                                        )}
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
                            {/* Instruction Clickable Area */}
                            <div 
                                onClick={() => openInstructionEditor(item)}
                                className="mt-1 text-[10px] text-slate-400 hover:text-blue-600 cursor-pointer flex items-center gap-1 w-fit bg-slate-50 hover:bg-blue-50 px-2 py-0.5 rounded border border-transparent hover:border-blue-100 transition-all"
                            >
                                <Sticker className="w-3 h-3" />
                                {item.instruction || 'Add usage instruction...'}
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
            {selectedCustomer && selectedCustomer.points >= 10 && cart.length > 0 && (
                <div className="mb-4 bg-white p-3 rounded-xl border border-blue-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-700">Use {Math.min(cartTotal * 2, selectedCustomer.points)} Points?</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={usePoints} onChange={() => setUsePoints(!usePoints)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            )}

            <div className="space-y-1 mb-6">
                 <div className="flex justify-between items-end">
                    <span className="text-slate-500 text-sm font-medium">Subtotal</span>
                    <span className="font-bold text-slate-800">฿{cartTotal.toLocaleString()}</span>
                 </div>
                 {discount > 0 && (
                     <div className="flex justify-between items-end text-green-600">
                        <span className="text-xs font-bold flex items-center gap-1"><Percent className="w-3 h-3"/> Discount</span>
                        <span className="font-bold">-฿{discount.toLocaleString()}</span>
                     </div>
                 )}
                 <div className="flex justify-between items-end pt-2 border-t border-slate-200">
                    <span className="text-slate-900 text-lg font-bold">Net Total</span>
                    <span className="text-3xl font-bold text-blue-600 tracking-tight">฿{netTotal.toLocaleString()}</span>
                 </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
                {[
                    { id: 'CASH', label: 'Cash', icon: Banknote, color: 'green' },
                    { id: 'QR', label: 'QR Scan', icon: QrCode, color: 'blue' },
                    { id: 'CREDIT', label: 'Card', icon: CreditCard, color: 'indigo' }
                ].map((m) => (
                    <button 
                        key={m.id}
                        onClick={() => initiatePayment(m.id as any)}
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
