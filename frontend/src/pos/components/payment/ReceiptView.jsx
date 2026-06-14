import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Printer, Mail, Plus, Banknote, CreditCard, QrCode } from 'lucide-react';
import { formatINR } from '../../lib/utils';
import { useCustomers } from '../../context/CustomersContext';
import { useCart } from '../../context/CartContext';

// Generate a clean thermal-style receipt HTML and print it in a new window
function printReceipt(order, customer, cartProducts) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const itemRows = order.items.map((item) => {
    const name = item.productName || item.name || cartProducts?.find(p => p.id === item.productId)?.name || 'Item';
    const qty = item.quantity;
    const total = item.lineTotal || 0;
    return `
      <tr>
        <td style="text-align:left;padding:2px 0;">${name}</td>
        <td style="text-align:center;padding:2px 4px;">${qty}</td>
        <td style="text-align:right;padding:2px 0;">${formatINR(total)}</td>
      </tr>`;
  }).join('');

  const discountRow = order.totalDiscount > 0
    ? `<tr><td style="text-align:left;padding:2px 0;">Discount</td><td></td><td style="text-align:right;padding:2px 0;">-${formatINR(order.totalDiscount)}</td></tr>`
    : '';

  const couponRow = order.coupon
    ? `<tr><td colspan="3" style="text-align:center;padding:2px 0;font-size:10px;">Coupon: ${order.coupon.code || order.coupon}</td></tr>`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Receipt - ${order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      color: #000;
      background: #fff;
      width: 280px;
      margin: 0 auto;
      padding: 12px 8px;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .divider {
      border: none;
      border-top: 1px dashed #000;
      margin: 6px 0;
    }
    .spacer { height: 4px; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; border-bottom: 1px solid #000; padding: 2px 0; }
    .total-row td {
      font-weight: bold;
      font-size: 14px;
      padding-top: 4px;
      border-top: 1px dashed #000;
    }
    @media print {
      body { width: 72mm; margin: 0; padding: 4mm; }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="center bold" style="font-size:18px;letter-spacing:2px;">CAFECCINO</div>
  <div class="center" style="font-size:10px;margin-top:2px;">Premium Cafe & Kitchen</div>
  <div class="center" style="font-size:10px;margin-top:1px;">Every order, handled with precision</div>
  
  <hr class="divider" />
  
  <!-- Order Info -->
  <div style="display:flex;justify-content:space-between;">
    <span>Order:</span>
    <span class="bold">${order.orderNumber || '—'}</span>
  </div>
  <div style="display:flex;justify-content:space-between;">
    <span>Date:</span>
    <span>${dateStr} ${timeStr}</span>
  </div>
  ${customer ? `<div style="display:flex;justify-content:space-between;"><span>Customer:</span><span>${customer.name}</span></div>` : ''}
  ${customer?.phone ? `<div style="display:flex;justify-content:space-between;"><span>Phone:</span><span>${customer.phone}</span></div>` : ''}
  <div style="display:flex;justify-content:space-between;">
    <span>Payment:</span>
    <span class="bold">${(order.paymentMethod || 'CASH').toUpperCase()}</span>
  </div>
  
  <hr class="divider" />
  
  <!-- Items -->
  <table>
    <thead>
      <tr>
        <th style="text-align:left;">Item</th>
        <th style="text-align:center;">Qty</th>
        <th style="text-align:right;">Amt</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>
  
  <hr class="divider" />
  
  <!-- Totals -->
  <table>
    <tbody>
      <tr>
        <td style="text-align:left;padding:2px 0;">Subtotal</td>
        <td></td>
        <td style="text-align:right;padding:2px 0;">${formatINR(order.subtotal)}</td>
      </tr>
      <tr>
        <td style="text-align:left;padding:2px 0;">Tax</td>
        <td></td>
        <td style="text-align:right;padding:2px 0;">${formatINR(order.taxAmount)}</td>
      </tr>
      ${discountRow}
      ${couponRow}
    </tbody>
  </table>
  
  <div class="spacer"></div>
  
  <table>
    <tbody>
      <tr class="total-row">
        <td style="text-align:left;">TOTAL</td>
        <td></td>
        <td style="text-align:right;">${formatINR(order.total)}</td>
      </tr>
    </tbody>
  </table>
  
  <hr class="divider" />
  
  <!-- Footer -->
  <div class="center bold" style="margin-top:6px;font-size:11px;">THANK YOU!</div>
  <div class="center" style="font-size:10px;margin-top:2px;">Visit us again soon</div>
  <div class="center" style="font-size:9px;margin-top:4px;color:#666;">--- End of Receipt ---</div>
  
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=320,height=600');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}

export const ReceiptView = ({ completedOrder, onNewOrderClick, onTriggerToast }) => {
  const { customers } = useCustomers();
  const { products } = useCart();

  const customer = completedOrder.customerId
    ? customers.find((c) => c.id === completedOrder.customerId)
    : null;

  const handlePrint = () => {
    printReceipt(completedOrder, customer, products);
  };

  const handleEmail = () => {
    if (customer && customer.email) {
      if (onTriggerToast) {
        onTriggerToast('Receipt Emailed', `Receipt sent to ${customer.email}`, 'success');
      }
    }
  };

  const paymentIcons = {
    cash: Banknote,
    card: CreditCard,
    upi: QrCode,
  };

  const PaymentIcon = paymentIcons[completedOrder.paymentMethod] || Banknote;
  const paymentLabel = completedOrder.paymentMethod
    ? completedOrder.paymentMethod.toUpperCase()
    : 'CASH';

  return (
    <div className="flex flex-col h-full justify-between space-y-6 select-none font-inter">
      {/* Scrollable Receipt Area */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="h-14 w-14 bg-[#4CAF7D]/10 text-[#4CAF7D] rounded-full flex items-center justify-center mb-3.5 border border-[#4CAF7D]/25"
          >
            <CheckCircle2 size={30} />
          </motion.div>
          
          <h2 className="font-sora font-bold text-lg text-[#F0EDE8]">Payment Successful</h2>
          <span className="font-mono text-xs text-[#9A9590] mt-1">
            {completedOrder.orderNumber || 'ORD-0044'}
          </span>
        </div>

        {/* Mini Receipt Card */}
        <div className="bg-[#242424] rounded-xl p-4 border border-[#2E2E2E] space-y-3.5">
          {/* Items log */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {completedOrder.items.map((item) => {
              const name = item.productName || item.name || products?.find(p => p.id === item.productId)?.name || 'Item';
              return (
                <div key={item.productId} className="flex justify-between items-start text-xs leading-normal">
                  <span className="text-[#9A9590] truncate max-w-[160px] font-inter">
                    {name}
                    <span className="text-[10px] text-[#9A9590]/70 ml-1 select-none font-mono">
                      ×{item.quantity}
                    </span>
                  </span>
                  <span className="font-mono text-[#F0EDE8] ml-2">
                    {formatINR(item.lineTotal || 0)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="h-px bg-[#2E2E2E]" />

          {/* Totals */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#9A9590]">Subtotal</span>
              <span className="font-mono text-[#F0EDE8]">{formatINR(completedOrder.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#9A9590]">Tax</span>
              <span className="font-mono text-[#F0EDE8]">{formatINR(completedOrder.taxAmount)}</span>
            </div>

            {completedOrder.totalDiscount > 0 && (
              <div className="flex justify-between text-[#4CAF7D]">
                <span>Total Discount</span>
                <span className="font-mono">-{formatINR(completedOrder.totalDiscount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm pt-1.5 border-t border-[#2E2E2E] font-semibold">
              <span className="text-[#F0EDE8]">Total Paid</span>
              <span className="font-mono text-[#F5A623]">{formatINR(completedOrder.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Badge */}
        <div className="flex justify-center select-none">
          <div className="flex items-center gap-1.5 bg-[#242424] border border-[#2E2E2E] px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#9A9590]">
            <PaymentIcon size={14} className="text-[#F5A623]" />
            <span>Paid via {paymentLabel}</span>
          </div>
        </div>

        {/* Share Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="h-10 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] rounded-lg text-xs font-semibold text-[#F0EDE8] flex items-center justify-center gap-1.5 transition-colors outline-none"
          >
            <Printer size={14} />
            Print Receipt
          </button>

          <div className="relative group">
            <button
              onClick={handleEmail}
              disabled={!customer || !customer.email}
              className="w-full h-10 bg-[#242424] hover:bg-[#2E2E2E] border border-[#2E2E2E] disabled:hover:border-[#2E2E2E] rounded-lg text-xs font-semibold text-[#F0EDE8] disabled:text-[#9A9590]/50 flex items-center justify-center gap-1.5 transition-colors outline-none disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Mail size={14} />
              Email Receipt
            </button>
            
            {(!customer || !customer.email) && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#242424] border border-[#2E2E2E] text-[#9A9590] text-[10px] rounded-lg shadow-elevated opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-center leading-normal">
                Assign a customer with an email address first
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Order Trigger */}
      <button
        onClick={onNewOrderClick}
        className="w-full h-12 bg-[#F5A623] hover:bg-[#e09820] text-[#0F0F0F] rounded-lg text-sm font-sora font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-accent select-none"
      >
        <Plus size={16} />
        New Order
      </button>
    </div>
  );
};
export default ReceiptView;
