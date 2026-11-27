import React, { createContext, useContext, useRef } from 'react';
import { KhataDataProvider, useKhataData } from './KhataDataContext';
import { KhataUiProvider, useKhataUi } from './KhataUiContext';

export { useKhataData } from './KhataDataContext';
export { useKhataUi } from './KhataUiContext';

const KhataContext = createContext(null);

function UndoBridge({ children, undoBridgeRef }) {
  const { registerUndo } = useKhataUi();
  undoBridgeRef.current = registerUndo;
  return children;
}

function KhataInnerProvider({ children }) {
  const data = useKhataData();
  const ui = useKhataUi();

  // Combine into single facade value for backward-compatible useKhata()
  const combined = {
    ...data,
    ...ui
  };

  return (
    <KhataContext.Provider value={combined}>
      {children}
    </KhataContext.Provider>
  );
}

export function KhataProvider({ children }) {
  const undoBridgeRef = useRef(null);

  const handleRegisterUndo = (action) => {
    if (undoBridgeRef.current) {
      undoBridgeRef.current(action);
    }
  };

  return (
    <KhataDataProvider onRegisterUndo={handleRegisterUndo}>
      <KhataUiProvider>
        <UndoBridge undoBridgeRef={undoBridgeRef}>
          <KhataInnerProvider>
            {children}
          </KhataInnerProvider>
        </UndoBridge>
      </KhataUiProvider>
    </KhataDataProvider>
  );
}

export function useKhata() {
  const context = useContext(KhataContext);
  if (!context) {
    throw new Error('useKhata must be used within a KhataProvider');
  }
  return context;
}
