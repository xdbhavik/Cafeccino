// Seed script to add automated promotions
const BASE = "http://localhost:8080";

async function api(endpoint, options = {}) {
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${endpoint}: ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function main() {
  console.log("🌱 Seeding promotions...");

  // 1. Order-based Promo: 10% off on orders above ₹1000
  try {
    await api("/api/admin/promotions", {
      method: "POST",
      body: JSON.stringify({
        type: "ORDER",
        description: "10% off on orders above ₹1000",
        minOrderAmount: 1000.0,
        discountType: "PERCENT",
        discountValue: 10.0,
        isActive: true,
      }),
    });
    console.log("  ✓ Created Order Promo: 10% off above ₹1000");
  } catch (e) {
    console.log("  ⚠ Skipped Order Promo:", e.message);
  }

  // 2. Coupon Code: WELCOME50 for flat ₹50 off
  try {
    await api("/api/admin/promotions/seed-coupon", {
      method: "POST",
      body: JSON.stringify({
        description: "Welcome flat ₹50 off",
        code: "WELCOME50",
        discountType: "FLAT",
        discountValue: 50.0,
      }),
    });
    console.log("  ✓ Created Coupon: WELCOME50");
  } catch (e) {
    console.log("  ⚠ Skipped Coupon:", e.message);
  }

  console.log("🎉 Promotions seeded!");
}

main().catch(console.error);
