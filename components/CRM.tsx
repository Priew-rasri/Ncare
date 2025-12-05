
import React, { useState } from 'react';
import { GlobalState, Customer } from '../types';
import { User, Phone, Star, Clock, Trophy, History, ShieldCheck, X } from 'lucide-react';

interface CRMProps {
    data: GlobalState;
}

const CRM: React.FC<CRMProps> = ({ data }) => {
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const getTier = (totalSpent: number) => {
        if (totalSpent > 100000) return 'PLATINUM';
        if (totalSpent > 20000) return 'GOLD';
        if (totalSpent > 5000) return 'SILVER';
        return 'MEMBER';
    };

    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'PLATINUM': return 'bg-gradient-to-br from-slate-800 to-black text-white border-slate-600';
            case 'GOLD': return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white border-yellow-300';
            case 'SILVER': return 'bg-gradient-to-br from-slate-300 to-slate-400 text-slate-800 border-slate-200';
            default: return 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-blue-400';
        }
    };

    const customerHistory = selectedCustomer 
        ? data.sales.filter(s => s.customerId === selectedCustomer.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : [];

    return (
        <div className="space-y-8 animate-fade-in pb-10 relative">
             {selectedCustomer && (
                 <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 fixed top-0 left-72 w-[calc(100vw-18rem)] h-screen">
                     <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-0 animate-fade-in border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
                         <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                             <div>
                                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                     <History className="w-6 h-6 text-blue-600" /> Medication History
                                 </h3>
                                 <p className="text-sm text-slate-500">{selectedCustomer.name}</p>
                             </div>
                             <button onClick={() => setSelectedCustomer(null)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm"><X className="w-5 h-5"/></button>
                         </div>
                         <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                             {customerHistory.length === 0 ? (
                                 <div className="text-center py-10 text-slate-400">No purchase history found.</div>
                             ) : (
                                 <div className="space-y-4">
                                     {customerHistory.map(sale => (
                                         <div key={sale.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                             <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-50">
                                                 <div className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                     {sale.date}
                                                     <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">{sale.id}</span>
                                                 </div>
                                                 <div className="font-bold text-blue-600">฿{sale.netTotal.toLocaleString()}</div>
                                             </div>
                                             <div className="space-y-2">
                                                 {sale.items.map((item, idx) => (
                                                     <div key={idx} className="flex justify-between text-sm">
                                                         <span className="text-slate-600">{item.name}</span>
                                                         <span className="text-slate-400 text-xs">x{item.quantity}</span>
                                                     </div>
                                                 ))}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>
             )}

             <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Customer Relationships</h2>
                    <p className="text-slate-500 mt-1">Manage membership tiers, points, and patient history.</p>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-200 transition-all shadow-blue-500/30">
                    + New Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {data.customers.map((customer) => {
                    const tier = getTier(customer.totalSpent);
                    return (
                        <div key={customer.id} className="relative group perspective-1000">
                             {/* Card Visual */}
                            <div className={`p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border transition-all duration-300 relative overflow-hidden h-full flex flex-col justify-between ${getTierColor(tier)}`}>
                                {/* Texture Overlay */}
                                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_top_right,_white,_transparent_70%)] pointer-events-none"></div>
                                
                                <div className="relative z-10 flex justify-between items-start">
                                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                                        <User size={24} className="text-white" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold opacity-70 uppercase tracking-widest">Membership Tier</div>
                                        <div className="text-xl font-bold tracking-tight">{tier}</div>
                                    </div>
                                </div>
                                
                                <div className="relative z-10 mt-8 mb-6">
                                    <h3 className="font-bold text-2xl tracking-tight mb-1">{customer.name}</h3>
                                    <div className="flex items-center text-white/80 text-sm font-mono tracking-wide opacity-80">
                                        <Phone className="w-3 h-3 mr-2" /> {customer.phone}
                                    </div>
                                </div>
                                
                                <div className="relative z-10 pt-4 border-t border-white/20 flex justify-between items-end">
                                    <div>
                                        <div className="text-[10px] uppercase font-bold opacity-60">Points Balance</div>
                                        <div className="text-2xl font-bold">{customer.points.toLocaleString()}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] uppercase font-bold opacity-60">Total Spent</div>
                                        <div className="font-bold">฿{customer.totalSpent.toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Allergy Warning Badge */}
                                {customer.allergies && customer.allergies.length > 0 && (
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> ALLERGY
                                    </div>
                                )}
                            </div>

                            {/* Hover Action Overlay */}
                            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 z-20">
                                <button 
                                    onClick={() => setSelectedCustomer(customer)}
                                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <History className="w-4 h-4"/> History
                                </button>
                                <button className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CRM;
