
import React, { useState, useMemo, useEffect } from 'react';
import { GlobalState, Product, CartItem, SaleRecord, Shift, HeldBill } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, QrCode, Banknote, User, ShieldCheck, ShoppingBag, Pill, Stethoscope, ChevronRight, CheckCircle, Barcode, Printer, Lock, LogIn, AlertOctagon, X, Percent, PauseCircle, PlayCircle, Clock, Gift, Scan, Edit3, Sticker, UploadCloud, FileCheck, Camera, History, AlertTriangle, FileText, Briefcase, Coins, ArrowRightLeft, MousePointerClick, Tag, LogOut } from 'lucide-react';

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
  const [doctorName, setDoctorName] = useState('');
  
  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [openShiftAmount, setOpenShiftAmount] = useState<number>(1000);
  const [closeShiftActual, setCloseShiftActual] = useState<number>(0);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [shiftSummary, setShiftSummary] = useState<Shift | null>(null);
  
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<SaleRecord | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);
  const [showRxUpload, setShowRxUpload] = useState(false);
  const [showCashOpsModal, setShowCashOpsModal] = useState(false);
  const [showHeldBillsModal, setShowHeldBillsModal] = useState(false);

  // Instruction Editor
  const [editingInstructionId, setEditingInstructionId] = useState<string | null>(null);
  const [tempInstruction, setTempInstruction] = useState('');

  // Cash Ops State
  const [cashOpsType, setCashOpsType] = useState<'PAY_OUT' | 'CASH_DROP'>('PAY_OUT');
  const [cashOpsAmount, setCashOpsAmount] = useState<string>('');
  const [cashOpsReason, setCashOpsReason] = useState<string>('');

  // New Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [showTaxInvoiceForm, setShowTaxInvoiceForm] = useState(false);
  const [taxDetails, setTaxDetails] = useState({ name: '', taxId: '', address: '' });
  const [printMode, setPrintMode] = useState<'SLIP' | 'A4' | 'STICKER' | 'Z_REPORT'>('SLIP');

  // Void Reason
  const [voidReason, setVoidReason] = useState('');
  const [saleToVoid, setSaleToVoid] = useState<string | null>(null);
  
  // Prescription Upload State
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  
  // Search Input Ref
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // --- Global Keyboard Shortcuts ---
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
        if (!state.activeShift) return;

        // F2: Focus Search
        if (e.key === 'F2') {
            e.preventDefault();
            searchInputRef.current?.focus();
        }
        
        // F4: Pay Cash (Shortcut)
        if (e.key === 'F4') {
             e.preventDefault();
             if (cart.length > 0) {
                 initiatePayment('CASH');
             }
        }

        // F9: Hold Bill
        if (e.key === 'F9') {
            e.preventDefault();
            if (cart.length > 0) handleHoldBill();
        }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [state.activeShift, cart]);

  // --- Barcode Scanner Logic ---
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
        const currentTime = Date.now();
        const isFast = currentTime - lastKeyTime < 50; 
        lastKeyTime = currentTime;

        if (e.key === 'Enter') {
            if (barcodeBuffer.length > 5 && (isFast || document.activeElement?.tagName !== 'INPUT')) {
                const product = state.inventory.find(p => p.barcode === barcodeBuffer);
                if (product) {
                    addToCart(product);
                    setSearchTerm(''); 
                }
                barcodeBuffer = '';
            }
        } else if (e.key.length === 1) {
            if (isFast) barcodeBuffer += e.key;
            else barcodeBuffer = ''; 
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

  const addToCart = (product: Product) => {
    const existingQty = cart.find(x => x.id === product.id)?.quantity || 0;
    if (existingQty + 1 > product.stock) {
        alert(`❌ Insufficient Stock! Available: ${product.stock}`);
        return;
    }

    // 1. Check Customer Allergies
    if (selectedCustomer) {
        const allergy = selectedCustomer.allergies?.find(a => 
            product.genericName.toLowerCase().includes(a.toLowerCase()) || 
            (product.genericName === 'Amoxicillin' && a === 'Penicillin')
        );
        if (allergy && !window.confirm(`⚠️ ALLERGY WARNING: Customer is allergic to ${allergy}!\n\nAre you sure you want to add this item?`)) return;
    }

    // 2. Check Drug-Drug Interactions (Cart Items vs New Product)
    const interactingItem = cart.find(cartItem => {
        // Check if new product interacts with existing item
        const conflictA = product.drugInteractions?.some(interaction => 
            cartItem.genericName.toLowerCase().includes(interaction.toLowerCase())
        );
        // Check if existing item interacts with new product
        const conflictB = cartItem.drugInteractions?.some(interaction => 
            product.genericName.toLowerCase().includes(interaction.toLowerCase())
        );
        return conflictA || conflictB;
    });

    if (interactingItem) {
        if (!window.confirm(`⚠️ DRUG INTERACTION ALERT!\n\n'${product.name}' may interact with '${interactingItem.name}' already in cart.\n\nDo you want to proceed?`)) {
            return;
        }
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
            setPrescriptionImage(null); 
        }
    }
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (delta > 0 && newQty > item.stock) {
            alert(`Cannot exceed available stock (${item.stock})`);
            return item;
        }
        if (newQty < 1) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
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
      dispatch({ type: 'RESUME_BILL', payload: bill.id }); // Removes from Held list
      setShowHeldBillsModal(false);
  };
  
  const handleDeleteHeldBill = (id: string) => {
      if(window.confirm("Delete this held bill?")) {
          dispatch({ type: 'DELETE_HELD_BILL', payload: id });
      }
  }

  const handleCashOps = () => {
      if (!cashOpsAmount || Number(cashOpsAmount) <= 0 || !cashOpsReason) return;
      dispatch({ 
          type: 'ADD_CASH_TRANSACTION', 
          payload: { 
              type: cashOpsType, 
              amount: Number(cashOpsAmount), 
              reason: cashOpsReason 
          } 
      });
      setShowCashOpsModal(false);
      setCashOpsAmount('');
      setCashOpsReason('');
  };

  const openInstructionEditor = (item: CartItem) => {
      setEditingInstructionId(item.id);
      setTempInstruction(item.instruction || item.defaultInstruction || '');
  };

  const saveInstruction = () => {
      setCart(prev => prev.map(item => item.id === editingInstructionId ? { ...item, instruction: tempInstruction } : item));
      setEditingInstructionId(null);
  };

  const initiatePayment = (method: 'CASH' | 'QR' | 'CREDIT') => {
      if (cart.length === 0) return;
      
      if (needsPrescription && !prescriptionImage) {
          setShowRxUpload(true);
          return;
      }

      if (method === 'QR') {
          setQrAmount(netTotal);
          setShowQRModal(true);
      } else if (method === 'CASH') {
          setShowPaymentModal(true);
          setTenderedAmount('');
      } else {
          completeCheckout(method);
      }
  };
  
  const completeCheckout = (method: 'CASH' | 'QR' | 'CREDIT', tendered?: number, change?: number) => {
    const { total, totalExempt, totalVatable, subtotalVatableBase, vatAmount, discount, pointsToRedeem, netTotal } = calculateTotals(cart);

    const sale: SaleRecord = {
      id: 'PENDING', // Will be replaced by reducer
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
      tenderedAmount: tendered,
      change: change,
      customerId: selectedCustomerId || undefined,
      branchId: state.currentBranch.id,
      shiftId: activeShift?.id,
      prescriptionImage: prescriptionImage || undefined,
      doctorName: doctorName || undefined,
      status: 'COMPLETED',
      taxInvoiceDetails: showTaxInvoiceForm ? { ...taxDetails } : undefined
    };

    dispatch({ type: 'ADD_SALE', payload: sale });
    
    setTimeout(() => {
        setLastSale(sale); 
        setShowReceipt(true);
    }, 100);

    setCart([]);
    setSelectedCustomerId('');
    setNeedsPrescription(false);
    setPrescriptionImage(null);
    setUsePoints(false);
    setDoctorName('');
    setShowQRModal(false);
    setShowPaymentModal(false);
    setShowTaxInvoiceForm(false);
    setTaxDetails({ name: '', taxId: '', address: '' });
  };

  const handleCloseShift = () => {
      if (!activeShift) return;
      dispatch({ type: 'CLOSE_SHIFT', payload: { actualCash: closeShiftActual } });
      
      // Calculate variance and details for the summary
      const totalPayOut = activeShift.cashTransactions
        .filter(t => t.type === 'PAY_OUT' || t.type === 'CASH_DROP')
        .reduce((acc, curr) => acc + curr.amount, 0);
      
      const expectedCash = (activeShift.startCash + activeShift.totalCashSales) - totalPayOut;

      setShiftSummary({
          ...activeShift,
          actualCash: closeShiftActual,
          expectedCash: expectedCash,
          status: 'CLOSED',
          endTime: new Date().toLocaleString()
      });
      
      setShowCloseShiftModal(false);
  };

  const handlePrint = (mode: 'SLIP' | 'A4' | 'STICKER' | 'Z_REPORT') => {
      document.body.className = ''; // Reset classes
      if (mode === 'A4') {
          document.body.classList.add('print-a4');
      } else if (mode === 'STICKER') {
          document.body.classList.add('print-sticker');
      } else if (mode === 'Z_REPORT') {
          document.body.classList.add('print-z-report');
      } else {
          document.body.classList.add('print-slip');
      }
      window.print();
      document.body.className = ''; // Cleanup after print
  }

  const handleVoidSale = () => {
      if (!saleToVoid || !voidReason) return;
      if (window.confirm("Confirm VOID? This will reverse stock and financial records.")) {
          dispatch({ 
              type: 'VOID_SALE', 
              payload: { 
                  saleId: saleToVoid, 
                  reason: voidReason, 
                  user: state.currentUser?.name || 'Unknown' 
              } 
          });
          setSaleToVoid(null);
          setVoidReason('');
      }
  };

  const categories = ['ALL', ...Array.from(new Set(state.inventory.map(p => p.category)))];

  if (!activeShift) {
    if (shiftSummary) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center animate-fade-in no-print">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 text-center">
                    <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Shift Closed Successfully</h2>
                    <p className="text-slate-500 mb-6">Staff: {shiftSummary.staffName}</p>
                    
                    <div className="bg-slate-50 p-4 rounded-xl text-left mb-6 space-y-2 text-sm">
                        <div className="flex justify-between"><span>Expected Cash:</span><span className="font-bold">฿{shiftSummary.expectedCash?.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Actual Count:</span><span className="font-bold">฿{shiftSummary.actualCash?.toLocaleString()}</span></div>
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span>Variance:</span>
                            <span className={`font-bold ${(shiftSummary.actualCash || 0) - (shiftSummary.expectedCash || 0) !== 0 ? 'text-red-500' : 'text-green-500'}`}>
                                ฿{((shiftSummary.actualCash || 0) - (shiftSummary.expectedCash || 0)).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <button 
                        onClick={() => handlePrint('Z_REPORT')}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mb-3 flex items-center justify-center gap-2"
                    >
                        <Printer className="w-5 h-5" /> Print Z-Report
                    </button>
                    <button 
                        onClick={() => setShiftSummary(null)} 
                        className="w-full py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                    >
                        Start New Shift
                    </button>
                </div>

                {/* Hidden Printable Z-Report */}
                <div id="printable-z-report" className="hidden">
                    <div className="receipt-header">
                        <div className="receipt-title">{state.settings.storeName}</div>
                        <div>Z-REPORT (SHIFT CLOSING)</div>
                    </div>
                    <div className="receipt-divider"></div>
                    <div className="receipt-row"><span>Shift ID:</span><span>{shiftSummary.id}</span></div>
                    <div className="receipt-row"><span>Staff:</span><span>{shiftSummary.staffName}</span></div>
                    <div className="receipt-row"><span>Open:</span><span>{shiftSummary.startTime}</span></div>
                    <div className="receipt-row"><span>Close:</span><span>{shiftSummary.endTime}</span></div>
                    <div className="receipt-divider"></div>
                    <div className="receipt-row"><span>Opening Fund:</span><span>{shiftSummary.startCash.toFixed(2)}</span></div>
                    <div className="receipt-row"><span>Cash Sales:</span><span>{shiftSummary.totalCashSales.toFixed(2)}</span></div>
                    <div className="receipt-row"><span>QR Sales:</span><span>{shiftSummary.totalQrSales.toFixed(2)}</span></div>
                    <div className="receipt-row"><span>Pay Outs:</span><span>-{(shiftSummary.startCash + shiftSummary.totalCashSales - (shiftSummary.expectedCash || 0)).toFixed(2)}</span></div>
                    <div className="receipt-divider"></div>
                    <div className="receipt-row" style={{fontWeight: 'bold'}}><span>Expected Cash:</span><span>{shiftSummary.expectedCash?.toFixed(2)}</span></div>
                    <div className="receipt-row" style={{fontWeight: 'bold'}}><span>Actual Count:</span><span>{shiftSummary.actualCash?.toFixed(2)}</span></div>
                    <div className="receipt-row"><span>Variance:</span><span>{((shiftSummary.actualCash || 0) - (shiftSummary.expectedCash || 0)).toFixed(2)}</span></div>
                    <div className="receipt-footer">--- END OF REPORT ---</div>
                </div>
            </div>
        );
    }
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
                      <input 
                          type="number" 
                          value={openShiftAmount} 
                          onChange={(e) => setOpenShiftAmount(Number(e.target.value))}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-lg text-slate-800"
                      />
                  </div>
                  <button onClick={() => dispatch({ type: 'OPEN_SHIFT', payload: { staff: state.currentUser?.name || 'Staff', startCash: openShiftAmount } })} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">
                      <LogIn className="w-5 h-5 inline mr-2" /> Open Shift
                  </button>
              </div>
          </div>
      );
  }

  const todaysSales = state.sales
        .filter(s => s.shiftId === activeShift.id)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-9rem)] gap-6 animate-fade-in pb-2 relative">
      
      {/* Instruction Editor Modal */}
      {editingInstructionId && (
          <div className="absolute inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Edit3 className="w-5 h-5 text-blue-600"/> Edit Dosage Instruction</h3>
                  <textarea 
                      className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-sm"
                      value={tempInstruction}
                      onChange={e => setTempInstruction(e.target.value)}
                      placeholder="e.g. Take 1 tablet daily"
                  />
                  <div className="flex gap-2">
                      <button onClick={saveInstruction} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl">Save</button>
                      <button onClick={() => setEditingInstructionId(null)} className="flex-1 py-3 text-slate-500 font-bold rounded-xl border border-slate-200">Cancel</button>
                  </div>
              </div>
          </div>
      )}

      {/* Held Bills Modal */}
      {showHeldBillsModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                          <PauseCircle className="w-6 h-6 text-orange-500" /> Held Bills (Paused Transactions)
                      </h3>
                      <button onClick={() => setShowHeldBillsModal(false)}><X className="w-6 h-6"/></button>
                  </div>
                  {state.heldBills.length === 0 ? (
                      <div className="text-center py-10 text-slate-400">No held bills currently.</div>
                  ) : (
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                          {state.heldBills.map(bill => (
                              <div key={bill.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                                  <div>
                                      <div className="font-bold text-slate-700">{bill.id}</div>
                                      <div className="text-xs text-slate-500">{bill.timestamp}</div>
                                      <div className="text-xs text-slate-500 mt-1">Customer: {bill.customer?.name || 'Guest'}</div>
                                      <div className="text-xs text-slate-500">{bill.items.length} items</div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button onClick={() => handleResumeBill(bill)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
                                          <PlayCircle className="w-4 h-4"/> Resume
                                      </button>
                                      <button onClick={() => handleDeleteHeldBill(bill.id)} className="bg-white border border-red-200 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50">
                                          <Trash2 className="w-4 h-4"/>
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Cash Ops Modal */}
      {showCashOpsModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2"><ArrowRightLeft className="w-5 h-5"/> Drawer Ops</h3>
                      <button onClick={() => setShowCashOpsModal(false)}><X className="w-5 h-5"/></button>
                  </div>
                  <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
                      <button onClick={() => setCashOpsType('PAY_OUT')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${cashOpsType === 'PAY_OUT' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}>Pay Out / Expense</button>
                      <button onClick={() => setCashOpsType('CASH_DROP')} className={`flex-1 py-2 text-xs font-bold rounded-lg ${cashOpsType === 'CASH_DROP' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}>Cash Drop (Safe)</button>
                  </div>
                  <div className="space-y-3">
                      <div>
                          <label className="text-xs font-bold text-slate-500">Amount</label>
                          <input type="number" value={cashOpsAmount} onChange={e => setCashOpsAmount(e.target.value)} className="w-full p-3 border rounded-xl font-bold text-lg" placeholder="0.00" autoFocus />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-500">Reason</label>
                          <input type="text" value={cashOpsReason} onChange={e => setCashOpsReason(e.target.value)} className="w-full p-3 border rounded-xl text-sm" placeholder="e.g. Buying Ice, Move to Safe" />
                      </div>
                      <button onClick={handleCashOps} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl mt-2">Confirm</button>
                  </div>
              </div>
          </div>
      )}

      {/* Close Shift Modal */}
      {showCloseShiftModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2"><LogOut className="w-5 h-5 text-red-600"/> End Shift Reconciliation</h3>
                      <button onClick={() => setShowCloseShiftModal(false)}><X className="w-5 h-5"/></button>
                   </div>
                   
                   <div className="bg-slate-50 p-4 rounded-xl mb-6 space-y-2 text-sm">
                       <div className="flex justify-between text-slate-600"><span>Opening Fund</span><span>{activeShift.startCash.toLocaleString()}</span></div>
                       <div className="flex justify-between text-slate-600"><span>Cash Sales</span><span>{activeShift.totalCashSales.toLocaleString()}</span></div>
                       <div className="flex justify-between text-red-500"><span>Pay Outs</span><span>-{(activeShift.cashTransactions.reduce((a,c)=>a+c.amount,0)).toLocaleString()}</span></div>
                       <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-2">
                           <span>Expected Cash in Drawer</span>
                           <span>฿{((activeShift.startCash + activeShift.totalCashSales) - activeShift.cashTransactions.reduce((a,c)=>a+c.amount,0)).toLocaleString()}</span>
                       </div>
                   </div>

                   <div className="mb-6">
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Actual Cash Count (นับจริง)</label>
                       <input 
                          type="number" 
                          autoFocus
                          className="w-full p-4 text-2xl font-bold border-2 border-slate-300 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 transition-all text-right"
                          value={closeShiftActual}
                          onChange={(e) => setCloseShiftActual(Number(e.target.value))}
                       />
                   </div>

                   <button 
                       onClick={handleCloseShift}
                       className="w-full py-4 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all"
                   >
                       Confirm Close & Print Z-Report
                   </button>
              </div>
          </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative">
                   <button onClick={() => setShowPaymentModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
                   <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Banknote className="w-6 h-6 text-green-600"/> Cash Payment</h3>
                   
                   <div className="bg-slate-50 p-4 rounded-xl mb-6 text-center">
                       <span className="text-sm text-slate-500 font-bold uppercase">Total Amount</span>
                       <div className="text-4xl font-bold text-slate-900">฿{netTotal.toLocaleString()}</div>
                   </div>

                   <div className="mb-6">
                       <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cash Tendered (รับเงินมา)</label>
                       <input 
                          type="number" 
                          autoFocus
                          className="w-full p-4 text-2xl font-bold border-2 border-blue-500 rounded-xl outline-none focus:ring-4 focus:ring-blue-100 transition-all text-right"
                          value={tenderedAmount}
                          onChange={(e) => setTenderedAmount(e.target.value)}
                          placeholder="0.00"
                       />
                       <div className="flex gap-2 mt-2">
                           {[100, 500, 1000].map(amt => (
                               <button 
                                key={amt}
                                onClick={() => setTenderedAmount(amt.toString())}
                                className="flex-1 py-2 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200 text-slate-600"
                               >
                                   ฿{amt}
                               </button>
                           ))}
                           <button onClick={() => setTenderedAmount(netTotal.toString())} className="flex-1 py-2 bg-blue-50 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-100">Exact</button>
                       </div>
                   </div>

                   {Number(tenderedAmount) >= netTotal && (
                       <div className="bg-green-50 p-4 rounded-xl mb-6 flex justify-between items-center border border-green-100 animate-fade-in">
                           <span className="text-green-700 font-bold uppercase text-sm">Change Due (เงินทอน)</span>
                           <span className="text-2xl font-bold text-green-700">฿{(Number(tenderedAmount) - netTotal).toLocaleString()}</span>
                       </div>
                   )}

                   {/* Full Tax Invoice Request */}
                   <div className="mb-6">
                       <button 
                         onClick={() => setShowTaxInvoiceForm(!showTaxInvoiceForm)} 
                         className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                       >
                           {showTaxInvoiceForm ? <X className="w-3 h-3"/> : <FileText className="w-3 h-3"/>}
                           {showTaxInvoiceForm ? 'Cancel Tax Invoice' : 'Request Full Tax Invoice'}
                       </button>

                       {showTaxInvoiceForm && (
                           <div className="mt-3 space-y-3 p-3 bg-slate-50 rounded-xl border border-blue-100 animate-fade-in">
                               <input 
                                 className="w-full p-2 text-sm border border-slate-200 rounded-lg" 
                                 placeholder="Company Name / Customer Name"
                                 value={taxDetails.name}
                                 onChange={e => setTaxDetails({...taxDetails, name: e.target.value})}
                               />
                               <input 
                                 className="w-full p-2 text-sm border border-slate-200 rounded-lg" 
                                 placeholder="Tax ID (13 Digits)"
                                 value={taxDetails.taxId}
                                 onChange={e => setTaxDetails({...taxDetails, taxId: e.target.value})}
                               />
                               <input 
                                 className="w-full p-2 text-sm border border-slate-200 rounded-lg" 
                                 placeholder="Address / Branch"
                                 value={taxDetails.address}
                                 onChange={e => setTaxDetails({...taxDetails, address: e.target.value})}
                               />
                           </div>
                       )}
                   </div>

                   <button 
                       disabled={Number(tenderedAmount) < netTotal}
                       onClick={() => {
                           setPrintMode(showTaxInvoiceForm ? 'A4' : 'SLIP');
                           completeCheckout('CASH', Number(tenderedAmount), Number(tenderedAmount) - netTotal);
                       }}
                       className="w-full py-4 bg-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                   >
                       Confirm Payment
                   </button>
              </div>
          </div>
      )}

      {/* History / Void Modal */}
      {showHistoryModal && (
          <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                       <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                           <History className="w-5 h-5 text-blue-600" /> Today's Transactions
                       </h3>
                       <button onClick={() => setShowHistoryModal(false)}><X className="w-6 h-6 text-slate-400" /></button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-0">
                       <table className="w-full text-left text-sm">
                           <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                               <tr>
                                   <th className="p-4">Bill ID</th>
                                   <th className="p-4">Time</th>
                                   <th className="p-4 text-right">Total</th>
                                   <th className="p-4 text-center">Method</th>
                                   <th className="p-4 text-center">Status</th>
                                   <th className="p-4 text-center">Action</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                               {todaysSales.map(sale => (
                                   <tr key={sale.id} className="hover:bg-slate-50">
                                       <td className="p-4 font-mono text-blue-600 font-bold">{sale.id}</td>
                                       <td className="p-4 text-slate-500">{sale.date.split(' ')[1]}</td>
                                       <td className="p-4 text-right font-bold">฿{sale.netTotal.toLocaleString()}</td>
                                       <td className="p-4 text-center text-xs">{sale.paymentMethod}</td>
                                       <td className="p-4 text-center">
                                           {sale.status === 'VOID' ? (
                                               <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">VOID</span>
                                           ) : (
                                               <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">PAID</span>
                                           )}
                                       </td>
                                       <td className="p-4 text-center">
                                            {sale.status !== 'VOID' && (
                                                <button 
                                                    onClick={() => setSaleToVoid(sale.id)}
                                                    className="text-red-500 hover:text-red-700 text-xs font-bold border border-red-200 px-2 py-1 rounded hover:bg-red-50"
                                                >
                                                    VOID
                                                </button>
                                            )}
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   </div>
                   {saleToVoid && (
                       <div className="p-4 bg-red-50 border-t border-red-100">
                           <p className="text-red-700 font-bold text-sm mb-2">Voiding Bill: {saleToVoid}</p>
                           <div className="flex gap-2">
                               <input 
                                   type="text" 
                                   className="flex-1 p-2 border border-red-200 rounded text-sm"
                                   placeholder="Reason for void (Required)"
                                   value={voidReason}
                                   onChange={(e) => setVoidReason(e.target.value)}
                               />
                               <button 
                                    onClick={handleVoidSale}
                                    disabled={!voidReason}
                                    className="bg-red-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-red-700 disabled:opacity-50"
                                >
                                    Confirm Void
                               </button>
                               <button onClick={() => { setSaleToVoid(null); setVoidReason(''); }} className="text-slate-500 text-sm px-2">Cancel</button>
                           </div>
                       </div>
                   )}
              </div>
          </div>
      )}

      {/* Receipt / Success Modal */}
      {showReceipt && lastSale && (
        <div className="absolute inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full no-print">
                 <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                 <h2 className="text-2xl font-bold text-center mb-2">Payment Successful</h2>
                 <p className="text-center text-slate-500 mb-6">
                     {lastSale.change ? `Change: ฿${lastSale.change.toLocaleString()}` : 'Completed'}
                 </p>
                 <div className="space-y-2 mb-3">
                    <button onClick={() => handlePrint(printMode)} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                        <Printer className="w-4 h-4"/> {printMode === 'A4' ? 'Print Full Invoice' : 'Print Slip'}
                    </button>
                    <button onClick={() => handlePrint('STICKER')} className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2">
                        <Tag className="w-4 h-4"/> Print Drug Labels
                    </button>
                 </div>
                 <button onClick={() => setShowReceipt(false)} className="w-full py-3 border border-slate-200 text-slate-600 font-bold rounded-xl">Close</button>
             </div>
             
             {/* Hidden Print Area: Thermal Slip */}
             <div id="printable-receipt">
                 <div className="receipt-header">
                     <div className="receipt-title">{state.settings.storeName}</div>
                     <div>TAX ID: {state.settings.taxId}</div>
                     <div>{state.settings.address}</div>
                     <div>ABB (Tax Inv)</div>
                 </div>
                 <div className="receipt-divider"></div>
                 <div className="receipt-row"><span>Bill: {lastSale.id}</span><span>{lastSale.date.split(' ')[0]} {lastSale.date.split(' ')[1]}</span></div>
                 {lastSale.doctorName && <div className="receipt-row"><span>Dr: {lastSale.doctorName}</span></div>}
                 <div className="receipt-divider"></div>
                 {lastSale.items.map((item,i) => (
                     <div key={i} className="receipt-row"><span>{item.name} x{item.quantity}</span><span>{(item.price*item.quantity).toFixed(2)}</span></div>
                 ))}
                 <div className="receipt-divider"></div>
                 <div className="receipt-row"><span>Total</span><span>{lastSale.total.toFixed(2)}</span></div>
                 {lastSale.discount > 0 && <div className="receipt-row"><span>Discount</span><span>-{lastSale.discount.toFixed(2)}</span></div>}
                 <div className="receipt-row receipt-total"><span>Net Total</span><span>{lastSale.netTotal.toFixed(2)}</span></div>
                 <div className="receipt-divider"></div>
                 <div className="receipt-row"><span>Before VAT</span><span>{lastSale.subtotalVatable.toFixed(2)}</span></div>
                 <div className="receipt-row"><span>VAT 7%</span><span>{lastSale.vatAmount.toFixed(2)}</span></div>
                 <div className="receipt-divider"></div>
                 <div className="receipt-row"><span>Cash Tendered</span><span>{lastSale.tenderedAmount?.toFixed(2) || '-'}</span></div>
                 <div className="receipt-row"><span>Change</span><span>{lastSale.change?.toFixed(2) || '-'}</span></div>
                 <div className="receipt-divider"></div>
                 {/* Queue Number Section */}
                 {lastSale.queueNumber && (
                    <div className="text-center mt-2 mb-2">
                        <div style={{fontSize: '10px'}}>QUEUE NO</div>
                        <div style={{fontSize: '32px', fontWeight: 'bold'}}>{lastSale.queueNumber}</div>
                    </div>
                 )}
                 <div className="receipt-footer">{state.settings.receiptFooter}</div>
             </div>

             {/* Hidden Print Area: Drug Labels (Stickers) */}
             <div id="printable-stickers" className="hidden">
                 {lastSale.items.map((item, idx) => {
                     // If item requires instruction (medicine), print a sticker. Skip if it's general merchandise without instruction.
                     // For demo, we print for everything that has an instruction.
                     if(!item.instruction) return null;
                     return (
                         <div key={idx} className="sticker-item">
                             <div className="sticker-header">
                                 {state.settings.storeName} | {state.settings.phone}
                             </div>
                             <div className="sticker-drug-name">
                                 {item.name}
                             </div>
                             <div className="sticker-instruction">
                                 วิธีใช้: {item.instruction}
                             </div>
                             <div className="sticker-footer">
                                 Date: {lastSale.date.split(' ')[0]} | Qty: {item.quantity} | {selectedCustomer?.name || 'Customer'}
                             </div>
                         </div>
                     );
                 })}
             </div>

             {/* Hidden Print Area: A4 Full Tax Invoice */}
             <div id="printable-a4-invoice" className="hidden">
                 <div className="flex justify-between items-start mb-8">
                     <div>
                         <h1 className="text-2xl font-bold">{state.settings.storeName}</h1>
                         <p className="text-sm">{state.settings.address}</p>
                         <p className="text-sm">Tax ID: {state.settings.taxId} (Head Office)</p>
                         <p className="text-sm">Tel: {state.settings.phone}</p>
                     </div>
                     <div className="text-right">
                         <h2 className="text-xl font-bold uppercase tracking-wider mb-2">Full Tax Invoice</h2>
                         <h2 className="text-sm font-bold uppercase tracking-wider mb-2">(ใบกำกับภาษีเต็มรูป)</h2>
                         <p className="font-bold">No: {lastSale.id}</p>
                         <p>Date: {lastSale.date}</p>
                     </div>
                 </div>

                 <div className="border p-4 mb-6 rounded">
                     <h3 className="font-bold border-b pb-2 mb-2">Customer (ผู้ซื้อสินค้า)</h3>
                     <p><span className="font-bold">Name:</span> {lastSale.taxInvoiceDetails?.name || '-'}</p>
                     <p><span className="font-bold">Address:</span> {lastSale.taxInvoiceDetails?.address || '-'}</p>
                     <p><span className="font-bold">Tax ID:</span> {lastSale.taxInvoiceDetails?.taxId || '-'}</p>
                 </div>

                 <table className="w-full text-left border-collapse mb-6">
                     <thead>
                         <tr className="bg-gray-100 border-y border-black">
                             <th className="py-2 px-2">#</th>
                             <th className="py-2 px-2">Description</th>
                             <th className="py-2 px-2 text-right">Qty</th>
                             <th className="py-2 px-2 text-right">Unit Price</th>
                             <th className="py-2 px-2 text-right">Amount</th>
                         </tr>
                     </thead>
                     <tbody>
                         {lastSale.items.map((item, idx) => (
                             <tr key={idx} className="border-b border-gray-200">
                                 <td className="py-2 px-2">{idx+1}</td>
                                 <td className="py-2 px-2">{item.name} ({item.genericName})</td>
                                 <td className="py-2 px-2 text-right">{item.quantity}</td>
                                 <td className="py-2 px-2 text-right">{item.price.toFixed(2)}</td>
                                 <td className="py-2 px-2 text-right">{(item.price * item.quantity).toFixed(2)}</td>
                             </tr>
                         ))}
                     </tbody>
                     <tfoot>
                         <tr>
                             <td colSpan={3}></td>
                             <td className="py-2 px-2 text-right font-bold">Total</td>
                             <td className="py-2 px-2 text-right font-bold">{lastSale.total.toFixed(2)}</td>
                         </tr>
                         <tr>
                             <td colSpan={3}></td>
                             <td className="py-2 px-2 text-right">Discount</td>
                             <td className="py-2 px-2 text-right">-{lastSale.discount.toFixed(2)}</td>
                         </tr>
                         <tr className="bg-gray-100 border-t border-black">
                             <td colSpan={3} className="py-2 px-2 font-bold">{/* Text Value could go here */}</td>
                             <td className="py-2 px-2 text-right font-bold">Net Total</td>
                             <td className="py-2 px-2 text-right font-bold">{lastSale.netTotal.toFixed(2)}</td>
                         </tr>
                     </tfoot>
                 </table>

                 <div className="flex justify-end mb-12">
                     <div className="w-1/2">
                         <div className="flex justify-between border-b py-1">
                             <span>Vatable Amount</span>
                             <span>{lastSale.subtotalVatable.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between border-b py-1">
                             <span>VAT 7%</span>
                             <span>{lastSale.vatAmount.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between border-b py-1">
                             <span>Exempt Amount</span>
                             <span>{lastSale.subtotalExempt.toFixed(2)}</span>
                         </div>
                         <div className="flex justify-between py-1 font-bold">
                             <span>Grand Total</span>
                             <span>{lastSale.netTotal.toFixed(2)}</span>
                         </div>
                     </div>
                 </div>

                 <div className="flex justify-between mt-12 text-center">
                     <div>
                         <div className="border-b border-black w-40 mb-2"></div>
                         <p className="text-sm">Received By</p>
                     </div>
                     <div>
                         <div className="border-b border-black w-40 mb-2"></div>
                         <p className="text-sm">Authorized Signature</p>
                     </div>
                 </div>
             </div>
        </div>
      )}

      {/* Catalog Area */}
      <div className="lg:w-2/3 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col overflow-hidden no-print">
        {/* Search Header */}
        <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10 space-y-4">
            <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     Shift: <span className="font-bold text-slate-700">{activeShift.staffName}</span>
                 </div>
                 <div className="flex gap-2">
                     <button onClick={() => setShowHeldBillsModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 relative">
                         <PauseCircle className="w-4 h-4 text-orange-500"/> 
                         Bills ({state.heldBills.length})
                     </button>
                     <button onClick={() => setShowCashOpsModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                         <Coins className="w-4 h-4"/> Drawer
                     </button>
                     <button onClick={() => setShowHistoryModal(true)} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                         <History className="w-4 h-4" /> Transactions
                     </button>
                     <button 
                        onClick={() => { setCloseShiftActual(0); setShowCloseShiftModal(true); }}
                        className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                     >
                        End Shift
                     </button>
                 </div>
            </div>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                    ref={searchInputRef}
                    type="text" 
                    placeholder="Scan Barcode or Search Product (F2)..." 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
            {/* Horizontal Scrollable Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map(cat => (
                    <button 
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                            activeCategory === cat 
                            ? 'bg-blue-600 text-white shadow-md border-blue-600' 
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
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
                const inCartQty = cart.find(c => c.id === product.id)?.quantity || 0;
                const isOutOfStock = product.stock <= inCartQty;
                return (
                    <div 
                        key={product.id} 
                        onClick={() => !isOutOfStock && addToCart(product)}
                        className={`bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col group overflow-hidden ${isOutOfStock ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}
                    >
                        <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative p-6">
                            {product.image ? (
                                <img src={product.image} alt={product.name} className="object-contain w-full h-full mix-blend-multiply" />
                            ) : (
                                <Pill className="w-12 h-12 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            )}
                            {isOutOfStock && (
                                <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow">OUT OF STOCK</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">{product.name}</h3>
                            {product.subCategory && (
                                <span className="text-[10px] text-slate-500 mt-1 block truncate">{product.subCategory}</span>
                            )}
                            <div className="mt-auto flex justify-between items-end pt-2">
                                <span className="font-bold text-lg text-blue-700">฿{product.price.toLocaleString()}</span>
                                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-blue-600"><Plus className="w-3 h-3"/></div>
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
                onClick={handleHoldBill}
                disabled={cart.length === 0}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:bg-white hover:shadow-sm px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
                <PauseCircle className="w-3.5 h-3.5" /> Hold Bill (F9)
            </button>
        </div>

        <div className="p-5 border-b border-slate-100 bg-white">
            <div className="relative mb-3">
                <select 
                    className="w-full p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                >
                    <option value="">General Customer (Walk-in)</option>
                    {state.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <User className="absolute left-3 top-3 text-slate-400 w-5 h-5 pointer-events-none" />
            </div>
            
            <div className="relative">
                 <input 
                    type="text" 
                    placeholder="Doctor Name (Optional)" 
                    className="w-full pl-10 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
                    value={doctorName}
                    onChange={(e) => setDoctorName(e.target.value)}
                />
                <Briefcase className="absolute left-3 top-2.5 text-slate-400 w-4 h-4 pointer-events-none" />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <ShoppingBag size={48} className="mb-4 opacity-20" />
                    <p className="font-medium text-sm">Cart is empty</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.id} className="flex flex-col p-2 hover:bg-slate-50 rounded-xl transition-colors group relative">
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex-1 pr-4">
                                <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{item.name}</h4>
                                <div className="text-xs text-slate-500 mt-1">฿{item.price} x {item.quantity}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900 w-16 text-right">฿{(item.price * item.quantity).toLocaleString()}</span>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded-l-lg text-slate-500"><Minus className="w-3 h-3" /></button>
                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded-r-lg text-slate-500"><Plus className="w-3 h-3" /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        {/* Instruction Link */}
                        <div className="flex items-center gap-2 mt-1">
                            <button onClick={() => openInstructionEditor(item)} className="text-[10px] text-blue-600 flex items-center gap-1 hover:underline bg-blue-50 px-2 py-0.5 rounded">
                                <Edit3 className="w-3 h-3"/> {item.instruction ? item.instruction : 'Add Instruction'}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-200">
            <div className="space-y-1 mb-6">
                 <div className="flex justify-between items-end">
                    <span className="text-slate-500 text-sm font-medium">Subtotal</span>
                    <span className="font-bold text-slate-800">฿{cartTotal.toLocaleString()}</span>
                 </div>
                 {discount > 0 && (
                     <div className="flex justify-between items-end text-green-600">
                        <span className="text-xs font-bold">Discount</span>
                        <span className="font-bold">-฿{discount.toLocaleString()}</span>
                     </div>
                 )}
                 <div className="flex justify-between items-end pt-2 border-t border-slate-200">
                    <span className="text-slate-900 text-lg font-bold">Net Total</span>
                    <span className="text-3xl font-bold text-blue-600 tracking-tight">฿{netTotal.toLocaleString()}</span>
                 </div>
            </div>
            
            <button 
                onClick={() => initiatePayment('CASH')}
                disabled={cart.length === 0}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
            >
                <Banknote className="w-6 h-6"/> PAY CASH (F4)
            </button>
        </div>
      </div>
    </div>
  );
};

export default POS;
