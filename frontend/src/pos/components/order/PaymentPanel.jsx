import React, { useState, useEffect } from 'react';
import { Receipt, Banknote, CreditCard, QrCode } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import { PAYMENT_METHODS } from '../../data/dummyData';
import { CashPaymentForm } from '../payment/CashPaymentForm';
import { CardPaymentForm } from '../payment/CardPaymentForm';
import { UpiPaymentForm } from '../payment/UpiPaymentForm';
import { ReceiptView } from '../payment/ReceiptView';
import { formatINR } from '../../lib/utils';

export const PaymentPanel = ({ onNewOrder, onTriggerToast }) => {
  const { items, total, completeOrder, orderId } = useCart();
  const { getOrderById } = useOrders();

  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSnapshot, setCompletedSnapshot] = useState(null);

  // We no longer reset completedSnapshot when orderId becomes null,
  // because orderId ALWAYS becomes null upon successful payment (resetCart).
  // The snapshot will be explicitly cleared when the user clicks 'New Order'.

  if (completedSnapshot) {
    const orderDetails = getOrderById(completedSnapshot.orderId) || completedSnapshot;
    return (
      <div className="w-full h-full bg-[#1A1A1A] border-l border-[#2E2E2E] p-5 flex flex-col justify-between">
        <ReceiptView
          completedOrder={{
            ...completedSnapshot,
            orderNumber: orderDetails?.orderNumber || 'ORD-0044',
          }}
          onNewOrderClick={() => {
            setCompletedSnapshot(null);
            setSelectedMethod('cash');
            if (onNewOrder) onNewOrder();
          }}
          onTriggerToast={onTriggerToast}
        />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1A1A] border-l border-[#2E2E2E] p-5 text-center opacity-60 select-none no-print">
        <Receipt size={40} className="text-[#2E2E2E] mb-3" />
        <h4 className="text-sm font-semibold text-[#9A9590] font-inter">Checkout Disabled</h4>
        <p className="text-xs text-[#9A9590] font-inter mt-0.5">Add items to enable payment</p>
      </div>
    );
  }

  const handleConfirmPayment = async (formData = {}) => {
    setIsSubmitting(true);
    // 700ms loading state for premium feel
    await new Promise((r) => setTimeout(r, 700));
    try {
      const paymentData = {
        paymentMethod: selectedMethod.toUpperCase(),
        receivedAmount: formData.receivedAmount ?? null,
        transactionRef: formData.transactionRef ?? null,
      };
      const snapshot = await completeOrder(paymentData);
      setIsSubmitting(false);
      if (snapshot) {
        setCompletedSnapshot(snapshot);
        if (onTriggerToast) {
          onTriggerToast('Order Paid', `Order finalized via ${selectedMethod.toUpperCase()}`, 'success');
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      if (onTriggerToast) {
        onTriggerToast('Payment Failed', err.message || 'Checkout failed', 'error');
      }
    }
  };

  const enabledMethods = PAYMENT_METHODS.filter((m) => m.enabled);

  const renderForm = () => {
    switch (selectedMethod) {
      case 'cash':
        return (
          <CashPaymentForm
            total={total}
            isSubmitting={isSubmitting}
            onConfirm={(data) => handleConfirmPayment(data)}
          />
        );
      case 'card':
        return <CardPaymentForm isSubmitting={isSubmitting} onConfirm={(data) => handleConfirmPayment(data)} />;
      case 'upi':
        return (
          <UpiPaymentForm
            total={total}
            isSubmitting={isSubmitting}
            onCancel={() => setSelectedMethod('cash')}
            onConfirm={(data) => handleConfirmPayment(data)}
          />
        );
      default:
        return null;
    }
  };

  const methodIcons = {
    Banknote: Banknote,
    CreditCard: CreditCard,
    QrCode: QrCode,
  };

  return (
    <div className="w-full h-full bg-[#1A1A1A] border-l border-[#2E2E2E] p-5 flex flex-col justify-between no-print">
      <div className="space-y-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="select-none">
          <h3 className="font-sora font-bold text-base text-[#F0EDE8]">Payment</h3>
          <span className="text-2xl font-bold font-mono text-[#F5A623] mt-1 block" data-type="price">
            {formatINR(total)}
          </span>
        </div>

        {/* Method selector */}
        {selectedMethod !== 'upi' && (
          <div className="grid grid-cols-3 gap-2.5">
            {enabledMethods.map((method) => {
              const Icon = methodIcons[method.icon] || Banknote;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  disabled={isSubmitting}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border select-none transition-all outline-none focus:ring-1 focus:ring-[#F5A623]/25 ${
                    isSelected
                      ? 'bg-[#3D2B00] border-[#F5A623] text-[#F5A623]'
                      : 'bg-[#242424] border-[#2E2E2E] text-[#9A9590] hover:border-[#F5A623]/40 hover:text-[#F0EDE8]'
                  }`}
                >
                  <Icon size={20} className="mb-1.5" />
                  <span className="text-xs font-inter font-medium">{method.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Form area */}
        <div className="flex-1 flex flex-col pt-4 min-h-0">{renderForm()}</div>
      </div>
    </div>
  );
};
export default PaymentPanel;
