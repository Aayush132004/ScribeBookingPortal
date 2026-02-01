// src/context/ToastContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Video, CheckCircle, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', action = null, customId = null) => {
    const id = customId || Date.now();
    
    // Remove existing toast with same ID (prevents duplicates)
    setToasts((prev) => prev.filter((t) => t.id !== id));
    
    // Add new toast
    setToasts((prev) => [...prev, { id, message, type, action }]);
    
    // Auto remove after duration based on type
    const duration = type === 'call' ? 30000 : 5000; // 30s for calls, 5s for others
    
    if (!action || type !== 'call') {
      setTimeout(() => removeToast(id), duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div 
        className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
        role="region" 
        aria-live="polite" 
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className={`
              pointer-events-auto p-4 rounded-xl shadow-2xl border-2 flex items-start gap-3 transition-all animate-in slide-in-from-right
              ${toast.type === 'call' ? 'bg-slate-900 border-primary text-white' : 'bg-white border-slate-200 text-slate-900'}
            `}
            role="alert"
          >
            <div className="mt-1">
              {toast.type === 'call' && <Video className="text-primary animate-pulse" size={24} />}
              {toast.type === 'success' && <CheckCircle className="text-green-500" size={24} />}
              {toast.type === 'error' && <AlertCircle className="text-red-500" size={24} />}
            </div>
            
            <div className="flex-1">
              <p className="font-bold text-sm">{toast.type === 'call' ? 'Incoming Video Call' : 'Notification'}</p>
              <p className="text-sm opacity-90 mt-1">{toast.message}</p>
              
              {toast.action && (
                <div className="mt-3 flex gap-2">
                  <button 
                    onClick={() => { 
                      toast.action.onClick(); 
                      removeToast(toast.id); 
                    }}
                    className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-primary-dark focus:ring-2 focus:ring-white transition-all"
                  >
                    {toast.action.label}
                  </button>
                  
                  {/* ✅ Dismiss button with optional onDismiss handler */}
                  <button 
                    onClick={() => {
                      // Call onDismiss if provided (for sending "Call Declined" message)
                      if (toast.action.onDismiss) {
                        toast.action.onDismiss();
                      }
                      removeToast(toast.id);
                    }}
                    className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-white/20 transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                // Also call onDismiss when clicking X
                if (toast.action?.onDismiss) {
                  toast.action.onDismiss();
                }
                removeToast(toast.id);
              }} 
              aria-label="Close notification"
              className="hover:opacity-100 transition-opacity"
            >
              <X size={18} className="opacity-50 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};