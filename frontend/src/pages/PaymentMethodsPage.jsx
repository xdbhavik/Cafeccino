import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Banknote, CreditCard, QrCode, AtSign, CheckCircle2, Loader2 } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { Switch } from "../components/ui/Switch";

export const PaymentMethodsPage = () => {
  const { paymentMethods, fetchPaymentSettings, updatePaymentSettings } = useAdmin();
  const [upiId, setUpiId] = useState(paymentMethods.upiId || "");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPaymentSettings()
      .then((data) => {
        setUpiId(data.upiId || "");
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePaymentSettings({ upiId });
      setSuccessMsg("Settings saved to server!");
      setTimeout(() => setSuccessMsg(""), 2500);
    } catch (err) {
      setSuccessMsg("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = async (methodKey) => {
    try {
      await updatePaymentSettings({
        [methodKey]: !paymentMethods[methodKey],
      });
    } catch (err) {
      console.error("Failed to toggle payment method:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 size={24} className="animate-spin text-accent" />
        <span className="ml-2 text-text-secondary text-sm">Loading payment settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
          Payment Settings
        </h1>
        <p className="text-sm text-text-secondary">
          Configure enabled customer checkout methods for Cashier POS terminals.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-success/10 border border-success/30 rounded-lg text-success text-sm font-medium flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Method 1: Cash */}
        <div
          className={`bg-surface border p-6 rounded-xl flex items-center justify-between transition-all border-l-4 ${
            paymentMethods.cash
              ? "border-l-accent border-border bg-accent-dim/20"
              : "border-l-transparent border-border"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-surface-raised border border-border ${paymentMethods.cash ? "text-accent" : "text-text-secondary"}`}>
              <Banknote size={24} />
            </div>
            <div>
              <h3 className="font-sora font-semibold text-text-primary">Cash Register</h3>
              <p className="text-xs text-text-secondary">
                Accept physical cash payments. Terminal displays change calculation.
              </p>
            </div>
          </div>
          <Switch
            checked={paymentMethods.cash}
            onChange={() => toggleMethod("cash")}
          />
        </div>

        {/* Method 2: Card */}
        <div
          className={`bg-surface border p-6 rounded-xl flex items-center justify-between transition-all border-l-4 ${
            paymentMethods.card
              ? "border-l-accent border-border bg-accent-dim/20"
              : "border-l-transparent border-border"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-surface-raised border border-border ${paymentMethods.card ? "text-accent" : "text-text-secondary"}`}>
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="font-sora font-semibold text-text-primary">Card Terminal</h3>
              <p className="text-xs text-text-secondary">
                Accept debit/credit card payments via connected terminal.
              </p>
            </div>
          </div>
          <Switch
            checked={paymentMethods.card}
            onChange={() => toggleMethod("card")}
          />
        </div>

        {/* Method 3: UPI */}
        <div
          className={`bg-surface border p-6 rounded-xl flex flex-col gap-4 transition-all border-l-4 ${
            paymentMethods.upi
              ? "border-l-accent border-border bg-accent-dim/20"
              : "border-l-transparent border-border"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-surface-raised border border-border ${paymentMethods.upi ? "text-accent" : "text-text-secondary"}`}>
                <QrCode size={24} />
              </div>
              <div>
                <h3 className="font-sora font-semibold text-text-primary">UPI / QR Pay</h3>
                <p className="text-xs text-text-secondary">
                  Generate dynamic UPI QR codes for customer scanning.
                </p>
              </div>
            </div>
            <Switch
              checked={paymentMethods.upi}
              onChange={() => toggleMethod("upi")}
            />
          </div>

          {paymentMethods.upi && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-3 mt-2"
            >
              <div className="flex items-center gap-2 flex-1">
                <AtSign size={16} className="text-text-secondary" />
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="your-upi-id@provider"
                  className="flex-1 h-10 bg-surface-raised border border-border rounded-lg px-3 text-sm text-text-primary placeholder-text-secondary/50 focus:border-accent outline-none transition-all"
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="h-10 px-6 bg-accent hover:bg-accent/90 text-bg font-sora font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
