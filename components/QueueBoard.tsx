
import React, { useEffect, useState, useMemo } from 'react';
import { GlobalState } from '../types';
import { MonitorPlay, Clock, LogOut, ArrowRight, HeartPulse } from 'lucide-react';

interface QueueBoardProps {
  data: GlobalState;
  onClose: () => void;
}

const QueueBoard: React.FC<QueueBoardProps> = ({ data, onClose }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Get Today's Sales for Queue
  const queueData = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    // Filter sales from today that are completed
    const salesToday = data.sales.filter(s => 
        new Date(s.date).toLocaleDateString('en-CA') === today && 
        s.status === 'COMPLETED'
    );
    
    // In a real system, you might have a 'QUEUE_STATUS' (WAITING, CALLING, COMPLETED).
    // For this simulation, we'll take the most recent 1 as "CALLING" and previous 3 as "WAITING/READY"
    // Sorted by Time Newest First
    const sorted = [...salesToday].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
        current: sorted[0],
        next: sorted.slice(1, 5)
    };
  }, [data.sales]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 text-white flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="h-24 bg-gradient-to-r from-blue-700 to-blue-900 flex justify-between items-center px-8 shadow-2xl border-b border-blue-600/30">
        <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl">
                 <HeartPulse className="w-10 h-10 text-blue-600" />
            </div>
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Ncare Pharmacy</h1>
                <p className="text-blue-200 text-sm">We Care for Your Life</p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-right">
                <div className="text-3xl font-bold font-mono">{currentTime.toLocaleTimeString('th-TH', { hour: '2-digit', minute:'2-digit' })}</div>
                <div className="text-blue-300 text-sm">{currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
            <button onClick={onClose} className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition-all">
                <LogOut className="w-6 h-6 text-slate-300" />
            </button>
        </div>
      </div>

      <div className="flex-1 flex p-8 gap-8">
          {/* Main Display (Calling) */}
          <div className="w-2/3 flex flex-col gap-6">
              <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl border-4 border-blue-400/30 shadow-[0_0_50px_rgba(37,99,235,0.3)] flex flex-col items-center justify-center relative overflow-hidden group">
                  {/* Background Pulse Animation */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.2)_0%,_transparent_70%)] opacity-50 animate-pulse"></div>
                  
                  <div className="relative z-10 text-center">
                      <div className="text-blue-200 text-3xl font-bold uppercase tracking-[0.2em] mb-4 animate-bounce">Calling Queue</div>
                      <div className="text-[12rem] font-bold leading-none font-mono text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                          {queueData.current ? queueData.current.queueNumber : '---'}
                      </div>
                      <div className="mt-8 bg-black/20 backdrop-blur-sm px-8 py-3 rounded-full text-2xl text-white font-medium border border-white/10">
                          {queueData.current ? 'Please proceed to Counter 1' : 'Waiting for next customer...'}
                      </div>
                  </div>
              </div>
          </div>

          {/* Side List (Waiting/Next) */}
          <div className="w-1/3 flex flex-col gap-6">
               <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 flex-1 flex flex-col shadow-xl">
                   <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                       <Clock className="w-8 h-8 text-emerald-400" />
                       <h2 className="text-2xl font-bold text-slate-200">Recent / Waiting</h2>
                   </div>
                   
                   <div className="flex-1 space-y-4">
                       {queueData.next.map((sale, idx) => (
                           <div key={idx} className="bg-slate-700/50 p-6 rounded-2xl border border-slate-600 flex justify-between items-center">
                               <div className="text-slate-400 text-lg">Queue</div>
                               <div className="text-4xl font-bold text-white font-mono">{sale.queueNumber}</div>
                               <ArrowRight className="w-6 h-6 text-slate-500" />
                               <div className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-500/30">
                                   READY
                               </div>
                           </div>
                       ))}
                       {queueData.next.length === 0 && (
                           <div className="text-center text-slate-500 py-10 text-lg">No other queues</div>
                       )}
                   </div>

                   <div className="mt-auto bg-slate-900/50 p-4 rounded-2xl text-center text-slate-400 text-sm">
                       Please have your receipt ready.
                   </div>
               </div>
          </div>
      </div>
      
      {/* Ticker Footer */}
      <div className="h-12 bg-slate-950 flex items-center overflow-hidden whitespace-nowrap">
          <div className="animate-[marquee_20s_linear_infinite] text-slate-400 text-lg flex gap-10">
              <span>💊 Professional Pharmacy Service</span>
              <span>•</span>
              <span>👨‍⚕️ Consult with our Pharmacist for free</span>
              <span>•</span>
              <span>🏥 Ncare System - Your Health Partner</span>
              <span>•</span>
              <span>⚡ Fast & Secure Checkout</span>
          </div>
      </div>
      
      <style>{`
        @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default QueueBoard;
