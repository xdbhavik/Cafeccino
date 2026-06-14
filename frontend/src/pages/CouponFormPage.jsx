import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAdmin } from "../context/AdminContext";

export const CouponFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { coupons, promotions, products, addPromotion, updatePromotion, fetchPromotions, fetchProducts } = useAdmin();

  const isEdit = Boolean(id);
  const editTypeQuery = searchParams.get("type"); // "promotion"

  // Base state: determines which form to render
  const [ruleType, setRuleType] = useState("coupon"); // "coupon" | "promotion"

  // Coupon fields state
  const [code, setCode] = useState("");
  const [couponDiscType, setCouponDiscType] = useState("percentage");
  const [couponDiscVal, setCouponDiscVal] = useState("");
  const [couponDesc, setCouponDesc] = useState("");

  // Promotion fields state
  const [promoName, setPromoName] = useState("");
  const [promoScope, setPromoScope] = useState("order"); // "order" | "product"
  const [promoTriggerCond, setPromoTriggerCond] = useState("min_amount"); // "min_amount" | "min_qty"
  const [promoTriggerVal, setPromoTriggerVal] = useState("");
  const [promoDiscType, setPromoDiscType] = useState("percentage");
  const [promoDiscVal, setPromoDiscVal] = useState("");
  const [applicableProductId, setApplicableProductId] = useState("");
  const [apiError, setApiError] = useState("");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchPromotions().catch(console.error);
    fetchProducts().catch(console.error);
  }, []);

  // Resolve values on edit mode
  useEffect(() => {
    if (isEdit && promotions.length > 0) {
      if (editTypeQuery === "promotion" || id.startsWith("pr")) {
        setRuleType("promotion");
        const promo = promotions.find((p) => p.id.toString() === id.toString());
        if (promo) {
          setPromoName(promo.name);
          setPromoScope(promo.type ? promo.type.toLowerCase() : "order");
          setPromoTriggerCond(promo.minQty !== null && promo.minQty !== undefined ? "min_qty" : "min_amount");
          setPromoTriggerVal((promo.minQty !== null && promo.minQty !== undefined ? promo.minQty : promo.minOrderAmount || 0).toString());
          setPromoDiscType(promo.discountType === "PERCENT" ? "percentage" : "fixed");
          setPromoDiscVal(promo.discountValue.toString());
          setApplicableProductId(promo.applicableProductId?.toString() || "");
        } else {
          navigate("/admin/coupons");
        }
      } else {
        setRuleType("coupon");
        const cp = coupons.find((c) => c.code === id || c.id.toString() === id.toString());
        if (cp) {
          setCode(cp.code);
          setCouponDiscType(cp.discountType === "PERCENT" ? "percentage" : "fixed");
          setCouponDiscVal(cp.discountValue.toString());
          setCouponDesc(cp.name || "");
        } else {
          navigate("/admin/coupons");
        }
      }
    }
  }, [id, isEdit, editTypeQuery, coupons, promotions, navigate]);

  const validate = () => {
    const newErrors = {};

    if (ruleType === "coupon") {
      if (!code.trim()) {
        newErrors.code = "Coupon Code is required.";
      } else if (!/^[A-Z0-9_-]+$/i.test(code)) {
        newErrors.code = "Code can only contain alphanumeric characters, underscores, and hyphens.";
      }

      const val = parseFloat(couponDiscVal);
      if (isNaN(val) || val <= 0) {
        newErrors.couponValue = "Discount value must be a positive number.";
      } else if (couponDiscType === "percentage" && val > 100) {
        newErrors.couponValue = "Percentage discount cannot exceed 100%.";
      }
    } else {
      if (!promoName.trim()) {
        newErrors.promoName = "Promotion name is required.";
      }

      const trig = parseFloat(promoTriggerVal);
      if (isNaN(trig) || trig <= 0) {
        newErrors.promoTriggerVal = "Trigger threshold must be greater than 0.";
      }

      const val = parseFloat(promoDiscVal);
      if (isNaN(val) || val <= 0) {
        newErrors.promoValue = "Discount value must be a positive number.";
      } else if (promoDiscType === "percentage" && val > 100) {
        newErrors.promoValue = "Percentage discount cannot exceed 100%.";
      }

      if (promoScope === "product" && !applicableProductId) {
        newErrors.applicableProductId = "Specific product is required for product scope.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;

    let body;
    if (ruleType === "coupon") {
      body = {
        name: couponDesc.trim() || `${code.trim().toUpperCase()} Coupon`,
        code: code.trim().toUpperCase(),
        type: "ORDER",
        applicableProductId: null,
        minQty: null,
        discountType: couponDiscType === "percentage" ? "PERCENT" : "FLAT",
        discountValue: parseFloat(couponDiscVal),
        minOrderAmount: 100.0,
        startDate: new Date().toISOString().split(".")[0],
        endDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split(".")[0],
      };
    } else {
      body = {
        name: promoName.trim(),
        code: null,
        type: promoScope.toUpperCase(),
        applicableProductId: promoScope === "product" ? Number(applicableProductId) : null,
        minQty: promoTriggerCond === "min_qty" ? Number(promoTriggerVal) : null,
        discountType: promoDiscType === "percentage" ? "PERCENT" : "FLAT",
        discountValue: parseFloat(promoDiscVal),
        minOrderAmount: promoTriggerCond === "min_amount" ? parseFloat(promoTriggerVal) : null,
        startDate: new Date().toISOString().split(".")[0],
        endDate: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString().split(".")[0],
      };
    }

    try {
      if (isEdit) {
        await updatePromotion(id, body);
      } else {
        if (ruleType === "coupon") {
          const exists = coupons.some((c) => c.code === body.code);
          if (exists) {
            setErrors({ code: "This coupon code already exists." });
            return;
          }
        }
        await addPromotion(body);
      }
      navigate("/admin/coupons");
    } catch (err) {
      setApiError(err.message || "Failed to save discount rule.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-sora font-bold text-text-primary">
          {isEdit ? "Edit Discount Rule" : "Create Discount Rule"}
        </h1>
        <p className="text-sm text-text-secondary">
          Set up eligibility constraints, thresholds, and valuation parameters.
        </p>
      </div>

      {/* Main Form Box */}
      <div className="bg-surface border border-border p-6 rounded-xl shadow-card space-y-6">
        {apiError && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger text-sm font-medium">
            {apiError}
          </div>
        )}
        {/* Toggle segment selector (Only allowed on Create mode) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Discount Rule Category
          </label>
          <div className="bg-surface-raised p-1 border border-border rounded-lg flex max-w-md">
            <button
              type="button"
              disabled={isEdit}
              onClick={() => setRuleType("coupon")}
              className={`flex-1 h-9 rounded-md font-sora font-semibold text-xs transition-all disabled:opacity-80 ${
                ruleType === "coupon"
                  ? "bg-accent text-bg"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Manual Coupon Code
            </button>
            <button
              type="button"
              disabled={isEdit}
              onClick={() => setRuleType("promotion")}
              className={`flex-1 h-9 rounded-md font-sora font-semibold text-xs transition-all disabled:opacity-80 ${
                ruleType === "promotion"
                  ? "bg-accent text-bg"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Automated Promotion
            </button>
          </div>
        </div>

        {/* Dynamic fields container with animation wrapper */}
        <form onSubmit={handleSave} className="space-y-4">
          <AnimatePresence mode="wait">
            {ruleType === "coupon" ? (
              <motion.div
                key="coupon-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Code */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    disabled={isEdit}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. MONSOON20"
                    style={{ textTransform: "uppercase" }}
                    className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm font-mono tracking-wider focus:outline-none focus:ring-2 ${
                      errors.code ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
                    }`}
                  />
                  {errors.code && <p className="text-xs text-danger font-medium">{errors.code}</p>}
                </div>

                {/* Disc Type Selection */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Discount Method
                    </label>
                    <select
                      value={couponDiscType}
                      onChange={(e) => setCouponDiscType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  {/* Value */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Value
                    </label>
                    <input
                      type="number"
                      value={couponDiscVal}
                      onChange={(e) => setCouponDiscVal(e.target.value)}
                      placeholder={couponDiscType === "percentage" ? "e.g. 10" : "e.g. 50"}
                      className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                        errors.couponValue ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
                      }`}
                    />
                    {errors.couponValue && (
                      <p className="text-xs text-danger font-medium">{errors.couponValue}</p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Receipt Description
                  </label>
                  <input
                    type="text"
                    value={couponDesc}
                    onChange={(e) => setCouponDesc(e.target.value)}
                    placeholder="e.g. 10% off your entire order"
                    className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/20"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="promotion-fields"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Promo Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Promotion Rule Name
                  </label>
                  <input
                    type="text"
                    value={promoName}
                    onChange={(e) => setPromoName(e.target.value)}
                    placeholder="e.g. Buy 2 Cappuccinos Special"
                    className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      errors.promoName ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
                    }`}
                  />
                  {errors.promoName && (
                    <p className="text-xs text-danger font-medium">{errors.promoName}</p>
                  )}
                </div>

                {/* Scope & Trigger selection row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Promo Application Scope
                    </label>
                    <select
                      value={promoScope}
                      onChange={(e) => setPromoScope(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm"
                    >
                      <option value="order">Whole Order Total</option>
                      <option value="product">Specific Line Item Product</option>
                    </select>
                  </div>

                  {promoScope === "product" && (
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Target Product Item
                      </label>
                      <select
                        value={applicableProductId}
                        onChange={(e) => setApplicableProductId(e.target.value)}
                        className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                          errors.applicableProductId ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
                        }`}
                      >
                        <option value="">Select a product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {errors.applicableProductId && (
                        <p className="text-xs text-danger font-medium">{errors.applicableProductId}</p>
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Auto Trigger Parameter
                    </label>
                    <select
                      value={promoTriggerCond}
                      onChange={(e) => {
                        setPromoTriggerCond(e.target.value);
                        setPromoTriggerVal("");
                      }}
                      className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm"
                    >
                      <option value="min_amount">Minimum Cart Value (₹)</option>
                      <option value="min_qty">Minimum Item Quantity (Count)</option>
                    </select>
                  </div>
                </div>

                {/* Trigger threshold value */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    {promoTriggerCond === "min_amount"
                      ? "Minimum Cart Value (₹)"
                      : "Minimum Quantity of Items"}
                  </label>
                  <input
                    type="number"
                    value={promoTriggerVal}
                    onChange={(e) => setPromoTriggerVal(e.target.value)}
                    placeholder={promoTriggerCond === "min_amount" ? "e.g. 1000" : "e.g. 2"}
                    className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      errors.promoTriggerVal ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
                    }`}
                  />
                  {errors.promoTriggerVal && (
                    <p className="text-xs text-danger font-medium">{errors.promoTriggerVal}</p>
                  )}
                </div>

                {/* Double column: discount type & value */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Automated Discount Method
                    </label>
                    <select
                      value={promoDiscType}
                      onChange={(e) => setPromoDiscType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-surface-raised border border-border rounded-lg text-sm"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                      Discount Value
                    </label>
                    <input
                      type="number"
                      value={promoDiscVal}
                      onChange={(e) => setPromoDiscVal(e.target.value)}
                      placeholder={promoDiscType === "percentage" ? "e.g. 15" : "e.g. 100"}
                      className={`w-full px-3.5 py-2.5 bg-surface-raised border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                        errors.promoValue ? "border-danger/50 focus:ring-danger/20" : "border-border focus:ring-accent/20"
                      }`}
                    />
                    {errors.promoValue && (
                      <p className="text-xs text-danger font-medium">{errors.promoValue}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border mt-6">
            <button
              type="button"
              onClick={() => navigate("/admin/coupons")}
              className="h-10 px-5 border border-border text-text-primary rounded-lg text-sm font-semibold hover:bg-surface-raised transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 bg-accent hover:bg-amber-500 text-bg font-sora font-semibold rounded-lg hover:shadow-accent transition-all"
            >
              {isEdit ? "Update Discount" : "Save Discount"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
