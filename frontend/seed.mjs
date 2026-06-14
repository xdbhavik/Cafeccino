// Seed script — creates 10 chefs, 5 cashiers, and 500 customers via the backend API
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

// ── Users: 10 Chefs + 5 Cashiers ──
const CHEFS = [
  { name: "Rajan Kapoor", email: "rajan.kapoor@cafechino.com", password: "password123", role: "CHEF" },
  { name: "Meena Iyer", email: "meena.iyer@cafechino.com", password: "password123", role: "CHEF" },
  { name: "Suresh Nair", email: "suresh.nair@cafechino.com", password: "password123", role: "CHEF" },
  { name: "Anita Deshmukh", email: "anita.deshmukh@cafechino.com", password: "password123", role: "CHEF" },
  { name: "Vikram Shetty", email: "vikram.shetty@cafechino.com", password: "password123", role: "CHEF" },
  { name: "Prerna Joshi", email: "prerna.joshi@cafechino.com", password: "password123", role: "CHEF" },
  { name: "Arun Menon", email: "arun.menon@cafechino.com", password: "password123", role: "CHEF" },
  { name: "Divya Reddy", email: "divya.reddy@cafechino.com", password: "password123", role: "CHEF" },
  { name: "Karthik Bhat", email: "karthik.bhat@cafechino.com", password: "password123", role: "CHEF" },
  { name: "Lakshmi Rao", email: "lakshmi.rao@cafechino.com", password: "password123", role: "CHEF" },
];

const CASHIERS = [
  { name: "Pooja Sharma", email: "pooja.sharma@cafechino.com", password: "password123", role: "EMPLOYEE" },
  { name: "Rahul Verma", email: "rahul.verma@cafechino.com", password: "password123", role: "EMPLOYEE" },
  { name: "Sneha Patel", email: "sneha.patel@cafechino.com", password: "password123", role: "EMPLOYEE" },
  { name: "Amit Gupta", email: "amit.gupta@cafechino.com", password: "password123", role: "EMPLOYEE" },
  { name: "Nidhi Singh", email: "nidhi.singh@cafechino.com", password: "password123", role: "EMPLOYEE" },
];

// ── 500 Customers ──
const FIRST = [
  "Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Ayaan","Krishna","Ishaan",
  "Shaurya","Atharva","Advik","Pranav","Advait","Dhruv","Kabir","Ritvik","Aarush","Kavya",
  "Ananya","Aanya","Aadhya","Aaradhya","Myra","Sara","Kiara","Diya","Riya","Isha",
  "Saanvi","Anika","Navya","Nisha","Priya","Meera","Tara","Zara","Inaya","Mahi",
  "Aryan","Rohan","Karan","Nikhil","Vikram","Rahul","Amit","Mohit","Sahil","Dev",
  "Neha","Pooja","Sneha","Shreya","Divya","Tanvi","Nidhi","Komal","Mansi","Sonali",
  "Harsh","Yash","Varun","Kunal","Gaurav","Siddharth","Ravi","Ajay","Vijay","Sunil",
  "Ankita","Pallavi","Swati","Bhavna","Jyoti","Rekha","Sonal","Rashmi","Deepa","Geeta",
  "Tushar","Parth","Chirag","Hitesh","Jatin","Mayank","Naman","Ojas","Piyush","Rajat",
  "Shruti","Trisha","Uma","Vandana","Yamini","Aishwarya","Bhavika","Chandni","Dimple","Ekta",
];
const LAST = [
  "Sharma","Patel","Singh","Kumar","Gupta","Verma","Joshi","Mehta","Shah","Rao",
  "Reddy","Iyer","Nair","Menon","Chopra","Saxena","Kapoor","Malhotra","Bhat","Agarwal",
  "Tiwari","Mishra","Pandey","Banerjee","Mukherjee","Chatterjee","Das","Ghosh","Sen","Roy",
  "Pillai","Shetty","Hegde","Deshmukh","Patil","Kulkarni","Deshpande","Kamath","Naik","Thakur",
  "Chauhan","Rathore","Rajput","Solanki","Yadav","Chaudhary","Saini","Gill","Sandhu","Dhillon",
];

function buildCustomers(count) {
  const customers = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[i % LAST.length];
    // Generate unique phone: 9000000001 through 9000000500
    const phone = `${9000000001 + i}`;
    const emailSuffix = i < 100 ? "" : `${i}`;
    const email = `${first.toLowerCase()}${emailSuffix}.${last.toLowerCase()}@email.com`;
    customers.push({
      name: `${first} ${last}`,
      phone,
      email,
      address: "",
    });
  }
  return customers;
}

// ── Main ──
async function main() {
  console.log("🌱 Starting seed...\n");

  // 1. Staff
  const staff = [...CHEFS, ...CASHIERS];
  console.log(`👨‍🍳 Creating ${CHEFS.length} chefs + ${CASHIERS.length} cashiers...`);
  let staffCreated = 0;
  for (const u of staff) {
    try {
      await api("/api/users/register", { method: "POST", body: JSON.stringify(u) });
      staffCreated++;
      process.stdout.write(`\r   ${staffCreated}/${staff.length} staff created`);
    } catch (e) {
      // Already exists — skip
    }
  }
  console.log(`\n   ✅ ${staffCreated} staff created.\n`);

  // 2. Customers
  const customers = buildCustomers(500);
  console.log(`👥 Creating ${customers.length} customers...`);
  let custCreated = 0;
  let custSkipped = 0;
  for (const c of customers) {
    try {
      await api("/api/customers", { method: "POST", body: JSON.stringify(c) });
      custCreated++;
    } catch (e) {
      custSkipped++;
    }
    process.stdout.write(`\r   ${custCreated + custSkipped}/${customers.length} processed (${custCreated} created, ${custSkipped} skipped)`);
  }
  console.log(`\n   ✅ ${custCreated} customers created, ${custSkipped} skipped.\n`);

  console.log("🎉 Seed complete!");
}

main().catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); });
