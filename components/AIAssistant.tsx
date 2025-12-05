
import React, { useState, useEffect, useRef } from 'react';
import { GlobalState } from '../types';
import { analyzeBusinessData } from '../services/geminiService';
import { Bot, Send, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  data: GlobalState;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ data }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'สวัสดีครับ ผมคือ **Ncare Genius** ผู้ช่วยอัจฉริยะประจำร้านยาของคุณ มีอะไรให้ผมช่วยวิเคราะห์ข้อมูลวันนี้ไหมครับ? (เช่น วิเคราะห์ยอดขาย, แนะนำสินค้าขายดี)' }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const response = await analyzeBusinessData(userMessage, data);

    setMessages(prev => [...prev, { role: 'ai', content: response }]);
    setLoading(false);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 animate-fade-in overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center gap-3">
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
           <Bot className="w-6 h-6" />
        </div>
        <div>
           <h2 className="font-bold text-lg">Ncare Genius AI</h2>
           <p className="text-xs text-teal-100 flex items-center gap-1"><Sparkles className="w-3 h-3"/> Powered by Gemini 2.5</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-teal-600 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
              }`}
            >
               {msg.role === 'ai' ? (
                   <div className="prose prose-sm prose-slate max-w-none">
                       <ReactMarkdown>{msg.content}</ReactMarkdown>
                   </div>
               ) : (
                   <p className="text-sm">{msg.content}</p>
               )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span className="text-xs text-slate-500">กำลังวิเคราะห์ข้อมูล...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-100">
        <div className="flex gap-2">
          <input 
            type="text" 
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
            placeholder="ถามเกี่ยวกับสต็อก, ยอดขาย หรือคำแนะนำ..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl disabled:opacity-50 transition-colors shadow-lg shadow-teal-500/20"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
