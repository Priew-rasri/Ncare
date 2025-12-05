import React from 'react';
import { GlobalState } from '../types';
import { User, Phone, Star, Clock } from 'lucide-react';

interface CRMProps {
    data: GlobalState;
}

const CRM: React.FC<CRMProps> = ({ data }) => {
    return (
        <div className="space-y-6 animate-fade-in">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">ข้อมูลลูกค้า (CRM)</h2>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 shadow-lg shadow-teal-500/20">
                    + เพิ่มลูกค้าสมาชิก
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.customers.map((customer) => (
                    <div key={customer.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <User size={64} />
                        </div>
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-lg">
                                {customer.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{customer.name}</h3>
                                <div className="flex items-center text-slate-500 text-sm">
                                    <Phone className="w-3 h-3 mr-1" /> {customer.phone}
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-1"><Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> คะแนนสะสม</span>
                                <span className="font-bold text-slate-800">{customer.points} แต้ม</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500">ยอดซื้อรวม</span>
                                <span className="font-bold text-slate-800">฿{customer.totalSpent.toLocaleString()}</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-1"><Clock className="w-4 h-4" /> มาล่าสุด</span>
                                <span className="text-slate-800">{customer.lastVisit}</span>
                             </div>
                        </div>

                        <button className="w-full mt-6 py-2 bg-slate-50 text-teal-600 font-medium text-sm rounded-lg hover:bg-teal-50 border border-slate-200 hover:border-teal-200 transition-colors">
                            ดูประวัติการซื้อ
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CRM;