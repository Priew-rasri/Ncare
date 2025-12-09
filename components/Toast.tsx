
import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // Auto dismiss after 4 seconds
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
      switch (toast.type) {
        case 'SUCCESS': return 'border-l-4 border-green-500 bg-white';
        case 'ERROR': return 'border-l-4 border-red-500 bg-white';
        case 'WARNING': return 'border-l-4 border-orange-500 bg-white';
        default: return 'border-l-4 border-blue-500 bg-white';
      }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl border border-slate-100 min-w-[300px] animate-fade-in ${getStyles()}`}>
      <div className="shrink-0">
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-slate-800">{toast.type}</p>
        <p className="text-xs text-slate-600 font-medium">{toast.message}</p>
      </div>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
