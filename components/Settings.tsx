
import React, { useState, useEffect } from 'react';
import { GlobalState, Settings as SettingsType } from '../types';
import { Save, Store, Receipt, Printer, Info, CheckCircle, Shield, FileText } from 'lucide-react';

interface SettingsProps {
    data: GlobalState;
    dispatch: React.Dispatch<any>;
}

const Settings: React.FC<SettingsProps> = ({ data, dispatch }) => {
    const [form, setForm] = useState<SettingsType>(data.settings);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState<'GENERAL' | 'AUDIT'>('GENERAL');

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

    const renderGeneral = () => (
        <div className="space-y-6 animate-fade-in">
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
    );

    const renderAudit = () => (
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden animate-fade-in">
             <div className="p-6 border-b border-slate-100 bg-white">
                 <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                     <Shield className="w-5 h-5 text-slate-500"/> System Security Audit Log
                 </h3>
                 <p className="text-xs text-slate-500 mt-1">Track all sensitive actions within the system.</p>
             </div>
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500">
                    <tr>
                         <th className="px-6 py-5 font-bold tracking-wider">Timestamp</th>
                         <th className="px-6 py-5 font-bold tracking-wider">Actor</th>
                         <th className="px-6 py-5 font-bold tracking-wider">Action</th>
                         <th className="px-6 py-5 font-bold tracking-wider">Details</th>
                         <th className="px-6 py-5 font-bold tracking-wider text-center">Severity</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.systemLogs.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-10 text-slate-400">No logs available</td></tr>
                    ) : (
                        data.systemLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.timestamp}</td>
                                <td className="px-6 py-4 font-bold text-slate-800">{log.actor}</td>
                                <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{log.action}</td>
                                <td className="px-6 py-4 text-slate-600">{log.details}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
                                        log.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' :
                                        log.severity === 'WARNING' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                        'bg-blue-50 text-blue-700 border-blue-100'
                                    }`}>
                                        {log.severity}
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
             </table>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">System Configuration</h2>
                    <p className="text-slate-500 text-sm mt-1">Manage store details, tax settings, and hardware preferences.</p>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setActiveTab('GENERAL')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'GENERAL' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        General Settings
                    </button>
                    <button 
                        onClick={() => setActiveTab('AUDIT')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'AUDIT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                    >
                        Security Audit
                    </button>
                    <button 
                        onClick={handleSave}
                        className={`ml-4 flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${saved ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {saved ? 'Saved' : 'Save'}
                    </button>
                </div>
            </div>

            {activeTab === 'GENERAL' ? renderGeneral() : renderAudit()}
        </div>
    );
};

export default Settings;
