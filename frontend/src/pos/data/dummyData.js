export const DUMMY_USER = {
  id: 'emp1',
  name: 'Rohan Mehta',
  email: 'rohan@odoo-cafe.com',
  role: 'cashier',
  avatar: 'RM',
};

export const SESSION = {
  id: 'sess1',
  employeeId: 'emp1',
  openedAt: '2026-06-13T09:00:00',
  status: 'OPEN',
  lastClosingAmount: 18540,
  lastOpenSessionDate: '2026-06-12',
};

export const CATEGORIES = [
  { id: 'all', name: 'All', color: '#F0EDE8' },
  { id: 'bev', name: 'Beverages', color: '#6C63FF' },
  { id: 'snk', name: 'Snacks', color: '#FF6584' },
  { id: 'mns', name: 'Mains', color: '#43CFAB' },
  { id: 'dss', name: 'Desserts', color: '#F5A623' },
  { id: 'spl', name: 'Specials', color: '#56CCF2' },
];

export const PRODUCTS = [
  { id: 'p1',  name: 'Cappuccino',       category: 'bev', price: 180, tax: 5,  unit: 'per cup',   description: 'Rich espresso with steamed milk foam' },
  { id: 'p2',  name: 'Cold Brew',        category: 'bev', price: 220, tax: 5,  unit: 'per cup',   description: 'Slow-steeped for 12 hours, served over ice' },
  { id: 'p3',  name: 'Masala Chai',      category: 'bev', price: 120, tax: 5,  unit: 'per cup',   description: 'Classic spiced tea with ginger and cardamom' },
  { id: 'p4',  name: 'Fresh Lime Soda',  category: 'bev', price: 100, tax: 5,  unit: 'per glass', description: 'Refreshing lime with soda and mint' },
  { id: 'p5',  name: 'Avocado Toast',    category: 'snk', price: 320, tax: 12, unit: 'per piece', description: 'Multigrain toast with smashed avocado and chili flakes' },
  { id: 'p6',  name: 'Bruschetta',       category: 'snk', price: 280, tax: 12, unit: 'per piece', description: 'Toasted sourdough with tomato and basil' },
  { id: 'p7',  name: 'Nachos',           category: 'snk', price: 250, tax: 12, unit: 'per plate', description: 'Tortilla chips with salsa and sour cream' },
  { id: 'p8',  name: 'Grilled Sandwich', category: 'mns', price: 290, tax: 12, unit: 'per piece', description: 'Cheese and veggie on butter-grilled bread' },
  { id: 'p9',  name: 'Pasta Arrabbiata',category: 'mns', price: 380, tax: 12, unit: 'per plate', description: 'Penne in spicy tomato sauce with garlic' },
  { id: 'p10', name: 'Paneer Wrap',      category: 'mns', price: 340, tax: 12, unit: 'per piece', description: 'Grilled paneer tikka with mint chutney in a whole wheat wrap' },
  { id: 'p11', name: 'Brownie',          category: 'dss', price: 160, tax: 5,  unit: 'per piece', description: 'Warm chocolate brownie served with vanilla scoop' },
  { id: 'p12', name: 'Cheesecake',       category: 'dss', price: 240, tax: 5,  unit: 'per slice', description: 'New York style with berry coulis' },
  { id: 'p13', name: 'Affogato',         category: 'dss', price: 200, tax: 5,  unit: 'per cup',   description: 'Vanilla gelato drowned in hot espresso' },
  { id: 'p14', name: "Chef's Special",   category: 'spl', price: 450, tax: 12, unit: 'per plate', description: 'Daily rotating chef creation — ask your server' },
  { id: 'p15', name: 'Combo Meal',       category: 'spl', price: 520, tax: 12, unit: 'per set',   description: 'Any main + beverage + dessert at a flat rate' },
];

export const FLOORS = [
  { id: 'f1', name: 'Ground Floor' },
  { id: 'f2', name: 'First Floor' },
];

// status: 'available' | 'occupied'. activeOrderId is null when available.
export const TABLES = [
  { id: 't1', number: 'T-01', seats: 4, floorId: 'f1', status: 'occupied',  activeOrderId: 'o1' },
  { id: 't2', number: 'T-02', seats: 2, floorId: 'f1', status: 'available', activeOrderId: null },
  { id: 't3', number: 'T-03', seats: 6, floorId: 'f1', status: 'available', activeOrderId: null },
  { id: 't4', number: 'T-04', seats: 4, floorId: 'f1', status: 'occupied',  activeOrderId: 'o2' },
  { id: 't5', number: 'T-05', seats: 2, floorId: 'f1', status: 'available', activeOrderId: null },
  { id: 't6', number: 'T-06', seats: 8, floorId: 'f1', status: 'available', activeOrderId: null },
  { id: 't7', number: 'T-07', seats: 4, floorId: 'f2', status: 'available', activeOrderId: null },
  { id: 't8', number: 'T-08', seats: 4, floorId: 'f2', status: 'occupied',  activeOrderId: 'o3' },
  { id: 't9', number: 'T-09', seats: 6, floorId: 'f2', status: 'available', activeOrderId: null },
  { id: 't10', number: 'T-10', seats: 2, floorId: 'f2', status: 'available', activeOrderId: null },
];

export const CUSTOMERS = [
  { id: 'c1', name: 'Priya Sharma',  email: 'priya@email.com',  phone: '9876543210' },
  { id: 'c2', name: 'Aman Verma',    email: 'aman@email.com',   phone: '9123456780' },
  { id: 'c3', name: 'Sneha Iyer',    email: 'sneha@email.com',  phone: '9988776655' },
  { id: 'c4', name: 'Karan Joshi',   email: 'karan@email.com',  phone: '9001122334' },
];

export const COUPONS = [
  { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off your order' },
  { code: 'FLAT50',    type: 'fixed',      value: 50, description: '₹50 off your order' },
  { code: 'CAFE20',    type: 'percentage', value: 20, description: '20% off for members' },
];

// Automated promotions — applied automatically, no code entry.
export const PROMOTIONS = [
  // Product-based: fires when qty of productId reaches minQty
  { id: 'pr1', appliesTo: 'product', productId: 'p1', minQty: 3, discountType: 'percentage', value: 15, description: 'Buy 3+ Cappuccinos, get 15% off order' },
  // Order-based: fires when subtotal crosses minAmount
  { id: 'pr2', appliesTo: 'order', minAmount: 1000, discountType: 'fixed', value: 100, description: 'Orders above ₹1000 get ₹100 off' },
];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 'Banknote',   enabled: true },
  { id: 'card', label: 'Card', icon: 'CreditCard', enabled: true },
  { id: 'upi',  label: 'UPI',  icon: 'QrCode',     enabled: true },
];

export const UPI_ID = 'odoocafe@ybl';

// Pre-seeded orders for the current session — demonstrates Draft, Paid, Cancelled states
export const ORDERS = [
  {
    id: 'o1',
    orderNumber: 'ORD-0041',
    tableId: 't1',
    customerId: null,
    status: 'DRAFT',
    items: [
      { productId: 'p1', quantity: 2, lineTotal: 360 },
      { productId: 'p11', quantity: 1, lineTotal: 160 },
    ],
    coupon: null,
    paymentMethod: null,
    createdAt: '2026-06-13T10:15:00',
  },
  {
    id: 'o2',
    orderNumber: 'ORD-0042',
    tableId: 't4',
    customerId: 'c1',
    status: 'DRAFT',
    items: [
      { productId: 'p9', quantity: 2, lineTotal: 760 },
      { productId: 'p2', quantity: 2, lineTotal: 440 },
    ],
    coupon: null,
    paymentMethod: null,
    createdAt: '2026-06-13T10:40:00',
  },
  {
    id: 'o3',
    orderNumber: 'ORD-0043',
    tableId: 't8',
    customerId: 'c2',
    status: 'DRAFT',
    items: [
      { productId: 'p14', quantity: 1, lineTotal: 450 },
      { productId: 'p4', quantity: 1, lineTotal: 100 },
    ],
    coupon: null,
    paymentMethod: null,
    createdAt: '2026-06-13T11:05:00',
  },
  {
    id: 'o4',
    orderNumber: 'ORD-0040',
    tableId: 't2',
    customerId: 'c3',
    status: 'PAID',
    items: [
      { productId: 'p5', quantity: 1, lineTotal: 320 },
      { productId: 'p1', quantity: 1, lineTotal: 180 },
    ],
    coupon: { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off your order' },
    paymentMethod: 'cash',
    createdAt: '2026-06-13T09:30:00',
  },
  {
    id: 'o5',
    orderNumber: 'ORD-0039',
    tableId: 't5',
    customerId: null,
    status: 'CANCELLED',
    items: [
      { productId: 'p7', quantity: 2, lineTotal: 500 },
    ],
    coupon: null,
    paymentMethod: null,
    createdAt: '2026-06-13T09:10:00',
  },
];
