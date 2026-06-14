import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit2, Trash2, HelpCircle, Ticket, Milestone } from "lucide-react";
import { useAdmin } from "../context/AdminContext";
import { formatINR } from "../lib/utils";
import { Dialog } from "../components/ui/Dialog";

export const CouponsListPage = () => {
  const navigate = useNavigate();
  const { coupons, promotions, deleteCoupon, deletePromotion, fetchPromotions } = useAdmin();

  const [activeTab, setActiveTab] = useState("coupons"); // "coupons" | "promotions"
  const [deleteTargetKey, setDeleteTargetKey] = useState(null); // code for coupon, id for promotion

  React.useEffect(() => {
    fetchPromotions().catch(console.error);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetKey) return;

    try {
      if (activeTab === "coupons") {
        await deleteCoupon(deleteTargetKey);
      } else {
        await deletePromotion(deleteTargetKey);
      }
    } catch (err) {
      alert(err.message || "Failed to delete rule.");
    }
    setDeleteTargetKey(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
            Discounts & Promotions
          </h1>
          <p className="text-sm text-text-secondary">
            Configure manual coupon codes and automated trigger-based cart promotions.
          </p>
        </div>
        <Link
          to="/admin/coupons/new"
          className="inline-flex items-center gap-2 h-10 px-4 bg-accent hover:bg-amber-500 text-bg font-sora font-bold text-sm rounded-lg hover:shadow-accent transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Discount Rule</span>
        </Link>
      </div>

      {/* Tab Switcher */}
      <div className="bg-surface p-1 rounded-lg border border-border inline-flex">
        <button
          onClick={() => setActiveTab("coupons")}
          className={`h-9 px-5 rounded-md font-sora font-semibold text-xs transition-all ${
            activeTab === "coupons"
              ? "bg-accent text-bg"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Manual Coupon Codes
        </button>
        <button
          onClick={() => setActiveTab("promotions")}
          className={`h-9 px-5 rounded-md font-sora font-semibold text-xs transition-all ${
            activeTab === "promotions"
              ? "bg-accent text-bg"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Automated Promotions
        </button>
      </div>

      {/* List Sections */}
      {activeTab === "coupons" ? (
        coupons.length === 0 ? (
          <div className="bg-surface border border-border p-12 rounded-xl text-center shadow-card">
            <Ticket size={32} className="text-text-secondary mx-auto mb-3" />
            <p className="text-sm text-text-secondary">No manual coupon codes configured.</p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-raised/40">
                    <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Code</th>
                    <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Type</th>
                    <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Value</th>
                    <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Description</th>
                    <th className="py-4 px-6 font-sora font-semibold text-text-secondary text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {coupons.map((cp) => (
                    <tr key={cp.code} className="hover:bg-surface-raised/20 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-accent tracking-wider">
                        {cp.code}
                      </td>
                      <td className="py-3.5 px-6 capitalize text-text-secondary font-medium">
                        {cp.type} Discount
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-text-primary">
                        {cp.type === "percentage" ? `${cp.value}%` : formatINR(cp.value)}
                      </td>
                      <td className="py-3.5 px-6 text-text-secondary">{cp.description}</td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/coupons/${cp.code}/edit`)}
                            className="p-1.5 text-text-secondary hover:text-accent hover:bg-surface-raised rounded-md transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTargetKey(cp.code)}
                            className="p-1.5 text-text-secondary hover:text-danger hover:bg-surface-raised rounded-md transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : promotions.length === 0 ? (
        <div className="bg-surface border border-border p-12 rounded-xl text-center shadow-card">
          <Milestone size={32} className="text-text-secondary mx-auto mb-3" />
          <p className="text-sm text-text-secondary">No automated promotion rules configured.</p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-raised/40">
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Promo Name</th>
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Scope</th>
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Trigger Condition</th>
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary">Value</th>
                  <th className="py-4 px-6 font-sora font-semibold text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promotions.map((pr) => (
                  <tr key={pr.id} className="hover:bg-surface-raised/20 transition-colors">
                    <td className="py-3.5 px-6 font-semibold text-text-primary">{pr.name}</td>
                    <td className="py-3.5 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-raised border border-border capitalize">
                        {pr.scope} Level
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-text-secondary">
                      {pr.triggerCondition === "min_qty"
                        ? `Min Qty of ${pr.triggerValue} items`
                        : `Min Cart Spend of ${formatINR(pr.triggerValue)}`}
                    </td>
                    <td className="py-3.5 px-6 font-mono font-medium text-accent">
                      {pr.discountType === "percentage" ? `${pr.discountValue}% Off` : `${formatINR(pr.discountValue)} Off`}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/admin/coupons/${pr.id}/edit?type=promotion`)}
                          className="p-1.5 text-text-secondary hover:text-accent hover:bg-surface-raised rounded-md transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTargetKey(pr.id)}
                          className="p-1.5 text-text-secondary hover:text-danger hover:bg-surface-raised rounded-md transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        isOpen={deleteTargetKey !== null}
        onClose={() => setDeleteTargetKey(null)}
        title="Delete Rule"
        className="max-w-sm"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="h-12 w-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mb-4">
            <HelpCircle size={24} />
          </div>
          <p className="text-sm text-text-primary font-medium mb-1">
            Delete this discount rule?
          </p>
          <p className="text-xs text-text-secondary mb-6">
            This will immediately stop cashier terminals from applying this rule or accepting this coupon code.
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={() => setDeleteTargetKey(null)}
              className="flex-1 h-10 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="flex-1 h-10 bg-danger text-text-primary rounded-lg text-sm font-semibold hover:bg-red-600 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
