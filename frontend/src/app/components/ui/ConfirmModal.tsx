import { X, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from './button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm Protocol",
  cancelText = "Abort",
  type = 'info'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden relative border border-pink-100 animate-in zoom-in-95 duration-300">
        
        {/* Header with Icon */}
        <div className={`p-8 text-center flex flex-col items-center`}>
          <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-lg ${
            type === 'danger' ? 'bg-pink-50 text-pink-500 shadow-pink-50' : 'bg-sky-50 text-sky-500 shadow-sky-50'
          }`}>
            {type === 'danger' ? <AlertCircle size={40} /> : <HelpCircle size={40} />}
          </div>
          
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter mb-3">{title}</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">{message}</p>
        </div>

        {/* Action Buttons */}
        <div className="p-8 pt-0 flex flex-col gap-3">
          <Button
            onClick={() => { onConfirm(); onClose(); }}
            className={`w-full py-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg ${
              type === 'danger' 
                ? 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-100' 
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-100'
            }`}
          >
            {confirmText}
          </Button>
          <button
            onClick={onClose}
            className="w-full py-4 text-slate-400 hover:text-slate-600 font-black uppercase tracking-widest text-[9px] transition-all"
          >
            {cancelText}
          </button>
        </div>

        {/* Security Footer */}
        <div className="bg-slate-50/50 p-4 border-t border-pink-50 text-center">
          <p className="text-[8px] text-slate-300 font-black uppercase tracking-widest">
            Authorization Required
          </p>
        </div>
      </div>
    </div>
  );
}
