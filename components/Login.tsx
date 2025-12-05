

import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { HeartPulse, LogIn, ShieldCheck } from 'lucide-react';

interface LoginProps {
    onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [selectedUser, setSelectedUser] = useState<string>('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulator delay
        setTimeout(() => {
            if (password === '1234') { // Mock password
                const user = MOCK_USERS.find(u => u.id === selectedUser);
                if (user) {
                    onLogin(user);
                } else {
                    setError('Please select a user');
                }
            } else {
                setError('Invalid password (Try "1234")');
            }
            setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-br from-blue-600 to-teal-600 p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_70%)]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="bg-white p-3 rounded-2xl shadow-lg mb-4 text-blue-600">
                            <HeartPulse className="w-8 h-8" />
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Ncare<span className="text-teal-200">.</span></h1>
                        <p className="text-blue-100 text-sm mt-1 font-medium">Professional Pharmacy ERP</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Account Role</label>
                        <div className="grid grid-cols-1 gap-3">
                            {MOCK_USERS.map(user => (
                                <div 
                                    key={user.id}
                                    onClick={() => setSelectedUser(user.id)}
                                    className={`p-3 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition-all ${selectedUser === user.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ${
                                        user.role === 'OWNER' ? 'bg-slate-800' : 
                                        user.role === 'PHARMACIST' ? 'bg-teal-500' : 'bg-blue-500'
                                    }`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                                        <div className="text-[10px] uppercase font-bold text-slate-400">{user.role}</div>
                                    </div>
                                    {selectedUser === user.id && <ShieldCheck className="ml-auto text-blue-600 w-5 h-5" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                         <input 
                            type="password" 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Enter PIN (Demo: 1234)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                         />
                         {error && <p className="text-red-500 text-xs font-bold mt-2 animate-pulse">{error}</p>}
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !selectedUser || !password}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? 'Authenticating...' : <><LogIn className="w-5 h-5" /> Login to Ncare</>}
                    </button>
                    
                    <p className="text-center text-[10px] text-slate-400">
                        Ncare System v3.0 (Enterprise)<br/>
                        Authorized Personnel Only
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Login;