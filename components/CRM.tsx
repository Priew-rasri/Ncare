import React from 'react';
import { GlobalState } from '../types';
import { User, Phone, Star, Clock, Trophy } from 'lucide-react';

interface CRMProps {
    data: GlobalState;
}

const CRM: React.FC<CRMProps> = ({ data }) => {
    return (
        <div className="space-y-8 animate-fade-in pb-10">
             <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Customer Relationships</h2>
                    <p className="text-slate-500 mt-1">จัดการข้อมูลสมาชิกและสิทธิพิเศษ (Loyalty Program)</p>
                </div>
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:shadow-lg hover:shadow-blue-200 transition-all">
                    + New Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.customers.map((customer) => (
                    <div key={customer.id} className="bg-white p-6 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_10px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                            <User size={120} />
                        </div>
                        
                        <div className="flex items-center space-x-5 mb-6 relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-2xl shadow-inner">
                                {customer.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-xl tracking-tight">{customer.name}</h3>
                                <div className="flex items-center text-slate-500 text-sm mt-1">
                                    <Phone className="w-3 h-3 mr-1.5" /> {customer.phone}
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Silver Member</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-4 border-t border-slate-50 relative">
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2 font-medium"><Trophy className="w-4 h-4 text-yellow-500" /> Reward Points</span>
                                <span className="font-bold text-slate-800 text-lg">{customer.points.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Lifetime Spend</span>
                                <span className="font-bold text-slate-800">฿{customer.totalSpent.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2 font-medium"><Clock className="w-4 h-4 text-slate-400" /> Last Visit</span>
                                <span className="text-slate-700">{customer.lastVisit}</span>
                             </div>
                        </div>

                        <button className="w-full mt-6 py-3 bg-slate-50 text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300">
                            View History
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CRM;