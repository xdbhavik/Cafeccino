import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Sparkles, CheckCircle2, X } from 'lucide-react';
import { useTables } from '../context/TablesContext';
import { useCart } from '../context/CartContext';
import { CategoryTabs } from '../components/order/CategoryTabs';
import { ProductGrid } from '../components/order/ProductGrid';
import { CartPanel } from '../components/order/CartPanel';
import { PaymentPanel } from '../components/order/PaymentPanel';
import { FloorModal } from '../components/floor/FloorModal';

export const OrderViewPage = () => {
  const { activeTableId } = useTables();
  const { items, searchQuery, setSearchQuery } = useCart();

  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);

  // Mobile drawer states
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState('cart'); // 'cart' | 'payment'

  // Toast system states
  const [toasts, setToasts] = useState([]);

  // Auto-open table selection modal ONLY on initial mount if no table is selected.
  // We do NOT want to re-trigger when activeTableId becomes null during the lifecycle
  // (e.g. after a payment completes), because that would cover the receipt.
  const hasMounted = React.useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      if (activeTableId === null) {
        setIsFloorModalOpen(true);
      }
    }
  }, [activeTableId]);

  const triggerToast = (title, desc, iconType = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, desc, iconType }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleNewOrder = () => {
    setIsFloorModalOpen(true);
  };

  // Pulse effect on first item add (FAB)
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-1 h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0F0F0F] relative text-[#F0EDE8]"
    >
      {/* 3-Panel POS Desktop Layout */}
      <div className="flex flex-1 h-full overflow-hidden w-full">
        {/* Panel 1: Product View (Sidebar Categories + Grid) */}
        <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden min-w-0">
          <CategoryTabs
            activeCategoryId={activeCategoryId}
            onCategoryChange={setActiveCategoryId}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <ProductGrid
            activeCategoryId={activeCategoryId}
            searchQuery={searchQuery}
            onTriggerToast={triggerToast}
          />
        </div>

        {/* Panel 2: Cart Sidebar (Desktop >= 1280px) */}
        <div className="hidden xl:block w-[400px] h-full border-l border-[#2E2E2E] flex-shrink-0">
          <CartPanel onTriggerToast={triggerToast} />
        </div>

        {/* Panel 3: Payment Sidebar (Desktop >= 1280px) */}
        <div className="hidden xl:block w-[360px] h-full border-l border-[#2E2E2E] flex-shrink-0">
          <PaymentPanel onTriggerToast={triggerToast} onNewOrder={handleNewOrder} />
        </div>
      </div>

      {/* Floating Action Button (Tablet/Mobile < 1280px) */}
      <div className="xl:hidden fixed bottom-6 right-6 z-40 no-print">
        <motion.button
          onClick={() => setIsMobilePanelOpen(true)}
          animate={items.length === 1 ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.25 }}
          className="h-14 w-14 rounded-full bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] flex items-center justify-center shadow-accent relative outline-none focus:ring-2 focus:ring-[#F5A623]/40"
        >
          <ShoppingCart size={22} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-6 min-w-6 bg-[#E05C5C] border-2 border-[#1A1A1A] text-white text-[10px] font-bold font-mono rounded-full flex items-center justify-center px-1.5">
              {cartItemCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Slide-in Drawer Sheet (Tablet/Mobile < 1280px) */}
      <AnimatePresence>
        {isMobilePanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobilePanelOpen(false)}
              className="fixed inset-0 bg-black z-40 xl:hidden no-print"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.28 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-[#1A1A1A] border-l border-[#2E2E2E] z-50 xl:hidden flex flex-col shadow-elevated no-print"
            >
              {/* Header Tab Switcher */}
              <div className="flex items-center justify-between border-b border-[#2E2E2E] p-3 bg-[#1A1A1A]">
                <div className="flex gap-1 bg-[#242424] border border-[#2E2E2E] p-1 rounded-xl w-[240px]">
                  <button
                    onClick={() => setActivePanelTab('cart')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-sora transition-all outline-none ${
                      activePanelTab === 'cart'
                        ? 'bg-[#F5A623] text-[#0F0F0F]'
                        : 'text-[#9A9590] hover:text-[#F0EDE8]'
                    }`}
                  >
                    Cart ({cartItemCount})
                  </button>
                  <button
                    onClick={() => setActivePanelTab('payment')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold font-sora transition-all outline-none ${
                      activePanelTab === 'payment'
                        ? 'bg-[#F5A623] text-[#0F0F0F]'
                        : 'text-[#9A9590] hover:text-[#F0EDE8]'
                    }`}
                  >
                    Payment
                  </button>
                </div>
                <button
                  onClick={() => setIsMobilePanelOpen(false)}
                  className="p-1.5 hover:bg-[#242424] rounded-lg text-[#9A9590] hover:text-[#F0EDE8] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden">
                {activePanelTab === 'cart' ? (
                  <CartPanel onTriggerToast={triggerToast} />
                ) : (
                  <PaymentPanel
                    onTriggerToast={triggerToast}
                    onNewOrder={() => {
                      setIsMobilePanelOpen(false);
                      setIsFloorModalOpen(true);
                    }}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Table Selection Modal Overlay */}
      <FloorModal open={isFloorModalOpen} onOpenChange={setIsFloorModalOpen} />

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-[90vw] pointer-events-none no-print">
        <AnimatePresence>
          {toasts.map((toast) => {
            const isSparkle = toast.iconType === 'sparkle';
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 24, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
                className="w-full bg-[#1A1A1A] border border-[#2E2E2E] rounded-xl p-4 shadow-elevated flex items-start gap-3 pointer-events-auto"
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                    isSparkle
                      ? 'bg-[#3D2B00] border-[#F5A623]/20 text-[#F5A623]'
                      : 'bg-[#4CAF7D]/10 border-[#4CAF7D]/20 text-[#4CAF7D]'
                  }`}
                >
                  {isSparkle ? <Sparkles size={16} /> : <CheckCircle2 size={16} />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold font-sora text-[#F0EDE8]">{toast.title}</h4>
                  <p className="text-xs text-[#9A9590] font-inter mt-0.5 leading-normal">{toast.desc}</p>
                </div>

                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-[#9A9590] hover:text-[#F0EDE8] self-start"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
export default OrderViewPage;
