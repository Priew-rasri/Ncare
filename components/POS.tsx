import React, { useState, useMemo } from 'react';
import { GlobalState, Product, CartItem, SaleRecord } from '../types';
import { Search, Plus, Minus, Trash2, CreditCard, QrCode, Banknote, User } from 'lucide-react';

interface POSProps {
  state: GlobalState;
  dispatch: React.Dispatch<any>; // Simplified dispatch type
}

const POS: React.FC<POSProps> = ({ state, dispatch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');

  const filteredProducts = useMemo(() => {
    return state.inventory.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.genericName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [state.inventory, searchTerm]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
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

    const sale: SaleRecord = {
      id: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      items: cart,
      total: cartTotal,
      paymentMethod: method,
      customerId: selectedCustomer || undefined
    };

    dispatch({ type: 'ADD_SALE', payload: sale });
    
    // Decrease stock
    cart.forEach(item => {
      dispatch({ type: 'UPDATE_STOCK', payload: { productId: item.id, quantity: -item.quantity } });
    });

    // Update customer points
    if (selectedCustomer) {
        dispatch({ 
            type: 'UPDATE_CUSTOMER_POINTS', 
            payload: { customerId: selectedCustomer, points: Math.floor(cartTotal / 20), spent: cartTotal } 
        });
    }

    setCart([]);
    setSelectedCustomer('');
    alert('บันทึกการขายเรียบร้อย!');
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-2rem)] gap-4 animate-fade-in">
      {/* Product List Area */}
      <div className="lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า (ชื่อ, ชื่อสามัญ)..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 bg-slate-50/50">
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              onClick={() => product.stock > 0 && addToCart(product)}
              className={`bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div>
                <div className="h-24 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-slate-400">
                  {/* Placeholder for Product Image */}
                   <PackageIcon />
                </div>
                <h3 className="font-semibold text-slate-800 line-clamp-1 group-hover:text-teal-600">{product.name}</h3>
                <p className="text-xs text-slate-500 mb-2">{product.genericName}</p>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-teal-600">฿{product.price}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {product.stock > 0 ? `${product.stock} ${product.unit}` : 'หมด'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart & Checkout Area */}
      <div className="lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCartIcon /> รายการขาย
            </h2>
            <div className="mt-4">
                <select 
                    className="w-full p-2 border border-slate-200 rounded-lg text-sm"
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                >
                    <option value="">ลูกค้าทั่วไป (General)</option>
                    {state.customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.points} pts)</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <ShoppingCartIcon size={48} className="mb-2 opacity-20" />
                <p>ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex-1">
                  <h4 className="font-medium text-slate-800 text-sm">{item.name}</h4>
                  <p className="text-xs text-slate-500">฿{item.price} / {item.unit}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-white rounded-lg border border-slate-200">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-slate-100 rounded-l-lg"><Minus className="w-4 h-4 text-slate-600" /></button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-slate-100 rounded-r-lg"><Plus className="w-4 h-4 text-slate-600" /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-slate-600">ยอดรวม</span>
            <span className="text-2xl font-bold text-slate-900">฿{cartTotal.toLocaleString()}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button 
                onClick={() => handleCheckout('CASH')}
                disabled={cart.length === 0}
                className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg hover:border-teal-500 hover:text-teal-600 transition-all disabled:opacity-50"
            >
                <Banknote className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">เงินสด</span>
            </button>
            <button 
                onClick={() => handleCheckout('QR')}
                disabled={cart.length === 0}
                className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-all disabled:opacity-50"
            >
                <QrCode className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">QR Pay</span>
            </button>
            <button 
                onClick={() => handleCheckout('CREDIT')}
                disabled={cart.length === 0}
                className="flex flex-col items-center justify-center p-3 bg-white border border-slate-200 rounded-lg hover:border-purple-500 hover:text-purple-600 transition-all disabled:opacity-50"
            >
                <CreditCard className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">บัตรเครดิต</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Icons
const PackageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
);

const ShoppingCartIcon = ({size, className}: {size?: number, className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`lucide lucide-shopping-cart ${className || ''}`}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);

export default POS;