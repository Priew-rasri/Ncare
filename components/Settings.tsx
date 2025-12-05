
import React, { useState, useEffect } from 'react';
import { GlobalState, Settings as SettingsType } from '../types';
import { Save, Store, Receipt, Printer, Info, CheckCircle } from 'lucide-react';

interface SettingsProps {
    data: GlobalState;
    dispatch: React.Dispatch<any>;
}

const Settings: React.FC<SettingsProps> = ({ data, dispatch }) => {
    const [form, setForm] = useState<SettingsType>(data.settings);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setForm(data.settings);
    }, [data.settings]);

    const handleSave = () => {
        dispatch({ type: 'UPDATE_SETTINGS', payload: form });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleChange = (field: keyof SettingsType, value: any) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-10">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Configuration</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage store details, tax settings, and hardware preferences.</p>
                </div>
                <button 
                    onClick={handleSave}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg ${saved ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {saved ? 'Saved Successfully' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-6">
                {/* Store Information */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                        <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                            <Store className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Store Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Store Name</label>
                            <input 
                                type="text" 
                                value={form.storeName}
                                onChange={(e) => handleChange('storeName', e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tax ID</label>
                            <input 
                                type="text" 
                                value={form.taxId}
                                onChange={(e) => handleChange('taxId', e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Address</label>
                            <input 
                                type="text" 
                                value={form.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label>
                            <input 
                                type="text" 
                                value={form.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                    </div>
                </div>

                {/* Financial & Tax */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-8">
                    <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                         <div className="bg-orange-50 p-2.5 rounded-lg text-orange-600">
                            <Receipt className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Financial & Receipt</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">VAT Rate (%)</label>
                            <input 
                                type="number" 
                                value={form.vatRate}
                                onChange={(e) => handleChange('vatRate', Number(e.target.value))}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Receipt Footer Message</label>
                            <input 
                                type="text" 
                                value={form.receiptFooter}
                                onChange={(e) => handleChange('receiptFooter', e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                        </div>
                    </div>
                </div>

                 {/* Hardware */}
                <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-8">
                     <div className="flex items-center gap-3 mb-6 border-b border-slate-50 pb-4">
                         <div className="bg-purple-50 p-2.5 rounded-lg text-purple-600">
                            <Printer className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Hardware Connection</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Printer IP Address</label>
                            <input 
                                type="text" 
                                value={form.printerIp}
                                onChange={(e) => handleChange('printerIp', e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1"><Info className="w-3 h-3"/> For network thermal printers (Epson, Star Micronics)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
