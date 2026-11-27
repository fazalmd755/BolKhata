import React from 'react';
import { RotateCcw, X } from 'lucide-react';

export default function UndoToast({ undoAction, onUndo, onDismiss }) {
  if (!undoAction) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 max-w-sm">
        <p className="text-xs font-medium text-slate-200 truncate">
          {undoAction.message || 'कार्रवाई पूरी हुई (Action recorded)'}
        </p>
        <button
          onClick={onUndo}
          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>पूर्ववत करें (Undo)</span>
        </button>
        <button
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-white transition"
          aria-label="Dismiss toast"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
